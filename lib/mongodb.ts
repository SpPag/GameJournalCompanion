// lib/mongodb.ts
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!; // This ! is a non-null assertion operator in TypeScript. It tells the compiler that the variable is guaranteed to not be null or undefined
const options = {};

let client;
let clientPromise: Promise<MongoClient>;

if (!process.env.MONGODB_URI) {
    throw new Error("Please add your Mongo URI to .env.local");
}

declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (process.env.NODE_ENV === "development") { // In development, you store the promise in global._mongoClientPromise so it survives reloads
    if (!global._mongoClientPromise) {
        client = new MongoClient(uri, options);
        global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;
} else { // In production, hot reload isn’t an issue — so you just connect normally
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
}

export { clientPromise };
