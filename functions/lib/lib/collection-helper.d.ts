import { Db, Collection, Document } from 'mongodb';
export declare function getTypedCollection<T extends Document>(db: Db, collectionName: string): Collection<T>;
