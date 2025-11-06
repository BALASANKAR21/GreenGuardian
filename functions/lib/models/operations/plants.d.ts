import { ObjectId } from 'mongodb';
import { BaseOperations } from './base';
import { DBPlant } from '../types/db-types';
import { Plant, CreatePlantInput } from '../../types';
interface IPlantOperations {
    create(input: CreatePlantInput): Promise<Plant>;
    findById(id: ObjectId): Promise<Plant | null>;
    findByName(query: string, page?: number, limit?: number): Promise<{
        plants: Plant[];
        total: number;
    }>;
    update(id: ObjectId, updates: Partial<DBPlant>): Promise<Plant>;
}
export declare class PlantOperations extends BaseOperations<DBPlant> implements IPlantOperations {
    constructor();
    create(input: CreatePlantInput): Promise<Plant>;
    findById(id: ObjectId): Promise<Plant | null>;
    findByName(query: string, page?: number, limit?: number): Promise<{
        plants: Plant[];
        total: number;
    }>;
    update(id: ObjectId, updates: Partial<DBPlant>): Promise<Plant>;
}
export declare const plantOperations: PlantOperations;
export {};
