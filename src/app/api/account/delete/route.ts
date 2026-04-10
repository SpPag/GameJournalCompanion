import { getServerSession } from "next-auth";
import { authOptions } from "@/../lib/authOptions";
import { User } from "@/../lib/models/User";
import { Note } from "@/../lib/models/Note";
import dbConnect from "@/../lib/mongoose";
import { NextResponse } from "next/server";

export async function DELETE() {
    try {
        // 1. Get the currently logged-in user's session
        const session = await getServerSession(authOptions);

        // 2. Return 401 if there's no session or no logged-in user
        if (!session || !session.user) {
            return NextResponse.json(
                { error: "Unauthenticated user" },
                { status: 401 }
            );
        }

        // 3. Connect to the database
        await dbConnect();

        // 4. Find the user by session user id
        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        // 5. Delete all notes belonging to this user
        await Note.deleteMany({ userId: user._id });

        // 6. Delete the user itself
        await User.deleteOne({ _id: user._id });

        // 7. Return success response
        return NextResponse.json(
            { message: "Account deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting account:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}