/**
 * Database service layer for the GreenGuardian application.
 * Handles all MongoDB operations with proper type checking and error handling.
 */

import { ObjectId, WithId, Document, Collection } from 'mongodb';
import { getDb } from '../db';
import {
  DBUserProfile,
  DBPlant,
  DBUserGarden,
  DBPlantIdentification,
  DBEnvironmentalData
} from '../types/models';

// Collection names as constants
export const COLLECTIONS = {
  USERS: 'users',
  PLANTS: 'plants',
  GARDENS: 'gardens',
  IDENTIFICATIONS: 'plant_identifications',
  ENVIRONMENTAL_DATA: 'environmental_data',
} as const;

// Error class for database operations
export class DatabaseError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Type-safe collection accessor
function getCollection<T extends Document>(collectionName: string): Promise<Collection<T>> {
  return getDb().then(db => db.collection<T>(collectionName));
}

// Utility function to wrap database operations with error handling
async function wrapDbOperation<T>(operation: () => Promise<T>, operationName: string): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    throw new DatabaseError(`Error during ${operationName}: ${message}`, error instanceof Error ? error : undefined);
  }
}

// --- User Profile Services ---

export async function getUserProfile(uid: string): Promise<WithId<DBUserProfile> | null> {
  return wrapDbOperation(async () => {
    const collection = await getCollection<DBUserProfile>(COLLECTIONS.USERS);
    const profile = await collection.findOne({ uid });
    return profile ? { ...profile, _id: profile._id } as WithId<DBUserProfile> : null;
  }, 'getUserProfile');
}

export async function createUserProfile(
  profile: Omit<DBUserProfile, 'createdAt' | 'updatedAt' | '_id'>
): Promise<WithId<DBUserProfile>> {
  return wrapDbOperation(async () => {
    const collection = await getCollection<DBUserProfile>(COLLECTIONS.USERS);
    const now = new Date();
    const newProfile = {
      ...profile,
      createdAt: now,
      updatedAt: now,
    };
    
    const result = await collection.insertOne(newProfile as DBUserProfile);
    if (!result.acknowledged) {
      throw new DatabaseError('Failed to create user profile');
    }
    
    return { ...newProfile, _id: result.insertedId } as WithId<DBUserProfile>;
  }, 'createUserProfile');
}

export async function updateUserProfile(
  uid: string, 
  updates: Partial<Omit<DBUserProfile, '_id' | 'createdAt' | 'uid'>>
): Promise<boolean> {
  return wrapDbOperation(async () => {
    const collection = await getCollection<DBUserProfile>(COLLECTIONS.USERS);
    const result = await collection.updateOne(
      { uid },
      { 
        $set: {
          ...updates,
          updatedAt: new Date(),
        }
      }
    );
    return result.modifiedCount > 0;
  }, 'updateUserProfile');
}

// --- Plant Services ---

export async function addPlant(plant: Omit<DBPlant, '_id'>): Promise<WithId<DBPlant>> {
  return wrapDbOperation(async () => {
    const collection = await getCollection<DBPlant>(COLLECTIONS.PLANTS);
    const now = new Date();
    const plantWithDates = {
      ...plant,
      createdAt: now,
      updatedAt: now,
    } as DBPlant;
    
    const result = await collection.insertOne(plantWithDates);
    return { ...plantWithDates, _id: result.insertedId } as WithId<DBPlant>;
  }, 'addPlant');
}

export async function getPlant(id: ObjectId): Promise<WithId<DBPlant> | null> {
  return wrapDbOperation(async () => {
    const collection = await getCollection<DBPlant>(COLLECTIONS.PLANTS);
    const plant = await collection.findOne({ _id: id });
    return plant ? { ...plant, _id: plant._id } as WithId<DBPlant> : null;
  }, 'getPlant');
}

export async function searchPlants(query: string): Promise<WithId<DBPlant>[]> {
  return wrapDbOperation(async () => {
    const collection = await getCollection<DBPlant>(COLLECTIONS.PLANTS);
    const plants = await collection
      .find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { scientificName: { $regex: query, $options: 'i' } }
        ]
      })
      .toArray();
    return plants.map(p => ({ ...p, _id: p._id } as WithId<DBPlant>));
  }, 'searchPlants');
}

// --- Garden Services ---

