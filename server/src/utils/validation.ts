import { z } from 'zod';

// Auth validation schemas
export const signupSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(6)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1)
});

// Session validation schemas
export const createSessionSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  platform: z.enum(['youtube', 'instagram-post', 'instagram-reel'])
});

export const updateSessionSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  platform: z.enum(['youtube', 'instagram-post', 'instagram-reel']).optional(),
  status: z.enum(['draft', 'completed']).optional()
});

// Message validation schemas
export const createMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(5000),
  imageAssetId: z.string().optional()
});

// AI validation schemas
export const generateImageSchema = z.object({
  sessionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),
  prompt: z.string().min(1).max(4000),
  platform: z.enum(['youtube', 'instagram-post', 'instagram-reel']).optional(),
  style: z.enum(['realistic', 'artistic', 'cartoon', 'minimalist']).optional(),
  size: z.enum(['256x256', '512x512', '1024x1024']).optional()
});

export const regenerateImageSchema = z.object({
  sessionId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId'),
  messageId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid MongoDB ObjectId')
});

// Gallery validation schemas
export const getGallerySchema = z.object({
  q: z.string().optional(),
  platform: z.enum(['youtube', 'instagram-post', 'instagram-reel', 'all']).optional(),
  page: z.string().regex(/^\d+$/).optional(),
  limit: z.string().regex(/^\d+$/).optional()
});

// Helper function to validate request body
export const validateBody = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  return schema.parse(data);
};

// Helper function to validate query parameters
export const validateQuery = <T>(schema: z.ZodSchema<T>, data: unknown): T => {
  return schema.parse(data);
};
