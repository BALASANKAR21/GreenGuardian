import { MongoClient, Db } from 'mongodb';
import * as functions from 'firebase-functions';

class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private isConnecting = false;
  private readonly dbName = 'greenguardian';

  private constructor() {
    const uri = functions.config().mongodb?.uri || process.env.MONGODB_URI;
    if (!uri) {
      throw new DatabaseError('MongoDB URI not configured');
    }
    this.client = new MongoClient(uri);
  }

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async getDb(): Promise<Db> {
    if (this.db) {
      return this.db;
    }

    if (this.isConnecting) {
      // Wait for the connection to be established
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.getDb();
    }

    try {
      this.isConnecting = true;
      if (!this.client) {
        throw new DatabaseError('MongoDB client not initialized');
      }
      
      await this.client.connect();
      this.db = this.client.db(this.dbName);
      console.log('Successfully connected to MongoDB.');
      return this.db;
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw new DatabaseError(error instanceof Error ? error.message : 'Unknown database error');
    } finally {
      this.isConnecting = false;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      if (this.client) {
        await this.client.close();
        this.client = null;
        this.db = null;
        console.log('Successfully disconnected from MongoDB.');
      }
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw new DatabaseError(error instanceof Error ? error.message : 'Failed to disconnect from database');
    }
  }
}