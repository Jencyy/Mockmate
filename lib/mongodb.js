// lib/mongodb.js
// This file is responsible for creating a connection to the MongoDB database.
// We use a caching mechanism to avoid creating multiple connections in development mode.

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// We don't throw an error at the top level because Next.js sometimes runs these files
// during the build step when environment variables might not be fully loaded.

// In Next.js serverless environments (like API routes), code can run multiple times.
// To avoid opening a new connection to the database every time a route is hit,
// we cache the connection globally.
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  // If we already have a successful connection, return it immediately.
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection attempt is currently in progress, wait for it to finish.
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable Mongoose buffering
      serverSelectionTimeoutMS: 2000, // FAST FALLBACK: Only wait 2 seconds instead of 30 seconds if DB is blocked
    };

    // Initiate the connection and store the promise
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully!');
      return mongoose;
    });
  }

  try {
    // Wait for the connection promise to resolve and store the actual connection object
    cached.conn = await cached.promise;
  } catch (e) {
    // If the connection fails, clear the promise so we can try again next time
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
