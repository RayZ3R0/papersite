#!/usr/bin/env node
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';

// Read .env file manually
function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env file not found in project root');
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const envVars = envContent
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .reduce((acc, line) => {
      const [key, ...values] = line.split('=');
      if (key && values.length) {
        acc[key.trim()] = values.join('=').trim();
      }
      return acc;
    }, {} as Record<string, string>);

  return envVars;
}

// Get MongoDB URI from env
const env = loadEnv();
const MONGODB_URI = env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI not found in .env file');
  console.error('Your .env file should contain:');
  console.error('MONGODB_URI=mongodb+srv://...');
  process.exit(1);
}

// Define User schema type
interface IUser {
  username: string;
  role: 'user' | 'moderator' | 'admin';
}

// Define User schema for this script
const UserSchema = new mongoose.Schema<IUser>({
  username: String,
  role: {
    type: String,
    enum: ['user', 'moderator', 'admin'],
    default: 'user'
  }
});

type Role = 'admin' | 'moderator';

async function makeAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get User model
    const User = mongoose.model<IUser>('User', UserSchema);

    // Get username from command line
    const username = process.argv[2];
    const role = process.argv[3] as Role || 'admin';

    if (!username) {
      console.error('Error: Please provide a username');
      console.error('Usage: npx tsx scripts/makeAdmin.ts <username> [role]');
      process.exit(1);
    }

    if (!['admin', 'moderator'].includes(role)) {
      console.error('Error: Role must be either "admin" or "moderator"');
      console.error('Usage: npx tsx scripts/makeAdmin.ts <username> [role]');
      process.exit(1);
    }

    // Update user role
    const result = await User.updateOne(
      { username },
      { $set: { role } }
    );

    if (result.matchedCount === 0) {
      console.error(`Error: User '${username}' not found`);
      console.error('Make sure the username exists and is correct.');
      process.exit(1);
    }

    console.log(`✅ Successfully updated user '${username}' to ${role}`);
    console.log(`🔑 User now has ${role} privileges`);

    // Close connection
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the script
makeAdmin();

/*
To use this script:

1. Make sure MONGODB_URI is in your .env file:
   MONGODB_URI=mongodb+srv://...

2. Run the script with username (not email):
   npx tsx scripts/makeAdmin.ts <username> [role]

Examples:
   npx tsx scripts/makeAdmin.ts rayz3r0 admin
   npx tsx scripts/makeAdmin.ts moderator1 moderator

Note: Use the username you login with, not email
*/