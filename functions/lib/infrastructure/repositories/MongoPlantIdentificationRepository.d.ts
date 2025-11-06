import { Db } from 'mongodb';
import { IPlantIdentification } from '../../core/domain/models';
import { IPlantIdentificationRepository } from '../../core/repositories/interfaces';
export declare class MongoPlantIdentificationRepository implements IPlantIdentificationRepository {
    private collection;
    private readonly COLLECTION_NAME;
    constructor(db: Db);
    create(identification: IPlantIdentification): Promise<IPlantIdentification>;
    findByUserId(userId: string): Promise<IPlantIdentification[]>;
}
