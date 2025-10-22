import { 
  User as UserProfile,
  Plant,
  Garden,
  EnvironmentalData,
  Location,
  WithMongoId
} from '../types';

export interface UserService {
  getProfile(uid: string): Promise<WithMongoId<UserProfile> | null>;
  createProfile(profile: Omit<UserProfile, 'createdAt' | 'updatedAt'>): Promise<WithMongoId<UserProfile>>;
  updateProfile(uid: string, updates: Partial<UserProfile>): Promise<boolean>;
}

export interface PlantService {
  searchPlants(query: string, limit?: number): Promise<WithMongoId<Plant>[]>;
  getPlantById(id: string): Promise<WithMongoId<Plant> | null>;
}

export interface GardenService {
  getUserGarden(userId: string): Promise<WithMongoId<Garden> | null>;
  addPlantToGarden(
    userId: string,
    plantId: string,
    location: Location,
    notes?: string
  ): Promise<boolean>;
  updatePlantInGarden(
    userId: string,
    plantId: string,
    updates: Partial<Omit<Garden['plants'][0], '_id' | 'plantId'>>
  ): Promise<boolean>;
}

export interface EnvironmentalDataService {
  addEnvironmentalData(data: Omit<EnvironmentalData, '_id' | 'createdAt' | 'updatedAt'>): Promise<WithMongoId<EnvironmentalData>>;
  getEnvironmentalData(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<WithMongoId<EnvironmentalData>[]>;
  getLatestEnvironmentalData(userId: string): Promise<WithMongoId<EnvironmentalData> | null>;
}

export interface Services {
  users: UserService;
  plants: PlantService;
  gardens: GardenService;
  environmentalData: EnvironmentalDataService;
}

// Import the actual service implementations here
import { services as serviceImplementations } from '../services';

export const services: Services = {
  users: serviceImplementations.users,
  plants: serviceImplementations.plants,
  gardens: serviceImplementations.gardens,
  environmentalData: serviceImplementations.environmentalData
};