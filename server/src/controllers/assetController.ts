import { Request, Response } from 'express';
import { Asset } from '../models/Asset';
import { logger } from '../lib/logger';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

// Upload endpoint
export const uploadAsset = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const sessionId = req.body.sessionId;

    if (!req.file) {
      return res.status(400).json({
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded'
        }
      });
    }

    // Generate unique filename
    const ext = path.extname(req.file.originalname);
    const assetId = crypto.randomBytes(16).toString('hex');
    const filename = `${assetId}${ext}`;

    // Determine storage path
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);

    // Save file to local storage
    fs.writeFileSync(filePath, req.file.buffer);

    // Create asset record
    const asset = new Asset({
      userId,
      sessionId,
      filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      url: `/assets/${assetId}`,
      metadata: req.body.metadata || {}
    });

    await asset.save();

    logger.info('Asset uploaded', {
      assetId: asset._id,
      userId,
      filename,
      size: asset.size
    });

    res.status(201).json({
      data: {
        asset: {
          id: asset._id,
          userId: asset.userId,
          sessionId: asset.sessionId,
          filename: asset.filename,
          originalName: asset.originalName,
          mimeType: asset.mimeType,
          size: asset.size,
          url: asset.url,
          metadata: asset.metadata,
          createdAt: asset.createdAt,
          updatedAt: asset.updatedAt
        }
      }
    });
  } catch (error: any) {
    logger.error('Upload asset error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to upload asset'
      }
    });
  }
};

// Get asset metadata
export const getAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({
        error: {
          code: 'ASSET_NOT_FOUND',
          message: 'Asset not found'
        }
      });
    }

    // Check ownership
    if (asset.userId.toString() !== userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      });
    }

    res.json({
      data: {
        asset: {
          id: asset._id,
          userId: asset.userId,
          sessionId: asset.sessionId,
          filename: asset.filename,
          originalName: asset.originalName,
          mimeType: asset.mimeType,
          size: asset.size,
          url: asset.url,
          metadata: asset.metadata,
          createdAt: asset.createdAt,
          updatedAt: asset.updatedAt
        }
      }
    });
  } catch (error: any) {
    logger.error('Get asset error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get asset'
      }
    });
  }
};

// Download asset
export const downloadAsset = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;

    const asset = await Asset.findById(id);
    if (!asset) {
      return res.status(404).json({
        error: {
          code: 'ASSET_NOT_FOUND',
          message: 'Asset not found'
        }
      });
    }

    // Check ownership
    if (asset.userId.toString() !== userId) {
      return res.status(403).json({
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied'
        }
      });
    }

    // Determine file path
    const uploadDir = path.join(process.cwd(), 'uploads');
    const filePath = path.join(uploadDir, asset.filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'File not found on disk'
        }
      });
    }

    // Set headers
    res.setHeader('Content-Type', asset.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${asset.originalName}"`);
    res.setHeader('Content-Length', asset.size.toString());

    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    logger.info('Asset downloaded', {
      assetId: asset._id,
      userId,
      filename: asset.filename
    });
  } catch (error: any) {
    logger.error('Download asset error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to download asset'
      }
    });
  }
};
