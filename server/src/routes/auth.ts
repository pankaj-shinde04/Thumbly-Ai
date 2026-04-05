import { Router } from 'express';
import { body } from 'express-validator';
import { signup, login, getMe, logout } from '../controllers/authController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// Validation middleware
const validateSignup = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Routes
router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

export default router;
