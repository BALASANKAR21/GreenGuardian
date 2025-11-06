import { z } from 'zod';

export const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const userProfileSchema = z.object({
  body: z.object({
    displayName: z.string().min(2).max(50).optional(),
    location: locationSchema.optional(),
    preferences: z.object({
      notifications: z.boolean(),
      theme: z.enum(['light', 'dark', 'system']),
      language: z.string().min(2).max(5),
    }).optional(),
  }),
});

export const plantSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100),
    scientificName: z.string().min(2).max(100),
    imageUrl: z.string().url(),
    description: z.string().min(10).max(1000),
    careInstructions: z.object({
      water: z.string().min(5).max(500),
      sunlight: z.string().min(5).max(500),
      soil: z.string().min(5).max(500),
      temperature: z.string().min(5).max(500),
      humidity: z.string().min(5).max(500),
    }),
    tags: z.array(z.string().min(2).max(50)),
  }),
});

export const searchSchema = z.object({
  query: z.object({
    q: z.string().min(2).max(100),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sort: z.enum(['name', 'scientificName', 'createdAt']).optional(),
    order: z.enum(['asc', 'desc']).optional(),
  }),
});

export const gardenPlantSchema = z.object({
  body: z.object({
    plantId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    location: locationSchema,
    notes: z.string().max(500).optional(),
  }),
});

export const environmentalDataSchema = z.object({
  body: z.object({
    location: locationSchema,
    temperature: z.number(),
    humidity: z.number().min(0).max(100),
    soilMoisture: z.number().min(0).max(100).optional(),
    airQuality: z.object({
      aqi: z.number().min(0),
      description: z.string(),
    }).optional(),
    weather: z.object({
      condition: z.string(),
      forecast: z.string(),
    }),
  }),
});

export const dateRangeSchema = z.object({
  query: z.object({
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});