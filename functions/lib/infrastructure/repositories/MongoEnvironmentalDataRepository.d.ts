import { Db } from 'mongodb';
import { IEnvironmentalData } from '../../core/domain/models';
import { IEnvironmentalDataRepository } from '../../core/repositories/interfaces';
export declare class MongoEnvironmentalDataRepository implements IEnvironmentalDataRepository {
    private collection;
    private readonly COLLECTION_NAME;
    constructor(db: Db);
    create(data: IEnvironmentalData): Promise<IEnvironmentalData>;
    findLatestByUserId(userId: string): Promise<IEnvironmentalData | null>;
    findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<IEnvironmentalData[]>;
}
