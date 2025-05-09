import mongoose from 'mongoose';

// gets MONGODB_URI from .env.local
const MONGODB_URI = process.env.MONGODB_URI!;
// if MONGODB_URI doesn't exist, throws an appropriate error
if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Global is used here to maintain a cached connection across hot reloads in development. This prevents connections from growing exponentially during API Route usage. However, using simply 'global' was causing a TS error, so I had to globalWithMongoose with the following logic and casting
let globalWithMongoose = global as typeof globalThis & {
    mongoose: {
        promise: Promise<typeof mongoose> | null;
        conn: typeof mongoose | null;
    };
}

// grabbing the cached connection
let cached = globalWithMongoose.mongoose as {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
};

// if cached connection doesn't exist, creates an empty one. Note that the very first time, the connection won't exist so this will set it to null
if (!cached) {
    cached = globalWithMongoose.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
    if (cached.conn) return cached.conn;

    if (!cached.promise) {
        cached.promise = mongoose.connect(MONGODB_URI, {
            //  // No need for useNewUrlParser or useUnifiedTopology here, now they're automatically enabled and explicitly adding them causes TS errors.Add any mongoose options here
        });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

export default dbConnect;
