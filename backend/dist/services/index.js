import { repositories } from '../repositories';
import { ValidationError, NotFoundError } from '../utils/errors';
export class UserService {
    userRepo = repositories.users;
    async getProfile(uid) {
        const user = await this.userRepo.findByUid(uid);
        return user;
    }
    async createProfile(data) {
        const user = await this.userRepo.create(data);
        return user;
    }
    async updateProfile(uid, updates) {
        const result = await this.userRepo.updateByUid(uid, updates);
        if (!result) {
            throw new NotFoundError('User profile not found');
        }
        return true;
    }
}
export class PlantService {
    plantRepo = repositories.plants;
    async searchPlants(query, limit) {
        if (!query) {
            throw new ValidationError('Search query is required');
        }
        const plants = await this.plantRepo.search(query, limit);
        return plants;
    }
    async getPlantById(id) {
        const plant = await this.plantRepo.findById(id);
        if (!plant) {
            throw new NotFoundError('Plant not found');
        }
        return plant;
    }
    async createPlant(data) {
        const plant = await this.plantRepo.create(data);
        return plant;
    }
}
export class GardenService {
    gardenRepo = repositories.gardens;
    plantRepo = repositories.plants;
    async getUserGarden(userId) {
        const garden = await this.gardenRepo.findByUserId(userId);
        return garden;
    }
    async addPlantToGarden(userId, plantId, location, notes) {
        // Verify plant exists
        const plant = await this.plantRepo.findById(plantId);
        if (!plant) {
            throw new NotFoundError('Plant not found');
        }
        // Create garden plant entry
        const gardenPlant = {
            plantId,
            location,
            plantedDate: new Date(),
            lastWatered: new Date(),
            health: 'good',
            notes,
        };
        return this.gardenRepo.addPlant(userId, gardenPlant);
    }
    async updatePlantInGarden(userId, plantId, updates) {
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
    envRepo = repositories.environmentalData;
    async getEnvironmentalData(userId, startDate, endDate) {
        if (startDate > endDate) {
            throw new ValidationError('Start date must be before end date');
        }
        const data = await this.envRepo.findByUserAndDateRange(userId, startDate, endDate);
        return data;
    }
    async getLatestEnvironmentalData(userId) {
        const data = await this.envRepo.findLatestEnvironmentalData(userId);
        return data;
    }
    async addEnvironmentalData(data) {
        // Validate required fields
        if (!data.location || !data.readings) {
            throw new ValidationError('Location and readings are required');
        }
        const created = await this.envRepo.create(data);
        return created;
    }
}
// Export service instances
export const services = {
    users: new UserService(),
    plants: new PlantService(),
    gardens: new GardenService(),
    environmentalData: new EnvironmentalDataService(),
};
