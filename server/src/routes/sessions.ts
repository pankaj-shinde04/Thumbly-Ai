import { Router } from 'express';
import { body, query } from 'express-validator';
import { 
  createSession, 
  getUserSessions, 
  getSession, 
  updateSession, 
  deleteSession 
} from '../controllers/designSessionController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All session routes require authentication
router.use(authenticate);

// Validation middleware
const validateCreateSession = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('platform')
    .isIn(['youtube', 'instagram-post', 'instagram-reel'])
    .withMessage('Platform must be youtube, instagram-post, or instagram-reel')
];

const validateUpdateSession = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title must be between 1 and 100 characters'),
  body('platform')
    .optional()
    .isIn(['youtube', 'instagram-post', 'instagram-reel'])
    .withMessage('Platform must be youtube, instagram-post, or instagram-reel'),
  body('status')
    .optional()
    .isIn(['active', 'archived', 'deleted'])
    .withMessage('Status must be active, archived, or deleted')
];

const validateGetSessions = [
  query('q')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('platform')
    .optional()
    .isIn(['youtube', 'instagram-post', 'instagram-reel'])
    .withMessage('Platform filter must be youtube, instagram-post, or instagram-reel'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50')
];

// Routes
router.get('/', validateGetSessions, getUserSessions);
router.post('/', validateCreateSession, createSession);
router.get('/:id', getSession);
router.patch('/:id', validateUpdateSession, updateSession);
router.delete('/:id', deleteSession);

export default router;
