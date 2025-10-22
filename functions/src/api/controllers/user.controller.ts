import { Request, Response } from 'express';
import { UserService } from '../../services/user.service';
import { AppError } from '../../errors';
import { StatusCodes } from 'http-status-codes';
import { UserInput, UserUpdateInput } from '../../models/user.model';
import * as admin from 'firebase-admin';
import path from 'path';

interface AuthenticatedRequest extends Request {
  user: { uid: string; email: string; role: 'user' | 'admin' };
}

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  public async createUser(req: Request, res: Response): Promise<void> {
    try {
      const userData: UserInput = req.body;

      // Validate required fields
      if (!userData.email || !userData.password || !userData.name) {
        throw AppError.badRequest('Missing required fields');
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(userData.email)) {
        throw AppError.badRequest('Invalid email format');
      }

      // Validate password strength
      if (userData.password.length < 8) {
        throw AppError.badRequest('Password must be at least 8 characters long');
      }

      // Validate name length
      if (userData.name.length < 2 || userData.name.length > 50) {
        throw AppError.badRequest('Name must be between 2 and 50 characters');
      }

      const user = await this.userService.createUser(userData);
      res.status(StatusCodes.CREATED).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
  throw AppError.internal('Failed to create user');
    }
  }

  public async getUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      if (!userId) {
        throw AppError.badRequest('User ID is required');
      }

      const user = await this.userService.getUserById(userId);
      if (!user) {
        throw AppError.notFound('User not found');
      }

      res.status(StatusCodes.OK).json({
        status: 'success',
        data: user
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
  throw AppError.internal('Failed to get user');
    }
  }

  public async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      if (!userId) {
        throw AppError.badRequest('User ID is required');
      }

      const updateData: Partial<UserUpdateInput> = req.body;

      // Validate email if provided
      if (updateData.email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(updateData.email)) {
          throw AppError.badRequest('Invalid email format');
        }
      }

      // Validate name if provided
      if (updateData.name && (updateData.name.length < 2 || updateData.name.length > 50)) {
        throw AppError.badRequest('Name must be between 2 and 50 characters');
      }

      // Check if user exists
      const existingUser = await this.userService.getUserById(userId);
      if (!existingUser) {
        throw AppError.notFound('User not found');
      }

      const updatedUser = await this.userService.updateUser(userId, updateData);
      res.status(StatusCodes.OK).json({
        status: 'success',
        data: updatedUser
      });
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
  throw AppError.internal('Failed to update user');
    }
  }

  public async deleteUser(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      if (!userId) {
        throw AppError.badRequest('User ID is required');
      }

      // Check if user exists
      const existingUser = await this.userService.getUserById(userId);
      if (!existingUser) {
        throw AppError.notFound('User not found');
      }

      // Check if user is attempting to delete themselves
      const requestingUser = (req as AuthenticatedRequest).user;
      if (requestingUser.uid !== userId && requestingUser.role !== 'admin') {
        throw AppError.forbidden('Not authorized to delete this user');
      }

      await this.userService.deleteUser(userId);
      res.status(StatusCodes.NO_CONTENT).send();
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
  throw AppError.internal('Failed to delete user');
    }
  }

  // Expect multer to put file on req.file (memory storage)
  public async uploadProfilePicture(req: any, res: Response): Promise<void> {
    try {
      const userId = req.params.id;
      if (!userId) throw AppError.badRequest('User ID is required');

      const file = req.file;
      if (!file) throw AppError.badRequest('No file uploaded');

      const bucket = admin.storage().bucket();
      const ext = path.extname(file.originalname) || '.jpg';
      const fileName = `profilePictures/${userId}${ext}`;
      const storageFile = bucket.file(fileName);

      const stream = storageFile.createWriteStream({ metadata: { contentType: file.mimetype } });
      stream.end(file.buffer);

      await new Promise<void>((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      // Make public and construct URL
      await storageFile.makePublic();
      const url = `https://storage.googleapis.com/${bucket.name}/${storageFile.name}`;

      // Update user
      const updated = await this.userService.updateUser(userId, { profilePicture: url } as any);

      res.status(StatusCodes.OK).json({ status: 'success', data: { url, user: updated } });
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw AppError.internal('Failed to upload profile picture');
    }
  }
}
