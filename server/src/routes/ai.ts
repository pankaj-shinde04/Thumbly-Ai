import { Router } from 'express';
import { body } from 'express-validator';
import { 
  generateImageHandler, 
  regenerateImageHandler 
} from '../controllers/aiController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All AI routes require authentication
router.use(authenticate);

// Validation middleware
const validateGenerateImage = [
  body('prompt')
    .trim()
    .notEmpty()
    .withMessage('Prompt is required')
    .isLength({ max: 4000 })
    .withMessage('Prompt must be less than 4000 characters'),
  body('style')
    .optional()
    .isIn(['realistic', 'artistic', 'cartoon', 'minimalist'])
    .withMessage('Style must be realistic, artistic, cartoon, or minimalist'),
  body('size')
    .optional()
    .isIn(['256x256', '512x512', '1024x1024'])
    .withMessage('Size must be 256x256, 512x512, or 1024x1024'),
  body('sessionId')
    .optional()
    .isMongoId()
    .withMessage('Session ID must be a valid MongoDB ObjectId')
];

const validateRegenerateImage = [
  body('originalPrompt')
    .trim()
    .notEmpty()
    .withMessage('Original prompt is required'),
  body('modifications')
    .trim()
    .notEmpty()
    .withMessage('Modifications are required')
];

// Routes
router.post('/generate', validateGenerateImage, generateImageHandler);
router.post('/regenerate', validateRegenerateImage, regenerateImageHandler);

export default router;
