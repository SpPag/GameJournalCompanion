import { NextResponse } from 'next/server';
import { Game } from '@/../lib/models/Game';
import dbConnect from '@/../lib/mongoose';

export async function POST(request: Request) {
    // Connect to the database
    await dbConnect();

    // The method .json() reads the body stream and parses it as JSON.
    const body = await request.json();

    // First check if the game already exists on the database, based on its title
    const existingGame = await Game.findOne({ title: body.title });
    if (existingGame) {
        return NextResponse.json(
            { success: false, error: "A game with that title already exists" },
            { status: 400 }
        );
    }
    
    // The Game variable is a Mongoose model constructor and it creates a new document instance (an object representing a document to be saved to the database)
    const newGame = new Game(body);

    try {
        const savedGame = await newGame.save();
        return NextResponse.json(
            { success: true, game: savedGame },
            { status: 201 }
        );
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 500 }
            );
        } else {
            return NextResponse.json(
                { success: false, error: "An unknown error occurred" },
                { status: 500 }
            );
        }
    }
}