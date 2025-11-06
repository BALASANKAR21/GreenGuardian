import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectMongo() {
  if (mongoose.connection.readyState === 1) return;
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI);
  console.log("[db] connected");
}
