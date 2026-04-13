import { Router } from 'express';
import { body } from 'express-validator';
import { 
  getSessionMessages, 
  createMessage 
} from '../controllers/messageController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All message routes require authentication
router.use(authenticate);

// Validation middleware
const validateCreateMessage = [
  body('role')
    .isIn(['user', 'assistant', 'system'])
    .withMessage('Role must be user, assistant, or system'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 5000 })
    .withMessage('Content must be between 1 and 5000 characters'),
  body('imageAssetId')
    .optional()
    .isMongoId()
    .withMessage('Image asset ID must be a valid MongoDB ObjectId'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

// Routes
router.get('/:id/messages', getSessionMessages);
router.post('/:id/messages', validateCreateMessage, createMessage);

export default router;
