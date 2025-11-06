import { ApiClient } from './api-client';

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  preferences?: {
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
}

export class UserService {
  private api = ApiClient.getInstance();

  async getProfile(): Promise<UserProfile> {
    return this.api.get<UserProfile>('/profile');
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    return this.api.put<UserProfile>('/profile', data);
  }
}

export interface Plant {
  id: string;
  name: string;
  scientificName: string;
  imageUrl: string;
  description: string;
  careInstructions: {
    water: string;
    sunlight: string;
    soil: string;
    temperature: string;
    humidity: string;
  };
  tags: string[];
}

export class PlantService {
  private api = ApiClient.getInstance();

  async searchPlants(query: string): Promise<{ plants: Plant[]; total: number }> {
    return this.api.get<{ plants: Plant[]; total: number }>('/plants/search', { params: { query } });
  }

  async getPlant(id: string): Promise<Plant> {
    return this.api.get<Plant>(`/plants/${id}`);
  }
}

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

export class GardenService {
  private api = ApiClient.getInstance();

  async getUserGarden(): Promise<GardenPlant[]> {
    return this.api.get<GardenPlant[]>('/garden');
  }

  async addPlant(data: {
    plantId: string;
    location: { latitude: number; longitude: number };
    notes?: string;
  }): Promise<GardenPlant> {
    return this.api.post<GardenPlant>('/garden/plants', data);
  }

  async updatePlant(
    plantId: string,
    data: Partial<GardenPlant>
  ): Promise<GardenPlant> {
    return this.api.put<GardenPlant>(`/garden/plants/${plantId}`, data);
  }

  async removePlant(plantId: string): Promise<void> {
    return this.api.delete(`/garden/plants/${plantId}`);
  }
}

export interface EnvironmentalData {
  id: string;
  timestamp: string;
  location: {
    latitude: number;
    longitude: number;
  };
  temperature: number;
  humidity: number;
  soilMoisture?: number;
  airQuality?: {
    aqi: number;
    description: string;
  };
  weather: {
    condition: string;
    forecast: string;
  };
}

export class EnvironmentalService {
  private api = ApiClient.getInstance();

  async getLatestData(): Promise<EnvironmentalData> {
    return this.api.get<EnvironmentalData>('/environmental/latest');
  }

  async getHistory(startDate: string, endDate: string): Promise<EnvironmentalData[]> {
    return this.api.get<EnvironmentalData[]>('/environmental/history', {
      params: { startDate, endDate }
    });
  }

  async saveData(data: Omit<EnvironmentalData, 'id' | 'timestamp'>): Promise<EnvironmentalData> {
    return this.api.post<EnvironmentalData>('/environmental', data);
  }
}