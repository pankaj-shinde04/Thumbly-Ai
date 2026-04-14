import { Request, Response } from 'express';
import { generateImage, regenerateImage } from '../services/aiService';
import { Message } from '../models/Message';
import { logger } from '../lib/logger';

interface GenerateRequestBody {
  sessionId: string;
  prompt: string;
  platform?: 'youtube' | 'instagram-post' | 'instagram-reel';
  style?: 'realistic' | 'artistic' | 'cartoon' | 'minimalist';
  size?: '256x256' | '512x512' | '1024x1024';
}

interface RegenerateRequestBody {
  sessionId: string;
  messageId: string;
}

// Generate image based on prompt
export const generateImageHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { sessionId, prompt, platform = 'youtube', style = 'realistic', size = '1024x1024' } = req.body as GenerateRequestBody;

    // Validate input
    if (!sessionId) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Session ID is required'
        }
      });
    }

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

    // Create assistant message with generated image
    if (images.length > 0) {
      const assistantMessage = new Message({
        sessionId,
        role: 'assistant',
        content: `Generated ${images.length} image(s) based on your prompt: "${prompt}"`,
        imageAssetId: images[0].url,
        metadata: {
          imageUrl: images[0].url,
          revisedPrompt: images[0].revisedPrompt,
          platform
        }
      });

      await assistantMessage.save();

      res.json({
        data: {
          asset: {
            url: images[0].url,
            revisedPrompt: images[0].revisedPrompt
          },
          assistantMessage: {
            id: assistantMessage._id,
            sessionId: assistantMessage.sessionId,
            role: assistantMessage.role,
            content: assistantMessage.content,
            imageAssetId: assistantMessage.imageAssetId,
            metadata: assistantMessage.metadata,
            createdAt: assistantMessage.createdAt
          }
        }
      });
    } else {
      res.status(500).json({
        error: {
          code: 'GENERATION_FAILED',
          message: 'Failed to generate image'
        }
      });
    }
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

// Regenerate image based on message
export const regenerateImageHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { sessionId, messageId } = req.body as RegenerateRequestBody;

    // Validate input
    if (!sessionId) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Session ID is required'
        }
      });
    }

    if (!messageId) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Message ID is required'
        }
      });
    }

    // Find the original message
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({
        error: {
          code: 'MESSAGE_NOT_FOUND',
          message: 'Message not found'
        }
      });
    }

    // Verify message belongs to the session
    if (message.sessionId.toString() !== sessionId) {
      return res.status(400).json({
        error: {
          code: 'INVALID_SESSION',
          message: 'Message does not belong to the specified session'
        }
      });
    }

    logger.info(`Regenerating image for user ${userId} from message ${messageId}`);

    // Get the original prompt from the message metadata or content
    const originalPrompt = (message.metadata as any)?.revisedPrompt || message.content;

    // Regenerate image
    const images = await regenerateImage(originalPrompt, 'add more detail and variety');

    // Create new assistant message with regenerated image
    if (images.length > 0) {
      const assistantMessage = new Message({
        sessionId,
        role: 'assistant',
        content: `Regenerated image based on your previous request`,
        imageAssetId: images[0].url,
        metadata: {
          imageUrl: images[0].url,
          revisedPrompt: images[0].revisedPrompt,
          originalMessageId: messageId
        }
      });

      await assistantMessage.save();

      res.json({
        data: {
          asset: {
            url: images[0].url,
            revisedPrompt: images[0].revisedPrompt
          },
          assistantMessage: {
            id: assistantMessage._id,
            sessionId: assistantMessage.sessionId,
            role: assistantMessage.role,
            content: assistantMessage.content,
            imageAssetId: assistantMessage.imageAssetId,
            metadata: assistantMessage.metadata,
            createdAt: assistantMessage.createdAt
          }
        }
      });
    } else {
      res.status(500).json({
        error: {
          code: 'GENERATION_FAILED',
          message: 'Failed to regenerate image'
        }
      });
    }
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
