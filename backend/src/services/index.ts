import { repositories } from '../repositories';
import { ValidationError, NotFoundError } from '../utils/errors';
import * as Types from '../types';

export class UserService {
  private userRepo = repositories.users;

  async getProfile(uid: string): Promise<Types.UserDoc | null> {
    const user = await this.userRepo.findByUid(uid);
    return user as unknown as Types.UserDoc | null;
  }

  async createProfile(data: Omit<Types.User, 'createdAt' | 'updatedAt'>): Promise<Types.UserDoc> {
    const user = await this.userRepo.create(data);
    return user as unknown as Types.UserDoc;
  }

  async updateProfile(uid: string, updates: Partial<Types.User>): Promise<boolean> {
    const result = await this.userRepo.updateByUid(uid, updates);
    if (!result) {
      throw new NotFoundError('User profile not found');
    }
    return true;
  }
}

export class PlantService {
  private plantRepo = repositories.plants;

  async searchPlants(query: string, limit?: number): Promise<Types.PlantDoc[]> {
    if (!query) {
      throw new ValidationError('Search query is required');
    }
    const plants = await this.plantRepo.search(query, limit);
    return plants as unknown as Types.PlantDoc[];
  }

  async getPlantById(id: string): Promise<Types.PlantDoc> {
    const plant = await this.plantRepo.findById(id);
    if (!plant) {
      throw new NotFoundError('Plant not found');
    }
    return plant as unknown as Types.PlantDoc;
  }

  async createPlant(data: Omit<Types.Plant, 'createdAt' | 'updatedAt'>): Promise<Types.PlantDoc> {
    const plant = await this.plantRepo.create(data);
    return plant as unknown as Types.PlantDoc;
  }
}

export class GardenService {
  private gardenRepo = repositories.gardens;
  private plantRepo = repositories.plants;

  async getUserGarden(userId: string): Promise<Types.GardenDoc | null> {
    const garden = await this.gardenRepo.findByUserId(userId);
    return garden as unknown as Types.GardenDoc | null;
  }

  async addPlantToGarden(
    userId: string,
    plantId: string,
    location: { latitude: number; longitude: number },
    notes?: string
  ): Promise<boolean> {
    // Verify plant exists
    const plant = await this.plantRepo.findById(plantId);
    if (!plant) {
      throw new NotFoundError('Plant not found');
    }

    // Create garden plant entry
    const gardenPlant: Types.GardenPlant = {
      plantId,
      location,
      plantedDate: new Date(),
      lastWatered: new Date(),
      health: 'good',
      notes,
    };

    return this.gardenRepo.addPlant(userId, gardenPlant);
  }

  async updatePlantInGarden(
    userId: string,
    plantId: string,
    updates: Partial<Types.GardenPlant>
  ): Promise<boolean> {
    const garden = await this.gardenRepo.findByUserId(userId);
    if (!garden) {
      throw new NotFoundError('Garden not found');
    }

    const plantExists = garden.plants.some(p => p.plantId === plantId);
    if (!plantExists) {
      throw new NotFoundError('Plant not found in garden');
    }

    return this.gardenRepo.updatePlant(userId, plantId, updates);
  }
}

export class EnvironmentalDataService {
  private envRepo = repositories.environmentalData;

  async getEnvironmentalData(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Types.EnvironmentalDataDoc[]> {
    if (startDate > endDate) {
      throw new ValidationError('Start date must be before end date');
    }

    const data = await this.envRepo.findByUserAndDateRange(userId, startDate, endDate);
    return data as unknown as Types.EnvironmentalDataDoc[];
  }

  async getLatestEnvironmentalData(userId: string): Promise<Types.EnvironmentalDataDoc | null> {
    const data = await this.envRepo.findLatestEnvironmentalData(userId);
    return data as unknown as Types.EnvironmentalDataDoc | null;
  }

  async addEnvironmentalData(
    data: Omit<Types.EnvironmentalData, 'createdAt' | 'updatedAt'>
  ): Promise<Types.EnvironmentalDataDoc> {
    // Validate required fields
    if (!data.location || !data.readings) {
      throw new ValidationError('Location and readings are required');
    }

    const created = await this.envRepo.create(data);
    return created as unknown as Types.EnvironmentalDataDoc;
  }
}

// Export service instances
export const services = {
  users: new UserService(),
  plants: new PlantService(),
  gardens: new GardenService(),
  environmentalData: new EnvironmentalDataService(),
};