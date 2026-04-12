import { NextResponse } from "next/server";
import dbConnect from "@/../lib/mongoose";
import { User } from "@/../lib/models/User";
import crypto from "crypto";
import { sendVerificationEmail } from "@/../lib/email";
import { resendIpLimiter } from "@/../lib/rateLimit";

// Utility function to extract the client's IP address from request headers
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
    const { success, limit, remaining, reset } = await resendIpLimiter.limit(ip);

    // If rate limit exceeded, return 429 with rate limit headers
    if (!success) {
        return NextResponse.json(
            {
                error: "Too many requests. Please try again later.",
            },
            {
                status: 429,
                headers: {
                    "X-RateLimit-Limit": String(limit),
                    "X-RateLimit-Remaining": String(remaining),
                    "X-RateLimit-Reset": String(reset),
                },
            }
        );
    }

    // Parse request body and extract email
    const { email } = await req.json();

    // Validate required field
    if (!email) {
        return NextResponse.json(
            { error: "Email required" },
            { status: 400 }
        );
    }

    // Connect to database
    await dbConnect();

    // Define cooldown (time between resend requests)
    const COOLDOWN = 120 * 1000; // 2 minutes
    const now = new Date();

    // Generate verification token (raw + hashed version)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Set token expiration (1 hour)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    // Atomically:
    //      - ensure user exists
    //      - ensure email is NOT verified
    //      - ensure cooldown has passed
    //      - update token + cooldown timestamp
    const user = await User.findOneAndUpdate(
        {
            email,
            emailVerified: false,
            $or: [
                // No previous resend
                { lastResendEmailSentAt: { $exists: false } },

                // Cooldown has passed
                { lastResendEmailSentAt: { $lte: new Date(Date.now() - COOLDOWN) } }
            ]
        },
        {
            $set: {
                verificationToken: hashedToken,
                verificationTokenExpires: expiresAt,
                lastResendEmailSentAt: now
            }
        },
        {
            new: true // return updated document
        }
    );

    // If no user was updated:
    //      - either user doesn't exist
    //      - OR email already verified
    //      - OR cooldown not finished
    if (!user) {
        return NextResponse.json(
            { error: "Please wait before requesting another email." },
            { status: 429 }
        );
    }

    try {
        // Send verification email using RAW token
        //      (user will send it back → we hash it again and compare)
        await sendVerificationEmail(email, rawToken);
    } catch (error) {

        // Rollback ONLY if this exact request is still the latest state
        //      (prevents overwriting newer valid tokens)
        await User.updateOne(
            {
                _id: user._id,
                emailVerified: false,
                verificationToken: hashedToken,
                verificationTokenExpires: expiresAt,
                lastResendEmailSentAt: now
            },
            {
                $unset: {
                    verificationToken: 1,
                    verificationTokenExpires: 1,
                    lastResendEmailSentAt: 1
                }
            }
        );

        // Return error if email sending fails
        return NextResponse.json(
            { error: "Failed to send verification email. Please try again." },
            { status: 500 }
        );
    }

    // Return success response
    return NextResponse.json({ success: true });
}