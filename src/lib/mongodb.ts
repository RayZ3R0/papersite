import mongoose from 'mongoose';

// MongoDB URI is required in production
const MONGODB_URI = process.env.MONGODB_URI;

// Mock connection for build time
const mockMongoose = {
  connection: {
    readyState: 1,
    on: () => {},
    once: () => {},
    close: () => Promise.resolve(),
  },
  Schema: mongoose.Schema,
  model: () => ({}),
  models: {},
  Types: mongoose.Types,
} as unknown as typeof mongoose;

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: GlobalMongoose | undefined;
}

const cached = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connect to MongoDB using a cached connection
 */
async function dbConnect(): Promise<typeof mongoose> {
  // If in build/testing without MongoDB, return mock
  if (process.env.NODE_ENV === 'production' && !process.env.MONGODB_URI) {
    console.log('Using mock MongoDB connection');
    return mockMongoose;
  }

  // Use existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  // Create new connection if none exists
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        cached.promise = null;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Handle connection events in development only
if (process.env.NODE_ENV !== 'production') {
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
    cached.conn = null;
    cached.promise = null;
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
    cached.conn = null;
    cached.promise = null;
  });
}

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
    }
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

export default dbConnect;