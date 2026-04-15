import { Request, Response } from 'express';
import { Asset } from '../models/Asset';
import { logger } from '../lib/logger';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinaryService';

// Upload endpoint
export const uploadAsset = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const sessionId = req.body.sessionId;
    const type = req.body.type || 'thumbnail';
    const prompt = req.body.prompt;

    if (!req.file) {
      return res.status(400).json({
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded'
        }
      });
    }

    logger.info('Uploading asset to Cloudinary', {
      userId,
      sessionId,
      type,
      prompt
    });

    // Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary({
      file: req.file.buffer,
      userId,
      type: type as 'thumbnail' | 'asset' | 'profile' | 'other',
      prompt
    });

    // Create asset record in MongoDB
    const asset = new Asset({
      userId,
      sessionId,
      filename: cloudinaryResult.public_id,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: cloudinaryResult.bytes,
      url: cloudinaryResult.secure_url,
      // Cloudinary fields
      publicId: cloudinaryResult.public_id,
      imageUrl: cloudinaryResult.secure_url,
      prompt,
      type,
      metadata: req.body.metadata || {}
    });

    await asset.save();

    logger.info('Asset uploaded successfully', {
      assetId: asset._id,
      userId,
      publicId: cloudinaryResult.public_id
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
          publicId: asset.publicId,
          imageUrl: asset.imageUrl,
          prompt: asset.prompt,
          type: asset.type,
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
        message: error.message || 'Failed to upload asset'
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
          publicId: asset.publicId,
          imageUrl: asset.imageUrl,
          prompt: asset.prompt,
          type: asset.type,
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

    // Redirect to Cloudinary URL for download
    if (asset.imageUrl) {
      res.redirect(asset.imageUrl);
    } else {
      res.status(404).json({
        error: {
          code: 'FILE_NOT_FOUND',
          message: 'File URL not found'
        }
      });
    }

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

// Delete asset
export const deleteAsset = async (req: Request, res: Response) => {
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

    // Delete from Cloudinary if publicId exists
    if (asset.publicId) {
      try {
        await deleteFromCloudinary(asset.publicId);
        logger.info('Deleted from Cloudinary', { publicId: asset.publicId });
      } catch (cloudinaryError: any) {
        logger.error('Failed to delete from Cloudinary:', cloudinaryError);
        // Continue with DB deletion even if Cloudinary fails
      }
    }

    // Delete from MongoDB
    await Asset.findByIdAndDelete(id);

    logger.info('Asset deleted successfully', {
      assetId: asset._id,
      userId,
      publicId: asset.publicId
    });

    res.json({
      data: {
        message: 'Asset deleted successfully'
      }
    });
  } catch (error: any) {
    logger.error('Delete asset error:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to delete asset'
      }
    });
  }
};
