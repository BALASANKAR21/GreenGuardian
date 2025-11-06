import { Db } from 'mongodb';
import { MongoUserRepository } from './MongoUserRepository';
import { MongoPlantRepository } from './MongoPlantRepository';
import { MongoGardenRepository } from './MongoGardenRepository';
import { MongoPlantIdentificationRepository } from './MongoPlantIdentificationRepository';
import { MongoEnvironmentalDataRepository } from './MongoEnvironmentalDataRepository';

export class RepositoryFactory {
  private static userRepository: MongoUserRepository;
  private static plantRepository: MongoPlantRepository;
  private static gardenRepository: MongoGardenRepository;
  private static plantIdentificationRepository: MongoPlantIdentificationRepository;
  private static environmentalDataRepository: MongoEnvironmentalDataRepository;

  public static initializeRepositories(db: Db): void {
    this.userRepository = new MongoUserRepository(db);
    this.plantRepository = new MongoPlantRepository(db);
    this.gardenRepository = new MongoGardenRepository(db);
    this.plantIdentificationRepository = new MongoPlantIdentificationRepository(db);
    this.environmentalDataRepository = new MongoEnvironmentalDataRepository(db);
  }

  public static getUserRepository(): MongoUserRepository {
    if (!this.userRepository) {
      throw new Error('Repositories not initialized');
    }
    return this.userRepository;
  }

  public static getPlantRepository(): MongoPlantRepository {
    if (!this.plantRepository) {
      throw new Error('Repositories not initialized');
    }
    return this.plantRepository;
  }

  public static getGardenRepository(): MongoGardenRepository {
    if (!this.gardenRepository) {
      throw new Error('Repositories not initialized');
    }
    return this.gardenRepository;
  }

  public static getPlantIdentificationRepository(): MongoPlantIdentificationRepository {
    if (!this.plantIdentificationRepository) {
      throw new Error('Repositories not initialized');
    }
    return this.plantIdentificationRepository;
  }

  public static getEnvironmentalDataRepository(): MongoEnvironmentalDataRepository {
    if (!this.environmentalDataRepository) {
      throw new Error('Repositories not initialized');
    }
    return this.environmentalDataRepository;
  }
}