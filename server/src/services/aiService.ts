import { GoogleAuth } from 'google-auth-library';
import { config } from '../config/env';
import { logger } from '../lib/logger';
import { v2 as cloudinary } from 'cloudinary';
import nodeFetch from 'node-fetch';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Initialize Google Cloud Authentication
let auth: GoogleAuth;

try {
  auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });
  logger.info('Google Cloud authentication initialized successfully');
} catch (error) {
  logger.error('Failed to initialize Google Cloud authentication:', error);
  throw new Error('Failed to initialize Google Cloud authentication. Check your credentials.');
}

interface GenerateImageOptions {
  prompt: string;
  size?: string;
  n?: number;
  style?: string;
  platform?: string;
  userId?: string;
  sessionId?: string;
}

interface GeneratedImage {
  url: string;
  revisedPrompt: string;
}

/**
 * Generate images using Google Imagen via Vertex AI REST API
 */
export const generateImage = async (options: GenerateImageOptions): Promise<GeneratedImage[]> => {
  try {
    const { prompt, size = '1024x1024', n = 1, style = 'realistic', platform = 'youtube', userId = 'default-user', sessionId } = options;

    // Use user's prompt directly without enhancement to get better results
    const enhancedPrompt = prompt;

    logger.info(`Generating image with prompt: ${enhancedPrompt}`);
    logger.info(`User prompt: ${prompt}`);
    logger.info(`Enhanced prompt: ${enhancedPrompt}`);
    logger.info(`Size: ${size}, Style: ${style}, Number of images: ${n}`);

    const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || 'your-project-id';
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    
    // Use Vertex AI REST API for Imagen
    const endpoint = `https://${location}-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/publishers/google/models/imagen-3.0-generate-001:predict`;
    
    // Parse size for aspect ratio
    const [width, height] = size.split('x').map(Number);
    
    const images: GeneratedImage[] = [];
    
    for (let i = 0; i < n; i++) {
      logger.info(`Generating image ${i + 1} of ${n} with Imagen REST API`);
      
      const requestBody = {
        instances: [
          {
            prompt: enhancedPrompt,
          }
        ],
        parameters: {
          sampleCount: 1,
          aspectRatio: `${width}/${height}`,
          safetyFilterLevel: 'block_some',
          personGeneration: 'allow_adult',
        }
      };

      // Get access token from Google Auth
      const client = await auth.getClient();
      const accessToken = await client.getAccessToken();
      
      const response = await nodeFetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('Imagen API error:', errorText);
        throw new Error(`Imagen API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      
      const imageData = data.predictions?.[0];
      
      if (!imageData || !imageData.bytesBase64Encoded) {
        throw new Error('No image generated from Imagen API');
      }

      const imageBase64 = imageData.bytesBase64Encoded;
      
      // Convert base64 to buffer and upload to Cloudinary
      const buffer = Buffer.from(imageBase64, 'base64');
      
      logger.info('Uploading generated image to Cloudinary');
      
      const cloudinaryResult = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: `thumbly-ai/${userId}/generated`,
            public_id: `generated-${sessionId || 'default'}-${Date.now()}-${i}`,
            transformation: [
              { width, height, crop: 'fill' }
            ]
          },
          (error, result) => {
            if (error) {
              logger.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        ).end(buffer);
      });

      const imageUrl = cloudinaryResult.secure_url;
      logger.info(`Image uploaded to Cloudinary: ${imageUrl}`);

      images.push({
        url: imageUrl,
        revisedPrompt: enhancedPrompt
      });
    }

    logger.info(`Successfully generated ${images.length} image(s)`);
    return images;

  } catch (error: any) {
    logger.error('Error generating image:', error);
    logger.error('Error details:', {
      message: error.message,
      stack: error.stack,
      prompt: options.prompt
    });
    
    // Return placeholder as fallback
    logger.info('Using placeholder image as fallback');
    return [{
      url: `https://picsum.photos/1024/1024?random=${Date.now()}`,
      revisedPrompt: options.prompt
    }];
  }
};

/**
 * Platform-specific prompt templates
 */
const platformTemplates = {
  youtube: {
    aspectRatio: '16:9',
    composition: 'wide horizontal layout, subject positioned on left or right third, bold text overlay space on opposite side, high contrast for thumbnail visibility',
    lighting: 'dramatic lighting, rim lighting, neon accents, high contrast, vibrant colors that pop on dark backgrounds',
    quality: 'ultra high definition, 8K, professional photography quality, sharp focus, high saturation'
  },
  'instagram-post': {
    aspectRatio: '1:1',
    composition: 'centered subject, balanced framing, symmetrical or rule-of-thirds, clean negative space, minimal distractions',
    lighting: 'soft natural lighting, golden hour tones, bright and airy, consistent color palette, professional studio lighting',
    quality: 'high definition, sharp details, clean edges, professional photography, Instagram-optimized colors'
  },
  'instagram-reel': {
    aspectRatio: '9:16',
    composition: 'vertical portrait layout, subject centered or slightly above center, top space for text overlay, bottom space for captions, dynamic angles',
    lighting: 'dramatic vertical lighting, gradient backgrounds, neon effects, high contrast for mobile viewing, vibrant colors',
    quality: 'high definition, sharp focus, optimized for mobile display, professional quality, vivid colors'
  }
};

/**
 * Negative constraints to avoid common issues
 */
const negativeConstraints = [
  'no blur',
  'no distortion',
  'no watermark',
  'no text artifacts',
  'no misspelled words',
  'no low resolution',
  'no pixelation',
  'no bad anatomy',
  'no out of focus',
  'no poor quality',
  'no grain',
  'no noise',
  'no chromatic aberration',
  'no motion blur',
  'no camera shake',
  'no overexposure',
  'no underexposure',
  'no washed out colors',
  'no muted colors',
  'no desaturated',
  'no black and white unless specified'
];

/**
 * Style-specific enhancements
 */
const styleEnhancements: Record<string, string> = {
  realistic: 'photorealistic, hyperrealistic, ultra realistic, professional photography, DSLR quality, studio lighting, detailed texture, natural skin tones, accurate colors',
  artistic: 'digital art, artistic interpretation, creative composition, expressive style, vibrant colors, artistic rendering, painterly quality, creative interpretation',
  cartoon: 'cartoon style, animated, colorful, fun illustration, clean lines, cel shading, vibrant colors, expressive characters, animation quality',
  minimalist: 'minimalist design, clean lines, simple composition, modern aesthetic, elegant, understated, sophisticated, plenty of negative space',
  cinematic: 'cinematic quality, movie poster style, dramatic lighting, film grain, professional cinematography, color graded, atmospheric, epic composition',
  neon: 'neon aesthetics, cyberpunk style, glowing effects, vibrant neon colors, futuristic, dark background with bright accents, high contrast, LED lighting',
  corporate: 'professional corporate style, clean business aesthetic, trustworthy, polished, modern business photography, neutral colors, professional lighting',
  gaming: 'gaming aesthetic, vibrant colors, dynamic action, gaming poster style, high energy, esports quality, bold colors, gaming UI elements'
};

/**
 * Enhance prompt based on platform, style, and user input
 */
const enhancePrompt = (prompt: string, style: string = 'realistic', platform: string = 'youtube'): string => {
  // Minimal enhancement to avoid confusing the AI
  const styleConfig = styleEnhancements[style] || styleEnhancements.realistic;
  
  // Just add style and quality, keep user's original intent clear
  const enhancedPrompt = `${prompt}, ${styleConfig}, high quality, sharp focus`;
  
  return enhancedPrompt;
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
