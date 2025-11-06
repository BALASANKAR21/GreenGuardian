declare module 'express' {
  export interface Express {
    __express: any;
  }
}

// Add environment variables types
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_FIREBASE_API_KEY: string;
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: string;
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: string;
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: string;
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: string;
    NEXT_PUBLIC_FIREBASE_APP_ID: string;
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: string;
    NEXT_PUBLIC_API_BASE_URL: string;
    NEXT_PUBLIC_API_TIMEOUT: string;
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: string;
    NEXT_PUBLIC_PLANT_RECOGNITION_API_KEY: string;
    NEXT_PUBLIC_PLANT_RECOGNITION_API_URL: string;
    NEXT_PUBLIC_GENKIT_API_KEY: string;
  }
}