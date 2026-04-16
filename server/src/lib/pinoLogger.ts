import pino from 'pino';
import { config } from '../config/env';

// Create pino logger instance
export const logger = pino({
  level: config.logging.level || 'info',
  transport: config.env === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss Z',
      ignore: 'pid,hostname'
    }
  } : undefined,
  timestamp: pino.stdTimeFunctions.isoTime,
  formatters: {
    level: (label) => {
      return { level: label };
    }
  },
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res
  }
});

// Create child logger with additional context
export const createChildLogger = (context: Record<string, any>) => {
  return logger.child(context);
};