export async function getUserGarden(userId: string): Promise<WithId<DBUserGarden> | null> {
  return wrapDbOperation(async () => {
    const collection = await getCollection<DBUserGarden>(COLLECTIONS.GARDENS);
    const garden = await collection.findOne({ userId });
    return garden ? { ...garden, _id: garden._id } as WithId<DBUserGarden> : null;
  }, 'getUserGarden');
}

export async function addPlantToGarden(
  userId: string,
  plantId: ObjectId,
  location: string,
  notes: string = ''
): Promise<boolean> {
  return wrapDbOperation(async () => {
    const collection = await getCollection<DBUserGarden>(COLLECTIONS.GARDENS);
    const now = new Date();
    
    const result = await collection.updateOne(
      { userId },
      {
        $push: {
          plants: {
            plantId: plantId.toHexString(),
            location,
            plantedDate: now,
            lastWatered: now,
            nextWateringDate: now,
            nickname: '',
            notes,
          }
        } as any // Type assertion needed due to MongoDB types limitation
      },
      { upsert: true }
    );
    
    return result.modifiedCount > 0 || result.upsertedCount > 0;
  }, 'addPlantToGarden');
}

export async function updatePlantInGarden(
  userId: string,
  plantId: string,
  updates: Partial<DBUserGarden['plants'][0]>
): Promise<boolean> {
  return wrapDbOperation(async () => {
    const collection = await getCollection<DBUserGarden>(COLLECTIONS.GARDENS);
    const setUpdates: Record<string, any> = { 
      'updatedAt': new Date(),
    };
    
    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'plantId') {
        setUpdates[`plants.$.${key}`] = value;
      }
    }

    const result = await collection.updateOne(
      { 
        userId,
        'plants.plantId': plantId
      },
      { $set: setUpdates }
    );
    
    return result.modifiedCount > 0;
  }, 'updatePlantInGarden');
}

// --- Plant Identification Services ---

export async function savePlantIdentification(identification: Omit<DBPlantIdentification, '_id'>): Promise<WithId<DBPlantIdentification>> {
  return wrapDbOperation(async () => {
    const collection = await getCollection<DBPlantIdentification>(COLLECTIONS.IDENTIFICATIONS);
    const now = new Date();
    const identificationWithDates = {
      ...identification,
      createdAt: now,
      updatedAt: now,
    } as DBPlantIdentification;
    
    const result = await collection.insertOne(identificationWithDates);
    return { ...identificationWithDates, _id: result.insertedId } as WithId<DBPlantIdentification>;
  }, 'savePlantIdentification');
}

export async function getUserPlantIdentifications(userId: string): Promise<WithId<DBPlantIdentification>[]> {
  return wrapDbOperation(async () => {
    const collection = await getCollection<DBPlantIdentification>(COLLECTIONS.IDENTIFICATIONS);
    const identifications = await collection
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    return identifications.map(i => ({ ...i, _id: i._id } as WithId<DBPlantIdentification>));
  }, 'getUserPlantIdentifications');
}

// --- Environmental Data Services ---

export async function saveEnvironmentalData(data: Omit<DBEnvironmentalData, '_id'>): Promise<WithId<DBEnvironmentalData>> {
  return wrapDbOperation(async () => {
    const collection = await getCollection<DBEnvironmentalData>(COLLECTIONS.ENVIRONMENTAL_DATA);
    const result = await collection.insertOne(data as DBEnvironmentalData);
    return { ...data, _id: result.insertedId } as WithId<DBEnvironmentalData>;
  }, 'saveEnvironmentalData');
}

export async function getLatestEnvironmentalData(userId: string): Promise<WithId<DBEnvironmentalData> | null> {
  return wrapDbOperation(async () => {
    const collection = await getCollection<DBEnvironmentalData>(COLLECTIONS.ENVIRONMENTAL_DATA);
    const data = await collection
      .find({ userId })
      .sort({ timestamp: -1 })
      .limit(1)
      .next();
    return data ? { ...data, _id: data._id } as WithId<DBEnvironmentalData> : null;
  }, 'getLatestEnvironmentalData');
}

export async function getEnvironmentalDataHistory(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<WithId<DBEnvironmentalData>[]> {
  return wrapDbOperation(async () => {
    const collection = await getCollection<DBEnvironmentalData>(COLLECTIONS.ENVIRONMENTAL_DATA);
    const dataPoints = await collection
      .find({
        userId,
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      })
      .sort({ timestamp: -1 })
      .toArray();
    return dataPoints.map(d => ({ ...d, _id: d._id } as WithId<DBEnvironmentalData>));
  }, 'getEnvironmentalDataHistory');
}