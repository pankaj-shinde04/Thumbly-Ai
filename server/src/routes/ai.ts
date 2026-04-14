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

// Validation middleware for Module 8 specifications
const validateGenerateImage = [
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
    .isMongoId()
    .withMessage('Session ID must be a valid MongoDB ObjectId'),
  body('prompt')
    .trim()
    .notEmpty()
    .withMessage('Prompt is required')
    .isLength({ max: 4000 })
    .withMessage('Prompt must be less than 4000 characters'),
  body('platform')
    .optional()
    .isIn(['youtube', 'instagram-post', 'instagram-reel'])
    .withMessage('Platform must be youtube, instagram-post, or instagram-reel'),
  body('style')
    .optional()
    .isIn(['realistic', 'artistic', 'cartoon', 'minimalist'])
    .withMessage('Style must be realistic, artistic, cartoon, or minimalist'),
  body('size')
    .optional()
    .isIn(['256x256', '512x512', '1024x1024'])
    .withMessage('Size must be 256x256, 512x512, or 1024x1024')
];

const validateRegenerateImage = [
  body('sessionId')
    .notEmpty()
    .withMessage('Session ID is required')
    .isMongoId()
    .withMessage('Session ID must be a valid MongoDB ObjectId'),
  body('messageId')
    .notEmpty()
    .withMessage('Message ID is required')
    .isMongoId()
    .withMessage('Message ID must be a valid MongoDB ObjectId')
];

// Module 8 Routes
router.post('/generate', validateGenerateImage, generateImageHandler);
router.post('/regenerate', validateRegenerateImage, regenerateImageHandler);

export default router;
