import { DatabaseError } from '../../utils/errors';
import { connectToDatabase } from '../../config/database';
class MongoUserService {
    async getProfile(uid) {
        try {
            const db = await connectToDatabase();
            const collection = db.collection('users');
            const profile = await collection.findOne({ uid });
            return profile;
        }
        catch (error) {
            throw new DatabaseError('Failed to get user profile', error);
        }
    }
    async createProfile(profile) {
        try {
            const db = await connectToDatabase();
            const collection = db.collection('users');
            const newProfile = {
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
            };
            const result = await collection.insertOne(toInsert);
            const inserted = { ...toInsert, _id: result.insertedId };
            return inserted;
        }
        catch (error) {
            throw new DatabaseError('Failed to create user profile', error);
        }
    }
    async updateProfile(uid, updates) {
        try {
            const db = await connectToDatabase();
            const collection = db.collection('users');
            const result = await collection.updateOne({ uid }, {
                $set: {
                    ...updates,
                    updatedAt: new Date()
                }
            });
            return result.modifiedCount > 0;
        }
        catch (error) {
            throw new DatabaseError('Failed to update user profile', error);
        }
    }
}
export const userService = new MongoUserService();
