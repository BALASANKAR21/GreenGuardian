import { Db, ObjectId } from 'mongodb';
import { IPlant } from '../../core/domain/models';
import { IPlantRepository } from '../../core/repositories/interfaces';
export declare class MongoPlantRepository implements IPlantRepository {
    private collection;
    private readonly COLLECTION_NAME;
    constructor(db: Db);
    findById(id: ObjectId): Promise<IPlant | null>;
    create(plant: IPlant): Promise<IPlant>;
    search(query: string): Promise<IPlant[]>;
    update(id: ObjectId, updates: Partial<IPlant>): Promise<boolean>;
}
