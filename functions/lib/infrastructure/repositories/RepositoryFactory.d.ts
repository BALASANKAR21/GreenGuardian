import { Db } from 'mongodb';
import { MongoUserRepository } from './MongoUserRepository';
import { MongoPlantRepository } from './MongoPlantRepository';
import { MongoGardenRepository } from './MongoGardenRepository';
import { MongoPlantIdentificationRepository } from './MongoPlantIdentificationRepository';
import { MongoEnvironmentalDataRepository } from './MongoEnvironmentalDataRepository';
export declare class RepositoryFactory {
    private static userRepository;
    private static plantRepository;
    private static gardenRepository;
    private static plantIdentificationRepository;
    private static environmentalDataRepository;
    static initializeRepositories(db: Db): void;
    static getUserRepository(): MongoUserRepository;
    static getPlantRepository(): MongoPlantRepository;
    static getGardenRepository(): MongoGardenRepository;
    static getPlantIdentificationRepository(): MongoPlantIdentificationRepository;
    static getEnvironmentalDataRepository(): MongoEnvironmentalDataRepository;
}
