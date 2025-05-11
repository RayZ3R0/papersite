import mongoose from "mongoose";

// MongoDB URI is required in production
const MONGODB_URI = process.env.MONGODB_URI;

// Connection options based on runtime
// Production (Vercel) optimized options
const PROD_OPTIONS = {
  maxPoolSize: 10,
  minPoolSize: 5,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  family: 4,
  heartbeatFrequencyMS: 10000,
  autoIndex: false,
  retryWrites: true,
  connectTimeoutMS: 10000,
  waitQueueTimeoutMS: 10000,
  maxIdleTimeMS: 60000,
  compressors: ["zlib"],
  zlibCompressionLevel: 6,
};

// Development options with more relaxed settings
const DEV_OPTIONS = {
  maxPoolSize: 5,
  minPoolSize: 1,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 30000,
  family: 4,
  heartbeatFrequencyMS: 3000,
  autoIndex: true,
  retryWrites: true,
};

// Use appropriate options based on environment
const NODE_OPTIONS =
  process.env.NODE_ENV === "production" ? PROD_OPTIONS : DEV_OPTIONS;

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

// Validate connection health with enhanced checks
async function validateConnection(): Promise<boolean> {
  if (!cached.conn?.connection?.db) return false;

  try {
    // Multi-step validation
    const startTime = Date.now();

    // 1. Basic ping check
    await cached.conn.connection.db.admin().ping();

    // 2. Check connection latency
    const latency = Date.now() - startTime;
    if (latency > 1000) {
      console.warn(`High MongoDB latency: ${latency}ms`);
    }

    // 3. Check if connection is authorized
    const isAuthorized = await cached.conn.connection.db
      .admin()
      .command({ connectionStatus: 1 });
    if (!isAuthorized.ok) {
      throw new Error("Connection not authorized");
    }

    // 4. Check server stats for health indicators
    const stats = await cached.conn.connection.db.admin().serverStatus();
    if (stats.connections.current >= stats.connections.available) {
      console.warn("Connection pool near capacity");
    }

    return true;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("Connection validation failed:", errorMessage);
    if (process.env.NODE_ENV === "production") {
      // Send error to monitoring service in production
      await fetch("/api/metrics/report", {
        method: "POST",
        body: JSON.stringify({
          type: "db_validation_error",
          error: errorMessage,
        }),
      }).catch(console.error);
    }
    return false;
  }
}

/**
 * Connect to MongoDB using a cached connection
 */
/**
 * Connect to MongoDB with enhanced retry logic and validation
 */
async function dbConnect(
  options: ConnectionOptions = {},
): Promise<typeof mongoose> {
  const {
    maxRetries = process.env.NODE_ENV === "production" ? 10 : 3,
    retryDelay = process.env.NODE_ENV === "production" ? 1000 : 1000,
    validateConnection: shouldValidate = process.env.NODE_ENV !== "production",
    ...mongooseOptions
  } = options;

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined");
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
  const shouldRetry =
    cached.retryCount < maxRetries &&
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
      throw new Error("MONGODB_URI is not defined");
    }

    cached.promise = mongoose
      .connect(uri, opts)
      .then((mongoose) => {
        console.log("MongoDB connected successfully");
        cached.retryCount = 0;
        cached.connectionError = null;

        // Connection event handlers
        mongoose.connection.on("error", (err) => {
          console.error("MongoDB connection error:", err);
          cached.conn = null;
          cached.promise = null;
          cached.connectionError = err;
        });

        mongoose.connection.on("disconnected", () => {
          console.log("MongoDB disconnected");
          cached.conn = null;
          cached.promise = null;
        });

        // Monitor connection health
        mongoose.connection.on("connected", () => {
          console.log("MongoDB connection established");
          cached.retryCount = 0;
          cached.connectionError = null;
        });

        return mongoose;
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error);
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
        throw new Error("Connection validation failed");
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
if (process.env.NODE_ENV !== "production") {
  mongoose.connection.on("connected", () => {
    console.log("MongoDB connected successfully");
  });

  mongoose.connection.on("error", (err) => {
    console.error("MongoDB connection error:", err);
    cached.conn = null;
    cached.promise = null;
  });

  mongoose.connection.on("disconnected", () => {
    console.log("MongoDB disconnected");
    cached.conn = null;
    cached.promise = null;
  });
}

// Graceful shutdown
process.on("SIGINT", async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log("MongoDB connection closed through app termination");
    }
    process.exit(0);
  } catch (err) {
    console.error("Error closing MongoDB connection:", err);
    process.exit(1);
  }
});

export default dbConnect;
