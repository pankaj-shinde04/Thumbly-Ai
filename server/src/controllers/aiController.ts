import { Request, Response } from 'express';
import { generateImage, regenerateImage } from '../services/aiService';
import { logger } from '../lib/logger';

interface GenerateRequestBody {
  prompt: string;
  sessionId?: string;
  style?: 'realistic' | 'artistic' | 'cartoon' | 'minimalist';
  size?: '256x256' | '512x512' | '1024x1024';
}

interface RegenerateRequestBody {
  originalPrompt: string;
  modifications: string;
}

// Generate image based on prompt
export const generateImageHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { prompt, sessionId, style = 'realistic', size = '1024x1024' } = req.body as GenerateRequestBody;

    // Validate input
    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Prompt is required'
        }
      });
    }

    if (prompt.length > 4000) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Prompt must be less than 4000 characters'
        }
      });
    }

    // Validate size
    const validSizes = ['256x256', '512x512', '1024x1024'];
    if (!validSizes.includes(size)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid size. Must be 256x256, 512x512, or 1024x1024'
        }
      });
    }

    // Validate style
    const validStyles = ['realistic', 'artistic', 'cartoon', 'minimalist'];
    if (!validStyles.includes(style)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid style. Must be realistic, artistic, cartoon, or minimalist'
        }
      });
    }

    logger.info(`Generating image for user ${userId} with prompt: ${prompt}`);

    // Generate image
    const images = await generateImage({
      prompt: prompt.trim(),
      sessionId,
      userId,
      style,
      size,
      n: 1
    });

    res.json({
      data: {
        images: images.map(img => ({
          url: img.url,
          revisedPrompt: img.revisedPrompt
        })),
        prompt,
        style,
        size
      }
    });
  } catch (error: any) {
    logger.error('Error in generateImageHandler:', error);
    
    if (error.message.includes('Rate limit')) {
      return res.status(429).json({
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: error.message
        }
      });
    }

    if (error.message.includes('Invalid API key')) {
      return res.status(500).json({
        error: {
          code: 'INVALID_API_KEY',
          message: error.message
        }
      });
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to generate image'
      }
    });
  }
};

// Regenerate image with modifications
export const regenerateImageHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { originalPrompt, modifications } = req.body as RegenerateRequestBody;

    // Validate input
    if (!originalPrompt || originalPrompt.trim().length === 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Original prompt is required'
        }
      });
    }

    if (!modifications || modifications.trim().length === 0) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Modifications are required'
        }
      });
    }

    logger.info(`Regenerating image for user ${userId} with modifications: ${modifications}`);

    // Regenerate image
    const images = await regenerateImage(originalPrompt.trim(), modifications.trim());

    res.json({
      data: {
        images: images.map(img => ({
          url: img.url,
          revisedPrompt: img.revisedPrompt
        })),
        originalPrompt,
        modifications
      }
    });
  } catch (error: any) {
    logger.error('Error in regenerateImageHandler:', error);
    
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message || 'Failed to regenerate image'
      }
    });
  }
};
