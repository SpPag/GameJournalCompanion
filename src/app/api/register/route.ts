import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import dbConnect from '@/../lib/mongoose';
import { User, IUser } from '@/../lib/models/User';

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

    // 5. Hash the password
    const hashedPassword = await hash(password, 10);

    // 6. Create the user
    try {
        const newUser = await User.create({
            email,
            username,
            password: hashedPassword,
        });

        // 7. Return success (omit password from response!)
        const { password: _pw, ...userWithoutPassword } = newUser.toObject() as IUser;
        return NextResponse.json(
            { user: userWithoutPassword },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}