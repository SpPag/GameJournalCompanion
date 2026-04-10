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

    const user = await User.findOne({ email });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
        return NextResponse.json({ error: "Email already verified" }, { status: 400 });
    }

    // generate new token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.verificationToken = hashedToken;
    user.verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 60);

    await user.save();

    try {
        // debug
        // console.log("STEP 1: before email function in resend route");
        await sendVerificationEmail(email, rawToken);
        // debug
        // console.log("STEP 2: after email function in resend route");
    } catch (error) {
        // rollback user creation if email fails
        await User.deleteOne({ email });

        return NextResponse.json(
            { error: "Failed to send verification email. Please try again." },
            { status: 500 }
        );
    }
    return NextResponse.json({ success: true });
}