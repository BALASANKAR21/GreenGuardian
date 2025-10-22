import { ObjectId } from 'mongodb';
import { BaseOperations } from './base';
import { AppError } from '../../errors';
import { DBUserProfile } from '../types/db-types';
import { UserProfile, CreateUserProfileInput } from '../../types';

interface IUserProfileOperations {
  create(input: CreateUserProfileInput): Promise<UserProfile>;
  findByUid(uid: string): Promise<UserProfile | null>;
  findById(id: ObjectId): Promise<UserProfile | null>;
  update(id: ObjectId, updates: Partial<DBUserProfile>): Promise<UserProfile>;
}

export class UserProfileOperations extends BaseOperations<DBUserProfile> implements IUserProfileOperations {
  constructor() {
    super('userProfiles');
  }

  async create(input: CreateUserProfileInput): Promise<UserProfile> {
    const collection = await this.getCollection();
    
    try {
      // Validate required fields
      if (!input.uid || !input.email || !input.displayName) {
        throw AppError.badRequest('Missing required fields');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input.email)) {
        throw AppError.badRequest('Invalid email format');
      }

      const existingUser = await this.findByUid(input.uid);
      if (existingUser) {
        return existingUser;
      }

      const now = new Date();
      const profile: DBUserProfile = {
        ...input,
        role: input.role || 'user',
        preferences: {
          notifications: input.preferences?.notifications ?? true,
          theme: (input.preferences?.theme as 'light' | 'dark' | 'system') ?? 'light'
        },
        createdAt: now,
        updatedAt: now
      };
      
      const result = await collection.insertOne(profile);
      return { ...profile, _id: result.insertedId };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.databaseError('Failed to create user profile', error as Error);
    }
  }

  async findByUid(uid: string): Promise<UserProfile | null> {
    const collection = await this.getCollection();
    
    try {
      return collection.findOne({ uid });
    } catch (error) {
      throw AppError.databaseError('Failed to find user profile', error as Error);
    }
  }

  async findById(id: ObjectId): Promise<UserProfile | null> {
    const collection = await this.getCollection();
    
    try {
      return collection.findOne({ _id: id });
    } catch (error) {
      throw AppError.databaseError('Failed to find user profile', error as Error);
    }
  }

  async update(id: ObjectId, updates: Partial<DBUserProfile>): Promise<UserProfile> {
    const collection = await this.getCollection();
    
    try {
      // Validate that we're not updating critical fields
      const restrictedFields = ['uid', 'role', 'createdAt', '_id'];
      const hasRestrictedFields = restrictedFields.some(field => field in updates);
      if (hasRestrictedFields) {
        throw AppError.badRequest('Cannot update restricted fields');
      }

      // Validate theme if it's being updated
      if (updates.preferences?.theme && 
          !['light', 'dark', 'system'].includes(updates.preferences.theme)) {
        throw AppError.badRequest('Invalid theme value');
      }

      // Handle email format validation if email is being updated
      if (updates.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updates.email)) {
          throw AppError.badRequest('Invalid email format');
        }
      }

      const result = await collection.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            ...updates,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw AppError.notFound('User profile not found');
      }

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.databaseError('Failed to update user profile', error as Error);
    }
  }
}

export const userProfileOperations = new UserProfileOperations();