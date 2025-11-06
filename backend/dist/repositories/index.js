import { ObjectId } from 'mongodb';
import { getDb } from '../config/database';
import { DatabaseError } from '../utils/errors';
// Collection names
export const Collections = {
    USERS: 'users',
    PLANTS: 'plants',
    GARDENS: 'gardens',
    ENVIRONMENTAL_DATA: 'environmental_data',
    PLANT_IDENTIFICATIONS: 'plant_identifications',
    WEATHER_DATA: 'weather_data'
};
class BaseRepository {
    collectionName;
    collection = null;
    constructor(collectionName) {
        this.collectionName = collectionName;
    }
    async getCollection() {
        if (!this.collection) {
            const db = await getDb();
            this.collection = db.collection(this.collectionName);
        }
        return this.collection;
    }
    handleError(operation, error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new DatabaseError(`Error in ${this.collectionName} repository during ${operation}: ${message}`, error instanceof Error ? error : undefined);
    }
    async findById(id) {
        try {
            const collection = await this.getCollection();
            const _id = typeof id === 'string' ? new ObjectId(id) : id;
            return (await collection.findOne({ _id }));
        }
        catch (error) {
            this.handleError('findById', error);
        }
    }
    async findOne(filter) {
        try {
            const collection = await this.getCollection();
            return (await collection.findOne(filter));
        }
        catch (error) {
            this.handleError('findOne', error);
        }
    }
    async find(filter, limit) {
        try {
            const collection = await this.getCollection();
            let query = collection.find(filter);
            if (limit) {
                query = query.limit(limit);
            }
            return (await query.toArray());
        }
        catch (error) {
            this.handleError('find', error);
        }
    }
    async create(data) {
        try {
            const collection = await this.getCollection();
            const now = new Date();
            const document = {
                ...data,
                createdAt: now,
                updatedAt: now,
            };
            const result = await collection.insertOne(document);
            if (!result.acknowledged) {
                throw new Error('Insert operation was not acknowledged');
            }
            const created = await this.findById(result.insertedId);
            if (!created) {
                throw new Error('Created document could not be found');
            }
            return created;
        }
        catch (error) {
            this.handleError('create', error);
        }
    }
    async update(id, update) {
        try {
            const collection = await this.getCollection();
            const _id = typeof id === 'string' ? new ObjectId(id) : id;
            const result = await collection.updateOne({ _id }, {
                $set: {
                    ...update,
                    updatedAt: new Date()
                }
            });
            return result.modifiedCount > 0;
        }
        catch (error) {
            this.handleError('update', error);
        }
    }
    async delete(id) {
        try {
            const collection = await this.getCollection();
            const _id = typeof id === 'string' ? new ObjectId(id) : id;
            const result = await collection.deleteOne({ _id });
            return result.deletedCount > 0;
        }
        catch (error) {
            this.handleError('delete', error);
        }
    }
}
// User repository
export class UserRepository extends BaseRepository {
    constructor() {
        super(Collections.USERS);
    }
    async findByUid(uid) {
        try {
            const collection = await this.getCollection();
            const result = await collection.findOne({ uid });
            return result;
        }
        catch (error) {
            this.handleError('findByUid', error);
        }
    }
    async updateByUid(uid, update) {
        try {
            const collection = await this.getCollection();
            const result = await collection.updateOne({ uid }, {
                $set: {
                    ...update,
                    updatedAt: new Date()
                }
            });
            return result.modifiedCount > 0;
        }
        catch (error) {
            this.handleError('updateByUid', error);
        }
    }
}
// Plant repository
export class PlantRepository extends BaseRepository {
    constructor() {
        super(Collections.PLANTS);
    }
    async search(query, limit = 20) {
        try {
            const collection = await this.getCollection();
            const result = await collection.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { scientificName: { $regex: query, $options: 'i' } },
                    { tags: { $regex: query, $options: 'i' } }
                ]
            }).limit(limit).toArray();
            return result;
        }
        catch (error) {
            this.handleError('search', error);
        }
    }
}
// Garden repository
export class GardenRepository extends BaseRepository {
    constructor() {
        super(Collections.GARDENS);
    }
    async findByUserId(userId) {
        try {
            const collection = await this.getCollection();
            const result = await collection.findOne({ userId });
            return result;
        }
        catch (error) {
            this.handleError('findByUserId', error);
        }
    }
    async addPlant(userId, plant) {
        try {
            const collection = await this.getCollection();
            const result = await collection.updateOne({ userId }, {
                $push: { plants: plant },
                $set: { updatedAt: new Date() },
                $setOnInsert: {
                    userId,
                    createdAt: new Date(),
                    name: 'My Garden'
                }
            }, { upsert: true });
            return result.modifiedCount > 0 || result.upsertedCount > 0;
        }
        catch (error) {
            this.handleError('addPlant', error);
        }
    }
    async updatePlant(userId, plantId, update) {
        try {
            const collection = await this.getCollection();
            const result = await collection.updateOne({
                userId,
                'plants.plantId': plantId
            }, {
                $set: Object.entries(update).reduce((acc, [key, value]) => ({
                    ...acc,
                    [`plants.$.${key}`]: value
                }), { updatedAt: new Date() })
            });
            return result.modifiedCount > 0;
        }
        catch (error) {
            this.handleError('updatePlant', error);
        }
    }
}
// Environmental data repository
export class EnvironmentalDataRepository extends BaseRepository {
    constructor() {
        super(Collections.ENVIRONMENTAL_DATA);
    }
    async findByUserAndDateRange(userId, startDate, endDate) {
        try {
            const collection = await this.getCollection();
            const result = await collection.find({
                userId,
                timestamp: {
                    $gte: startDate,
                    $lte: endDate
                }
            }).toArray();
            return result;
        }
        catch (error) {
            this.handleError('findByUserAndDateRange', error);
        }
    }
    async findLatestEnvironmentalData(userId) {
        try {
            const collection = await this.getCollection();
            const [data] = await collection
                .find({ userId })
                .sort({ timestamp: -1 })
                .limit(1)
                .toArray();
            return data ?? null;
        }
        catch (error) {
            this.handleError('findLatestEnvironmentalData', error);
        }
    }
}
// Export repositories
export const repositories = {
    users: new UserRepository(),
    plants: new PlantRepository(),
    gardens: new GardenRepository(),
    environmentalData: new EnvironmentalDataRepository()
};
