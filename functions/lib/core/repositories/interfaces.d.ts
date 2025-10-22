import { ObjectId } from 'mongodb';
import { IUserProfile, IPlant, IUserGarden, IPlantIdentification, IEnvironmentalData, IGardenPlant } from '../domain/models';
export interface IUserRepository {
    findByUid(uid: string): Promise<IUserProfile | null>;
    create(profile: IUserProfile): Promise<IUserProfile>;
    update(uid: string, updates: Partial<IUserProfile>): Promise<boolean>;
}
export interface IPlantRepository {
    findById(id: ObjectId): Promise<IPlant | null>;
    create(plant: IPlant): Promise<IPlant>;
    search(query: string): Promise<IPlant[]>;
    update(id: ObjectId, updates: Partial<IPlant>): Promise<boolean>;
}
export interface IGardenRepository {
    findByUserId(userId: string): Promise<IUserGarden | null>;
    addPlant(userId: string, plant: IGardenPlant): Promise<boolean>;
    updatePlant(userId: string, plantId: ObjectId, updates: Partial<IGardenPlant>): Promise<boolean>;
    removePlant(userId: string, plantId: ObjectId): Promise<boolean>;
}
export interface IPlantIdentificationRepository {
    create(identification: IPlantIdentification): Promise<IPlantIdentification>;
    findByUserId(userId: string): Promise<IPlantIdentification[]>;
}
export interface IEnvironmentalDataRepository {
    create(data: IEnvironmentalData): Promise<IEnvironmentalData>;
    findLatestByUserId(userId: string): Promise<IEnvironmentalData | null>;
    findByUserIdAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<IEnvironmentalData[]>;
}
