import mongoose, { Schema, Document, model, models } from "mongoose";

interface INote extends Document {
    _id: mongoose.Types.ObjectId; // MongoDB's auto-generated ObjectID;
    userId: mongoose.Types.ObjectId;
    gameId: mongoose.Types.ObjectId;
    content: string;
    lastEditedOn: Date;
}

const NoteSchema = new Schema<INote>({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    gameId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Game"
    },
    content: {
        type: String,
        required: true
    },
    lastEditedOn: {
        type: Date,
        required: true,
        default: Date.now
    }
})

// This is a Mongoose middleware that updates lastEditedOn whenever the note is updated.
NoteSchema.pre('save', function(next) { // hooks a function to be run before a document is saved (with .save())
  this.lastEditedOn = new Date(); // Updates `lastEditedOn` to the current date/time
  next(); // Tells Mongoose to proceed with saving
});

// the following line checks if a model named 'Game' has already been registered with Mongoose. If yes, it's saved to the Game variable, otherwise, it creates a new model, registers it with Mongoose and saves it to the Game variable
const Note = models.Note || model<INote>("Note", NoteSchema);

export type { INote }
export { Note, NoteSchema }