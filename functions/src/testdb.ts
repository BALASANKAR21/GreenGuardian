import * as functions from "firebase-functions";
import { Request, Response } from "express";
import { getDb } from "./db";

export const testDbConnection = functions.https.onRequest(async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    const collections = await db.listCollections().toArray();
    res.json({ success: true, collections: collections.map((c: { name: string }) => c.name) });
  } catch (e) {
    res.status(500).json({ success: false, error: e instanceof Error ? e.message : String(e) });
  }
});
