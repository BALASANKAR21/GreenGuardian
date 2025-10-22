import { ObjectId } from 'mongodb';
export interface EnvironmentalData {
    _id?: ObjectId;
    userId: string;
    plantId?: ObjectId;
    readings: {
        soilMoisture?: number;
        temperature?: number;
        humidity?: number;
        lightLevel?: number;
        airQuality?: {
            co2?: number;
            tvoc?: number;
        };
    };
    location?: {
        type: 'Point';
        coordinates: [number, number];
    };
    timestamp: Date;
    source: 'sensor' | 'manual' | 'forecast';
}
