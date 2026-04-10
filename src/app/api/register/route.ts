import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import dbConnect from '@/../lib/mongoose';
import { User } from '@/../lib/models/User';
import crypto from "crypto";
import { sendVerificationEmail } from "@/../lib/email";
import { registerIpLimiter } from "@/../lib/rateLimit";

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

export async function POST(request: Request) {
    const ip = getClientIp(request);

    const { success, limit, remaining, reset } = await registerIpLimiter.limit(ip);

    if (!success) {
        return NextResponse.json(
            {
                error: "Too many registration attempts from this network. Please try again later.",
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

    console.log("Mongo URI exists:", !!process.env.MONGODB_URI);

    // 1. Parse the incoming JSON body
    const { email, username, password } = await request.json();

    // 2. Validate presence of required fields
    if (!email || !username || !password) {
        return NextResponse.json(
            { error: "Missing email, username or password" },
            { status: 400 }
        );
    }

    // 3. Connect to MongoDB
    await dbConnect();

    // 4. Check for existing user by email or username
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
        return NextResponse.json(
            { error: "Unable to create account with the provided details" },
            { status: 400 }
        );
    }

    // 5. Generate a verification token (both raw and hashed)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // 6. Hash the password
    const hashedPassword = await hash(password, 10);

    // 7. Create the user
    try {
        const newUser = await User.create({
            email,
            username,
            password: hashedPassword,
            emailVerified: false,
            verificationToken: hashedToken,
            verificationTokenExpires: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
            lastResendEmailSentAt: new Date(),
            // games: [], // optional since schema already sets a default
        });

        // 8. Send verification email (using the raw token, since the user will be sending it back to us and we need to hash it and compare it to the hashed token in the database)
        try {
            // debug
            // console.log("STEP 1: before email function");
            await sendVerificationEmail(email, rawToken);
            // debug
            // console.log("STEP 2: after email function");
        } catch (error) {
            // rollback user creation if email fails
            await User.deleteOne({ _id: newUser._id });

            return NextResponse.json(
                { error: "Failed to send verification email. Please try again." },
                { status: 500 }
            );
        }

        // 9. Return success response
        return NextResponse.json(
            {
                success: true,
                message: "Check your email to verify your account"
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        } else {
            return NextResponse.json(
                { success: false, error: "An unknown error occurred" },
                { status: 500 }
            );
        }
    }
}