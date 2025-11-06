import { ObjectId } from 'mongodb';
import { BaseOperations } from './base';
import { AppError } from '../../errors';
import { DBPlant } from '../types/db-types';
import { Plant, CreatePlantInput } from '../../types';

interface IPlantOperations {
  create(input: CreatePlantInput): Promise<Plant>;
  findById(id: ObjectId): Promise<Plant | null>;
  findByName(query: string, page?: number, limit?: number): Promise<{ plants: Plant[]; total: number }>;
  update(id: ObjectId, updates: Partial<DBPlant>): Promise<Plant>;
}

export class PlantOperations extends BaseOperations<DBPlant> implements IPlantOperations {
  constructor() {
    super('plants');
  }

  async create(input: CreatePlantInput): Promise<Plant> {
    const collection = await this.getCollection();
    
    try {
      // Validate required fields
      if (!input.name || !input.scientificName) {
        throw AppError.badRequest('Name and scientific name are required');
      }

      // Validate string lengths
      if (input.name.length > 100 || input.scientificName.length > 100) {
        throw AppError.badRequest('Name and scientific name must not exceed 100 characters');
      }

      if (input.description && input.description.length > 1000) {
        throw AppError.badRequest('Description must not exceed 1000 characters');
      }

      const now = new Date();
      const plant: DBPlant = {
        name: input.name,
        scientificName: input.scientificName,
        description: input.description,
        tags: [],
        careInstructions: {
          watering: {
            frequency: input.wateringFrequency,
            amount: 'moderate',
            notes: input.careInstructions
          },
          sunlight: {
            level: 'medium',
            directSun: false,
            notes: input.careInstructions
          },
          soil: {
            type: 'standard',
            pH: { min: 6.0, max: 7.0 },
            notes: input.careInstructions
          },
          temperature: {
            min: 18,
            max: 24,
            ideal: 21
          },
          humidity: {
            min: 40,
            max: 60,
            ideal: 50
          }
        },
        createdAt: now,
        updatedAt: now
      };
      
      const result = await collection.insertOne(plant);
      return { ...plant, _id: result.insertedId };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.databaseError('Failed to create plant', error as Error);
    }
  }

  async findById(id: ObjectId): Promise<Plant | null> {
    const collection = await this.getCollection();
    
    try {
      const plant = await collection.findOne({ _id: id });
      return plant;
    } catch (error) {
      throw AppError.databaseError('Failed to find plant', error as Error);
    }
  }

  async findByName(query: string, page: number = 1, limit: number = 10): Promise<{ plants: Plant[]; total: number }> {
    const collection = await this.getCollection();
    
    try {
      const searchQuery = {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { scientificName: { $regex: query, $options: 'i' } }
        ]
      };

      const [plants, total] = await Promise.all([
        collection
          .find(searchQuery)
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray(),
        collection.countDocuments(searchQuery)
      ]);

      return { plants, total };
    } catch (error) {
      throw AppError.databaseError('Failed to search plants', error as Error);
    }
  }

  async update(id: ObjectId, updates: Partial<DBPlant>): Promise<Plant> {
    const collection = await this.getCollection();
    
    try {
      // Validate that we're not updating critical fields
      const restrictedFields = ['_id', 'createdAt'];
      const hasRestrictedFields = restrictedFields.some(field => field in updates);
      if (hasRestrictedFields) {
        throw AppError.badRequest('Cannot update restricted fields');
      }

      // Validate string lengths if they're being updated
      if (updates.name && updates.name.length > 100) {
        throw AppError.badRequest('Name must not exceed 100 characters');
      }
      if (updates.scientificName && updates.scientificName.length > 100) {
        throw AppError.badRequest('Scientific name must not exceed 100 characters');
      }
      if (updates.description && updates.description.length > 1000) {
        throw AppError.badRequest('Description must not exceed 1000 characters');
      }

      // Validate care instructions if they're being updated
      if (updates.careInstructions) {
  const { watering, sunlight, soil: _soil, temperature, humidity } = updates.careInstructions;

        if (watering) {
          if (watering.frequency && (watering.frequency < 1 || watering.frequency > 90)) {
            throw AppError.badRequest('Watering frequency must be between 1 and 90 days');
          }
          if (watering.amount && !['light', 'moderate', 'heavy'].includes(watering.amount)) {
            throw AppError.badRequest('Invalid watering amount');
          }
        }

        if (sunlight && sunlight.level && !['low', 'medium', 'high'].includes(sunlight.level)) {
          throw AppError.badRequest('Invalid sunlight level');
        }

        if (temperature) {
          if (temperature.min && (temperature.min < -10 || temperature.min > 40)) {
            throw AppError.badRequest('Temperature min must be between -10 and 40°C');
          }
          if (temperature.max && (temperature.max < temperature.min || temperature.max > 40)) {
            throw AppError.badRequest('Invalid temperature range');
          }
        }

        if (humidity) {
          if (humidity.min && (humidity.min < 0 || humidity.min > 100)) {
            throw AppError.badRequest('Humidity min must be between 0 and 100%');
          }
          if (humidity.max && (humidity.max < humidity.min || humidity.max > 100)) {
            throw AppError.badRequest('Invalid humidity range');
          }
        }
      }

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
        throw AppError.notFound('Plant not found');
      }

      return result;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw AppError.databaseError('Failed to update plant', error as Error);
    }
  }
}

export const plantOperations = new PlantOperations();