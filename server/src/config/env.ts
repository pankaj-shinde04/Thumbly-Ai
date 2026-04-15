import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface Config {
  port: number;
  env: string;
  database: {
    url: string;
  };
  cors: {
    origin: string;
  };
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessTokenTtl: string;
    refreshTokenTtl: string;
  };
  storage: {
    driver: 'local' | 's3' | 'cloudinary';
    local: {
      uploadDir: string;
    };
    s3?: {
      bucket: string;
      region: string;
      accessKey: string;
      secretKey: string;
    };
    cloudinary?: {
      cloudName: string;
      apiKey: string;
      apiSecret: string;
      uploadPreset: string;
    };
  };
  ai: {
    provider: string;
    apiKey: string;
  };
  logging: {
    level: string;
    file: string;
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '4001', 10),
  env: process.env.NODE_ENV || 'development',
  
  database: {
    url: process.env.DATABASE_URL || 'mongodb://localhost:27017/thumbly-ai',
  },
  
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret-change-in-production',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production',
    accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
    refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || '30d',
  },
  
  storage: {
    driver: (process.env.STORAGE_DRIVER as 'local' | 's3' | 'cloudinary') || 'local',
    local: {
      uploadDir: process.env.UPLOAD_DIR || 'uploads',
    },
    s3: process.env.STORAGE_DRIVER === 's3' ? {
      bucket: process.env.S3_BUCKET || '',
      region: process.env.S3_REGION || 'us-east-1',
      accessKey: process.env.S3_ACCESS_KEY || '',
      secretKey: process.env.S3_SECRET_KEY || '',
    } : undefined,
    cloudinary: process.env.STORAGE_DRIVER === 'cloudinary' ? {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
      apiKey: process.env.CLOUDINARY_API_KEY || '',
      apiSecret: process.env.CLOUDINARY_API_SECRET || '',
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || '',
    } : undefined,
  },
  
  ai: {
    provider: process.env.AI_PROVIDER || 'openai',
    apiKey: process.env.AI_API_KEY || '',
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL'];

if (config.env === 'production') {
  requiredEnvVars.push('JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET');
}

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

export { config };
