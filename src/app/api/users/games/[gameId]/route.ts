import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import dbConnect from "@/../lib/mongoose";
import { Game } from "@/../lib/models/Game";
import { User } from "@/../lib/models/User";
import mongoose from "mongoose";

export async function GET(request: Request, { params }: { params: { gameId: mongoose.Types.ObjectId } }) {
    
    console.log("GET /api/users/games/:gameId route hit");
    try {
        console.log("try block entered");
        // 1. Get the currently logged-in user's session
        const session = await getServerSession(authOptions);

        // 2. Return 401 if there's no session or no logged-in user
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthenticated user" }, { status: 401 });
        }

        // 3. Get gameId from query parameters
        const { gameId } = await params;

        // 4. Return 400 if gameId is not provided
        if (!gameId) {
            console.log("Game ID not provided");
            return NextResponse.json({ error: "Game ID not provided" }, { status: 400 });
        }

        // 5. Return 400 if gameId is not a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(gameId)) {
            console.log("Invalid game ID object");
            return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
        }

        // 6. Connect to the database
        await dbConnect();

        // 7. Verify game exists
        const game = await Game.findById(gameId);
        if (!game) {
            console.log("Game not found");
            return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }

        // 8. Fetch user data, including registeredGames
        const user = await User.findOne({ email: session.user.email });

        // 9. If there's no logged-in user or the session has expired, redirect to login
        if (!user) {
            console.log("Unauthorized (step 9)");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 10. Check if the gameId is in the user's registeredGames array. 'gameId' is a string, because it's coming from the URL
        const gameIsRegistered = user.registeredGames.some(
            (regGameId: mongoose.Types.ObjectId) => regGameId.toString() === gameId.toString()
        );

        // 11. If the game is not registered, redirect to the home page
        if (!gameIsRegistered) {
            console.log("Game not registered");
            return NextResponse.json({ error: "Game not registered" }, { status: 403 });
        }

        return NextResponse.json({ game });
    } catch (error) {
        console.error(error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}