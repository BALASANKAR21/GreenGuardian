export interface LogData {
    [key: string]: any;
}
export declare enum LogLevel {
    DEBUG = "DEBUG",
    INFO = "INFO",
    WARN = "WARN",
    ERROR = "ERROR"
}
export declare class Logger {
    private static instance;
    private context;
    private constructor();
    static getInstance(): Logger;
    setContext(context: {
        [key: string]: any;
    }): void;
    clearContext(): void;
    private formatMessage;
    debug(message: string, data?: LogData): void;
    info(message: string, data?: LogData): void;
    warn(message: string, data?: LogData): void;
    error(message: string, error?: Error, data?: LogData): void;
}
