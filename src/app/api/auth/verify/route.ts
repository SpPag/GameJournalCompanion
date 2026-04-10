import { NextResponse } from "next/server";
import crypto from "crypto";
import dbConnect from "@/../lib/mongoose";
import { User } from "@/../lib/models/User";

export async function GET(req: Request) {
    try {
        // 1. Get token from URL
        const { searchParams } = new URL(req.url);
        const token = searchParams.get("token");

        if (!token) {
            return NextResponse.json(
                { error: "Missing token" },
                { status: 400 }
            );
        }

        // 2. Hash token (must match registration hashing method)
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        // 3. Connect to DB
        await dbConnect();

        // 4. Find user with matching token AND valid expiration
        const user = await User.findOne({
            verificationToken: hashedToken,
            verificationTokenExpires: { $gt: new Date() }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Invalid or expired verification link" },
                { status: 400 }
            );
        }

        // 5. Activate account
        user.emailVerified = true;

        // 6. Clean up verification fields
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;

        await user.save();

        // 7. Redirect user to login page
        return NextResponse.redirect(
            new URL("/login?verified=true", req.url)
        );

    } catch (error) {
        return NextResponse.json(
            { error: "Verification failed" },
            { status: 500 }
        );
    }
}