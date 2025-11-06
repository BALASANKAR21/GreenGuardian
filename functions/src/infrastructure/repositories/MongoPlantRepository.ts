import { Collection, Db, ObjectId } from 'mongodb';
import { IPlant } from '../../core/domain/models';
import { IPlantRepository } from '../../core/repositories/interfaces';

export class MongoPlantRepository implements IPlantRepository {
  private collection: Collection<IPlant>;
  private readonly COLLECTION_NAME = 'plants';

  constructor(db: Db) {
    this.collection = db.collection(this.COLLECTION_NAME);
  }

  async findById(id: ObjectId): Promise<IPlant | null> {
    return this.collection.findOne({ _id: id });
  }

  async create(plant: IPlant): Promise<IPlant> {
    const now = new Date();
    const newPlant = {
      ...plant,
      createdAt: now,
      updatedAt: now,
    };
    await this.collection.insertOne(newPlant);
    return newPlant;
  }

  async search(query: string): Promise<IPlant[]> {
    return this.collection.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { scientificName: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } },
      ]
    }).toArray();
  }

  async update(id: ObjectId, updates: Partial<IPlant>): Promise<boolean> {
    const result = await this.collection.updateOne(
      { _id: id },
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