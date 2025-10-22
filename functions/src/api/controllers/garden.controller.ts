import { Request, Response } from 'express';
import { ObjectId } from 'mongodb';
import { RepositoryFactory } from '../../infrastructure/repositories/RepositoryFactory';
import { AppError } from '../../lib/errors';
import { TypedRequestBody } from '../types';

interface AuthenticatedRequest extends Request {
  user: { uid: string };
}

interface AddPlantRequest {
  plantId: string;
  location: { latitude: number; longitude: number };
  notes?: string;
  health?: 'good' | 'average' | 'poor';
}

interface UpdatePlantRequest {
  location?: { latitude: number; longitude: number };
  notes?: string;
  health?: 'good' | 'average' | 'poor';
}

export const gardenController = {
  async getUserGarden(req: TypedRequestBody<any>, res: Response) {
    try {
      const { uid } = (req as AuthenticatedRequest).user;
      const gardenRepo = RepositoryFactory.getGardenRepository();
      const garden = await gardenRepo.findByUserId(uid);
      
      if (!garden) {
        // Return empty garden if not found
        return res.json({
          status: 'success',
          data: { plants: [] }
        });
      }
      
      return res.json({
        status: 'success',
        data: garden
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch garden');
    }
  },

  async addPlant(req: TypedRequestBody<AddPlantRequest>, res: Response) {
    try {
      const { uid } = (req as AuthenticatedRequest).user;
      const { plantId, location, notes = '', health = 'good' } = req.body;
      
      // Ensure plantData has required fields
      if (!plantId || !location) {
        throw AppError.badRequest('Plant ID and location are required');
      }

      const gardenRepo = RepositoryFactory.getGardenRepository();
      const now = new Date();
      const plantData = {
        plantId: new ObjectId(plantId),
        location,
        notes,
        health,
        plantedDate: now,
        lastWatered: now
      };
      const updatedGarden = await gardenRepo.addPlant(uid, plantData);

      res.status(201).json({
        status: 'success',
        message: 'Plant added to garden',
        data: updatedGarden
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to add plant to garden');
    }
  },

  async updatePlant(req: TypedRequestBody<UpdatePlantRequest>, res: Response) {
    try {
      const { uid } = (req as AuthenticatedRequest).user;
      const { plantId } = req.params;
      const updates = req.body;

      if (!ObjectId.isValid(plantId)) {
        throw AppError.badRequest('Invalid plant ID');
      }

      const gardenRepo = RepositoryFactory.getGardenRepository();
      const updated = await gardenRepo.updatePlant(uid, new ObjectId(plantId), updates);

      if (!updated) {
        throw AppError.notFound('Plant not found in garden');
      }

      res.json({
        status: 'success',
        message: 'Plant updated successfully'
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update plant');
    }
  },

  async removePlant(req: TypedRequestBody<{}>, res: Response) {
    try {
      const { uid } = (req as AuthenticatedRequest).user;
      const { plantId } = req.params;

      if (!ObjectId.isValid(plantId)) {
        throw AppError.badRequest('Invalid plant ID');
      }

      const gardenRepo = RepositoryFactory.getGardenRepository();
      const removed = await gardenRepo.removePlant(uid, new ObjectId(plantId));

      if (!removed) {
        throw AppError.notFound('Plant not found in garden');
      }

      res.json({
        status: 'success',
        message: 'Plant removed from garden'
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to remove plant');
    }
  }
};