import mongoose, { Schema } from "mongoose";

export type Plant = {
  name: string;
  scientificName: string;
  minTempC: number;
  maxTempC: number;
  sunlight: "full" | "partial" | "shade";
  waterNeeds: "low" | "medium" | "high";
  spaces: ("indoor" | "balcony" | "outdoor")[];
  tags: string[];
  airPurifying: boolean;
  petFriendly: boolean;
  heightCm?: number;
  spreadCm?: number;
  imageUrl?: string;
};

const PlantSchema = new Schema<Plant>(
  {
    name: { type: String, required: true, index: true },
    scientificName: { type: String, required: true, index: true },
    minTempC: { type: Number, required: true },
    maxTempC: { type: Number, required: true },
    sunlight: { type: String, enum: ["full", "partial", "shade"], required: true },
    waterNeeds: { type: String, enum: ["low", "medium", "high"], required: true },
    spaces: { type: [String], enum: ["indoor", "balcony", "outdoor"], required: true },
    tags: { type: [String], default: [] },
    airPurifying: { type: Boolean, default: false },
    petFriendly: { type: Boolean, default: true },
    heightCm: Number,
    spreadCm: Number,
    imageUrl: String
  },
  { timestamps: true }
);

PlantSchema.index({ name: "text", scientificName: "text", tags: 1 });

export const PlantModel = mongoose.models.Plant || mongoose.model<Plant>("Plant", PlantSchema);
