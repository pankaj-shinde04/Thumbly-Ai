import { Router } from 'express';
import { body } from 'express-validator';
import { updateProfile, changePassword, deleteAccount } from '../controllers/userController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// All user routes require authentication
router.use(authenticate);

// Validation middleware
const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('avatarUrl')
    .optional()
    .isURL()
    .withMessage('Avatar URL must be a valid URL')
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const validateDeleteAccount = [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account')
];

// Routes
router.put('/profile', validateUpdateProfile, updateProfile);
router.put('/password', validateChangePassword, changePassword);
router.delete('/account', validateDeleteAccount, deleteAccount);

export default router;
