import { Collection, Db } from 'mongodb';
import { IUserProfile } from '../../core/domain/models';
import { IUserRepository } from '../../core/repositories/interfaces';

export class MongoUserRepository implements IUserRepository {
  private collection: Collection<IUserProfile>;
  private readonly COLLECTION_NAME = 'users';

  constructor(db: Db) {
    this.collection = db.collection(this.COLLECTION_NAME);
  }

  async findByUid(uid: string): Promise<IUserProfile | null> {
    return this.collection.findOne({ uid });
  }

  async create(profile: IUserProfile): Promise<IUserProfile> {
    const now = new Date();
    const newProfile = {
      ...profile,
      createdAt: now,
      updatedAt: now,
    };
    await this.collection.insertOne(newProfile);
    return newProfile;
  }

  async update(uid: string, updates: Partial<IUserProfile>): Promise<boolean> {
    const result = await this.collection.updateOne(
      { uid },
      { 
        $set: {
          ...updates,
          updatedAt: new Date(),
        }
      }
    );
    return result.modifiedCount > 0;
  }
}