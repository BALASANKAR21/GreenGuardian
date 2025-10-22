import { ObjectId } from 'mongodb';
export interface Plant {
    _id?: ObjectId;
    name: string;
    scientificName: string;
    description?: string;
    family?: string;
    genus?: string;
    species?: string;
    commonNames?: string[];
    images?: {
        url: string;
        caption?: string;
        uploadedAt: Date;
    }[];
    careInstructions?: {
        watering?: string;
        sunlight?: string;
        temperature?: string;
        soil?: string;
        fertilizer?: string;
        pruning?: string;
    };
    characteristics?: {
        height?: {
            min: number;
            max: number;
            unit: string;
        };
        spread?: {
            min: number;
            max: number;
            unit: string;
        };
        growthRate?: 'slow' | 'moderate' | 'fast';
        lifespan?: string;
        nativeRegions?: string[];
        floweringSeason?: string[];
        leafType?: string;
        leafColor?: string[];
        flowerColor?: string[];
    };
    tags?: string[];
    isEndangered?: boolean;
    toxicity?: {
        toxic: boolean;
        toxicTo?: string[];
        symptoms?: string[];
    };
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
    status?: 'active' | 'archived' | 'pending_review';
    verificationStatus?: 'verified' | 'unverified' | 'pending';
    references?: {
        url: string;
        title: string;
        type: 'scientific' | 'article' | 'book' | 'other';
    }[];
}
