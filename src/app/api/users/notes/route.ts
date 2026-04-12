import { getServerSession } from "next-auth";
import { authOptions } from "@/../lib/authOptions";
import dbConnect from "@/../lib/mongoose";
import { NextResponse } from "next/server";
import { Note } from "../../../../../lib/models/Note";
import { Types } from "mongoose";
import { updateUserLastActive } from "@/../lib/updateUserLastActive";
import { generateNoteTitle } from "@/lib/noteUtils";
import { User } from "@/../lib/models/User";

export async function GET(request: Request) {
    try {
        // 1. Get the currently logged-in user's session
        const session = await getServerSession(authOptions);

        // 2. Return 401 if there is no session or required user data
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthenticated user" },
                { status: 401 }
            );
        }

        // 3. Get gameId from query parameters
        const { searchParams } = new URL(request.url);
        const gameId = searchParams.get("gameId");

        // 4. Validate gameId
        if (!gameId) {
            return NextResponse.json(
                { error: "Game ID not provided" },
                { status: 400 }
            );
        }

        if (!Types.ObjectId.isValid(gameId)) {
            return NextResponse.json(
                { error: "Invalid game ID" },
                { status: 400 }
            );
        }

        // 5. Connect to the database
        await dbConnect();

        // 6. Fetch notes for this user and game
        const notes = await Note.find({
            userId: session.user.id,
            gameId,
        }).sort({ lastEditedOn: -1 }); // Sort notes by lastEditedOn in descending order

        // 7. Return notes
        return NextResponse.json({ notes });
    } catch (error) {
        console.error("Error fetching user's notes for this game:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        // 1. Get the currently logged-in user's session
        const session = await getServerSession(authOptions);

        // 2. Return 401 if there is no session or required user data
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthenticated user" },
                { status: 401 }
            );
        }

        // 3. Parse request body
        let body: { gameId?: unknown; content?: unknown; title?: unknown };

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        const { gameId, content, title } = body;

        // 4. Validate fields
        if (typeof gameId !== "string" || !Types.ObjectId.isValid(gameId)) {
            return NextResponse.json(
                { error: "Invalid game ID" },
                { status: 400 }
            );
        }

        if (typeof content !== "string" || !content.trim()) {
            return NextResponse.json(
                { error: "Content is required" },
                { status: 400 }
            );
        }

        if (title !== undefined && typeof title !== "string") {
            return NextResponse.json(
                { error: "Invalid title" },
                { status: 400 }
            );
        }

        const trimmedContent = content.trim();
        const trimmedTitle = typeof title === "string" ? title.trim() : "";
        const finalTitle = trimmedTitle || generateNoteTitle(trimmedContent);

        // 5. Connect to the database
        await dbConnect();


        // 6. Verify that the game is registered under the user
        const user = await User.findById(session.user.id).select("registeredGames");

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const hasRegisteredGame = user.registeredGames.some(
            (registeredGameId: Types.ObjectId) => registeredGameId.toString() === gameId
        );

        if (!hasRegisteredGame) {
            return NextResponse.json(
                { error: "Game is not registered under this user" },
                { status: 403 }
            );
        }
        // 7. Create the new note
        const newNote = new Note({
            userId: session.user.id,
            gameId,
            title: finalTitle,
            content: trimmedContent,
        });

        // 8. Save the note
        await newNote.save();

        // 9. Update lastActive
        updateUserLastActive(session.user.id);

        // 10. Return the created note
        return NextResponse.json({ note: newNote }, { status: 201 });
    } catch (error) {
        console.error("Error creating note:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}