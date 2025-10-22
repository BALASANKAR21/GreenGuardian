import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    MONGODB_URI: z.ZodString;
    FIREBASE_PROJECT_ID: z.ZodString;
    FIREBASE_STORAGE_BUCKET: z.ZodString;
}, "strip", z.ZodTypeAny, {
    MONGODB_URI: string;
    NODE_ENV: "production" | "development" | "test";
    FIREBASE_PROJECT_ID: string;
    FIREBASE_STORAGE_BUCKET: string;
}, {
    MONGODB_URI: string;
    FIREBASE_PROJECT_ID: string;
    FIREBASE_STORAGE_BUCKET: string;
    NODE_ENV?: "production" | "development" | "test" | undefined;
}>;
export type Env = z.infer<typeof envSchema>;
export declare function validateEnv(): Env;
export {};
