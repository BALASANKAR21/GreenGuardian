import { UserDocument, UserInput, UserUpdateInput } from '../models/user.model';
import { AppError } from '../lib/errors';
import { MongoUserRepository } from './repositories/mongo-user.repository';

export class UserService {
  private userRepo: MongoUserRepository;

  constructor() {
    this.userRepo = new MongoUserRepository();
  }

  async createUser(userData: UserInput): Promise<UserDocument> {
    const existingUser = await this.userRepo.findByEmail(userData.email);
    if (existingUser) {
      throw AppError.badRequest('User with this email already exists');
    }

    return this.userRepo.create(userData);
  }

  async getUserById(userId: string): Promise<UserDocument | null> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return user;
  }

  async updateUser(userId: string, updateData: UserUpdateInput): Promise<UserDocument | null> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    return this.userRepo.update(userId, updateData);
  }

  async deleteUser(userId: string): Promise<boolean> {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }

    return this.userRepo.delete(userId);
  }
}