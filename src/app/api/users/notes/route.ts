import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/../lib/mongoose";
import { NextResponse } from "next/server";
import { Note } from "../../../../../lib/models/Note";
// import { Note } from "@/../lib/models/Note";

// Force model registration
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// const _ = Note.modelName;

export async function GET(request: Request) {
    try {
        // 1. Get the currently logged-in user's session
        const session = await getServerSession(authOptions);

        // 2. Return 401 if there's no session or no logged-in user
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthenticated user" }, { status: 401 });
        }

        // 3. Get gameId from query parameters
        const { searchParams } = new URL(request.url);
        const gameId = searchParams.get("gameId");

        // 4. Return 400 if gameId is not provided
        if (!gameId) {
            return NextResponse.json({ error: "Game ID not provided" }, { status: 400 });
        }

        // 5. Connect to the database
        await dbConnect();

        // 6. Fetch notes for this user & game
        const notes = await Note.find({
            userId: session.user.id,
            gameId: gameId,
        }).sort({ lastEditedOn: -1 }); // Sort notes by lastEditedOn in descending order

        // 7. Return the notes
        return NextResponse.json({ notes });

    }
    catch (error) {
        console.error("Error fetching user's notes for this game:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}