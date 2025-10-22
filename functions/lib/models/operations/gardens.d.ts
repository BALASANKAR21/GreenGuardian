import { ObjectId } from 'mongodb';
import { BaseOperations } from './base';
import { DBUserGarden } from '../types/db-types';
import { UserGarden } from '../../types';
interface AddPlantInput {
    plantId: ObjectId;
    location?: {
        latitude: number;
        longitude: number;
        name?: string;
    };
    nickname?: string;
    plantedDate: Date;
    healthStatus: 'healthy' | 'needs_attention' | 'unhealthy';
    notes?: string;
}
interface CreateGardenInput {
    userId: string;
    plants?: Array<{
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
interface IGardenOperations {
    create(input: CreateGardenInput): Promise<UserGarden>;
    findByUserId(userId: string): Promise<UserGarden | null>;
    addPlant(gardenId: ObjectId, plant: AddPlantInput): Promise<UserGarden>;
    update(id: ObjectId, updates: Partial<DBUserGarden>): Promise<UserGarden>;
}
export declare class GardenOperations extends BaseOperations<DBUserGarden> implements IGardenOperations {
    constructor();
    create(input: CreateGardenInput): Promise<UserGarden>;
    findByUserId(userId: string): Promise<UserGarden | null>;
    addPlant(gardenId: ObjectId, plant: AddPlantInput): Promise<UserGarden>;
    update(id: ObjectId, updates: Partial<DBUserGarden>): Promise<UserGarden>;
}
export declare const gardenOperations: GardenOperations;
export {};
