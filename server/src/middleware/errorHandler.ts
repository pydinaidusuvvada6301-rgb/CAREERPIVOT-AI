import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { MulterError } from 'multer';
import { config } from '../config/index.js';

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Handle Zod Schema Validation Errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Request payload validation failed',
      issues: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Handle Multer Errors (e.g. file too large)
  if (err instanceof MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        error: 'File Too Large',
        message: 'Resume file size exceeds the maximum limit of 5 MB.',
      });
      return;
    }
    res.status(400).json({
      error: 'Upload Error',
      message: err.message,
    });
    return;
  }

  // Handle custom upload errors
  if (err.message && err.message.includes('Invalid file type')) {
    res.status(400).json({
      error: 'Unsupported File Type',
      message: err.message,
    });
    return;
  }

  console.error('Unhandled Server Error:', err);

  const status = err.status || 500;
  const isProd = config.nodeEnv === 'production';

  res.status(status).json({
    error: err.name || 'Internal Server Error',
    message: isProd ? 'An unexpected error occurred. Please try again later.' : err.message,
    ...(isProd ? {} : { stack: err.stack }),
  });
};
