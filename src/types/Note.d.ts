interface Note {
    _id: mongoose.Types.ObjectId; // MongoDB's auto-generated ObjectID;
    userId: mongoose.Types.ObjectId;
    gameId: mongoose.Types.ObjectId;
    title: string;
    content: string;
    lastEditedOn: Date;
}

export { Note }