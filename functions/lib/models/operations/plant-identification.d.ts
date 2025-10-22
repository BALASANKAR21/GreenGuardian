import { ObjectId } from 'mongodb';
import { BaseOperations } from './base';
import { DBPlantIdentification } from '../types/db-types';
import { PlantIdentification, CreatePlantIdentificationInput } from '../../types';
interface IPlantIdentificationOperations {
    create(input: CreatePlantIdentificationInput): Promise<PlantIdentification>;
    findById(id: ObjectId): Promise<PlantIdentification | null>;
    findByUserId(userId: string): Promise<PlantIdentification[]>;
    update(id: ObjectId, updates: Partial<DBPlantIdentification>): Promise<PlantIdentification>;
}
export declare class PlantIdentificationOperations extends BaseOperations<DBPlantIdentification> implements IPlantIdentificationOperations {
    constructor();
    create(input: CreatePlantIdentificationInput): Promise<PlantIdentification>;
    findById(id: ObjectId): Promise<PlantIdentification | null>;
    findByUserId(userId: string): Promise<PlantIdentification[]>;
    update(id: ObjectId, updates: Partial<DBPlantIdentification>): Promise<PlantIdentification>;
}
export declare const plantIdentificationOperations: PlantIdentificationOperations;
export {};
