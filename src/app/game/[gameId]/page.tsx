import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import dbConnect from "@/../lib/mongoose";
import React from "react";
import mongoose from "mongoose";

interface Props {
    params: {
        gameId: string
    }
}

const GameDetailsPage = async ({ params }: Props) => {

    // 1. Get the currently logged-in user's session
    const session = await getServerSession(authOptions);

    // ==================================================== !! TAKE A LOOK AT THIS, DO I REDIRECT INSTEAD? !! ===============================================
    // 2. Return 401 if there's no session or no logged-in user
    if (!session || !session.user) {
    return <div className="text-red-500">You must be logged in to view this page.</div>;
    // ==================================================== !! TAKE A LOOK AT THIS, DO I REDIRECT INSTEAD? !! ===============================================
  }

    // 3. Connect to the database
    await dbConnect();

    // 4. Parse gameId from request
    const { gameId } = params;

    // 5. Return 400 if gameId is not provided
    if (!gameId) {
        return NextResponse.json({ error: "Game ID not provided" }, { status: 400 });
    }

    // 6. Return 400 if gameId is not a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(gameId)) {
        return NextResponse.json({ error: "Invalid game ID" }, { status: 400 });
    }

    return (
        <div>
            <h1>Game Details Will Go Here</h1>
        </div>
    )
};

export default GameDetailsPage; // this needs to be default, because that's how Next.js knows to look for and import it