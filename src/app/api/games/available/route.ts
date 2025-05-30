import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { Game } from "@/../lib/models/Game";
import { User } from "@/../lib/models/User";
import { Types } from "mongoose"; // if not already imported
import dbConnect from "@/../lib/mongoose";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // 1. Get the currently logged-in user's session
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ error: "Unauthenticated user" }, { status: 401 });
        }

        // 2. Connect to the database
        await dbConnect();

        // 3. Find the user and populate the games they have registered
        const user = await User.findById(session.user.id).select("registeredGames");
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const registeredIds = user?.registeredGames.map((id: Types.ObjectId) => id.toString()) || [];

        const unregisteredGames = await Game.find({
            _id: { $nin: registeredIds },
        });

        return NextResponse.json({ availableGames: unregisteredGames });
    } catch (error) {
        console.error("Error fetching available games:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
