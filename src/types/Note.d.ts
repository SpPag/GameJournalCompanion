interface Note {
    _id: string;
    userId: mongoose.Types.ObjectId;
    gameId: mongoose.Types.ObjectId;
    content: string;
}

export { Note }