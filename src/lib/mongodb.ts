import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env');
}

const MONGODB_URI = process.env.MONGODB_URI;

interface GlobalMongo {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend global NodeJS namespace to include mongoose
declare global {
  var mongoose: GlobalMongo;
}

// Initialize the global mongoose object if it doesn't exist
if (!global.mongoose) {
  global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB using a cached connection
 */
async function dbConnect(): Promise<typeof mongoose> {
  // Use the cached connection if available
  if (global.mongoose.conn) {
    return global.mongoose.conn;
  }

  // If no cached promise exists, create a new connection
  if (!global.mongoose.promise) {
    const opts = {
      bufferCommands: false,
    };

    global.mongoose.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Wait for the connection to be established
    global.mongoose.conn = await global.mongoose.promise;
  } catch (e) {
    // Reset the promise on error
    global.mongoose.promise = null;
    throw e;
  }

  return global.mongoose.conn;
}

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
    process.exit(1);
  }
});

export default dbConnect;