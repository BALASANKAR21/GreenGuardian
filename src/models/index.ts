import mongoose from 'mongoose';

// Export all models
export { Plant } from './plant';
export { User } from './user';
export { Identification } from './identification';
export { EnvironmentalData } from './environmental-data';

// Database connection function
export const connectDB = async () => {
  if (mongoose.connections[0].readyState) {
    return;
  }

  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }

    await mongoose.connect(uri, {
      // Options will be automatically added by Mongoose 7+
    });

    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};