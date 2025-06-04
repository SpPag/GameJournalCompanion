import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { User } from "@/../lib/models/User";
import { Game } from "@/../lib/models/Game";
import { NextResponse } from "next/server";
import dbConnect from "@/../lib/mongoose";
import mongoose from "mongoose";

export async function POST(request: Request) {
    try {
        // 1. Get the currently logged-in user's session
        const session = await getServerSession(authOptions);
        
        // 2. Return 401 if there's no session or no logged-in user
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthenticated user" }, { status: 401 });
        }

        // 3. Connect to the database
        await dbConnect();

        // 4. Parse gameId from request
        const { gameId } = await request.json(); // destructure the gameId from the request body

        // 5. Return 400 if gameId is not provided
        if (!gameId) {
            return NextResponse.json({ error: "Game ID not provided" }, { status: 400 });
        }

        // 6. Return 400 if gameId is not a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(gameId)) {
            return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
        }

        // 7. Find the user by email
        const user = await User.findOne({ email: session.user.email });
        
        // 8. Return 404 if user is not found
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 9. Check if the game exists based on gameId
        const gameExists = await Game.findById(gameId);
        
        // 10. Return 404 if game is not found
        if (!gameExists) {
            return NextResponse.json({ error: "Game not found" }, { status: 404 });
        }
        
        // 11. Check if the game is already registered by the user and return 400 if so
        if (user.registeredGames.includes(gameId)) {
            return NextResponse.json({ error: "Game already registered" }, { status: 400 });
        }

        // 12. Push the gameId to the user's registeredGames array
        user.registeredGames.push(gameId);
        
        // 13. Save the user to the database
        await user.save();
        
        // 14. Return 200 if successful
        return NextResponse.json({ message: "Game registered successfully" }, { status: 200 });
    }
    catch (error) {
        console.error("Error fetching available games:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}