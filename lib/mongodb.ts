import mongoose, { Mongoose } from 'mongoose'

// Define MONGODB_URI with type safety
const MONGODB_URI: string = process.env.MONGODB_URI!;

// Throw error if MONGODB_URI is not defined
if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

// Define the cached object type
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined; // Fixed naming to match global variable
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      return mongooseInstance;
    }).catch((error) => {
      console.error('Mongoose connection error:', error);
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw new Error(`Failed to connect to MongoDB: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }

  return cached.conn;
}

export default dbConnect;