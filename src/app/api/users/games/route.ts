// src/app/api/users/games/route.ts

import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { User } from "@/../lib/models/User";
import { NextResponse } from "next/server";
import dbConnect from "@/../lib/mongoose";

export async function GET() {
    try {
        // 1. Get the currently logged-in user's session
        const session = await getServerSession(authOptions);

        // 2. Return 401 if there's no session or no logged-in user
        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthenticated user" }, { status: 401 });
        }

        // 3. Connect to the database
        await dbConnect();

        // 4. Find the user and populate the games they have registered
        const user = await User.findById(session.user.id).populate("registeredGames"); // 'registeredGames' should be the name of the field in the User schema
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 5. Return the user's registered games
        return NextResponse.json({
            registeredGames: user.registeredGames,
        });
    }
    catch (error) {
        console.error("Error fetching user games:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}