import mongoose, { Schema, Document, model, models } from "mongoose";

interface IGame extends Document {
    _id: mongoose.Types.ObjectId; // MongoDB's auto-generated ObjectID
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
        required: true,
        unique: true,
        trim: true
    },
    publisher: {
        type: String,
        required: true,
        trim: true
    },
    developer: {
        type: String,
        required: true,
        trim: true
    },
    westernReleaseYear: {
        type: String,
        required: true,
        trim: true
    },
    cover: {
        type: String,
        required: false,
        trim: true
    },
    genres: {
        type: String,
        required: true,
        trim: true
    }
})

// the following line checks if a model named 'Game' has already been registered with Mongoose. If yes, it's saved to the Game variable, otherwise, it creates a new model, registers it with Mongoose and saves it to the Game variable
const Game = models.Game || model<IGame>("Game", GameSchema);

export type { IGame }
export { Game, GameSchema }