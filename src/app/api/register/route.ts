import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import dbConnect from '@/../lib/mongoose';
import { User, IUser } from '@/../lib/models/User';
import crypto from "crypto";
import { sendVerificationEmail } from "@/../lib/email";

export async function POST(request: Request) {
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
    const existingUser = await User.findOne({ $or: [{ email }, { username }] }); // https://www.mongodb.com/docs/manual/reference/operator/query/or/#op._S_or ({email} is equivalent to { email: email })
    if (existingUser) {
        return NextResponse.json(
            { error: "User already exists" },
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
            // games: [], // optional since schema already sets a default
        });

        // 8. Send verification email (using the raw token, since the user will be sending it back to us and we need to hash it and compare it to the hashed token in the database)
        try {
            console.log("STEP 1: before email function");
            await sendVerificationEmail(email, rawToken);
            console.log("STEP 2: after email function");
        } catch (error) {
            // rollback user creation if email fails
            await User.deleteOne({ email });

            return NextResponse.json(
                { error: "Failed to send verification email. Please try again." },
                { status: 500 }
            );
        }

        // 9. Return success (omit password from response!)
        // I'm including the following line that disables ESlint's no-unused-vars rule for this specific line. The relevant error stems from me grabbing the password and storing it in the _pw variable, which I don't want to be included anywhere. I would have to use it otherwise, which is the exact opposite of the point of the _pw throwaway variable
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: _pw, ...userWithoutPassword } = newUser.toObject() as IUser;
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