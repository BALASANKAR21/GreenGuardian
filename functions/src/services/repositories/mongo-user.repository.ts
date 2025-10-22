import { MongoClient, Collection, ObjectId } from 'mongodb';
import { UserDocument, UserInput, UserUpdateInput } from '../../models/user.model';

export class MongoUserRepository {
  private collection: Collection<UserDocument>;

  constructor() {
    const client = new MongoClient(process.env.MONGODB_URI || '');
    const db = client.db('greenguardian');
    this.collection = db.collection<UserDocument>('users');
  }

  async create(userData: UserInput): Promise<UserDocument> {
    const now = new Date();
    const userDoc: UserDocument = {
      ...userData,
      id: new ObjectId().toHexString(),
      createdAt: now,
      updatedAt: now,
    };

    await this.collection.insertOne(userDoc);
    return userDoc;
  }

  async findById(id: string): Promise<UserDocument | null> {
    return this.collection.findOne({ id });
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.collection.findOne({ email });
  }

  async update(id: string, updateData: UserUpdateInput): Promise<UserDocument | null> {
    const result = await this.collection.findOneAndUpdate(
      { id },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    return result;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ id });
    return result.deletedCount > 0;
  }
}