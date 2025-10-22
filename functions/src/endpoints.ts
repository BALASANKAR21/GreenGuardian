import * as functions from 'firebase-functions/v2';
import { Response } from 'express';
import { ObjectId } from 'mongodb';
import { db } from './models';
import { auth } from 'firebase-admin';
import { AppError } from './errors';
import {
  ApiResponse,
  CreateEnvironmentalDataInput,
  UserProfile,
  Plant,
  UserGarden
} from './types';

// Type for Cloud Functions request and response
type CloudFunctionsRequest = functions.https.Request;
type CloudFunctionsResponse = Response;

// Type for authenticated request
interface AuthRequest extends CloudFunctionsRequest {
  uid?: string;
}

// Error handler utility
function handleApiError(error: unknown, res: CloudFunctionsResponse): void {
  console.error('Error:', error);
  
  if (error instanceof AppError) {
    res.status(error.status).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
  } else {
    const appError = AppError.internal(
      error instanceof Error ? error.message : 'An unexpected error occurred'
    );
    res.status(appError.status).json({
      success: false,
      error: {
        code: appError.code,
        message: appError.message
      }
    });
  }
}

// Validate required fields
function validateRequired(obj: Record<string, any>, fields: string[]): void {
  const missing = fields.filter(field => !obj[field]);
  if (missing.length > 0) {
    throw AppError.validation(`Required fields missing: ${missing.join(', ')}`);
  }
}

// Authentication middleware
async function authenticate(req: AuthRequest): Promise<string> {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    throw AppError.unauthorized('No token provided');
  }

  try {
    const decodedToken = await auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    throw AppError.unauthorized('Invalid token');
  }
}

// Create a new HTTP callable function
function createHttpFunction<T>(handler: (req: AuthRequest, res: CloudFunctionsResponse) => Promise<T>) {
  return functions.https.onRequest(async (req: AuthRequest, res: CloudFunctionsResponse) => {
    try {
      await handler(req, res);
    } catch (error) {
      handleApiError(error, res);
    }
  });
}

// Export all endpoints
export const endpoints = {
  // User Profile Endpoints
  getUserProfile: createHttpFunction(async (req, res) => {
    const uid = await authenticate(req);
    const profile = await db.users.findByUid(uid);
      
    if (!profile) {
      throw AppError.notFound('Profile not found', 'PROFILE_NOT_FOUND');
    }
      
    const response: ApiResponse<UserProfile> = {
      success: true,
      data: profile
    };
      
    res.json(response);
  }),

  updateUserProfile: createHttpFunction(async (req, res) => {
    const uid = await authenticate(req);
    validateRequired(req.body, ['displayName']);
      
    const profile = await db.users.findByUid(uid);
    if (!profile) {
      throw AppError.notFound('Profile not found', 'PROFILE_NOT_FOUND');
    }

    const updates = {
      ...req.body,
      updatedAt: new Date()
    };

    const updatedProfile = await db.users.update(profile._id, updates);
    if (!updatedProfile) {
      throw AppError.internal('Failed to update profile');
    }

    const response: ApiResponse<UserProfile> = {
      success: true,
      data: updatedProfile
    };

    res.json(response);
  }),

  // Plant Endpoints
  searchPlants: createHttpFunction(async (req, res) => {
    await authenticate(req);
    validateRequired(req.query, ['query']);

    const searchQuery = req.query.query as string;
    const result = await db.plants.findByName(searchQuery);
      
    const response: ApiResponse<{ plants: Plant[]; total: number }> = {
      success: true,
      data: result
    };
      
    res.json(response);
  }),

  // Garden Endpoints
  getUserGarden: createHttpFunction(async (req, res) => {
    const uid = await authenticate(req);
    const garden = await db.gardens.findByUserId(uid);
      
    const response: ApiResponse<UserGarden> = {
      success: true,
      data: garden || { 
        _id: new ObjectId(),
        userId: uid, 
        plants: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };
      
    res.json(response);
  }),

  addPlantToGarden: createHttpFunction(async (req, res) => {
    const uid = await authenticate(req);
    validateRequired(req.body, ['gardenId', 'plantId', 'location']);

    const garden = await db.gardens.findByUserId(uid);
    if (!garden) {
      throw AppError.notFound('Garden not found', 'GARDEN_NOT_FOUND');
    }

    const updatedGarden = await db.gardens.addPlant(
      garden._id,
      {
        plantId: new ObjectId(req.body.plantId),
        location: req.body.location,
        plantedDate: new Date(),
        healthStatus: 'healthy',
        nickname: req.body.nickname
      }
    );

    if (!updatedGarden) {
      throw AppError.internal('Failed to update garden');
    }

    const response: ApiResponse<UserGarden> = {
      success: true,
      data: updatedGarden
    };
      
    res.json(response);
  }),

  updatePlantInGarden: createHttpFunction(async (req, res) => {
    const uid = await authenticate(req);
    validateRequired(req.body, ['gardenId', 'plantId', 'updates']);

    const gardens = await db.gardens.findByUserId(uid);
    if (!gardens) {
      throw AppError.notFound('Garden not found', 'GARDEN_NOT_FOUND');
    }

    const plant = gardens.plants.find((p: any) => p.plantId.toString() === req.body.plantId);
    if (!plant) {
      throw AppError.notFound('Plant not found in garden', 'PLANT_NOT_FOUND');
    }

    const updatedGarden = await db.gardens.update(gardens._id, {
      plants: gardens.plants.map((p: any) => 
        p.plantId.toString() === req.body.plantId
          ? { ...p, ...req.body.updates }
          : p
      )
    });

    if (!updatedGarden) {
      throw AppError.internal('Failed to update garden');
    }

    const response: ApiResponse<UserGarden> = {
      success: true,
      data: updatedGarden
    };

    res.json(response);
  }),

  // Environmental Data Endpoints
  addEnvironmentalData: createHttpFunction(async (req, res) => {
    const uid = await authenticate(req);
    validateRequired(req.body, ['location', 'readings']);
      
    const { location, readings } = req.body;
    if (!location.latitude || !location.longitude) {
      throw AppError.validation('Location must include latitude and longitude');
    }
      
    if (Object.keys(readings).length === 0) {
      throw AppError.validation('At least one reading is required');
    }

    // Validate readings have valid numeric values
    for (const [key, value] of Object.entries(readings)) {
      if (typeof value !== 'number') {
        throw AppError.validation(`Reading '${key}' must be a number`);
      }
    }
      
    const data: CreateEnvironmentalDataInput = {
      userId: uid,
      location,
      readings,
      timestamp: new Date(),
    };
      
    const envData = await db.environmentalData.create(data);
      
    res.json({
      success: true,
      data: envData
    });
  }),

  getEnvironmentalData: createHttpFunction(async (req, res) => {
    const uid = await authenticate(req);
    const { startDate, endDate } = req.query;
      
    if (!startDate || !endDate) {
      throw AppError.validation('Start date and end date are required');
    }
      
    if (typeof startDate !== 'string' || typeof endDate !== 'string') {
      throw AppError.validation('Dates must be provided as strings');
    }
      
    const start = new Date(startDate);
    const end = new Date(endDate);
      
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw AppError.validation('Invalid date format');
    }

    // Validate date range
    const maxRange = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
    if (end.getTime() - start.getTime() > maxRange) {
      throw AppError.validation('Date range cannot exceed 30 days');
    }
      
    const data = await db.environmentalData.findByDateRange(uid, start, end);
      
    res.json({
      success: true,
      data
    });
  })
};