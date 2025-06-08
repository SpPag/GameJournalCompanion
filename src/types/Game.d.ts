interface Game {
    _id: mongoose.Types.ObjectId; // MongoDB's auto-generated ObjectID
    title: string,
    publisher: string,
    developer: string,
    westernReleaseYear: string,
    cover: string,
    genres: string,
}

export { Game }