import { MongoClient, Db } from "mongodb";
import * as functions from "firebase-functions";

const uri = functions.config().mongodb?.uri || process.env.MONGODB_URI;
if (!uri) {
  throw new Error("MongoDB URI is not configured");
}

const client = new MongoClient(uri);
let cachedDb: Db | null = null;

export async function getDb(): Promise<Db> {
  if (!cachedDb) {
    await client.connect();
    cachedDb = client.db("greenguardian");
  }
  return cachedDb;
}
