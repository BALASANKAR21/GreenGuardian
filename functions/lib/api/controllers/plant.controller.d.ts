import { Response } from 'express';
import { TypedRequestBody } from '../types';
interface SearchQuery {
    query: string;
    page?: string;
    limit?: string;
}
interface CreatePlantRequest {
    name: string;
    scientificName: string;
    description?: string;
    careInstructions?: string;
    sunlightNeeds?: string;
    wateringNeeds?: string;
    imageUrl?: string;
}
type UpdatePlantRequest = Partial<CreatePlantRequest>;
export declare const plantController: {
    searchPlants(req: TypedRequestBody<SearchQuery>, res: Response): Promise<void>;
    getPlantById(req: TypedRequestBody<any>, res: Response): Promise<void>;
    createPlant(req: TypedRequestBody<CreatePlantRequest>, res: Response): Promise<void>;
    updatePlant(req: TypedRequestBody<UpdatePlantRequest>, res: Response): Promise<void>;
    deletePlant(req: TypedRequestBody<{}>, res: Response): Promise<void>;
};
export {};
