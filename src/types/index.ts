import { User } from 'firebase/auth';

// API Response Types
export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

// Auth Types
export interface AuthUser extends User {
  role?: string;
}

// User Types
export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  preferences?: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  notifications: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
}

// Plant Types
export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  imageUrl: string;
  description: string;
  careInstructions: PlantCareInstructions;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PlantCareInstructions {
  water: string;
  sunlight: string;
  soil: string;
  temperature: string;
  humidity: string;
}

// Garden Types
export interface GardenPlant extends Plant {
  location: {
    latitude: number;
    longitude: number;
  };
  plantedDate: string;
  lastWatered: string;
  health: 'good' | 'average' | 'poor';
  notes?: string;
}

// Environmental Data Types
export interface EnvironmentalData {
  id: string;
  userId: string;
  location: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  temperature: number;
  humidity: number;
  soilMoisture?: number;
  airQuality?: AirQuality;
  weather: Weather;
}

export interface AirQuality {
  aqi: number;
  description: string;
}

export interface Weather {
  condition: string;
  forecast: string;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData extends LoginFormData {
  displayName: string;
}

export interface ProfileUpdateFormData {
  displayName?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  preferences?: Partial<UserPreferences>;
}

// Component Props Types
export interface PageProps {
  params: { [key: string]: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export interface LayoutProps {
  children: React.ReactNode;
}