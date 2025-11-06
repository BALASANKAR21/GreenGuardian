import { Collection, Db } from 'mongodb';
import { IPlantIdentification } from '../../core/domain/models';
import { IPlantIdentificationRepository } from '../../core/repositories/interfaces';

export class MongoPlantIdentificationRepository implements IPlantIdentificationRepository {
  private collection: Collection<IPlantIdentification>;
  private readonly COLLECTION_NAME = 'plant_identifications';

  constructor(db: Db) {
    this.collection = db.collection(this.COLLECTION_NAME);
  }

  async create(identification: IPlantIdentification): Promise<IPlantIdentification> {
    const now = new Date();
    const newIdentification = {
      ...identification,
      createdAt: now,
      updatedAt: now,
    };
    await this.collection.insertOne(newIdentification);
    return newIdentification;
  }

  async findByUserId(userId: string): Promise<IPlantIdentification[]> {
    return this.collection
      .find({ userId })
      .sort({ identifiedAt: -1 })
      .toArray();
  }
}