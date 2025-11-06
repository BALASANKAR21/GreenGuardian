import { BaseOperations } from "./base";
import { EnvironmentalData, CreateEnvironmentalDataInput } from "../../types";
interface IEnvironmentalDataOperations {
    create(input: CreateEnvironmentalDataInput): Promise<EnvironmentalData>;
    findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<EnvironmentalData[]>;
    findByUserId(userId: string): Promise<EnvironmentalData[]>;
}
export declare class EnvironmentalDataOperations extends BaseOperations<EnvironmentalData> implements IEnvironmentalDataOperations {
    constructor();
    create(input: CreateEnvironmentalDataInput): Promise<EnvironmentalData>;
    findByDateRange(userId: string, startDate: Date, endDate: Date): Promise<EnvironmentalData[]>;
    findByUserId(userId: string): Promise<EnvironmentalData[]>;
}
export declare const environmentalDataOperations: EnvironmentalDataOperations;
export {};
