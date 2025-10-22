import { Request } from 'express';

export interface AuthUser {
  uid: string;
  email?: string;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

export interface Location {
  latitude: number;
  longitude: number;
  name?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  preferences?: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
  };
}

export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  description: string;
  careInstructions: {
    watering: {
      frequency: number;
      amount: 'light' | 'moderate' | 'heavy';
    };
    sunlight: {
      level: 'low' | 'medium' | 'high';
      directSun: boolean;
    };
    temperature: {
      min: number;
      max: number;
      ideal: number;
    };
    humidity: {
      min: number;
      max: number;
      ideal: number;
    };
  };
  imageURL?: string;
  tags: string[];
}

export interface GardenPlant extends Plant {
  nickname?: string;
  location: Location;
  plantedDate: Date;
  lastWatered?: Date;
  healthStatus: 'healthy' | 'needs_attention' | 'unhealthy';
  notes?: string;
}

export interface Garden {
  userId: string;
  plants: GardenPlant[];
}

export interface EnvironmentalData {
  id: string;
  userId: string;
  location: Location;
  readings: {
    temperature?: number;
    humidity?: number;
    soilMoisture?: number;
    lightLevel?: number;
    pH?: number;
    co2?: number;
  };
  timestamp: Date;
}