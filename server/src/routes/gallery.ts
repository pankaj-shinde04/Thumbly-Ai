import { Router } from 'express';
import { getGallery } from '../controllers/galleryController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All gallery routes require authentication
router.use(authenticate);

// Gallery endpoint
router.get('/', getGallery);

export default router;
