import { Collection, ObjectId, Filter, WithId, OptionalUnlessRequiredId, Document } from 'mongodb';
import { getDb } from '../config/database';
import { DatabaseError } from '../utils/errors';
import * as Types from '../types';

// Collection names
export const Collections = {
  USERS: 'users',
  PLANTS: 'plants',
  GARDENS: 'gardens',
  ENVIRONMENTAL_DATA: 'environmental_data',
  PLANT_IDENTIFICATIONS: 'plant_identifications',
  WEATHER_DATA: 'weather_data'
} as const;

// Base repository class with common CRUD operations
interface BaseDocument extends Document {
  createdAt: Date;
  updatedAt: Date;
}

abstract class BaseRepository<T extends BaseDocument> {
  private collectionName: string;
  private collection: Collection<T> | null = null;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected async getCollection(): Promise<Collection<T>> {
    if (!this.collection) {
      const db = await getDb();
      this.collection = db.collection<T>(this.collectionName);
    }
    return this.collection;
  }

  protected handleError(operation: string, error: unknown): never {
    const message = error instanceof Error ? error.message : String(error);
    throw new DatabaseError(
      `Error in ${this.collectionName} repository during ${operation}: ${message}`,
      error instanceof Error ? error : undefined
    );
  }

  async findById(id: string | ObjectId): Promise<WithId<T> | null> {
    try {
      const collection = await this.getCollection();
      const _id = typeof id === 'string' ? new ObjectId(id) : id;
      return (await collection.findOne({ _id } as Filter<T>)) as WithId<T> | null;
    } catch (error) {
      this.handleError('findById', error);
    }
  }

  async findOne(filter: Filter<T>): Promise<WithId<T> | null> {
    try {
      const collection = await this.getCollection();
      return (await collection.findOne(filter)) as WithId<T> | null;
    } catch (error) {
      this.handleError('findOne', error);
    }
  }

  async find(filter: Filter<T>, limit?: number): Promise<WithId<T>[]> {
    try {
      const collection = await this.getCollection();
      let query = collection.find(filter);
      if (limit) {
        query = query.limit(limit);
      }
      return (await query.toArray()) as WithId<T>[];
    } catch (error) {
      this.handleError('find', error);
    }
  }

  async create(data: Omit<T, keyof BaseDocument>): Promise<WithId<T>> {
    try {
      const collection = await this.getCollection();
      const now = new Date();
      const document = {
        ...data,
        createdAt: now,
        updatedAt: now,
      };

      const result = await collection.insertOne(document as OptionalUnlessRequiredId<T>);
      if (!result.acknowledged) {
        throw new Error('Insert operation was not acknowledged');
      }

      const created = await this.findById(result.insertedId);
      if (!created) {
        throw new Error('Created document could not be found');
      }

      return created;
    } catch (error) {
      this.handleError('create', error);
    }
  }

  async update(id: string | ObjectId, update: Partial<T>): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const _id = typeof id === 'string' ? new ObjectId(id) : id;
      const result = await collection.updateOne(
        { _id } as Filter<T>,
        {
          $set: {
            ...update,
            updatedAt: new Date()
          }
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      this.handleError('update', error);
    }
  }

  async delete(id: string | ObjectId): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const _id = typeof id === 'string' ? new ObjectId(id) : id;
      const result = await collection.deleteOne({ _id } as Filter<T>);
      return result.deletedCount > 0;
    } catch (error) {
      this.handleError('delete', error);
    }
  }
}

// User repository
export class UserRepository extends BaseRepository<Types.User> {
  constructor() {
    super(Collections.USERS);
  }

  async findByUid(uid: string): Promise<Types.User | null> {
    try {
      const collection = await this.getCollection();
      const result = await collection.findOne({ uid } as Filter<Types.User>);
      return result;
    } catch (error) {
      this.handleError('findByUid', error);
    }
  }

  async updateByUid(uid: string, update: Partial<Types.User>): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { uid } as Filter<Types.User>,
        { 
          $set: {
            ...update,
            updatedAt: new Date()
          }
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      this.handleError('updateByUid', error);
    }
  }
}

// Plant repository
export class PlantRepository extends BaseRepository<Types.Plant> {
  constructor() {
    super(Collections.PLANTS);
  }

  async search(query: string, limit = 20): Promise<Types.Plant[]> {
    try {
      const collection = await this.getCollection();
      const result = await collection.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { scientificName: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ]
      } as Filter<Types.Plant>).limit(limit).toArray();
      return result;
    } catch (error) {
      this.handleError('search', error);
    }
  }
}

// Garden repository
export class GardenRepository extends BaseRepository<Types.Garden> {
  constructor() {
    super(Collections.GARDENS);
  }

  async findByUserId(userId: string): Promise<Types.Garden | null> {
    try {
      const collection = await this.getCollection();
      const result = await collection.findOne({ userId } as Filter<Types.Garden>);
      return result;
    } catch (error) {
      this.handleError('findByUserId', error);
    }
  }

  async addPlant(userId: string, plant: Types.GardenPlant): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { userId } as Filter<Types.Garden>,
        {
          $push: { plants: plant },
          $set: { updatedAt: new Date() },
          $setOnInsert: {
            userId,
            createdAt: new Date(),
            name: 'My Garden'
          }
        },
        { upsert: true }
      );
      return result.modifiedCount > 0 || result.upsertedCount > 0;
    } catch (error) {
      this.handleError('addPlant', error);
    }
  }

  async updatePlant(userId: string, plantId: string, update: Partial<Types.GardenPlant>): Promise<boolean> {
    try {
      const collection = await this.getCollection();
      const result = await collection.updateOne(
        { 
          userId,
          'plants.plantId': plantId
        } as Filter<Types.Garden>,
        {
          $set: Object.entries(update).reduce((acc, [key, value]) => ({
            ...acc,
            [`plants.$.${key}`]: value
          }), { updatedAt: new Date() })
        }
      );
      return result.modifiedCount > 0;
    } catch (error) {
      this.handleError('updatePlant', error);
    }
  }
}

// Environmental data repository
export class EnvironmentalDataRepository extends BaseRepository<Types.EnvironmentalData> {
  constructor() {
    super(Collections.ENVIRONMENTAL_DATA);
  }

  async findByUserAndDateRange(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Types.EnvironmentalData[]> {
    try {
      const collection = await this.getCollection();
      const result = await collection.find({
        userId,
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      } as Filter<Types.EnvironmentalData>).toArray();
      return result;
    } catch (error) {
      this.handleError('findByUserAndDateRange', error);
    }
  }

  async findLatestEnvironmentalData(userId: string): Promise<Types.EnvironmentalData | null> {
    try {
      const collection = await this.getCollection();
      const [data] = await collection
        .find({ userId } as Filter<Types.EnvironmentalData>)
        .sort({ timestamp: -1 })
        .limit(1)
        .toArray();
      return data ?? null;
    } catch (error) {
      this.handleError('findLatestEnvironmentalData', error);
    }
  }
}

// Export repositories
export const repositories = {
  users: new UserRepository(),
  plants: new PlantRepository(),
  gardens: new GardenRepository(),
  environmentalData: new EnvironmentalDataRepository()
};