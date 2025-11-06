import { Db } from 'mongodb';
export declare class DatabaseConnection {
    private static instance;
    private client;
    private db;
    private isConnecting;
    private readonly dbName;
    private constructor();
    static getInstance(): DatabaseConnection;
    getDb(): Promise<Db>;
    disconnect(): Promise<void>;
}
