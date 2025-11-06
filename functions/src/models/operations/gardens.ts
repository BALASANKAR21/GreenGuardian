import { ObjectId } from 'mongodb';
import { BaseOperations } from './base';
import { AppError } from '../../errors';
import { DBUserGarden } from '../types/db-types';
import { UserGarden } from '../../types';

interface AddPlantInput {
  plantId: ObjectId;
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
  };
  nickname?: string;
  plantedDate: Date;
  healthStatus: 'healthy' | 'needs_attention' | 'unhealthy';
  notes?: string;
}

interface CreateGardenInput {
  userId: string;
  plants?: Array<{
    plantId: ObjectId;
    nickname?: string;
    location?: {
      latitude: number;
      longitude: number;
      name?: string;
    };
    plantedDate: Date;
    lastWatered?: Date;
    healthStatus: 'healthy' | 'needs_attention' | 'unhealthy';
    notes?: string;
  }>;
}

interface IGardenOperations {
  create(input: CreateGardenInput): Promise<UserGarden>;
  findByUserId(userId: string): Promise<UserGarden | null>;
  addPlant(gardenId: ObjectId, plant: AddPlantInput): Promise<UserGarden>;
  update(id: ObjectId, updates: Partial<DBUserGarden>): Promise<UserGarden>;
}

export class GardenOperations extends BaseOperations<DBUserGarden> implements IGardenOperations {
  constructor() {
    super('gardens');
  }

  async create(input: CreateGardenInput): Promise<UserGarden> {
    const collection = await this.getCollection();
    
    try {
      const now = new Date();
      const garden: DBUserGarden = {
        userId: input.userId,
        plants: input.plants || [],
        createdAt: now,
        updatedAt: now
      };
      
      const result = await collection.insertOne(garden);
      return { ...garden, _id: result.insertedId };
    } catch (error) {
      throw AppError.databaseError('Failed to create garden', error as Error);
    }
  }

  async findByUserId(userId: string): Promise<UserGarden | null> {
    const collection = await this.getCollection();
    
    try {
      return collection.findOne({ userId });
    } catch (error) {
      throw AppError.databaseError('Failed to find garden', error as Error);
    }
  }

  async addPlant(gardenId: ObjectId, plant: AddPlantInput): Promise<UserGarden> {
    const collection = await this.getCollection();
    
    try {
      // First get current garden
      const garden = await collection.findOne({ _id: gardenId });
      if (!garden) {
        throw AppError.notFound('Garden not found');
      }

      // Add new plant to the plants array
      const updatedGarden = {
        ...garden,
        plants: [...garden.plants, plant],
        updatedAt: new Date()
      };

      // Update garden with new plants array
      const result = await collection.findOneAndUpdate(
        { _id: gardenId },
        { $set: updatedGarden },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw AppError.internal('Failed to update garden after adding plant');
      }

      return result;
    } catch (error) {
      throw AppError.databaseError('Failed to add plant to garden', error as Error);
    }
  }

  async update(id: ObjectId, updates: Partial<DBUserGarden>): Promise<UserGarden> {
    const collection = await this.getCollection();
    
    try {
      const result = await collection.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            ...updates,
            updatedAt: new Date()
          }
        },
        { returnDocument: 'after' }
      );

      if (!result) {
        throw AppError.notFound('Garden not found');
      }

      return result;
    } catch (error) {
      throw AppError.databaseError('Failed to update garden', error as Error);
    }
  }
}

export const gardenOperations = new GardenOperations();