import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { auth } from 'firebase-admin';
import { services } from './services';
import { AppError, ValidationError, AuthError, NotFoundError } from '../utils/errors';
const app = express();
// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
// Error handler
const errorHandler = (error, _req, _res, _next) => {
    console.error('Error:', error);
    if (error instanceof AppError) {
        const response = error.toJSON();
        return _res.status(error.status).json(response);
    }
    const internalError = new AppError(error.message || 'Internal server error');
    return _res.status(internalError.status).json(internalError.toJSON());
};
// Authentication middleware
const authenticate = async (req, _res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            throw new AuthError('No token provided');
        }
        const token = authHeader.split('Bearer ')[1];
        const decodedToken = await auth().verifyIdToken(token);
        req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email
        };
        next();
    }
    catch (error) {
        next(new AuthError('Invalid token'));
    }
};
// Validation middleware
const validateBody = (requiredFields) => (req, _res, next) => {
    const missing = requiredFields.filter(field => !req.body[field]);
    if (missing.length > 0) {
        next(new ValidationError(`Missing required fields: ${missing.join(', ')}`));
        return;
    }
    next();
};
// User routes
app.get('/api/users/profile', authenticate, async (req, res, next) => {
    try {
        const profile = await services.users.getProfile(req.user.uid);
        if (!profile) {
            throw new NotFoundError('User profile not found');
        }
        res.json(profile);
    }
    catch (error) {
        next(error);
    }
});
app.post('/api/users/profile', authenticate, validateBody(['displayName', 'email']), async (req, res, next) => {
    try {
        const profile = await services.users.createProfile({
            uid: req.user.uid,
            ...req.body
        });
        res.status(201).json(profile);
    }
    catch (error) {
        next(error);
    }
});
app.patch('/api/users/profile', authenticate, async (req, res, next) => {
    try {
        await services.users.updateProfile(req.user.uid, req.body);
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
// Plant routes
app.get('/api/plants/search', authenticate, async (req, res, next) => {
    try {
        const { query, limit } = req.query;
        if (typeof query !== 'string') {
            throw new ValidationError('Query parameter must be a string');
        }
        const plants = await services.plants.searchPlants(query, limit ? parseInt(limit, 10) : undefined);
        res.json(plants);
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/plants/:id', authenticate, async (req, res, next) => {
    try {
        const plant = await services.plants.getPlantById(req.params.id);
        res.json(plant);
    }
    catch (error) {
        next(error);
    }
});
// Garden routes
app.get('/api/gardens', authenticate, async (req, res, next) => {
    try {
        const garden = await services.gardens.getUserGarden(req.user.uid);
        res.json(garden || { userId: req.user.uid, plants: [] });
    }
    catch (error) {
        next(error);
    }
});
app.post('/api/gardens/plants', authenticate, validateBody(['plantId', 'location']), async (req, res, next) => {
    try {
        const { plantId, location, notes } = req.body;
        const success = await services.gardens.addPlantToGarden(req.user.uid, plantId, location, notes);
        res.json({ success });
    }
    catch (error) {
        next(error);
    }
});
app.patch('/api/gardens/plants/:plantId', authenticate, async (req, res, next) => {
    try {
        const success = await services.gardens.updatePlantInGarden(req.user.uid, req.params.plantId, req.body);
        res.json({ success });
    }
    catch (error) {
        next(error);
    }
});
// Environmental data routes
app.post('/api/environmental-data', authenticate, validateBody(['location', 'readings']), async (req, res, next) => {
    try {
        const data = await services.environmentalData.addEnvironmentalData({
            userId: req.user.uid,
            ...req.body,
            timestamp: new Date()
        });
        res.status(201).json(data);
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/environmental-data', authenticate, async (req, res, next) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            throw new ValidationError('Start date and end date are required');
        }
        const data = await services.environmentalData.getEnvironmentalData(req.user.uid, new Date(startDate), new Date(endDate));
        res.json(data);
    }
    catch (error) {
        next(error);
    }
});
app.get('/api/environmental-data/latest', authenticate, async (req, res, next) => {
    try {
        const data = await services.environmentalData.getLatestEnvironmentalData(req.user.uid);
        if (!data) {
            throw new NotFoundError('No environmental data found');
        }
        res.json(data);
    }
    catch (error) {
        next(error);
    }
});
// Error handling
app.use(errorHandler);
export default app;
