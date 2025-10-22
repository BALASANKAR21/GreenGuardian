import { ObjectId } from 'mongodb';
export interface User {
    _id?: ObjectId;
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    role: 'user' | 'admin';
    preferences: {
        notificationSettings: {
            email: boolean;
            push: boolean;
            wateringReminders: boolean;
            healthAlerts: boolean;
        };
        location?: {
            type: 'Point';
            coordinates: [number, number];
        };
        theme?: 'light' | 'dark' | 'system';
        language?: string;
        units: {
            temperature: 'celsius' | 'fahrenheit';
            length: 'metric' | 'imperial';
        };
    };
    stats: {
        plantsCount: number;
        identificationCount: number;
        successfulIdentifications: number;
    };
    createdAt: Date;
    updatedAt: Date;
    lastActive: Date;
    status: 'active' | 'inactive' | 'suspended';
    verificationStatus: 'verified' | 'unverified' | 'pending';
}
