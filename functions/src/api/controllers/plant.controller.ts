import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { RepositoryFactory } from '../../infrastructure/repositories/RepositoryFactory';
import { AppError } from '../../lib/errors';
import { TypedRequestBody } from '../types';
import { IPlant } from '../../core/domain/models';


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

export const plantController = {
  async searchPlants(req: TypedRequestBody<SearchQuery>, res: Response) {
    try {
      const { query, page = '1', limit = '10' } = req.query as SearchQuery;
      
      if (!query) {
        throw AppError.badRequest('Invalid search query');
      }

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);

      if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
        throw AppError.badRequest('Invalid pagination parameters');
      }

      const plantRepo = RepositoryFactory.getPlantRepository();
      const searchResults = await plantRepo.search(query);
      
      // Apply pagination
      const startIdx = (pageNum - 1) * limitNum;
      const endIdx = startIdx + limitNum;
      const paginatedResults = searchResults.slice(startIdx, endIdx);
      const total = searchResults.length;

      res.json({
        status: 'success',
        data: {
          plants: paginatedResults,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            totalPages: Math.ceil(total / limitNum)
          }
        }
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to search plants', 500);
    }
  },

  async getPlantById(req: TypedRequestBody<any>, res: Response) {
    try {
      const { id } = req.params;
      
      if (!id) {
        throw AppError.badRequest('Plant ID is required');
      }
      
      if (!ObjectId.isValid(id)) {
        throw AppError.badRequest('Invalid Plant ID format');
      }

      const plantRepo = RepositoryFactory.getPlantRepository();
      const plant = await plantRepo.findById(new ObjectId(id));

      if (!plant) {
        throw AppError.notFound('Plant not found');
      }

      res.json({
        status: 'success',
        data: plant
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to get plant', 500);
    }
  },

  async createPlant(req: TypedRequestBody<CreatePlantRequest>, res: Response) {
    try {
  // authenticated user's uid is available on req.user if needed
  const plantData = req.body;
      
      // Validate required fields
      if (!plantData.name || !plantData.scientificName) {
        throw AppError.badRequest('Missing required plant fields');
      }

      // Validate field types
      if (typeof plantData.name !== 'string' || typeof plantData.scientificName !== 'string') {
        throw AppError.badRequest('Invalid field types');
      }

      if (plantData.name.length > 100 || plantData.scientificName.length > 100) {
        throw AppError.badRequest('Field length exceeds maximum');
      }

      // Add metadata
      const newPlant: IPlant = {
        ...plantData,
        tags: [],
        imageUrl: '',
        description: plantData.description || '',
        careInstructions: {
          water: plantData.wateringNeeds || '',
          sunlight: plantData.sunlightNeeds || '',
          soil: '',
          temperature: '',
          humidity: ''
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const plantRepo = RepositoryFactory.getPlantRepository();
      const createdPlant = await plantRepo.create(newPlant);

      res.status(201).json({
        status: 'success',
        message: 'Plant created successfully',
        data: createdPlant
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to create plant', 500);
    }
  },

  async updatePlant(req: TypedRequestBody<UpdatePlantRequest>, res: Response) {
    try {
      const { id } = req.params;
      const updates = req.body;

      if (!ObjectId.isValid(id)) {
        throw AppError.badRequest('Invalid plant ID');
      }

      // Get the existing plant first
      const plantRepo = RepositoryFactory.getPlantRepository();
      const existingPlant = await plantRepo.findById(new ObjectId(id));

      if (!existingPlant) {
        throw AppError.notFound('Plant not found');
      }

      // Prevent updating certain fields
      const { createdAt, updatedAt, _id, ...updateData } = updates as any;

      // Convert update data to IPlant format
      const plantUpdate: Partial<IPlant> = {
        ...updateData,
        ...(updateData.careInstructions && {
          careInstructions: {
            water: updateData.wateringNeeds || '',
            sunlight: updateData.sunlightNeeds || '',
            soil: '',
            temperature: '',
            humidity: ''
          }
        })
      };

      const updated = await plantRepo.update(new ObjectId(id), plantUpdate);

      res.json({
        status: 'success',
        message: 'Plant updated successfully',
        data: updated
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update plant', 500);
    }
  },

  async deletePlant(req: TypedRequestBody<{}>, res: Response) {
    try {
      const { id } = req.params;

      if (!ObjectId.isValid(id)) {
        throw AppError.badRequest('Invalid plant ID');
      }

      const plantRepo = RepositoryFactory.getPlantRepository();
      const plant = await plantRepo.findById(new ObjectId(id));

      if (!plant) {
        throw AppError.notFound('Plant not found');
      }

  await plantRepo.update(new ObjectId(id), { deleted: true } as Partial<IPlant>);

      res.json({
        status: 'success',
        message: 'Plant deleted successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to delete plant', 500);
    }
  }
};