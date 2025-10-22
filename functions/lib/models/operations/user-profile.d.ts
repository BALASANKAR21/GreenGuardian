import { ObjectId } from 'mongodb';
import { BaseOperations } from './base';
import { DBUserProfile } from '../types/db-types';
import { UserProfile, CreateUserProfileInput } from '../../types';
interface IUserProfileOperations {
    create(input: CreateUserProfileInput): Promise<UserProfile>;
    findByUid(uid: string): Promise<UserProfile | null>;
    findById(id: ObjectId): Promise<UserProfile | null>;
    update(id: ObjectId, updates: Partial<DBUserProfile>): Promise<UserProfile>;
}
export declare class UserProfileOperations extends BaseOperations<DBUserProfile> implements IUserProfileOperations {
    constructor();
    create(input: CreateUserProfileInput): Promise<UserProfile>;
    findByUid(uid: string): Promise<UserProfile | null>;
    findById(id: ObjectId): Promise<UserProfile | null>;
    update(id: ObjectId, updates: Partial<DBUserProfile>): Promise<UserProfile>;
}
export declare const userProfileOperations: UserProfileOperations;
export {};
