import { Request, Response, NextFunction } from 'express';

export interface ApiError extends Error {
  status?: number;
  message: string;
}

/**
 * Custom error middleware for Express
 * Catches all errors and returns structured response
 */
export const errorHandler = (
  err: ApiError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const status = (err as ApiError).status || 500;
  const message = err.message || 'Internal server error';

  console.error(`[ERROR] ${status} - ${message}`, {
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
    stack: err.stack,
  });

  res.status(status).json({
    error: true,
    status,
    message,
    timestamp: new Date().toISOString(),
    path: req.path,
  });
};

/**
 * Wrapper for async route handlers to catch errors
 * Usage: router.get('/path', asyncHandler(async (req, res) => { ... }))
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error classes for specific error types
 */
export class AppError extends Error implements ApiError {
  status: number;

  constructor(message: string, status: number = 500) {
    super(message);
    this.status = status;
    this.name = 'AppError';
  }
}

export class BadRequestError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = 'BadRequestError';
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded') {
    super(message, 429);
    this.name = 'RateLimitError';
  }
}

export class ExternalApiError extends AppError {
  constructor(
    message: string,
    public apiName: string,
    public originalError?: any
  ) {
    super(message, 502);
    this.name = 'ExternalApiError';
  }
}
