import { ObjectId } from 'mongodb';
import { Response } from 'express';
import * as functions from 'firebase-functions';
import {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  addPlant,
  getPlant,
  searchPlants,
  getUserGarden,
  addPlantToGarden,
  updatePlantInGarden,
  savePlantIdentification,
  saveEnvironmentalData,
  getLatestEnvironmentalData,
  getEnvironmentalDataHistory
} from './models/db-service';

export class ValidationError extends Error {
  constructor(message: string, public readonly details?: Record<string, string>) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Utility Functions
function validateRequired(data: Record<string, any>, fields: string[]): void {
  const missingFields = fields.filter(field => data[field] === undefined);
  if (missingFields.length > 0) {
    throw new ValidationError(`Missing required fields: ${missingFields.join(', ')}`, {
      missing: missingFields.join(', ')
    });
  }
}

function handleApiError(error: unknown, res: Response): void {
  console.error('API Error:', error);

  if (error instanceof ValidationError) {
    res.status(400).json({
      error: error.message,
      ...(error.details && { details: error.details })
    });
    return;
  }

  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  res.status(500).json({ error: message });
}

// User Profile Endpoints
export const getUserProfileEndpoint = functions.https.onRequest(async (req, res) => {
  try {
    const uid = req.query.uid;
    if (!uid || typeof uid !== 'string') {
      throw new ValidationError('User ID is required');
    }

    const profile = await getUserProfile(uid);
    if (!profile) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    res.json(profile);
  } catch (error) {
    handleApiError(error, res);
  }
});

export const createUserProfileEndpoint = functions.https.onRequest(async (req, res) => {
  try {
    const { uid, displayName, email } = req.body;
    validateRequired(req.body, ['uid', 'displayName', 'email']);

    const profile = await createUserProfile({ uid, displayName, email });
    res.json(profile);
  } catch (error) {
    handleApiError(error, res);
  }
});

export const updateUserProfileEndpoint = functions.https.onRequest(async (req, res) => {
  try {
    const { uid } = req.body;
    validateRequired(req.body, ['uid']);
    const updates = { ...req.body };
    delete updates.uid;

    const success = await updateUserProfile(uid, updates);
    if (!success) {
      res.status(404).json({ error: 'User profile not found' });
      return;
    }

    res.json({ success: true });
  } catch (error) {
    handleApiError(error, res);
  }
});

// Plant Endpoints
export const addPlantEndpoint = functions.https.onRequest(async (req, res) => {
  try {
    validateRequired(req.body, [
      'name',
      'scientificName',
      'description',
      'careInstructions',
      'wateringFrequency',
      'sunlightNeeds'
    ]);

    const plant = await addPlant(req.body);
    res.json(plant);
  } catch (error) {
    handleApiError(error, res);
  }
});

export const getPlantEndpoint = functions.https.onRequest(async (req, res) => {
  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string') {
      throw new ValidationError('Plant ID is required');
    }

    const plant = await getPlant(new ObjectId(id));
    if (!plant) {
      res.status(404).json({ error: 'Plant not found' });
      return;
    }

    res.json(plant);
  } catch (error) {
    handleApiError(error, res);
  }
});

export const searchPlantsEndpoint = functions.https.onRequest(async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || typeof query !== 'string') {
      throw new ValidationError('Search query is required');
    }

    const plants = await searchPlants(query);
    res.json(plants);
  } catch (error) {
    handleApiError(error, res);
  }
});

// Garden Endpoints
export const getUserGardenEndpoint = functions.https.onRequest(async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
      throw new ValidationError('User ID is required');
    }

    const garden = await getUserGarden(userId);
    if (!garden) {
      res.json({ plants: [] });
      return;
    }

    res.json(garden);
  } catch (error) {
    handleApiError(error, res);
  }
});

export const addPlantToGardenEndpoint = functions.https.onRequest(async (req, res) => {
  try {
    const { userId, plantId, location, notes } = req.body;
    validateRequired(req.body, ['userId', 'plantId', 'location']);

    const success = await addPlantToGarden(
      userId,
      new ObjectId(plantId),
      location,
      notes
    );

    res.json({ success });
  } catch (error) {
    handleApiError(error, res);
  }
});

export const updatePlantInGardenEndpoint = functions.https.onRequest(async (req, res) => {
  try {
    const { userId, plantId, ...updates } = req.body;
    validateRequired(req.body, ['userId', 'plantId']);

    const success = await updatePlantInGarden(userId, plantId, updates);
    res.json({ success });
  } catch (error) {
    handleApiError(error, res);
  }
});

// Plant Identification Endpoints
export const savePlantIdentificationEndpoint = functions.https.onRequest(async (req, res) => {
  try {
    validateRequired(req.body, ['userId', 'imageUrl', 'predictions']);

    const identification = await savePlantIdentification(req.body);
    res.json(identification);
  } catch (error) {
    handleApiError(error, res);
  }
});

// Environmental Data Endpoints
export const saveEnvironmentalDataEndpoint = functions.https.onRequest(async (req, res) => {
  try {
    validateRequired(req.body, ['userId', 'gardenId', 'sensorId', 'readings', 'timestamp']);

    const data = await saveEnvironmentalData(req.body);
    res.json(data);
  } catch (error) {
    handleApiError(error, res);
  }
});

export const getLatestEnvironmentalDataEndpoint = functions.https.onRequest(async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId || typeof userId !== 'string') {
      throw new ValidationError('User ID is required');
    }

    const data = await getLatestEnvironmentalData(userId);
    if (!data) {
      res.status(404).json({ error: 'No environmental data found' });
      return;
    }

    res.json(data);
  } catch (error) {
    handleApiError(error, res);
  }
});

export const getEnvironmentalDataHistoryEndpoint = functions.https.onRequest(async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    if (!userId || !startDate || !endDate || 
        typeof userId !== 'string' || 
        typeof startDate !== 'string' || 
        typeof endDate !== 'string') {
      throw new ValidationError('User ID, start date, and end date are required');
    }

    const data = await getEnvironmentalDataHistory(
      userId,
      new Date(startDate),
      new Date(endDate)
    );

    res.json(data);
  } catch (error) {
    handleApiError(error, res);
  }
});