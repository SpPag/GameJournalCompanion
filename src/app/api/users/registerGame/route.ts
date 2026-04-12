import { getServerSession } from "next-auth";
import { authOptions } from "@/../lib/authOptions";
import { User } from "@/../lib/models/User";
import { Game } from "@/../lib/models/Game";
import { NextResponse } from "next/server";
import dbConnect from "@/../lib/mongoose";
import mongoose from "mongoose";
import { updateUserLastActive } from "@/../lib/updateUserLastActive";

export async function POST(request: Request) {
    try {
        // 1. Get the currently logged-in user's session
        const session = await getServerSession(authOptions);

        // 2. Return 401 if there is no session or required user data
        if (!session?.user?.id || !session?.user?.email) {
            return NextResponse.json(
                { error: "Unauthenticated user" },
                { status: 401 }
            );
        }

        // 3. Parse request body
        let body: { gameId?: unknown };

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { error: "Invalid request body" },
                { status: 400 }
            );
        }

        const { gameId } = body;

        // 4. Validate gameId
        if (typeof gameId !== "string" || !gameId.trim()) {
            return NextResponse.json(
                { error: "Game ID not provided" },
                { status: 400 }
            );
        }

        if (!mongoose.Types.ObjectId.isValid(gameId)) {
            return NextResponse.json(
                { error: "Invalid game ID" },
                { status: 400 }
            );
        }

        // 5. Connect to the database
        await dbConnect();

        // 6. Check if the game exists
        const gameExists = await Game.exists({ _id: gameId });

        if (!gameExists) {
            return NextResponse.json(
                { error: "Game not found" },
                { status: 404 }
            );
        }

        // 7. Check if the game is already registered
        const user = await User.findById(session.user.id).select("registeredGames");

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            );
        }

        const alreadyRegistered = user.registeredGames.some(
            (registeredGameId: mongoose.Types.ObjectId) => registeredGameId.toString() === gameId
        );

        if (alreadyRegistered) {
            return NextResponse.json(
                { error: "Game already registered" },
                { status: 400 }
            );
        }

        // 8. Register the game
        await User.findByIdAndUpdate(
            session.user.id,
            {
                $push: { registeredGames: gameId }
            }
        );

        // 9. Update lastActive (non-blocking already handled in helper)
        updateUserLastActive(session.user.id);

        // 10. Return success
        return NextResponse.json(
            { message: "Game registered successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error registering game:", error);

        return NextResponse.json(
            { error: "Server error" },
            { status: 500 }
        );
    }
}