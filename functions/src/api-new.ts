import { Response } from 'express';
import * as functions from 'firebase-functions';
import { ObjectId } from 'mongodb';
import { db } from './models';
import { auth } from 'firebase-admin';
import { AppError, ValidationError, AuthError } from './errors';
import {
  ApiResponse,
  CreateEnvironmentalDataInput,
  UserProfile,
  Plant,
  UserGarden,
  EnvironmentalData
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
      error: error.message,
      code: error.code,
      details: error.details
    });
  } else if (error instanceof Error) {
    res.status(500).json({
      error: error.message,
      code: 'INTERNAL_ERROR'
    });
  } else {
    res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    });
  }
}

// Request validation utility
function validateRequired(data: Record<string, any>, fields: string[]): void {
  const missing = fields.filter(field => data[field] === undefined || data[field] === null);
  if (missing.length > 0) {
    throw new ValidationError(`Missing required fields: ${missing.join(', ')}`);
  }
}

// Authentication middleware
async function authenticate(req: AuthRequest): Promise<string> {
  const authorization = (req.headers as any)?.authorization || (req.get && req.get('authorization'));
  if (!authorization || !authorization?.startsWith?.('Bearer ')) {
    throw new AuthError('No token provided');
  }

  try {
    const token = authorization.split('Bearer ')[1];
    const decodedToken = await auth().verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    throw new AuthError('Invalid token');
  }
}

// --- User Profile Endpoints ---
export const getUserProfile = functions.https.onRequest(async (req: AuthRequest, res: CloudFunctionsResponse) => {
  try {
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
  } catch (error) {
    handleApiError(error, res);
  }
});

export const updateUserProfile = functions.https.onRequest(async (req: AuthRequest, res: CloudFunctionsResponse) => {
  try {
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
  } catch (error) {
    handleApiError(error, res);
  }
});

// --- Plant Endpoints ---
export const searchPlants = functions.https.onRequest(async (req: AuthRequest, res: CloudFunctionsResponse) => {
  try {
    await authenticate(req);
    validateRequired(req.query, ['query']);

    const searchQuery = req.query.query as string;
    const result = await db.plants.findByName(searchQuery);
    
    const response: ApiResponse<{ plants: Plant[]; total: number }> = {
      success: true,
      data: result
    };
    
    res.json(response);
  } catch (error) {
    handleApiError(error, res);
  }
});

// --- Garden Endpoints ---
export const getUserGarden = functions.https.onRequest(async (req: AuthRequest, res: CloudFunctionsResponse) => {
  try {
    const uid = await authenticate(req);

    // Attempt to find the garden for the user
    let garden = await db.gardens.findByUserId(uid);
    
    // If no garden is found, create a new empty garden for the user
    if (!garden) {
      garden = await db.gardens.create({
        userId: uid,
        plants: []  // Initialize with empty plants array
      });
    }
    
    // Return the garden data (either found or newly created)
    const response: ApiResponse<UserGarden> = {
      success: true,
      data: garden
    };
    
    res.json(response);
  } catch (error) {
    handleApiError(error, res);
  }
});


export const addPlantToGarden = functions.https.onRequest(async (req: AuthRequest, res: CloudFunctionsResponse) => {
  try {
    const uid = await authenticate(req);
    validateRequired(req.body, ['plantId', 'location']);
    
    const { plantId, location, notes } = req.body;
    if (!location.latitude || !location.longitude) {
      throw new ValidationError('Location must include latitude and longitude');
    }

    let garden = await db.gardens.findByUserId(uid);
    if (!garden) {
      // Create new garden if it doesn't exist
      garden = await db.gardens.create({
        userId: uid,
        plants: []
      });
    }

    const updatedGarden = await db.gardens.addPlant(garden._id, {
      plantId: new ObjectId(plantId),
      location,
      notes,
      plantedDate: new Date(),
      healthStatus: 'healthy'
    });

    if (!updatedGarden) {
      throw AppError.internal('Failed to update garden');
    }

    const response: ApiResponse<UserGarden> = {
      success: true,
      data: updatedGarden
    };
    
    res.json(response);
  } catch (error) {
    handleApiError(error, res);
  }
});

export const updatePlantInGarden = functions.https.onRequest(async (req: AuthRequest, res: CloudFunctionsResponse) => {
  try {
    const uid = await authenticate(req);
    validateRequired(req.body, ['plantId', 'updates']);
    
    const { plantId, updates } = req.body;
    if (!updates || Object.keys(updates).length === 0) {
      throw new ValidationError('No updates provided');
    }
    
    const validUpdates = ['healthStatus', 'notes', 'lastWatered', 'nickname'];
    const invalidFields = Object.keys(updates).filter(key => !validUpdates.includes(key));
    if (invalidFields.length > 0) {
      throw new ValidationError(`Invalid update fields: ${invalidFields.join(', ')}`);
    }
    
    const garden = await db.gardens.findByUserId(uid);
    if (!garden) {
      throw AppError.notFound('Garden not found', 'GARDEN_NOT_FOUND');
    }

    const plant = garden.plants.find(p => p.plantId.toString() === plantId);
    if (!plant) {
      throw AppError.notFound('Plant not found in garden', 'PLANT_NOT_FOUND');
    }

    const updatedGarden = await db.gardens.update(garden._id, {
      plants: garden.plants.map(p => 
        p.plantId.toString() === plantId
          ? { ...p, ...updates }
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
  } catch (error) {
    handleApiError(error, res);
  }
});

// --- Environmental Data Endpoints ---
export const addEnvironmentalData = functions.https.onRequest(async (req: AuthRequest, res: CloudFunctionsResponse) => {
  try {
    const uid = await authenticate(req);
    validateRequired(req.body, ['location', 'readings']);
    
    const { location, readings } = req.body;
    if (!location.latitude || !location.longitude) {
      throw new ValidationError('Location must include latitude and longitude');
    }
    
    if (Object.keys(readings).length === 0) {
      throw new ValidationError('At least one reading is required');
    }

    // Validate readings have valid numeric values
    for (const [key, value] of Object.entries(readings)) {
      if (typeof value !== 'number') {
        throw new ValidationError(`Reading '${key}' must be a number`);
      }
    }
    
    const data: CreateEnvironmentalDataInput = {
      userId: uid,
      location,
      readings,
      timestamp: new Date(),
    };
    
    const envData = await db.environmentalData.create(data);
    
    const response: ApiResponse<EnvironmentalData> = {
      success: true,
      data: envData
    };

    res.json(response);
  } catch (error) {
    handleApiError(error, res);
  }
});

export const getEnvironmentalData = functions.https.onRequest(async (req: AuthRequest, res: CloudFunctionsResponse) => {
  try {
    const uid = await authenticate(req);
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      throw new ValidationError('Start date and end date are required');
    }
    
    if (typeof startDate !== 'string' || typeof endDate !== 'string') {
      throw new ValidationError('Dates must be provided as strings');
    }
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new ValidationError('Invalid date format');
    }
    
    const data = await db.environmentalData.findByDateRange(uid, start, end);
    
    const response: ApiResponse<EnvironmentalData[]> = {
      success: true,
      data
    };

    res.json(response);
  } catch (error) {
    handleApiError(error, res);
  }
});
