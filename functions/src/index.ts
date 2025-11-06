import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import express from 'express';
import cors from 'cors';
import { DatabaseConnection } from './infrastructure/database/connection';
import { RepositoryFactory } from './infrastructure/repositories/RepositoryFactory';
import routes from './api/routes';

// Initialize Firebase Admin
admin.initializeApp();

// Set global options for functions
functions.setGlobalOptions({ maxInstances: 10 });

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Database connection and repositories
const dbConnection = DatabaseConnection.getInstance();
dbConnection.getDb().then(db => {
  RepositoryFactory.initializeRepositories(db);
  console.log('Database connection initialized successfully');
}).catch(error => {
  console.error('Failed to initialize database connection:', error);
});

// Use routes
app.use('/api/v1', routes);

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    error: {
      code: 'NOT_FOUND',
      message: 'Route not found'
    }
  });
});

// Export the API as a Firebase Cloud Function
export const api = functions.https.onRequest(app);
