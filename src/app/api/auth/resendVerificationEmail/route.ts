import { NextResponse } from "next/server";
import dbConnect from "@/../lib/mongoose";
import { User } from "@/../lib/models/User";
import crypto from "crypto";
import { sendVerificationEmail } from "@/../lib/email";
import { resendIpLimiter, resendEmailLimiter } from "@/../lib/rateLimit";
import { getClientIp } from "@/../lib/getClientIP";

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

    // Parse the incoming JSON body
    let body: { email?: unknown };

    try {
        body = await req.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }

    const { email } = body;

    // Validate required field
    if (typeof email !== "string" || email.trim().length === 0) {
        return NextResponse.json(
            { error: "Missing or invalid email" },
            { status: 400 }
        );
    }

    const normalizedEmail = email.trim().toLowerCase();

    const emailRateLimitKey = crypto.createHash("sha256").update(normalizedEmail).digest("hex");

    // Apply email address-based rate limiting
    const {
        success: emailAddressSuccess,
        limit: emailAddressLimit,
        remaining: emailAddressRemaining,
        reset: emailAddressReset,
    } = await resendEmailLimiter.limit(emailRateLimitKey); // using hashed email as key to avoid storing raw emails in Redis keys / analytics

    // If email address rate limit exceeded, return 429 with rate limit headers
    if (!emailAddressSuccess) {
        return NextResponse.json(
            {
                error: "Too many requests. Please try again later.",
            },
            {
                status: 429,
                headers: {
                    "X-RateLimit-Limit": String(emailAddressLimit),
                    "X-RateLimit-Remaining": String(emailAddressRemaining),
                    "X-RateLimit-Reset": String(emailAddressReset),
                },
            }
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
            email: normalizedEmail,
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
        return NextResponse.json({
            success: true,
            message: "If the account exists and is not yet verified, a verification email will be sent."
        });
    }

    try {
        // Send verification email using RAW token
        //      (user will send it back → we hash it again and compare)
        await sendVerificationEmail(normalizedEmail, rawToken);
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