import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/../lib/authOptions";
import { requestGameIpLimiter, requestGameUserLimiter } from "@/../lib/rateLimit";
import { sendGameRequestEmail } from "@/../lib/email";

function getClientIp(req: Request): string {
    const xForwardedFor = req.headers.get("x-forwarded-for");

    if (xForwardedFor) {
        return xForwardedFor.split(",")[0].trim();
    }

    const realIp = req.headers.get("x-real-ip");

    if (realIp) {
        return realIp.trim();
    }

    return "unknown";
}

export async function POST(req: Request) {
    // Get client IP for rate limiting
    const ip = getClientIp(req);

    // Apply IP-based rate limiting
    const {
        success: ipSuccess,
        limit: ipLimit,
        remaining: ipRemaining,
        reset: ipReset,
    } = await requestGameIpLimiter.limit(ip);

    // If ip rate limit exceeded, return 429 with rate limit headers
    if (!ipSuccess) {
        return NextResponse.json(
            {
                error: "Too many requests. Please try again later.",
            },
            {
                status: 429,
                headers: {
                    "X-RateLimit-Limit": String(ipLimit),
                    "X-RateLimit-Remaining": String(ipRemaining),
                    "X-RateLimit-Reset": String(ipReset),
                },
            }
        );
    }

    // Require authenticated user
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !session?.user?.id) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const userKey = session.user.id;

    // Apply user-based rate limiting
    const {
        success: userSuccess,
        limit: userLimit,
        remaining: userRemaining,
        reset: userReset,
    } = await requestGameUserLimiter.limit(userKey);

    // If user rate limit exceeded, return 429 with rate limit headers
    if (!userSuccess) {
        return NextResponse.json(
            {
                error: "Too many requests from this account. Please try again later.",
            },
            {
                status: 429,
                headers: {
                    "X-RateLimit-Limit": String(userLimit),
                    "X-RateLimit-Remaining": String(userRemaining),
                    "X-RateLimit-Reset": String(userReset),
                },
            }
        );
    }

    // Parse request body
    let body: { gameTitle?: unknown; message?: unknown };

    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }

    const { gameTitle, message } = body;

    // Validate required fields
    if (typeof gameTitle !== "string") {
        return NextResponse.json(
            { error: "Game title is required" },
            { status: 400 }
        );
    }

    if (message !== undefined && typeof message !== "string") {
        return NextResponse.json(
            { error: "Invalid message" },
            { status: 400 }
        );
    }

    const trimmedGameTitle = gameTitle.trim();
    const trimmedMessage = typeof message === "string" ? message.trim() : "";

    if (trimmedGameTitle.length === 0) {
        return NextResponse.json(
            { error: "Game title is required" },
            { status: 400 }
        );
    }

    if (trimmedGameTitle.length > 100) {
        return NextResponse.json(
            { error: "Game title is too long" },
            { status: 400 }
        );
    }

    if (trimmedMessage.length > 200) {
        return NextResponse.json(
            { error: "Message is too long" },
            { status: 400 }
        );
    }

    try {
        await sendGameRequestEmail({
            requesterEmail: session.user.email,
            requesterUsername: session.user.username ?? "",
            gameTitle: trimmedGameTitle,
            message: trimmedMessage,
        });

        return NextResponse.json(
            {
                success: true,
                message: "Game request sent successfully."
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Failed to send game request email:", error);

        return NextResponse.json(
            { error: "Failed to send request" },
            { status: 500 }
        );
    }
}