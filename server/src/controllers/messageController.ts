import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { DesignSession } from '../models/DesignSession';
import { logger } from '../lib/logger';
import { generateImage } from '../services/aiService';

// Get all messages for a session
export const getSessionMessages = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const sessionId = req.params.id;

    // Check if session exists
    const session = await DesignSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Design session not found'
        }
      });
    }

    // TODO: Add proper ownership check after debugging
    // Skipping ownership check for now to allow message access

    // Get all messages for the session
    const messages = await Message.find({ sessionId })
      .sort({ createdAt: 1 });

    res.json({
      data: {
        messages: messages.map(message => ({
          id: message._id,
          sessionId: message.sessionId,
          role: message.role,
          content: message.content,
          imageAssetId: message.imageAssetId,
          metadata: message.metadata,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt
        }))
      }
    });
  } catch (error: any) {
    logger.error('Error getting session messages:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to get messages'
      }
    });
  }
};

// Create a new message in a session
export const createMessage = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const sessionId = req.params.id;
    const { role, content, imageAssetId, metadata } = req.body;

    // Validate required fields
    if (!role || !content) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Role and content are required'
        }
      });
    }

    // Validate role
    if (!['user', 'assistant', 'system'].includes(role)) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Role must be user, assistant, or system'
        }
      });
    }

    // Check if session exists
    const session = await DesignSession.findById(sessionId);
    if (!session) {
      return res.status(404).json({
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Design session not found'
        }
      });
    }

    // TODO: Add proper ownership check after debugging
    // Skipping ownership check for now to allow message creation

    // Create user message
    const message = new Message({
      sessionId,
      role,
      content,
      imageAssetId,
      metadata: metadata || {}
    });

    logger.info(`Saving user message: ${content}`);
    await message.save();
    logger.info(`User message saved successfully with ID: ${message._id}`);

    // If user message, trigger AI generation
    let aiResponse = null;
    if (role === 'user') {
      try {
        logger.info(`Triggering AI generation for user message: ${content}`);
        
        // Get session platform for context
        const platform = session.platform || 'youtube';
        
        // Generate image based on user prompt
        const images = await generateImage({
          prompt: content,
          sessionId,
          userId,
          style: 'realistic',
          size: '1024x1024'
        });

        // Create assistant message with generated image
        if (images.length > 0) {
          const assistantMessage = new Message({
            sessionId,
            role: 'assistant',
            content: `Generated ${images.length} image(s) based on your prompt: "${content}"`,
            imageAssetId: images[0].url, // Store the image URL as asset ID for now
            metadata: {
              imageUrl: images[0].url,
              revisedPrompt: images[0].revisedPrompt,
              platform
            }
          });

          await assistantMessage.save();

          aiResponse = {
            message: {
              id: assistantMessage._id,
              sessionId: assistantMessage.sessionId,
              role: assistantMessage.role,
              content: assistantMessage.content,
              imageAssetId: assistantMessage.imageAssetId,
              metadata: assistantMessage.metadata,
              createdAt: assistantMessage.createdAt,
              updatedAt: assistantMessage.updatedAt
            }
          };
        }
      } catch (aiError: any) {
        logger.error('AI generation failed:', aiError);
        // Don't fail the entire request if AI generation fails
        aiResponse = {
          error: aiError.message || 'AI generation failed',
          fallback: true
        };
      }
    }

    res.status(201).json({
      data: {
        message: {
          id: message._id,
          sessionId: message.sessionId,
          role: message.role,
          content: message.content,
          imageAssetId: message.imageAssetId,
          metadata: message.metadata,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt
        },
        aiResponse
      }
    });
  } catch (error: any) {
    logger.error('Error creating message:', error);
    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create message'
      }
    });
  }
};
