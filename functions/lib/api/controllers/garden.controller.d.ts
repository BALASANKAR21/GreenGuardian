import { Response } from 'express';
import { TypedRequestBody } from '../types';
interface AddPlantRequest {
    plantId: string;
    location: {
        latitude: number;
        longitude: number;
    };
    notes?: string;
    health?: 'good' | 'average' | 'poor';
}
interface UpdatePlantRequest {
    location?: {
        latitude: number;
        longitude: number;
    };
    notes?: string;
    health?: 'good' | 'average' | 'poor';
}
export declare const gardenController: {
    getUserGarden(req: TypedRequestBody<any>, res: Response): Promise<Response<any, Record<string, any>>>;
    addPlant(req: TypedRequestBody<AddPlantRequest>, res: Response): Promise<void>;
    updatePlant(req: TypedRequestBody<UpdatePlantRequest>, res: Response): Promise<void>;
    removePlant(req: TypedRequestBody<{}>, res: Response): Promise<void>;
};
export {};
