import { ObjectId } from 'mongodb';

export interface UserProfile {
  _id?: ObjectId;
  uid: string;
  email: string;
  displayName: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Plant {
  _id?: ObjectId;
  name: string;
  scientificName: string;
  imageUrl: string;
  description: string;
  careInstructions: {
    water: string;
    sunlight: string;
    soil: string;
    temperature: string;
    humidity: string;
  };
  tags: string[];
}

export interface UserGarden {
  _id?: ObjectId;
  userId: string;
  plants: {
    plantId: ObjectId;
    location: {
      latitude: number;
      longitude: number;
    };
    plantedDate: Date;
    lastWatered: Date;
    health: 'good' | 'average' | 'poor';
    notes: string;
  }[];
}

export interface PlantIdentification {
  _id?: ObjectId;
  userId: string;
  imageUrl: string;
  identifiedPlant: Plant;
  confidence: number;
  identifiedAt: Date;
}

export interface EnvironmentalData {
  _id?: ObjectId;
  userId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: Date;
  temperature: number;
  humidity: number;
  soilMoisture?: number;
  airQuality?: {
    aqi: number;
    description: string;
  };
  weather: {
    condition: string;
    forecast: string;
  };
}