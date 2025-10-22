import { WithId } from 'mongodb';
import { DBUserProfile, DBPlant, DBUserGarden, DBPlantIdentification, DBEnvironmentalData } from './models/types/db-types';
export type UserProfile = WithId<DBUserProfile>;
export type Plant = WithId<DBPlant>;
export type UserGarden = WithId<DBUserGarden>;
export type PlantIdentification = WithId<DBPlantIdentification>;
export type EnvironmentalData = WithId<DBEnvironmentalData>;
export interface CreateUserProfileInput {
    uid: string;
    email: string;
    displayName: string;
    photoURL?: string;
    role?: 'user' | 'admin';
    preferences?: {
        notifications: boolean;
        theme: string;
        [key: string]: any;
    };
}
export interface CreatePlantInput {
    name: string;
    scientificName: string;
    description: string;
    careInstructions: string;
    wateringFrequency: number;
    sunlightNeeds: string;
    imageURL?: string;
    tags: string[];
    metadata?: Record<string, any>;
}
export interface CreateGardenInput {
    userId: string;
    plants: Array<{
        plantId: string;
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
export interface CreatePlantIdentificationInput {
    userId: string;
    imageURL: string;
}
export interface CreateEnvironmentalDataInput {
    userId: string;
    location: {
        latitude: number;
        longitude: number;
        name?: string;
    };
    readings: {
        temperature?: number;
        humidity?: number;
        soilMoisture?: number;
        lightLevel?: number;
        airQuality?: number;
        [key: string]: number | undefined;
    };
    timestamp: Date;
}
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}
