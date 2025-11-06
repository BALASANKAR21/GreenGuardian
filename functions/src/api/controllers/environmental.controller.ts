import { Request, Response } from 'express';
import { RepositoryFactory } from '../../infrastructure/repositories/RepositoryFactory';
import { AppError } from '../../lib/errors';
import { IEnvironmentalData } from '../../core/domain/models';



export const environmentalController = {
  async saveData(req: Request, res: Response) {
    try {
      const { uid } = (req as any).user;
      const environmentalData = req.body;
      
      if (!environmentalData.readings) {
        throw AppError.badRequest('Environmental readings are required');
      }

      const envRepo = RepositoryFactory.getEnvironmentalDataRepository();
      const savedData = await envRepo.create({
        ...environmentalData,
        userId: uid,
        timestamp: new Date()
      } as IEnvironmentalData);

      res.status(201).json({
        status: 'success',
        message: 'Environmental data saved',
        data: savedData
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to save environmental data');
    }
  },

  async getLatest(req: Request, res: Response) {
    try {
      const { uid } = (req as any).user;


      const envRepo = RepositoryFactory.getEnvironmentalDataRepository();
      const latestData = await envRepo.findLatestByUserId(uid);

      res.json({
        status: 'success',
        data: latestData || null
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch latest environmental data');
    }
  },

  async getHistory(req: Request, res: Response) {
    try {
      const { uid } = (req as any).user;
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        throw AppError.badRequest('Start and end dates are required');
      }

      const envRepo = RepositoryFactory.getEnvironmentalDataRepository();
      const history = await envRepo.findByUserIdAndDateRange(
        uid,
        new Date(startDate.toString()),
        new Date(endDate.toString())
      );

      res.json({
        status: 'success',
        data: history
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to fetch environmental data history');
    }
  }
};