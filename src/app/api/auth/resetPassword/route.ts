import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import dbConnect from "@/../lib/mongoose";
import { User } from "@/../lib/models/User";
import crypto from "crypto";
import { resetPasswordIpLimiter } from "@/../lib/rateLimit";
import { sendPasswordChangedEmail } from "@/../lib/email";
import { getClientIp } from "@/../lib/getClientIP";

export async function POST(req: Request) {

    // Get client IP for rate limiting
    const ip = getClientIp(req);

    // Apply IP-based rate limiting
    const { success, limit, remaining, reset } = await resetPasswordIpLimiter.limit(ip);

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

    // Parse request body and extract token and new password
    const { token, password } = await req.json();

    // Validate required fields
    if (!token || !password) {
        return NextResponse.json(
            { error: "Missing token or password" },
            { status: 400 }
        );
    }

    // Validate password length
    if (password.length < 8) {
        return NextResponse.json(
            { error: "Password must be at least 8 characters long" },
            { status: 400 }
        );
    }

    // Connect to database
    await dbConnect();

    // Hash the raw token from the URL so it can be compared with the hashed token in the database
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Hash the new password before saving it
    const hashedPassword = await hash(password, 10);

    // Atomically:
    //      - ensure reset token matches
    //      - ensure reset token has not expired
    //      - update password
    //      - clear reset token fields so the token cannot be reused
    const user = await User.findOneAndUpdate(
        {
            passwordResetToken: hashedToken,
            passwordResetTokenExpires: { $gt: new Date() }
        },
        {
            $set: {
                password: hashedPassword
            },
            $unset: {
                passwordResetToken: 1,
                passwordResetTokenExpires: 1
            }
        },
        {
            new: true // return updated document
        }
    );

    // If no user was updated:
    //      - either token is invalid
    //      - OR token has expired
    //      - OR token has already been used
    if (!user) {
        return NextResponse.json(
            { error: "Invalid or expired reset token" },
            { status: 400 }
        );
    }

    try {
        await sendPasswordChangedEmail(user.email);
    } catch (error) {
        console.error("Failed to send password changed email:", error);
    }

    // Return success response
    return NextResponse.json(
        {
            success: true,
            message: "Password reset successfully. You can now log in."
        },
        { status: 200 }
    );
}