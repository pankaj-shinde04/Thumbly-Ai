import app from './app';
import { config } from './config/env';
import { logger } from './lib/logger';
import mongoose from 'mongoose';

const PORT = config.port || 4001;

// Connect to MongoDB - REPLACE THIS WITH YOUR ATLAS CONNECTION STRING
const connectionString = 'mongodb+srv://pankajshinde2434_db_user:Pass%40123@cluster0.rytkgff.mongodb.net/?appName=Cluster0';

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    logger.info('🗄️ Connected to MongoDB successfully');
    
    // Test connection and list databases
    mongoose.connection.db.admin().listDatabases()
      .then((databases: any) => {
        logger.info('📊 Available databases:', databases.databases.map((db: any) => db.name));
      })
      .catch((error: any) => {
        logger.error('Error listing databases:', error);
      });
  })
  .catch((error) => {
    logger.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Handle MongoDB connection events
mongoose.connection.on('error', (error) => {
  logger.error('MongoDB connection error:', error);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server is running on port ${PORT}`);
  logger.info(`📝 Environment: ${config.env}`);
  logger.info(`🌐 CORS Origin: ${config.cors.origin}`);
  logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  mongoose.connection.close(() => {
    logger.info('MongoDB connection closed');
    server.close(() => {
      logger.info('Process terminated');
      process.exit(0);
    });
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default server;
