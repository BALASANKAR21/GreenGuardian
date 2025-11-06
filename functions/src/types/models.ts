import { Document } from 'mongodb';

export interface DBUserProfile extends Document {
  uid: string;
  displayName: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBPlant extends Document {
  name: string;
  scientificName: string;
  description: string;
  careInstructions: string;
  wateringFrequency: string;
  sunlightNeeds: string;
  idealTemperature: {
    min: number;
    max: number;
  };
  idealHumidity: {
    min: number;
    max: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DBUserGarden extends Document {
  userId: string;
  plants: Array<{
    plantId: string;
    nickname: string;
    plantedDate: Date;
    lastWatered: Date;
    nextWateringDate: Date;
    location: string;
    notes: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBPlantIdentification extends Document {
  userId: string;
  imageUrl: string;
  predictions: Array<{
    scientificName: string;
    commonName: string;
    confidence: number;
  }>;
  selectedPrediction?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBEnvironmentalData extends Document {
  userId: string;
  gardenId: string;
  sensorId: string;
  readings: {
    temperature: number;
    humidity: number;
    soilMoisture: number;
    lightLevel: number;
  };
  timestamp: Date;
}