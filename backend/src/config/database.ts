import { MongoClient, Db } from 'mongodb';
import { config } from 'dotenv';

// Load environment variables
config();

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || 'greenguardian';

if (!MONGODB_URI) {
  throw new Error('MongoDB URI is not defined in environment variables');
}

// MongoDB connection options
const options = {
  maxPoolSize: 10,
  minPoolSize: 5,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4  // Use IPv4, skip trying IPv6
};

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  try {
    if (db) {
      return db;
    }

    if (!client) {
      client = new MongoClient(MONGODB_URI as string, options);
    }

    // Always attempt to connect; MongoClient.connect() is idempotent in recent drivers
    await client.connect();
    console.log('Connected to MongoDB');

    db = client.db(DATABASE_NAME);
    return db;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  try {
    if (client) {
      await client.close();
      client = null;
      db = null;
      console.log('Disconnected from MongoDB');
    }
  } catch (error) {
    console.error('Failed to close MongoDB connection:', error);
    throw error;
  }
}

export function getDb(): Db {
  if (!db) {
    throw new Error('Database connection not established. Call connectToDatabase() first.');
  }
  return db;
}

// Handle process termination gracefully
process.on('SIGINT', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeDatabaseConnection();
  process.exit(0);
});