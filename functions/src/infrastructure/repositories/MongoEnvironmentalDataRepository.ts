import { Collection, Db } from 'mongodb';
import { IEnvironmentalData } from '../../core/domain/models';
import { IEnvironmentalDataRepository } from '../../core/repositories/interfaces';

export class MongoEnvironmentalDataRepository implements IEnvironmentalDataRepository {
  private collection: Collection<IEnvironmentalData>;
  private readonly COLLECTION_NAME = 'environmental_data';

  constructor(db: Db) {
    this.collection = db.collection(this.COLLECTION_NAME);
  }

  async create(data: IEnvironmentalData): Promise<IEnvironmentalData> {
    const now = new Date();
    const newData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };
    await this.collection.insertOne(newData);
    return newData;
  }

  async findLatestByUserId(userId: string): Promise<IEnvironmentalData | null> {
    return this.collection
      .findOne(
        { userId },
        { sort: { timestamp: -1 } }
      );
  }

  async findByUserIdAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<IEnvironmentalData[]> {
    return this.collection
      .find({
        userId,
        timestamp: {
          $gte: startDate,
          $lte: endDate,
        }
      })
      .sort({ timestamp: -1 })
      .toArray();
  }
}