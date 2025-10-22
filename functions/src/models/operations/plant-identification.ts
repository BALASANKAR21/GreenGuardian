import { ObjectId } from 'mongodb';
import { BaseOperations } from './base';
import { AppError } from '../../errors';
import { DBPlantIdentification } from '../types/db-types';
import { PlantIdentification, CreatePlantIdentificationInput } from '../../types';

interface IPlantIdentificationOperations {
  create(input: CreatePlantIdentificationInput): Promise<PlantIdentification>;
  findById(id: ObjectId): Promise<PlantIdentification | null>;
  findByUserId(userId: string): Promise<PlantIdentification[]>;
  update(id: ObjectId, updates: Partial<DBPlantIdentification>): Promise<PlantIdentification>;
}

export class PlantIdentificationOperations extends BaseOperations<DBPlantIdentification> implements IPlantIdentificationOperations {
  constructor() {
    super('plantIdentifications');
  }

  async create(input: CreatePlantIdentificationInput): Promise<PlantIdentification> {
    const collection = await this.getCollection();
    
    try {
      const now = new Date();
      const identification = {
        ...input,
        status: 'pending' as const,
        results: [],
        createdAt: now,
        updatedAt: now,
        timestamp: now
      };
      
      const result = await collection.insertOne(identification);
      return { ...identification, _id: result.insertedId };
    } catch (error) {
      throw AppError.databaseError('Failed to create plant identification', error as Error);
    }
  }

  async findById(id: ObjectId): Promise<PlantIdentification | null> {
    const collection = await this.getCollection();
    
    try {
      return collection.findOne({ _id: id });
    } catch (error) {
      throw AppError.databaseError('Failed to find plant identification', error as Error);
    }
  }

  async findByUserId(userId: string): Promise<PlantIdentification[]> {
    const collection = await this.getCollection();
    
    try {
      return collection
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();
    } catch (error) {
      throw AppError.databaseError('Failed to find plant identifications', error as Error);
    }
  }

  async update(id: ObjectId, updates: Partial<DBPlantIdentification>): Promise<PlantIdentification> {
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
        throw AppError.notFound('Plant identification not found');
      }

      return result;
    } catch (error) {
      throw AppError.databaseError('Failed to update plant identification', error as Error);
    }
  }
}

export const plantIdentificationOperations = new PlantIdentificationOperations();