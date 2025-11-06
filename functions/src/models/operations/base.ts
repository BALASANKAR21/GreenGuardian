import { Collection } from 'mongodb';
import { getDb } from '../../db';
import { AppError } from '../../errors';
import { BaseDocument } from '../types/db-types';

export abstract class BaseOperations<T extends BaseDocument> {
  constructor(protected collectionName: string) {}

  protected async getCollection(): Promise<Collection<T>> {
    const db = await getDb();
    return db.collection<T>(this.collectionName);
  }

  protected wrapError<TResult>(
    operation: string,
    error: Error,
    entityId?: string | number
  ): never {
    const message = entityId
      ? `Failed to ${operation} ${this.collectionName} with id ${entityId}`
      : `Failed to ${operation} ${this.collectionName}`;
    
    throw AppError.databaseError(message, error);
  }
}