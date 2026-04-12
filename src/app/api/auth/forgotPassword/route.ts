import { NextResponse } from "next/server";
import dbConnect from "@/../lib/mongoose";
import { User } from "@/../lib/models/User";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/../lib/email";
import { forgotPasswordIpLimiter } from "@/../lib/rateLimit";

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
    const { success, limit, remaining, reset } = await forgotPasswordIpLimiter.limit(ip);

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

    // // Find user by email
    // const user = await User.findOne({ email });

    // // Always return a generic success response if user does not exist
    // //      This avoids revealing whether an email is registered
    // if (!user) {
    //     return NextResponse.json({
    //         success: true,
    //         message: "If an account with that email exists, a reset link has been sent."
    //     });
    // }

    // Generate password reset token (raw + hashed)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Set token expiration (1 hour)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    // 9. Atomically find the user and set reset token fields
    //    If no user exists, no document will be updated
    const user = await User.findOneAndUpdate(
        { email },
        {
            $set: {
                passwordResetToken: hashedToken,
                passwordResetTokenExpires: expiresAt
            }
        },
        {
            new: true
        }
    );

    if (!user) {
        return NextResponse.json({
            success: true,
            message: "If an account with that email exists, a reset link has been sent."
        });
    }

    try {
        // Send password reset email using raw token
        await sendPasswordResetEmail(email, rawToken);
    } catch (error) {

        // Roll back ONLY if this exact request is still the latest state
        //      (prevents overwriting a newer valid token)
        await User.updateOne(
            {
                _id: user._id,
                passwordResetToken: hashedToken,
                passwordResetTokenExpires: expiresAt
            },
            {
                $unset: {
                    passwordResetToken: 1,
                    passwordResetTokenExpires: 1
                }
            }
        );

        return NextResponse.json(
            { error: "Failed to send password reset email. Please try again." },
            { status: 500 }
        );
    }

    // Return generic success response
    return NextResponse.json({
        success: true,
        message: "If an account with that email exists, a reset link has been sent."
    });
}