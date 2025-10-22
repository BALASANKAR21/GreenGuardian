import { ObjectId } from 'mongodb';

export interface ILocation {
  latitude: number;
  longitude: number;
}

export interface ITimestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserProfile extends ITimestamps {
  _id?: ObjectId;
  uid: string;
  email: string;
  displayName: string;
  location?: ILocation;
}

export interface ICareInstructions {
  water: string;
  sunlight: string;
  soil: string;
  temperature: string;
  humidity: string;
}

export interface IPlant extends ITimestamps {
  _id?: ObjectId;
  name: string;
  scientificName: string;
  imageUrl: string;
  description: string;
  careInstructions: ICareInstructions;
  tags: string[];
}

export interface IGardenPlant {
  plantId: ObjectId;
  location: ILocation;
  plantedDate: Date;
  lastWatered: Date;
  health: 'good' | 'average' | 'poor';
  notes: string;
}

export interface IUserGarden extends ITimestamps {
  _id?: ObjectId;
  userId: string;
  plants: IGardenPlant[];
}

export interface IPlantIdentification extends ITimestamps {
  _id?: ObjectId;
  userId: string;
  imageUrl: string;
  identifiedPlant: IPlant;
  confidence: number;
  identifiedAt: Date;
}

export interface IAirQuality {
  aqi: number;
  description: string;
}

export interface IWeather {
  condition: string;
  forecast: string;
}

export interface IEnvironmentalData extends ITimestamps {
  _id?: ObjectId;
  userId: string;
  location: ILocation;
  timestamp: Date;
  temperature: number;
  humidity: number;
  soilMoisture?: number;
  airQuality?: IAirQuality;
  weather: IWeather;
}