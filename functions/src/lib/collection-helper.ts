import { Db, Collection, Document } from 'mongodb';

export function getTypedCollection<T extends Document>(
  db: Db,
  collectionName: string
): Collection<T> {
  return db.collection(collectionName);
}