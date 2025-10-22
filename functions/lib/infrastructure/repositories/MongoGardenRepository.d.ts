import { Db, ObjectId } from 'mongodb';
import { IUserGarden, IGardenPlant } from '../../core/domain/models';
import { IGardenRepository } from '../../core/repositories/interfaces';
export declare class MongoGardenRepository implements IGardenRepository {
    private collection;
    private readonly COLLECTION_NAME;
    constructor(db: Db);
    findByUserId(userId: string): Promise<IUserGarden | null>;
    addPlant(userId: string, plant: IGardenPlant): Promise<boolean>;
    updatePlant(userId: string, plantId: ObjectId, updates: Partial<IGardenPlant>): Promise<boolean>;
    removePlant(userId: string, plantId: ObjectId): Promise<boolean>;
}
