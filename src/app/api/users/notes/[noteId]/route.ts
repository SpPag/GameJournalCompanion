import { getServerSession } from "next-auth";
import { authOptions } from "@/../lib/authOptions";
import dbConnect from "@/../lib/mongoose";
import { NextResponse } from "next/server";
import { Note } from "../../../../../../lib/models/Note";
import { Types } from "mongoose";
import { updateUserLastActive } from "@/../lib/updateUserLastActive";
import { generateNoteTitle } from "@/lib/noteUtils";

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ noteId: string }> }
) {
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

        // 3. Await params to access noteId
        const { noteId } = await params;

        // 4. Validate noteId format
        if (!Types.ObjectId.isValid(noteId)) {
            return NextResponse.json(
                { error: "Invalid note ID" },
                { status: 400 }
            );
        }

        // 5. Parse request body
        let body: { content?: unknown; title?: unknown };

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        const { content, title } = body;

        // 6. Validate required fields
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

        // 7. Connect to the database
        await dbConnect();

        // 8. Find the note and verify ownership
        const note = await Note.findById(noteId);

        if (!note) {
            return NextResponse.json(
                { error: "Note not found" },
                { status: 404 }
            );
        }

        if (note.userId.toString() !== session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        const trimmedContent = content.trim();
        const trimmedTitle = typeof title === "string" ? title.trim() : "";
        const finalTitle = trimmedTitle || generateNoteTitle(trimmedContent);

        // 9. Update the note
        note.title = finalTitle;
        note.content = trimmedContent;
        note.lastEditedOn = new Date();

        await note.save();

        // 10. Update lastActive
        updateUserLastActive(session.user.id);

        // 11. Return updated note
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

        // 2. Return 401 if there is no session or required user data
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthenticated user" },
                { status: 401 }
            );
        }

        // 3. Await params to access noteId
        const { noteId } = await params;

        // 4. Validate noteId format
        if (!Types.ObjectId.isValid(noteId)) {
            return NextResponse.json(
                { error: "Invalid note ID" },
                { status: 400 }
            );
        }

        // 5. Connect to the database
        await dbConnect();

        // 6. Find the note and verify ownership
        const note = await Note.findById(noteId);

        if (!note) {
            return NextResponse.json(
                { error: "Note not found" },
                { status: 404 }
            );
        }

        if (note.userId.toString() !== session.user.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 403 }
            );
        }

        // 7. Delete the note
        await Note.findByIdAndDelete(noteId);

        // 8. Update lastActive
        updateUserLastActive(session.user.id);

        // 9. Return success response
        return NextResponse.json(
            { message: "Note deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error deleting note:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}