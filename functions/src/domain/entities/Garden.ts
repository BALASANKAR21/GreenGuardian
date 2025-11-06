import { ObjectId } from 'mongodb';
import { Plant } from './Plant';

export interface Garden {
  _id?: ObjectId;
  userId: string;
  plants: Array<{
    _id?: ObjectId;
    plantId: ObjectId;
    nickname?: string;
    addedAt: Date;
    lastWatered: Date;
    location?: {
      type: 'Point';
      coordinates: [number, number];
    };
    healthStatus: 'healthy' | 'needs_attention' | 'sick';
    notes?: string;
    customCareInstructions?: {
      watering?: string;
      sunlight?: string;
      temperature?: string;
      soil?: string;
    };
    plantDetails?: Plant;  // Populated when includeDetails is true
  }>;
  lastWatered?: Date;
  stats: {
    totalPlants: number;
    healthyPlants: number;
    plantsNeedingAttention: number;
    sickPlants: number;
  };
  createdAt: Date;
  updatedAt: Date;
}