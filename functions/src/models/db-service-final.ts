import { Collection, ObjectId, WithId } from 'mongodb';
import { getDb } from '../db';
import { DatabaseError } from '../errors';
import {
  BaseDocument,
  DBUserProfile,
  DBPlant,
  DBUserGarden,
  DBPlantIdentification,
} from './types/db-types';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PLANTS: 'plants',
  GARDENS: 'gardens',
  IDENTIFICATIONS: 'plant_identifications',
  ENVIRONMENTAL_DATA: 'environmental_data',
} as const;

// Base interface for database operations
export interface DatabaseOperations<T extends BaseDocument> {
  findById(id: string | ObjectId): Promise<WithId<T> | null>;
  create(data: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<WithId<T>>;
  update(id: string | ObjectId, updates: Partial<Omit<T, '_id' | 'createdAt' | 'updatedAt'>>): Promise<WithId<T> | null>;
  delete(id: string | ObjectId): Promise<boolean>;
}

// Base class for database operations
abstract class BaseDbOperations<T extends BaseDocument> implements DatabaseOperations<T> {
  protected abstract collectionName: string;
  protected async getCollection(): Promise<Collection<T>> {
    const db = await getDb();
    return db.collection<T>(this.collectionName);
  }

  protected async wrapDbOperation<R>(operation: () => Promise<R>, operationName: string): Promise<R> {
    try {
      return await operation();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new DatabaseError(`Database error during ${operationName}: ${message}`, error instanceof Error ? error : undefined);
    }
  }

  async findById(id: string | ObjectId): Promise<WithId<T> | null> {
    return this.wrapDbOperation(async () => {
      const collection = await this.getCollection();
      const _id = typeof id === 'string' ? new ObjectId(id) : id;
      return collection.findOne({ _id } as any);
    }, 'findById');
  }

  async create(data: Omit<T, '_id' | 'createdAt' | 'updatedAt'>): Promise<WithId<T>> {
    return this.wrapDbOperation(async () => {
      const collection = await this.getCollection();
      const now = new Date();
      const doc = {
        ...data,
        createdAt: now,
        updatedAt: now,
      } as Partial<T>;

      const result = await collection.insertOne(doc as any);
      return { ...doc, _id: result.insertedId } as WithId<T>;
    }, 'create');
  }

  async update(id: string | ObjectId, updates: Partial<Omit<T, '_id' | 'createdAt' | 'updatedAt'>>): Promise<WithId<T> | null> {
    return this.wrapDbOperation(async () => {
      const collection = await this.getCollection();
      const _id = typeof id === 'string' ? new ObjectId(id) : id;
      const result = await collection.findOneAndUpdate(
        { _id } as any,
        { $set: { ...updates, updatedAt: new Date() } } as any,
        { returnDocument: 'after' }
      );
      return result;
    }, 'update');
  }

  async delete(id: string | ObjectId): Promise<boolean> {
    return this.wrapDbOperation(async () => {
      const collection = await this.getCollection();
      const _id = typeof id === 'string' ? new ObjectId(id) : id;
      const result = await collection.deleteOne({ _id } as any);
      return result.deletedCount > 0;
    }, 'delete');
  }
}

// User Profile Operations
export class UserProfileOperations extends BaseDbOperations<DBUserProfile> {
  protected collectionName = COLLECTIONS.USERS;

  async findByUid(uid: string): Promise<WithId<DBUserProfile> | null> {
    return this.wrapDbOperation(async () => {
      const collection = await this.getCollection();
      return collection.findOne({ uid });
    }, 'findByUid');
  }

  async findByEmail(email: string): Promise<WithId<DBUserProfile> | null> {
    return this.wrapDbOperation(async () => {
      const collection = await this.getCollection();
      return collection.findOne({ email });
    }, 'findByEmail');
  }
}

// Plant Operations
export class PlantOperations extends BaseDbOperations<DBPlant> {
  protected collectionName = COLLECTIONS.PLANTS;

  async findByName(query: string): Promise<WithId<DBPlant>[]> {
    return this.wrapDbOperation(async () => {
      const collection = await this.getCollection();
      return collection.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { scientificName: { $regex: query, $options: 'i' } },
        ],
      }).toArray();
    }, 'findByName');
  }
}

// Garden Operations
export class GardenOperations extends BaseDbOperations<DBUserGarden> {
  protected collectionName = COLLECTIONS.GARDENS;

  async findByUserId(userId: string): Promise<WithId<DBUserGarden>[]> {
    return this.wrapDbOperation(async () => {
      const collection = await this.getCollection();
      return collection.find({ userId }).toArray();
    }, 'findByUserId');
  }

  async addPlant(gardenId: string | ObjectId, plant: DBUserGarden['plants'][0]): Promise<WithId<DBUserGarden> | null> {
    return this.wrapDbOperation(async () => {
      const collection = await this.getCollection();
      const _id = typeof gardenId === 'string' ? new ObjectId(gardenId) : gardenId;
      return collection.findOneAndUpdate(
        { _id } as any,
        {
          $push: { plants: plant } as any,
          $set: { updatedAt: new Date() },
        },
        { returnDocument: 'after' }
      );
    }, 'addPlant');
  }
}

// Plant Identification Operations
export class PlantIdentificationOperations extends BaseDbOperations<DBPlantIdentification> {
  protected collectionName = COLLECTIONS.IDENTIFICATIONS;

  async findByUserId(userId: string): Promise<WithId<DBPlantIdentification>[]> {
    return this.wrapDbOperation(async () => {
      const collection = await this.getCollection();
      return collection.find({ userId }).toArray();
    }, 'findByUserId');
  }

  async updateResults(id: string | ObjectId, results: DBPlantIdentification['results']): Promise<WithId<DBPlantIdentification> | null> {
    return this.wrapDbOperation(async () => {
      const collection = await this.getCollection();
      return collection.findOneAndUpdate(
        { _id: typeof id === 'string' ? new ObjectId(id) : id },
        {
          $set: {
            results,
            status: 'completed',
            updatedAt: new Date(),
          },
        },
        { returnDocument: 'after' }
      );
    }, 'updateResults');
  }
}

// Export database operation instances
export const db = {
  users: new UserProfileOperations(),
  plants: new PlantOperations(),
  gardens: new GardenOperations(),
  identifications: new PlantIdentificationOperations(),
};