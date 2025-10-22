import { Collection, ObjectId, WithId } from 'mongodb';
import { BaseDocument, DBUserProfile, DBPlant, DBUserGarden, DBPlantIdentification } from './types/db-types';
export declare const COLLECTIONS: {
    readonly USERS: "users";
    readonly PLANTS: "plants";
    readonly GARDENS: "gardens";
    readonly IDENTIFICATIONS: "plant_identifications";
    readonly ENVIRONMENTAL_DATA: "environmental_data";
};
export interface DatabaseOperations<T extends BaseDocument> {
    findById(id: string | ObjectId): Promise<WithId<T> | null>;
    create(data: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<WithId<T>>;
    update(id: string | ObjectId, updates: Partial<Omit<T, '_id' | 'createdAt' | 'updatedAt'>>): Promise<WithId<T> | null>;
    delete(id: string | ObjectId): Promise<boolean>;
}
declare abstract class BaseDbOperations<T extends BaseDocument> implements DatabaseOperations<T> {
    protected abstract collectionName: string;
    protected getCollection(): Promise<Collection<T>>;
    protected wrapDbOperation<R>(operation: () => Promise<R>, operationName: string): Promise<R>;
    findById(id: string | ObjectId): Promise<WithId<T> | null>;
    create(data: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<WithId<T>>;
    update(id: string | ObjectId, updates: Partial<Omit<T, '_id' | 'createdAt' | 'updatedAt'>>): Promise<WithId<T> | null>;
    delete(id: string | ObjectId): Promise<boolean>;
}
export declare class UserProfileOperations extends BaseDbOperations<DBUserProfile> {
    protected collectionName: "users";
    findByUid(uid: string): Promise<WithId<DBUserProfile> | null>;
    findByEmail(email: string): Promise<WithId<DBUserProfile> | null>;
}
export declare class PlantOperations extends BaseDbOperations<DBPlant> {
    protected collectionName: "plants";
    findByName(query: string): Promise<WithId<DBPlant>[]>;
}
export declare class GardenOperations extends BaseDbOperations<DBUserGarden> {
    protected collectionName: "gardens";
    findByUserId(userId: string): Promise<WithId<DBUserGarden>[]>;
    addPlant(gardenId: string | ObjectId, plant: DBUserGarden['plants'][0]): Promise<WithId<DBUserGarden> | null>;
}
export declare class PlantIdentificationOperations extends BaseDbOperations<DBPlantIdentification> {
    protected collectionName: "plant_identifications";
    findByUserId(userId: string): Promise<WithId<DBPlantIdentification>[]>;
    updateResults(id: string | ObjectId, results: DBPlantIdentification['results']): Promise<WithId<DBPlantIdentification> | null>;
}
export declare const db: {
    users: UserProfileOperations;
    plants: PlantOperations;
    gardens: GardenOperations;
    identifications: PlantIdentificationOperations;
};
export {};
