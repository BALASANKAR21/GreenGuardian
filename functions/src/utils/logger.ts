import * as functions from 'firebase-functions';

export interface LogData {
  [key: string]: any;
}

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

export class Logger {
  private static instance: Logger;
  private context: { [key: string]: any } = {};

  private constructor() {}

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  public setContext(context: { [key: string]: any }): void {
    this.context = { ...this.context, ...context };
  }

  public clearContext(): void {
    this.context = {};
  }

  private formatMessage(level: LogLevel, message: string, data?: LogData): string {
    const timestamp = new Date().toISOString();
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...this.context,
      ...(data || {})
    });
  }

  public debug(message: string, data?: LogData): void {
    if (process.env.NODE_ENV !== 'production') {
      functions.logger.debug(this.formatMessage(LogLevel.DEBUG, message, data));
    }
  }

  public info(message: string, data?: LogData): void {
    functions.logger.info(this.formatMessage(LogLevel.INFO, message, data));
  }

  public warn(message: string, data?: LogData): void {
    functions.logger.warn(this.formatMessage(LogLevel.WARN, message, data));
  }

  public error(message: string, error?: Error, data?: LogData): void {
    const errorData = error ? {
      errorName: error.name,
      errorMessage: error.message,
      stackTrace: error.stack,
      ...data
    } : data;

    functions.logger.error(this.formatMessage(LogLevel.ERROR, message, errorData));
  }
}