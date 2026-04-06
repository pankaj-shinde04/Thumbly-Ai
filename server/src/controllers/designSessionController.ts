import { Request, Response } from 'express';
import { DesignSession } from '../models/DesignSession';
import { logger } from '../lib/logger';

// Create a new design session
export const createSession = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { title, platform } = req.body;

    // Validate input
    if (!title || !platform) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Title and platform are required'
        }
      });
    }

    // Validate platform
    if (!['youtube', 'instagram-post', 'instagram-reel'].includes(platform)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid platform. Must be youtube, instagram-post, or instagram-reel'
        }
      });
    }

    // Create session
    const session = new DesignSession({
      userId,
      title,
      platform
    });

    await session.save();

    logger.info('Design session created', {
      sessionId: session._id,
      userId,
      title,
      platform
    });

    res.status(201).json({
      data: {
        session: {
          id: session._id,
          userId: session.userId,
          title: session.title,
          platform: session.platform,
          status: session.status,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
        }
      }
    });

  } catch (error: any) {
    logger.error('Create session error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to create design session'
      }
    });
  }
};

// Get user's design sessions
export const getUserSessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { status } = req.query;

    let sessions;
    if (status && ['active', 'archived'].includes(status as string)) {
      sessions = await DesignSession.find({ userId, status: status as string }).sort({ createdAt: -1 });
    } else {
      sessions = await DesignSession.findByUserId(userId);
    }

    res.json({
      data: {
        sessions: sessions.map(session => ({
          id: session._id,
          userId: session.userId,
          title: session.title,
          platform: session.platform,
          status: session.status,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
        }))
      }
    });

  } catch (error: any) {
    logger.error('Get sessions error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get design sessions'
      }
    });
  }
};

// Get specific design session
export const getSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = (req as any).userId;

    const session = await DesignSession.findByIdWithUser(sessionId);
    if (!session) {
      return res.status(404).json({
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Design session not found'
        }
      });
    }

    // Check if user owns the session
    if (session.userId._id.toString() !== userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      });
    }

    res.json({
      data: {
        session: {
          id: session._id,
          userId: session.userId._id,
          title: session.title,
          platform: session.platform,
          status: session.status,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
        }
      }
    });

  } catch (error: any) {
    logger.error('Get session error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get design session'
      }
    });
  }
};

// Update design session
export const updateSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = (req as any).userId;
    const { title, status } = req.body;

    // Find session
    const session = await DesignSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Design session not found'
        }
      });
    }

    // Check ownership
    if (session.userId.toString() !== userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      });
    }

    // Update fields
    if (title !== undefined) session.title = title;
    if (status !== undefined && ['active', 'archived', 'deleted'].includes(status)) {
      session.status = status;
    }

    await session.save();

    logger.info('Design session updated', {
      sessionId: session._id.toString(),
      userId,
      updates: { title, status }
    });

    res.json({
      data: {
        session: {
          id: session._id.toString(),
          userId: session.userId.toString(),
          title: session.title,
          platform: session.platform,
          status: session.status,
          createdAt: session.createdAt,
          updatedAt: session.updatedAt
        }
      }
    });

  } catch (error: any) {
    logger.error('Update session error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to update design session'
      }
    });
  }
};

// Delete design session
export const deleteSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = (req as any).userId;

    // Find session
    const session = await DesignSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Design session not found'
        }
      });
    }

    // Check ownership
    if (session.userId.toString() !== userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      });
    }

    // Soft delete
    session.status = 'deleted';
    await session.save();

    logger.info('Design session deleted', {
      sessionId: session._id,
      userId
    });

    res.json({
      data: {
        message: 'Design session deleted successfully'
      }
    });

  } catch (error: any) {
    logger.error('Delete session error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete design session'
      }
    });
  }
};
