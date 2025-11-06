import * as functions from "firebase-functions";
import { Request, Response } from "express";
import { getDb } from "./db";

export const onboardUser = functions.https.onRequest(async (req: Request, res: Response): Promise<void> => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }
  const { uid, email, city, preferences } = req.body;
  const db = await getDb();
  await db.collection("users").updateOne(
    { uid },
    { $set: { email, city, preferences } },
    { upsert: true }
  );
  res.json({ success: true });
});

export const getUserProfile = functions.https.onRequest(async (req: Request, res: Response): Promise<void> => {
  const { uid } = req.query;
  const db = await getDb();
  const user = await db.collection("users").findOne({ uid });
  res.json(user);
});
