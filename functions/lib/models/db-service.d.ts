/**
 * Database service layer for the GreenGuardian application.
 * Handles all MongoDB operations with proper type checking and error handling.
 */
import { ObjectId, WithId } from 'mongodb';
import { DBUserProfile, DBPlant, DBUserGarden, DBPlantIdentification, DBEnvironmentalData } from '../types/models';
export declare const COLLECTIONS: {
    readonly USERS: "users";
    readonly PLANTS: "plants";
    readonly GARDENS: "gardens";
    readonly IDENTIFICATIONS: "plant_identifications";
    readonly ENVIRONMENTAL_DATA: "environmental_data";
};
export declare class DatabaseError extends Error {
    readonly cause?: Error | undefined;
    constructor(message: string, cause?: Error | undefined);
}
export declare function getUserProfile(uid: string): Promise<WithId<DBUserProfile> | null>;
export declare function createUserProfile(profile: Omit<DBUserProfile, 'createdAt' | 'updatedAt' | '_id'>): Promise<WithId<DBUserProfile>>;
export declare function updateUserProfile(uid: string, updates: Partial<Omit<DBUserProfile, '_id' | 'createdAt' | 'uid'>>): Promise<boolean>;
export declare function addPlant(plant: Omit<DBPlant, '_id'>): Promise<WithId<DBPlant>>;
export declare function getPlant(id: ObjectId): Promise<WithId<DBPlant> | null>;
export declare function searchPlants(query: string): Promise<WithId<DBPlant>[]>;
export declare function getUserGarden(userId: string): Promise<WithId<DBUserGarden> | null>;
export declare function addPlantToGarden(userId: string, plantId: ObjectId, location: string, notes?: string): Promise<boolean>;
export declare function updatePlantInGarden(userId: string, plantId: string, updates: Partial<DBUserGarden['plants'][0]>): Promise<boolean>;
export declare function savePlantIdentification(identification: Omit<DBPlantIdentification, '_id'>): Promise<WithId<DBPlantIdentification>>;
export declare function getUserPlantIdentifications(userId: string): Promise<WithId<DBPlantIdentification>[]>;
export declare function saveEnvironmentalData(data: Omit<DBEnvironmentalData, '_id'>): Promise<WithId<DBEnvironmentalData>>;
export declare function getLatestEnvironmentalData(userId: string): Promise<WithId<DBEnvironmentalData> | null>;
export declare function getEnvironmentalDataHistory(userId: string, startDate: Date, endDate: Date): Promise<WithId<DBEnvironmentalData>[]>;
