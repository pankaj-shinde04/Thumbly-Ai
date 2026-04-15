import { v2 as cloudinary } from 'cloudinary';
import { logger } from '../lib/logger';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

interface UploadOptions {
  file: string | Buffer;
  userId: string;
  type: 'thumbnail' | 'asset' | 'profile' | 'other';
  prompt?: string;
}

interface UploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Upload image to Cloudinary
 * Folder structure: thumbly-ai/{userId}/{type}
 */
export const uploadToCloudinary = async (options: UploadOptions): Promise<UploadResult> => {
  try {
    const { file, userId, type, prompt } = options;

    logger.info(`Uploading to Cloudinary: userId=${userId}, type=${type}`);

    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: `thumbly-ai/${userId}/${type}`,
          resource_type: 'image',
          allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
          max_file_size: 10485760, // 10MB
          transformation: [
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        }
      ).end(Buffer.isBuffer(file) ? file : Buffer.from(file, 'base64'));
    });

    logger.info(`Cloudinary upload successful: publicId=${result.public_id}`);

    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  } catch (error: any) {
    logger.error('Cloudinary upload error:', error);
    throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
  }
};

/**
 * Delete image from Cloudinary
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    logger.info(`Deleting from Cloudinary: publicId=${publicId}`);

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'image',
    });

    if (result.result === 'ok' || result.result === 'not found') {
      logger.info(`Cloudinary delete successful: publicId=${publicId}`);
    } else {
      throw new Error(`Cloudinary delete failed: ${result.result}`);
    }
  } catch (error: any) {
    logger.error('Cloudinary delete error:', error);
    throw new Error(`Failed to delete from Cloudinary: ${error.message}`);
  }
};

/**
 * Get image info from Cloudinary
 */
export const getCloudinaryInfo = async (publicId: string): Promise<any> => {
  try {
    const result = await cloudinary.api.resource(publicId, {
      resource_type: 'image',
    });
    return result;
  } catch (error: any) {
    logger.error('Cloudinary info error:', error);
    throw new Error(`Failed to get Cloudinary info: ${error.message}`);
  }
};
