import { NextResponse } from "next/server";
import dbConnect from "@/../lib/mongoose";
import { User } from "@/../lib/models/User";
import crypto from "crypto";
import { sendVerificationEmail } from "@/../lib/email";

export async function POST(req: Request) {
    const { email } = await req.json();

    if (!email) {
        return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    await dbConnect();

    const COOLDOWN = 120 * 1000;
    const now = new Date();

    // 1. Generate token FIRST (needed for update)
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // 2. Atomic update with cooldown check
    const user = await User.findOneAndUpdate(
        {
            email,
            emailVerified: false,
            $or: [
                { lastResendEmailSentAt: { $exists: false } },
                { lastResendEmailSentAt: { $lte: new Date(Date.now() - COOLDOWN) } }
            ]
        },
        {
            $set: {
                verificationToken: hashedToken,
                verificationTokenExpires: new Date(Date.now() + 1000 * 60 * 60),
                lastResendEmailSentAt: now
            }
        },
        {
            new: true // return updated doc
        }
    );

    // 3. If no user matched → cooldown or invalid user
    if (!user) {
        return NextResponse.json(
            { error: "Please wait before requesting another email." },
            { status: 429 }
        );
    }

    // 4. Send email AFTER successful update
    try {
        await sendVerificationEmail(email, rawToken);
    } catch (error) {
        return NextResponse.json(
            { error: "Failed to send verification email. Please try again." },
            { status: 500 }
        );
    }

    return NextResponse.json({ success: true });
}