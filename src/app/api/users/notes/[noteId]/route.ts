import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import dbConnect from "@/../lib/mongoose";
import { NextResponse } from "next/server";
import { Note } from "../../../../../../lib/models/Note";
import { Types } from "mongoose";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ noteId: string }> }
) {
    try {
        // 1. Get the currently logged-in user's session
        const session = await getServerSession(authOptions);

        // 2. Return 401 if there's no session or no logged-in user
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthenticated user" }, { status: 401 });
        }

        // 3. Await params to access noteId
        const { noteId } = await params;

        // 4. Get the request body
        const body = await request.json();
        const { content, title } = body;

        // 5. Validate required fields
        if (!content) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        // 6. Validate noteId format
        if (!Types.ObjectId.isValid(noteId)) {
            return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
        }

        // 7. Connect to the database
        await dbConnect();

        // 8. Find the note and verify the user owns it
        const note = await Note.findById(noteId);
        if (!note) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }

        if (note.userId.toString() !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // 9. Update the note
        note.title = title || note.title;
        note.content = content;
        note.lastEditedOn = new Date();

        await note.save();

        // 10. Return the updated note
        return NextResponse.json({ note }, { status: 200 });

    } catch (error) {
        console.error("Error updating note:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ noteId: string }> }
) {
    try {
        // 1. Get the currently logged-in user's session
        const session = await getServerSession(authOptions);

        // 2. Return 401 if there's no session or no logged-in user
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthenticated user" }, { status: 401 });
        }

        // 3. Await params to access noteId
        const { noteId } = await params;

        // 4. Validate noteId format
        if (!Types.ObjectId.isValid(noteId)) {
            return NextResponse.json({ error: "Invalid note ID" }, { status: 400 });
        }

        // 5. Connect to the database
        await dbConnect();

        // 6. Find the note and verify the user owns it
        const note = await Note.findById(noteId);
        if (!note) {
            return NextResponse.json({ error: "Note not found" }, { status: 404 });
        }

        if (note.userId.toString() !== session.user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // 7. Delete the note
        await Note.findByIdAndDelete(noteId);

        // 8. Return success response
        return NextResponse.json({ message: "Note deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error("Error deleting note:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
