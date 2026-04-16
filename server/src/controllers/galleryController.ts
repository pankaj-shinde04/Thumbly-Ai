import { Request, Response } from 'express';
import { DesignSession } from '../models/DesignSession';
import { Message } from '../models/Message';
import { logger } from '../lib/logger';

interface GalleryItem {
  id: string;
  sessionId: string;
  sessionTitle: string;
  platform: string;
  imageUrl: string;
  prompt: string;
  createdAt: Date;
}

export const getGallery = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { q, platform, page = '1', limit = '20' } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    logger.info('Fetching gallery', {
      userId,
      q,
      platform,
      page: pageNum,
      limit: limitNum
    });

    // Build query
    const sessionQuery: any = {
      userId,
      deletedAt: null // Only non-deleted sessions
    };

    if (platform && platform !== 'all') {
      sessionQuery.platform = platform;
    }

    if (q) {
      sessionQuery.title = { $regex: q as string, $options: 'i' };
    }

    // Fetch sessions with pagination
    const sessions = await DesignSession.find(sessionQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Extract images from session messages
    const galleryItems: GalleryItem[] = [];

    for (const session of sessions) {
      // Fetch messages for this session that have images
      const messages = await Message.find({
        sessionId: session._id,
        role: 'assistant',
        imageAssetId: { $exists: true, $ne: null }
      }).lean();

      for (const message of messages) {
        if (message.imageAssetId) {
          galleryItems.push({
            id: message._id.toString(),
            sessionId: session._id.toString(),
            sessionTitle: session.title,
            platform: session.platform,
            imageUrl: message.imageAssetId,
            prompt: message.content || '',
            createdAt: message.createdAt
          });
        }
      }
    }

    // Get total count for pagination
    const totalSessions = await DesignSession.countDocuments(sessionQuery);

    logger.info('Gallery fetched successfully', {
      userId,
      itemCount: galleryItems.length,
      totalSessions
    });

    res.json({
      data: {
        items: galleryItems,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalSessions,
          totalPages: Math.ceil(totalSessions / limitNum)
        }
      }
    });
  } catch (error: any) {
    logger.error('Get gallery error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to fetch gallery'
      }
    });
  }
};
