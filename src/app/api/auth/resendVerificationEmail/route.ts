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

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

    // Reserve the resend slot atomically
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
                verificationTokenExpires: expiresAt,
                lastResendEmailSentAt: now
            }
        },
        {
            new: true
        }
    );

    if (!user) {
        return NextResponse.json(
            { error: "Please wait before requesting another email." },
            { status: 429 }
        );
    }

    try {
        await sendVerificationEmail(email, rawToken);
        return NextResponse.json({ success: true });
    } catch (error) {
        // Roll back only if the values still match this exact request
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

        return NextResponse.json(
            { error: "Failed to send verification email. Please try again." },
            { status: 500 }
        );
    }
}