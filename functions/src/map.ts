import * as functions from "firebase-functions";
import { getDb } from "./db";

export const getGreenSpaces = functions.https.onRequest(async (req, res) => {
  const db = await getDb();
  const spaces = await db.collection("greenspaces").find({ city: req.query.city }).toArray();
  res.json(spaces);
});
