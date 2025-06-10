import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import dbConnect from "@/../lib/mongoose";
import React from "react";
import mongoose from "mongoose";
import { redirect } from "next/navigation";
import { Game } from "../../../../lib/models/Game";
import { GameTitle } from "@/components/GameTitle";
import { User } from "../../../../lib/models/User";
import { Note } from "../../../../lib/models/Note";

interface GameDetailsPageProps {
    params: {
        gameId: string
    }
}

const GameDetailsPage = async ({ params }: GameDetailsPageProps) => {

    // 1. Get the currently logged-in user's session
    const session = await getServerSession(authOptions);

    // 2. Return 401 if there's no session or no logged-in user
    if (!session || !session.user) {
        redirect("/login"); // 'redirect()' is used for server-side navigation, while 'router.push()' is used for client-side navigation
    }

    // 3. Connect to the database
    await dbConnect();

    // 4. Parse gameId from request
    const { gameId } = await params;

    // 5. Return 400 if gameId is not provided
    if (!gameId) {
        return NextResponse.json({ error: "Game ID not provided" }, { status: 400 });
    }

    // 6. Return 400 if gameId is not a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
        return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
    }

    // 7. Fetch user data, including registeredGames
    const user = await User.findOne({ email: session.user.email });

    // 8. If there's no logged-in user or the session has expired, redirect to login
    if (!user) {
        redirect("/login");
    }

    // 9. Check if the gameId is in the user's registeredGames array. 'gameId' is a string, because it's coming from the URL
    const gameIsRegistered = user.registeredGames.some(
        (regGameId: mongoose.Types.ObjectId) => regGameId.toString() === gameId
    );

    // 10. If the game is not registered, redirect to the home page
    if (!gameIsRegistered) {
        redirect("/?error=game-not-registered");
    }

    // 11. Fetch the game document from DB
    const game = await Game.findById(gameId);

    // 12. Return 404 if game is not found
    if (!game) {
        return NextResponse.json({ error: "Game not found" }, { status: 404 });
    }

    // 13. Fetch all notes for this user & game
    const notes = (await Note.find({ userId: user.id, gameId: game.id })).sort((a, b) => a.lastEditedOn - b.lastEditedOn).reverse();

    return (
        <div>
            <div>
                {/* Pass the game to your component */}
                <GameTitle game={game} />
                {/* You can add more game details/components here */}
            </div>
            {[...notes].map((note) => (
                <div key={note._id}>
                    <p>{note.content}</p>
                </div>
            ))
            }
        </div>
    );
};

export default GameDetailsPage; // this needs to be default, because that's how Next.js knows to look for and import it