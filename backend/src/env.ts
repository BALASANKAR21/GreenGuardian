import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  FRONTEND_ORIGIN: z.string().default("http://localhost:3000"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  OPENWEATHER_API_KEY: z.string().min(1, "OPENWEATHER_API_KEY is required"),
  AIRVISUAL_API_KEY: z.string().min(1, "AIRVISUAL_API_KEY is required"),
  PLANTNET_API_KEY: z.string().min(1, "PLANTNET_API_KEY is required"),
  IPINFO_TOKEN: z.string().min(1, "IPINFO_TOKEN is required"),
  NASA_API_KEY: z.string().optional()
});

export const env = EnvSchema.parse(process.env);
