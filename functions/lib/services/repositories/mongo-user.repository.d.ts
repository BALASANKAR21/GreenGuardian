import { UserDocument, UserInput, UserUpdateInput } from '../../models/user.model';
export declare class MongoUserRepository {
    private collection;
    constructor();
    create(userData: UserInput): Promise<UserDocument>;
    findById(id: string): Promise<UserDocument | null>;
    findByEmail(email: string): Promise<UserDocument | null>;
    update(id: string, updateData: UserUpdateInput): Promise<UserDocument | null>;
    delete(id: string): Promise<boolean>;
}
