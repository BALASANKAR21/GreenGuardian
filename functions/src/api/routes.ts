import express from 'express';
import { UserController } from './controllers/user.controller';
import { plantController } from './controllers/plant.controller';
import { gardenController } from './controllers/garden.controller';
import { environmentalController } from './controllers/environmental.controller';
import { authenticateMiddleware, requireRole } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';
import { validateSchema } from './middleware/validation';
import { rateLimiter } from './middleware/rate-limiter';
import * as schemas from './schemas';

// Rate limit configurations
const standardLimit = rateLimiter({ windowMs: 15 * 60 * 1000, max: 100 }); // 100 requests per 15 minutes
const searchLimit = rateLimiter({ windowMs: 60 * 1000, max: 30 }); // 30 requests per minute
const envDataLimit = rateLimiter({ windowMs: 60 * 1000, max: 60 }); // 60 requests per minute

const router = express.Router();
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });

const userController = new UserController();

// User routes
router.get(
  '/profile',
  authenticateMiddleware,
  standardLimit,
  async (req, res, next) => {
    try {
      // set params.id to the authenticated user's uid and call controller
      (req as any).params = { ...(req as any).params, id: (req as any).user?.uid };
      await userController.getUser(req as any, res as any);
      return;
    } catch (err) {
      return next(err);
    }
  }
);

router.put(
  '/profile',
  authenticateMiddleware,
  standardLimit,
  validateSchema(schemas.userProfileSchema),
  async (req, res, next) => {
    try {
      (req as any).params = { ...(req as any).params, id: (req as any).user?.uid };
      await userController.updateUser(req as any, res as any);
      return;
    } catch (err) {
      return next(err);
    }
  }
);

// Upload profile picture
router.post(
  '/profile/upload',
  authenticateMiddleware,
  standardLimit,
  upload.single('profilePicture'),
  async (req, res, next) => {
    try {
      // set params.id to the authenticated user's uid so controller can reuse logic
      (req as any).params = { ...(req as any).params, id: (req as any).user?.uid };
      await userController.uploadProfilePicture(req as any, res as any);
      return;
    } catch (err) {
      return next(err);
    }
  }
);

// Plant routes
router.get(
  '/plants/search',
  authenticateMiddleware,
  searchLimit,
  validateSchema(schemas.searchSchema),
  plantController.searchPlants
);

router.get(
  '/plants/:id',
  authenticateMiddleware,
  standardLimit,
  plantController.getPlantById
);

router.post(
  '/plants',
  authenticateMiddleware,
  requireRole(['admin']),
  validateSchema(schemas.plantSchema),
  plantController.createPlant
);

// Garden routes
router.get(
  '/garden',
  authenticateMiddleware,
  standardLimit,
  gardenController.getUserGarden
);

router.post(
  '/garden/plants',
  authenticateMiddleware,
  standardLimit,
  validateSchema(schemas.gardenPlantSchema),
  gardenController.addPlant
);

router.put(
  '/garden/plants/:plantId',
  authenticateMiddleware,
  standardLimit,
  validateSchema(schemas.gardenPlantSchema),
  gardenController.updatePlant
);

router.delete(
  '/garden/plants/:plantId',
  authenticateMiddleware,
  standardLimit,
  gardenController.removePlant
);

// Environmental data routes
router.post(
  '/environmental',
  authenticateMiddleware,
  envDataLimit,
  validateSchema(schemas.environmentalDataSchema),
  environmentalController.saveData
);

router.get(
  '/environmental/latest',
  authenticateMiddleware,
  envDataLimit,
  environmentalController.getLatest
);

router.get(
  '/environmental/history',
  authenticateMiddleware,
  envDataLimit,
  validateSchema(schemas.dateRangeSchema),
  environmentalController.getHistory
);

// Error handling
router.use(errorHandler);

export default router;