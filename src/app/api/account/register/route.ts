import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import dbConnect from '@/../lib/mongoose';
import { User } from '@/../lib/models/User';
import crypto from "crypto";
import { sendVerificationEmail } from "@/../lib/email";
import { registerIpLimiter } from "@/../lib/rateLimit";
import { isReservedUsername, normalizeUsername } from "@/../lib/reservedUsernames";

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

export async function POST(request: Request) {

    // 1. Get client IP for rate limiting
    const ip = getClientIp(request);

    // 2. Apply IP-based rate limiting to registration attempts
    const { success, limit, remaining, reset } = await registerIpLimiter.limit(ip);

    // 3. If rate limit exceeded, return 429 with rate limit headers
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

    // debug log to verify that the MongoDB URI is being read correctly from environment variables
    // console.log("Mongo URI exists:", !!process.env.MONGODB_URI);

    // 4. Parse the incoming JSON body
    let body: { email?: unknown; username?: unknown; password?: unknown };

    try {
        body = await request.json();
    } catch {
        return NextResponse.json(
            { error: "Invalid request body" },
            { status: 400 }
        );
    }

    const { email, username, password } = body;

    // 5. Validate presence and type of required fields
    if (
        typeof email !== "string" ||
        typeof username !== "string" ||
        typeof password !== "string"
    ) {
        return NextResponse.json(
            { error: "Missing or invalid email, username or password" },
            { status: 400 }
        );
    }

    const normalizedUsername = normalizeUsername(username);
    const trimmedUsername = username.trim();

    if (!/^[a-zA-Z0-9_]+$/.test(trimmedUsername)) {
        return NextResponse.json(
            { error: "Username may only contain letters, numbers, and underscores." },
            { status: 400 }
        );
    }

    if (trimmedUsername.length < 3 || trimmedUsername.length > 30) {
        return NextResponse.json(
            { error: "Username must be between 3 and 30 characters long." },
            { status: 400 }
        );
    }

    if (password.length < 8) {
        return NextResponse.json(
            { error: "Password must be at least 8 characters long" },
            { status: 400 }
        );
    }

    if (isReservedUsername(username)) {
        return NextResponse.json(
            { error: "This username is not available." },
            { status: 400 }
        );
    }
    // 6. Connect to MongoDB
    await dbConnect();

    // 7. Check whether a user already exists with the same email or username
    const existingUser = await User.findOne({
        $or: [
            { email },
            { usernameLower: normalizedUsername }
        ]
    });

    if (existingUser) {
        return NextResponse.json(
            { error: "Unable to create account with the provided details" },
            { status: 400 }
        );
    }

    // 8. Generate email verification token:
    //    - raw token is sent to the user by email
    //    - hashed token is stored in the database for security
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // 9. Hash the password before saving it
    const hashedPassword = await hash(password, 10);

    try {
        // 10. Create the new user in an unverified state
        const newUser = await User.create({
            email,
            username: trimmedUsername,
            usernameLower: normalizedUsername,
            password: hashedPassword,
            emailVerified: false,
            verificationToken: hashedToken,
            verificationTokenExpires: new Date(Date.now() + 1000 * 60 * 60), // token valid for 1 hour
            lastResendEmailSentAt: new Date(),
            // registeredGames defaults to [] in the schema
        });

        try {
            // 11. Send verification email using the raw token
            //     The user will later send this token back to us,
            //     and we will hash it again to compare against the stored hashed token
            await sendVerificationEmail(email, rawToken);
        } catch (error) {
            // 12. Roll back user creation if verification email fails to send
            await User.deleteOne({ _id: newUser._id });

            return NextResponse.json(
                { error: "Failed to send verification email. Please try again." },
                { status: 500 }
            );
        }

        // 13. Return success response
        return NextResponse.json(
            {
                success: true,
                message: "Check your email to verify your account"
            },
            { status: 201 }
        );
    } catch (error: unknown) {
        // 14. Return a meaningful server error response
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === 11000
        ) {
            return NextResponse.json(
                { success: false, error: "Unable to create account with the provided details" },
                { status: 400 }
            );
        }
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