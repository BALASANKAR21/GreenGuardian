import { Document, ObjectId } from 'mongodb';

export interface BaseDocument extends Document {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBUserProfile extends BaseDocument {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  role: 'user' | 'admin';
  preferences?: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
    [key: string]: boolean | string | number | undefined;
  };
}

export interface DBPlant extends BaseDocument {
  name: string;
  scientificName: string;
  description: string;
  careInstructions: {
    watering: {
      frequency: number;  // days between watering
      amount: 'light' | 'moderate' | 'heavy';
      notes?: string;
    };
    sunlight: {
      level: 'low' | 'medium' | 'high';
      directSun: boolean;
      notes?: string;
    };
    soil: {
      type: string;
      pH: { min: number; max: number };
      notes?: string;
    };
    temperature: {
      min: number;  // in Celsius
      max: number;  // in Celsius
      ideal: number;  // in Celsius
    };
    humidity: {
      min: number;  // percentage
      max: number;  // percentage
      ideal: number;  // percentage
    };
  };
  imageURL?: string;
  tags: string[];
  metadata?: {
    origin?: string;
    season?: string[];
    growthRate?: 'slow' | 'moderate' | 'fast';
    [key: string]: string | string[] | undefined;
  };
}

export interface DBUserGarden extends BaseDocument {
  userId: string;
  plants: Array<{
    plantId: ObjectId;
    nickname?: string;
    location?: {
      latitude: number;
      longitude: number;
      name?: string;
    };
    plantedDate: Date;
    lastWatered?: Date;
    healthStatus: 'healthy' | 'needs_attention' | 'unhealthy';
    notes?: string;
  }>;
}

export interface DBPlantIdentification extends BaseDocument {
  userId: string;
  imageURL: string;
  results: Array<{
    plantId?: ObjectId;
    confidence: number;
    name: string;
    scientificName?: string;
  }>;
  status: 'pending' | 'completed' | 'failed';
  details?: {
    error?: string;
    confidenceThreshold?: number;
    modelVersion?: string;
    processingTime?: number;
    [key: string]: string | number | undefined;
  };
  timestamp: Date;
}

export interface DBEnvironmentalData extends BaseDocument {
  userId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  readings: {
    temperature?: number;  // in Celsius
    humidity?: number;     // percentage (0-100)
    soilMoisture?: number;  // percentage (0-100)
    lightLevel?: number;    // lux (0-100000)
    pH?: number;           // pH scale (0-14)
    co2?: number;          // ppm
    [key: string]: number | undefined;
  };
  timestamp: Date;
}