import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/env';
import { errorHandler } from './middlewares/errorHandler';
import { requestLogger } from './middlewares/requestLogger';
import { requestId } from './middlewares/requestId';

// Import routes (will be created later)
// import authRoutes from './modules/auth/routes';
// import sessionRoutes from './modules/sessions/routes';
// import assetRoutes from './modules/assets/routes';
// import aiRoutes from './modules/ai/routes';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: config.cors.origin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request ID middleware
app.use(requestId);

// Logging middleware
app.use(morgan('combined'));
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req: any, res: any) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.env
  });
});

// API routes
app.use('/api/v1', (req: any, res: any, next: any) => {
  res.setHeader('Content-Type', 'application/json');
  next();
});

// Placeholder routes (will be implemented later)
// app.use('/api/v1/auth', authRoutes);
// app.use('/api/v1/sessions', sessionRoutes);
// app.use('/api/v1/assets', assetRoutes);
// app.use('/api/v1/ai', aiRoutes);

// 404 handler
app.use('*', (req: any, res: any) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
      details: {
        path: req.originalUrl,
        method: req.method
      }
    }
  });
});

// Error handling middleware
app.use(errorHandler as any);

export default app;
