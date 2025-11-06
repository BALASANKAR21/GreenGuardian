import { z } from 'zod';
export declare const locationSchema: z.ZodObject<{
    latitude: z.ZodNumber;
    longitude: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    latitude: number;
    longitude: number;
}, {
    latitude: number;
    longitude: number;
}>;
export declare const userProfileSchema: z.ZodObject<{
    body: z.ZodObject<{
        displayName: z.ZodOptional<z.ZodString>;
        location: z.ZodOptional<z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            latitude: number;
            longitude: number;
        }, {
            latitude: number;
            longitude: number;
        }>>;
        preferences: z.ZodOptional<z.ZodObject<{
            notifications: z.ZodBoolean;
            theme: z.ZodEnum<["light", "dark", "system"]>;
            language: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            notifications: boolean;
            theme: "light" | "dark" | "system";
            language: string;
        }, {
            notifications: boolean;
            theme: "light" | "dark" | "system";
            language: string;
        }>>;
    }, "strip", z.ZodTypeAny, {
        displayName?: string | undefined;
        preferences?: {
            notifications: boolean;
            theme: "light" | "dark" | "system";
            language: string;
        } | undefined;
        location?: {
            latitude: number;
            longitude: number;
        } | undefined;
    }, {
        displayName?: string | undefined;
        preferences?: {
            notifications: boolean;
            theme: "light" | "dark" | "system";
            language: string;
        } | undefined;
        location?: {
            latitude: number;
            longitude: number;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        displayName?: string | undefined;
        preferences?: {
            notifications: boolean;
            theme: "light" | "dark" | "system";
            language: string;
        } | undefined;
        location?: {
            latitude: number;
            longitude: number;
        } | undefined;
    };
}, {
    body: {
        displayName?: string | undefined;
        preferences?: {
            notifications: boolean;
            theme: "light" | "dark" | "system";
            language: string;
        } | undefined;
        location?: {
            latitude: number;
            longitude: number;
        } | undefined;
    };
}>;
export declare const plantSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        scientificName: z.ZodString;
        imageUrl: z.ZodString;
        description: z.ZodString;
        careInstructions: z.ZodObject<{
            water: z.ZodString;
            sunlight: z.ZodString;
            soil: z.ZodString;
            temperature: z.ZodString;
            humidity: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            temperature: string;
            humidity: string;
            sunlight: string;
            soil: string;
            water: string;
        }, {
            temperature: string;
            humidity: string;
            sunlight: string;
            soil: string;
            water: string;
        }>;
        tags: z.ZodArray<z.ZodString, "many">;
    }, "strip", z.ZodTypeAny, {
        name: string;
        scientificName: string;
        description: string;
        careInstructions: {
            temperature: string;
            humidity: string;
            sunlight: string;
            soil: string;
            water: string;
        };
        tags: string[];
        imageUrl: string;
    }, {
        name: string;
        scientificName: string;
        description: string;
        careInstructions: {
            temperature: string;
            humidity: string;
            sunlight: string;
            soil: string;
            water: string;
        };
        tags: string[];
        imageUrl: string;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        name: string;
        scientificName: string;
        description: string;
        careInstructions: {
            temperature: string;
            humidity: string;
            sunlight: string;
            soil: string;
            water: string;
        };
        tags: string[];
        imageUrl: string;
    };
}, {
    body: {
        name: string;
        scientificName: string;
        description: string;
        careInstructions: {
            temperature: string;
            humidity: string;
            sunlight: string;
            soil: string;
            water: string;
        };
        tags: string[];
        imageUrl: string;
    };
}>;
export declare const searchSchema: z.ZodObject<{
    query: z.ZodObject<{
        q: z.ZodString;
        page: z.ZodOptional<z.ZodEffects<z.ZodString, number, string>>;
        limit: z.ZodOptional<z.ZodEffects<z.ZodString, number, string>>;
        sort: z.ZodOptional<z.ZodEnum<["name", "scientificName", "createdAt"]>>;
        order: z.ZodOptional<z.ZodEnum<["asc", "desc"]>>;
    }, "strip", z.ZodTypeAny, {
        q: string;
        sort?: "createdAt" | "name" | "scientificName" | undefined;
        limit?: number | undefined;
        page?: number | undefined;
        order?: "asc" | "desc" | undefined;
    }, {
        q: string;
        sort?: "createdAt" | "name" | "scientificName" | undefined;
        limit?: string | undefined;
        page?: string | undefined;
        order?: "asc" | "desc" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        q: string;
        sort?: "createdAt" | "name" | "scientificName" | undefined;
        limit?: number | undefined;
        page?: number | undefined;
        order?: "asc" | "desc" | undefined;
    };
}, {
    query: {
        q: string;
        sort?: "createdAt" | "name" | "scientificName" | undefined;
        limit?: string | undefined;
        page?: string | undefined;
        order?: "asc" | "desc" | undefined;
    };
}>;
export declare const gardenPlantSchema: z.ZodObject<{
    body: z.ZodObject<{
        plantId: z.ZodString;
        location: z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            latitude: number;
            longitude: number;
        }, {
            latitude: number;
            longitude: number;
        }>;
        notes: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        location: {
            latitude: number;
            longitude: number;
        };
        plantId: string;
        notes?: string | undefined;
    }, {
        location: {
            latitude: number;
            longitude: number;
        };
        plantId: string;
        notes?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        location: {
            latitude: number;
            longitude: number;
        };
        plantId: string;
        notes?: string | undefined;
    };
}, {
    body: {
        location: {
            latitude: number;
            longitude: number;
        };
        plantId: string;
        notes?: string | undefined;
    };
}>;
export declare const environmentalDataSchema: z.ZodObject<{
    body: z.ZodObject<{
        location: z.ZodObject<{
            latitude: z.ZodNumber;
            longitude: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            latitude: number;
            longitude: number;
        }, {
            latitude: number;
            longitude: number;
        }>;
        temperature: z.ZodNumber;
        humidity: z.ZodNumber;
        soilMoisture: z.ZodOptional<z.ZodNumber>;
        airQuality: z.ZodOptional<z.ZodObject<{
            aqi: z.ZodNumber;
            description: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            description: string;
            aqi: number;
        }, {
            description: string;
            aqi: number;
        }>>;
        weather: z.ZodObject<{
            condition: z.ZodString;
            forecast: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            condition: string;
            forecast: string;
        }, {
            condition: string;
            forecast: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        location: {
            latitude: number;
            longitude: number;
        };
        temperature: number;
        humidity: number;
        weather: {
            condition: string;
            forecast: string;
        };
        soilMoisture?: number | undefined;
        airQuality?: {
            description: string;
            aqi: number;
        } | undefined;
    }, {
        location: {
            latitude: number;
            longitude: number;
        };
        temperature: number;
        humidity: number;
        weather: {
            condition: string;
            forecast: string;
        };
        soilMoisture?: number | undefined;
        airQuality?: {
            description: string;
            aqi: number;
        } | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    body: {
        location: {
            latitude: number;
            longitude: number;
        };
        temperature: number;
        humidity: number;
        weather: {
            condition: string;
            forecast: string;
        };
        soilMoisture?: number | undefined;
        airQuality?: {
            description: string;
            aqi: number;
        } | undefined;
    };
}, {
    body: {
        location: {
            latitude: number;
            longitude: number;
        };
        temperature: number;
        humidity: number;
        weather: {
            condition: string;
            forecast: string;
        };
        soilMoisture?: number | undefined;
        airQuality?: {
            description: string;
            aqi: number;
        } | undefined;
    };
}>;
export declare const dateRangeSchema: z.ZodObject<{
    query: z.ZodObject<{
        startDate: z.ZodString;
        endDate: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        startDate: string;
        endDate: string;
    }, {
        startDate: string;
        endDate: string;
    }>;
}, "strip", z.ZodTypeAny, {
    query: {
        startDate: string;
        endDate: string;
    };
}, {
    query: {
        startDate: string;
        endDate: string;
    };
}>;
