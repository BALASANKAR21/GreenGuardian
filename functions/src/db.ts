import { MongoClient } from "mongodb";
import * as functions from "firebase-functions";

const uri = functions.config().mongodb?.uri || process.env.MONGODB_URI;
const client = new MongoClient(uri!);
let cachedDb: any = null;

export async function getDb() {
  if (!cachedDb) {
    await client.connect();
    cachedDb = client.db("greenguardian");
  }
  return cachedDb;
}
