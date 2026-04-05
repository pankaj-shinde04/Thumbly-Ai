import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// Extend Request interface to include userId
declare module 'express' {
  interface Request {
    userId?: string;
    user?: any;
  }
}

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Access token is required'
        }
      });
    }

    // Verify token
    const jwtSecret = process.env.JWT_ACCESS_SECRET || 'fallback-secret';
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };

    // Find user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'User not found'
        }
      });
    }

    // Attach user to request
    req.userId = user._id;
    req.user = user;

    next();
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid access token'
        }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Access token has expired'
        }
      });
    }

    return res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to authenticate user'
      }
    });
  }
};

// Optional authentication (doesn't throw error if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const jwtSecret = process.env.JWT_ACCESS_SECRET || 'fallback-secret';
      const decoded = jwt.verify(token, jwtSecret) as { userId: string };
      
      const user = await User.findById(decoded.userId);
      if (user) {
        req.userId = user._id;
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Silent fail for optional auth
    next();
  }
};
