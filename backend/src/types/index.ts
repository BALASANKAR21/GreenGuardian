import { WithId, Document } from 'mongodb';

// MongoDB document type
export type MongoDocument<T extends BaseDocument> = T & Document;

// Base interface for all documents
export interface BaseDocument {
  createdAt: Date;
  updatedAt: Date;
}

// Location type used across the application
export interface Location {
  latitude: number;
  longitude: number;
  name?: string;
}

// Document types with MongoDB _id
export type WithMongoId<T extends BaseDocument> = WithId<T>;

// Type helpers for repositories
export type CreateInput<T extends BaseDocument> = Omit<T, '_id' | 'createdAt' | 'updatedAt'>;
export type UpdateInput<T extends BaseDocument> = Partial<Omit<T, '_id' | 'createdAt' | 'updatedAt'>>;

// User related interfaces
export interface User extends BaseDocument {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  preferences?: {
    notifications: boolean;
    theme: string;
    language: string;
  };
}

// Plant related interfaces
export interface Plant extends BaseDocument {
  name: string;
  scientificName: string;
  description: string;
  careInstructions: string;
  wateringFrequency: number;  // in days
  sunlightNeeds: string;
  humidity: string;
  temperature: {
    min: number;
    max: number;
    unit: 'C' | 'F';
  };
  toxicity: {
    toxic: boolean;
    toxicTo?: string[];
  };
  tags: string[];
  images: string[];
}

// Garden related interfaces
export interface GardenPlant {
  plantId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  plantedDate: Date;
  lastWatered: Date;
  health: 'excellent' | 'good' | 'fair' | 'poor';
  notes?: string;
  customSchedule?: {
    wateringFrequency?: number;
    fertilizing?: boolean;
    pruning?: boolean;
  };
}

export interface Garden extends BaseDocument {
  userId: string;
  name: string;
  plants: GardenPlant[];
  settings?: {
    autoWatering: boolean;
    notifications: boolean;
  };
}

// Environmental data interfaces
export interface EnvironmentalData extends BaseDocument {
  userId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  readings: {
    temperature?: number;
    humidity?: number;
    soilMoisture?: number;
    lightLevel?: number;
    pH?: number;
    nutrients?: {
      nitrogen?: number;
      phosphorus?: number;
      potassium?: number;
    };
  };
  timestamp: Date;
}

// Plant identification interfaces
export interface PlantIdentification extends BaseDocument {
  userId: string;
  imageUrl: string;
  result: {
    name: string;
    scientificName: string;
    confidence: number;
    matches?: {
      name: string;
      confidence: number;
    }[];
  };
  location?: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
}

// Weather data interface
export interface WeatherData extends BaseDocument {
  location: {
    latitude: number;
    longitude: number;
  };
  current: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    uv: number;
    condition: string;
  };
  forecast: Array<{
    date: Date;
    temperature: {
      min: number;
      max: number;
    };
    precipitation: {
      probability: number;
      amount: number;
    };
    condition: string;
  }>;
  timestamp: Date;
}

// Convenience aliases for documents (include Mongo _id)
export type UserDoc = WithMongoId<User>;
export type PlantDoc = WithMongoId<Plant>;
export type GardenDoc = WithMongoId<Garden>;
export type EnvironmentalDataDoc = WithMongoId<EnvironmentalData>;
export type PlantIdentificationDoc = WithMongoId<PlantIdentification>;