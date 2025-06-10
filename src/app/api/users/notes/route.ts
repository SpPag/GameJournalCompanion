import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/../lib/mongoose";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    try {
        // 1. Get the currently logged-in user's session
                const session = await getServerSession(authOptions);
        
                // 2. Return 401 if there's no session or no logged-in user
                if (!session || !session.user) {
                    return NextResponse.json({ error: "Unauthenticated user" }, { status: 401 });
                }
        
                // 3. Get gameId from query parameters
                const { searchParams } = new URL(request.url);
                const gameId = searchParams.get("gameId");

                // 4. Return 400 if gameId is not provided
                if (!gameId) {
                    return NextResponse.json({ error: "Game ID not provided" }, { status: 400 });
                }

                // 5. Connect to the database
                await dbConnect();

    }
    catch (error) {
            console.error("Error fetching user's notes for this game:", error);
            return NextResponse.json(
                { error: "Internal Server Error" },
                { status: 500 }
            );
        }
}