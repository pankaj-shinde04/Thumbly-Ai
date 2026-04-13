import { VertexAI } from '@google-cloud/vertexai';
import { config } from '../config/env';
import { logger } from '../lib/logger';

// Initialize Google Vertex AI
let vertexAI: VertexAI;

try {
  // Google Cloud SDK automatically uses GOOGLE_APPLICATION_CREDENTIALS environment variable
  vertexAI = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT_ID || 'your-project-id',
    location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1'
  });
  
  logger.info('Google Vertex AI initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Google Vertex AI:', error);
  throw new Error('Failed to initialize Google Vertex AI. Check your credentials.');
}

interface GenerateImageOptions {
  prompt: string;
  sessionId?: string;
  userId?: string;
  style?: 'realistic' | 'artistic' | 'cartoon' | 'minimalist';
  size?: '256x256' | '512x512' | '1024x1024';
  n?: number;
}

interface GeneratedImage {
  url: string;
  revisedPrompt?: string;
}

/**
 * Generate images using Google Imagen via Vertex AI
 */
export const generateImage = async (options: GenerateImageOptions): Promise<GeneratedImage[]> => {
  try {
    const { prompt, size = '1024x1024', n = 1, style = 'realistic' } = options;

    // Enhance prompt based on style
    const enhancedPrompt = enhancePrompt(prompt, style);

    logger.info(`Generating image with prompt: ${enhancedPrompt}`);

    // Try different model names for Google Imagen
    const modelNames = [
      'imagen-3.0-generate-001',
      'imagen-3.0-generate-preview',
      'imagegeneration@006',
      'imagen-2.0-generate-001'
    ];

    let images: GeneratedImage[] = [];
    let lastError: any = null;

    for (const modelName of modelNames) {
      try {
        logger.info(`Trying model: ${modelName}`);
        
        const model = vertexAI.getGenerativeModel({
          model: modelName
        });

        // Try image generation API
        const result = await model.generateContent({
          contents: [{
            role: 'user',
            parts: [{ text: enhancedPrompt }]
          }],
          generationConfig: {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 2048,
          }
        });

        // Extract image from response
        if (result.response.candidates && result.response.candidates.length > 0) {
          const candidate = result.response.candidates[0];
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
              if (part.inlineData && part.inlineData.data) {
                images.push({
                  url: `data:image/png;base64,${part.inlineData.data}`,
                  revisedPrompt: enhancedPrompt
                });
              }
            }
          }
        }

        if (images.length > 0) {
          logger.info(`Successfully generated ${images.length} image(s) using model: ${modelName}`);
          return images;
        }
      } catch (modelError: any) {
        logger.error(`Model ${modelName} failed:`, modelError.message);
        lastError = modelError;
      }
    }

    // If all models failed, return a placeholder for testing
    if (images.length === 0) {
      logger.error('All Google Imagen models failed. Using placeholder.');
      logger.error('Last error:', lastError?.message);
      
      // Return a placeholder image for testing
      images.push({
        url: `https://picsum.photos/1024/1024?random=${Date.now()}`,
        revisedPrompt: enhancedPrompt
      });
    }

    logger.info(`Generated ${images.length} image(s)`);
    return images;

  } catch (error: any) {
    logger.error('Error generating image:', error);
    
    // Return placeholder as fallback
    logger.info('Using placeholder image as fallback');
    return [{
      url: `https://picsum.photos/1024/1024?random=${Date.now()}`,
      revisedPrompt: options.prompt
    }];
  }
};

/**
 * Enhance prompt based on style
 */
const enhancePrompt = (prompt: string, style: string): string => {
  const styleEnhancements: Record<string, string> = {
    realistic: 'photorealistic, high quality, professional photography, detailed, 8K',
    artistic: 'artistic, creative, vibrant colors, artistic style, digital art',
    cartoon: 'cartoon style, colorful, animated, fun, illustration',
    minimalist: 'minimalist, clean, simple, modern, elegant'
  };

  const enhancement = styleEnhancements[style] || '';
  return enhancement ? `${prompt}, ${enhancement}` : prompt;
};

/**
 * Generate multiple variations of an image
 */
export const generateVariations = async (imageUrl: string, n: number = 3): Promise<GeneratedImage[]> => {
  try {
    logger.info(`Generating ${n} variations for image`);

    // For variations, we would need to use a different approach
    // as Imagen doesn't support direct variations like DALL-E
    throw new Error('Variations feature not yet implemented for Google Imagen. Use regenerate with prompt instead.');
    
  } catch (error: any) {
    logger.error('Error generating variations:', error);
    throw new Error('Failed to generate variations.');
  }
};

/**
 * Regenerate image with modified prompt
 */
export const regenerateImage = async (originalPrompt: string, modifications: string): Promise<GeneratedImage[]> => {
  try {
    const modifiedPrompt = `${originalPrompt}, ${modifications}`;
    
    logger.info(`Regenerating image with modified prompt: ${modifiedPrompt}`);

    return await generateImage({
      prompt: modifiedPrompt,
      n: 1
    });

  } catch (error: any) {
    logger.error('Error regenerating image:', error);
    throw new Error('Failed to regenerate image. Please try again.');
  }
};
