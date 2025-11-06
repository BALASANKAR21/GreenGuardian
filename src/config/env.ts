// env.ts
/* eslint-disable no-console */

const requiredEnv = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_PLANT_RECOGNITION_API_KEY',
  'NEXT_PUBLIC_PLANT_RECOGNITION_API_URL',
  'NEXT_PUBLIC_WEATHER_API_KEY',
  'NEXT_PUBLIC_WEATHER_API_URL',
  'NEXT_PUBLIC_AIR_QUALITY_API_KEY',
  'NEXT_PUBLIC_AIR_QUALITY_API_URL',
];

// Basic runtime validation (throws on missing critical envs)
for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.warn(`⚠️ Missing environment variable: ${key}`);
  }
}

export const env = {
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  },

  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/api',
    timeout: Number(process.env.NEXT_PUBLIC_API_TIMEOUT ?? 10000),
  },

  maps: {
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },

  plantRecognition: {
    apiKey: process.env.NEXT_PUBLIC_PLANT_RECOGNITION_API_KEY!,
    baseUrl: process.env.NEXT_PUBLIC_PLANT_RECOGNITION_API_URL!,
  },

  weather: {
    apiKey: process.env.NEXT_PUBLIC_WEATHER_API_KEY!,
    baseUrl: process.env.NEXT_PUBLIC_WEATHER_API_URL!,
  },

  airQuality: {
    apiKey: process.env.NEXT_PUBLIC_AIR_QUALITY_API_KEY!,
    baseUrl: process.env.NEXT_PUBLIC_AIR_QUALITY_API_URL!,
  },

  app: {
    name: 'GreenGuardian',
    environment: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'es', 'fr'] as const,
  },
} as const;

export type Env = typeof env;
