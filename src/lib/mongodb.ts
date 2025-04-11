import mongoose from 'mongoose';

// MongoDB URI is required in production
const MONGODB_URI = process.env.MONGODB_URI;

// Connection options based on runtime
const NODE_OPTIONS = {
  maxPoolSize: 5,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  family: 4,
  heartbeatFrequencyMS: 3000,
  autoIndex: true,
  retryWrites: true,
};

// Enhanced connection interface
interface ConnectionOptions extends mongoose.ConnectOptions {
  maxRetries?: number;
  retryDelay?: number;
  validateConnection?: boolean;
}

interface GlobalMongoose {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  connectionError: Error | null;
  retryCount: number;
  lastRetry: number;
}

declare global {
  var mongoose: GlobalMongoose | undefined;
}

// Initialize global state
const cached: GlobalMongoose = global.mongoose || {
  conn: null,
  promise: null,
  connectionError: null,
  retryCount: 0,
  lastRetry: 0,
};

if (!global.mongoose) {
  global.mongoose = cached;
}

// Validate connection health
async function validateConnection(): Promise<boolean> {
  if (!cached.conn?.connection?.db) return false;
  
  try {
    // Attempt a lightweight operation to verify connection
    await cached.conn.connection.db.admin().ping();
    return true;
  } catch (error) {
    console.error('Connection validation failed:', error);
    return false;
  }
}

/**
 * Connect to MongoDB using a cached connection
 */
/**
 * Connect to MongoDB with enhanced retry logic and validation
 */
async function dbConnect(options: ConnectionOptions = {}): Promise<typeof mongoose> {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    validateConnection: shouldValidate = true,
    ...mongooseOptions
  } = options;

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  // Check existing connection
  if (cached.conn) {
    if (shouldValidate) {
      const isValid = await validateConnection();
      if (isValid) {
        return cached.conn;
      }
      // Reset connection if validation fails
      cached.conn = null;
      cached.promise = null;
    } else {
      return cached.conn;
    }
  }

  // Handle retry logic
  const shouldRetry = cached.retryCount < maxRetries &&
    Date.now() - cached.lastRetry > retryDelay;

  if (cached.connectionError && !shouldRetry) {
    throw cached.connectionError;
  }

  // Create new connection
  if (!cached.promise) {
    const opts = {
      ...NODE_OPTIONS,
      ...mongooseOptions,
    };

    const uri = MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined');
    }

    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongoose) => {
        console.log('MongoDB connected successfully');
        cached.retryCount = 0;
        cached.connectionError = null;
        
        // Connection event handlers
        mongoose.connection.on('error', (err) => {
          console.error('MongoDB connection error:', err);
          cached.conn = null;
          cached.promise = null;
          cached.connectionError = err;
        });

        mongoose.connection.on('disconnected', () => {
          console.log('MongoDB disconnected');
          cached.conn = null;
          cached.promise = null;
        });

        // Monitor connection health
        mongoose.connection.on('connected', () => {
          console.log('MongoDB connection established');
          cached.retryCount = 0;
          cached.connectionError = null;
        });

        return mongoose;
      })
      .catch((error) => {
        console.error('MongoDB connection error:', error);
        cached.promise = null;
        cached.connectionError = error;
        cached.retryCount++;
        cached.lastRetry = Date.now();
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
    
    // Validate new connection
    if (shouldValidate) {
      const isValid = await validateConnection();
      if (!isValid) {
        throw new Error('Connection validation failed');
      }
    }
  } catch (error) {
    cached.promise = null;
    cached.connectionError = error as Error;
    cached.retryCount++;
    cached.lastRetry = Date.now();
    throw error;
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