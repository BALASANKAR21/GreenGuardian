import { BaseOperations } from "./base";
import { AppError } from "../../errors";
import { EnvironmentalData, CreateEnvironmentalDataInput } from "../../types";

interface IEnvironmentalDataOperations {
  create(input: CreateEnvironmentalDataInput): Promise<EnvironmentalData>;
  findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<EnvironmentalData[]>;
  findByUserId(userId: string): Promise<EnvironmentalData[]>;
}

export class EnvironmentalDataOperations extends BaseOperations<EnvironmentalData> implements IEnvironmentalDataOperations {
  constructor() {
    super('environmentalData');
  }

  async create(input: CreateEnvironmentalDataInput): Promise<EnvironmentalData> {
    const collection = await this.getCollection();
    
    try {
      const now = new Date();
      const envData = {
        ...input,
        createdAt: now,
        updatedAt: now,
      };
      
      const result = await collection.insertOne(envData as any);
      
      return {
        ...envData,
        _id: result.insertedId,
      };
    } catch (error) {
      throw AppError.databaseError("Failed to create environmental data", error as Error);
    }
  }

  async findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<EnvironmentalData[]> {
    const collection = await this.getCollection();
    
    try {
      const data = await collection.find({
        userId,
        timestamp: {
          $gte: startDate,
          $lte: endDate
        }
      }).toArray();

      return data;
    } catch (error) {
      throw AppError.databaseError("Failed to fetch environmental data", error as Error);
    }
  }

  async findByUserId(userId: string): Promise<EnvironmentalData[]> {
    const collection = await this.getCollection();
    
    try {
      const data = await collection.find({
        userId
      }).toArray();

      return data;
    } catch (error) {
      throw AppError.databaseError("Failed to fetch environmental data for user", error as Error);
    }
  }
}

export const environmentalDataOperations = new EnvironmentalDataOperations();