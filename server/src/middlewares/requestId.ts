import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

declare module 'express' {
  interface Request {
    id: string;
  }
}

export const requestId = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  req.id = uuidv4();
  
  // Set request ID in response header for debugging
  res.setHeader('X-Request-ID', req.id);
  
  next();
};
