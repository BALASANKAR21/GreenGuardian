import { UserDocument, UserInput, UserUpdateInput } from '../models/user.model';
export declare class UserService {
    private userRepo;
    constructor();
    createUser(userData: UserInput): Promise<UserDocument>;
    getUserById(userId: string): Promise<UserDocument | null>;
    updateUser(userId: string, updateData: UserUpdateInput): Promise<UserDocument | null>;
    deleteUser(userId: string): Promise<boolean>;
}
