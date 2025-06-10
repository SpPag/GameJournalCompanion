// src/app/api/users/games/route.ts

import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { Game } from "@/../lib/models/Game";
import { User } from "@/../lib/models/User";
import dbConnect from "@/../lib/mongoose";
import { NextResponse } from "next/server";

// Force model registration
// the following line disables the eslint warning regarding the declaration of an unused variable. I'm deliberately leaving the variable name empty to signify that it's meant to be unused. The only reason the line exists is to force the model to be registered before the route tries to get the user's games populated. This deals with the MissingSchema error when loading the home page, without having clicked on the 'Register a new game' GameCard instance (which would trigger the model registration)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _ = Game.modelName;

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