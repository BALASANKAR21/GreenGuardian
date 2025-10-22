import { Collection, Db, ObjectId } from 'mongodb';
import { IUserGarden, IGardenPlant } from '../../core/domain/models';
import { IGardenRepository } from '../../core/repositories/interfaces';

export class MongoGardenRepository implements IGardenRepository {
  private collection: Collection<IUserGarden>;
  private readonly COLLECTION_NAME = 'gardens';

  constructor(db: Db) {
    this.collection = db.collection(this.COLLECTION_NAME);
  }

  async findByUserId(userId: string): Promise<IUserGarden | null> {
    return this.collection.findOne({ userId });
  }

  async addPlant(userId: string, plant: IGardenPlant): Promise<boolean> {
    const now = new Date();
    const result = await this.collection.updateOne(
      { userId },
      {
        $push: { plants: plant },
        $set: { updatedAt: now },
        $setOnInsert: {
          createdAt: now,
          userId
        }
      },
      { upsert: true }
    );
    return result.modifiedCount > 0 || result.upsertedCount > 0;
  }

  async updatePlant(userId: string, plantId: ObjectId, updates: Partial<IGardenPlant>): Promise<boolean> {
    const result = await this.collection.updateOne(
      { 
        userId,
        'plants.plantId': plantId
      },
      {
        $set: {
          'plants.$': {
            ...updates,
            updatedAt: new Date()
          }
        }
      }
    );
    return result.modifiedCount > 0;
  }

  async removePlant(userId: string, plantId: ObjectId): Promise<boolean> {
    const result = await this.collection.updateOne(
      { userId },
      {
        $pull: { plants: { plantId } },
        $set: { updatedAt: new Date() }
      }
    );
    return result.modifiedCount > 0;
  }
}