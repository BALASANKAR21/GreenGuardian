import { Db } from 'mongodb';
import { IUserProfile } from '../../core/domain/models';
import { IUserRepository } from '../../core/repositories/interfaces';
export declare class MongoUserRepository implements IUserRepository {
    private collection;
    private readonly COLLECTION_NAME;
    constructor(db: Db);
    findByUid(uid: string): Promise<IUserProfile | null>;
    create(profile: IUserProfile): Promise<IUserProfile>;
    update(uid: string, updates: Partial<IUserProfile>): Promise<boolean>;
}
