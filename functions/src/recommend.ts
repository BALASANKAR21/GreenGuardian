
import * as functions from "firebase-functions";
import { Request, Response } from "express";
import { getDb } from "./db";

export const recommendPlants = functions.https.onRequest(async (req: Request, res: Response) => {
  // const { city, preferences } = req.body; // Uncomment when you use these variables
  // TODO: Fetch weather, air, soil data from APIs (OpenWeatherMap, AirVisual, NASA, etc.)
  // Example: const weather = await axios.get(...);
  // TODO: Use logic to select best plants from MongoDB based on city, preferences, and API data
  const db = await getDb();
  const plants = await db.collection("plants").find({ /* match logic */ }).toArray();
  res.json({ recommendations: plants });
});
