import { UserService } from '../services';
import { User, WithMongoId } from '../../types';
import { DatabaseError } from '../../utils/errors';
import { connectToDatabase } from '../../config/database';

class MongoUserService implements UserService {
  async getProfile(uid: string): Promise<WithMongoId<User> | null> {
    try {
      const db = await connectToDatabase();
      const collection = db.collection<User>('users');
      const profile = await collection.findOne({ uid });
      return profile as WithMongoId<User> | null;
    } catch (error) {
      throw new DatabaseError('Failed to get user profile', error as Error);
    }
  }

  async createProfile(profile: Omit<User, 'createdAt' | 'updatedAt'>): Promise<WithMongoId<User>> {
    try {
      const db = await connectToDatabase();
      const collection = db.collection<User>('users');
      const newProfile: Omit<User, 'createdAt' | 'updatedAt'> & Partial<User> = {
        ...profile,
        preferences: {
          notifications: true,
          theme: 'light',
          language: 'en'
        }
      };

      const now = new Date();
      const toInsert = {
        ...newProfile,
        createdAt: now,
        updatedAt: now
      } as unknown as User;

      const result = await collection.insertOne(toInsert as any);
      const inserted = { ...(toInsert as any), _id: result.insertedId } as WithMongoId<User>;
      return inserted;
    } catch (error) {
      throw new DatabaseError('Failed to create user profile', error as Error);
    }
  }

  async updateProfile(uid: string, updates: Partial<User>): Promise<boolean> {
    try {
      const db = await connectToDatabase();
      const collection = db.collection<User>('users');
      const result = await collection.updateOne(
        { uid },
        { 
          $set: { 
            ...updates,
            updatedAt: new Date()
          }
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      throw new DatabaseError('Failed to update user profile', error as Error);
    }
  }
}

export const userService = new MongoUserService();