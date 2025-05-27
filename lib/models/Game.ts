import mongoose, { Schema, Document, model, models } from "mongoose";

interface IGame extends Document {
    title: string;
    publisher: string;
    developer: string;
    westernReleaseYear: string;
    cover: string;
    genres: string;
}

const GameSchema = new Schema<IGame>({
    title: {
        type: String,
        required: true
    },
    publisher: {
        type: String,
        required: true
    },
    developer: {
        type: String,
        required: true
    },
    westernReleaseYear: {
        type: String,
        required: true
    },
    cover: {
        type: String,
        required: false
    },
    genres: {
        type: String,
        required: true
    }
})

// the following line checks if a model named 'Game' has already been registered with Mongoose. If yes, it's saved to the Game variable, otherwise, it creates a new model, registers it with Mongoose and saves it to the Game variable
const Game = models.Game || model<IGame>("Game", GameSchema);

export type { IGame }
export { Game, GameSchema }