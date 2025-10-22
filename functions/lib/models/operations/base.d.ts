import { Collection } from 'mongodb';
import { BaseDocument } from '../types/db-types';
export declare abstract class BaseOperations<T extends BaseDocument> {
    protected collectionName: string;
    constructor(collectionName: string);
    protected getCollection(): Promise<Collection<T>>;
    protected wrapError<TResult>(operation: string, error: Error, entityId?: string | number): never;
}
