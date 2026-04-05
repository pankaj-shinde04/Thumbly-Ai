import { Request, Response } from 'express';
import { User } from '../models/User';
import { logger } from '../lib/logger';

// Update user profile
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { name, avatarUrl } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    // Update fields
    if (name) user.name = name;
    if (avatarUrl !== undefined) user.avatarUrl = avatarUrl;

    await user.save();

    logger.info('User profile updated', {
      userId: user._id,
      fields: { name, avatarUrl: !!avatarUrl }
    });

    res.json({
      data: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      }
    });

  } catch (error: any) {
    logger.error('Update profile error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update profile'
      }
    });
  }
};

// Change password
export const changePassword = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Current password and new password are required'
        }
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'New password must be at least 6 characters long'
        }
      });
    }

    // Find user with password
    const user = await User.findByIdWithPassword(userId);
    if (!user || !user.passwordHash) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found or no password set'
        }
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Current password is incorrect'
        }
      });
    }

    // Update password
    user.passwordHash = newPassword; // Will be hashed by pre-save middleware
    await user.save();

    logger.info('User password changed', {
      userId: user._id
    });

    res.json({
      data: {
        message: 'Password changed successfully'
      }
    });

  } catch (error: any) {
    logger.error('Change password error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to change password'
      }
    });
  }
};

// Delete account
export const deleteAccount = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Password is required to delete account'
        }
      });
    }

    // Find user with password
    const user = await User.findByIdWithPassword(userId);
    if (!user || !user.passwordHash) {
      return res.status(404).json({
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found or no password set'
        }
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: {
          code: 'INVALID_PASSWORD',
          message: 'Password is incorrect'
        }
      });
    }

    // Delete user
    await User.findByIdAndDelete(userId);

    logger.info('User account deleted', {
      userId: user._id,
      email: user.email
    });

    res.json({
      data: {
        message: 'Account deleted successfully'
      }
    });

  } catch (error: any) {
    logger.error('Delete account error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete account'
      }
    });
  }
};
