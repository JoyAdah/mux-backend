import { Request, Response, NextFunction } from 'express';

/**
 * Request logging middleware that logs incoming requests with correlation IDs.
 *
 * This middleware logs the request method, path, and correlation ID
 * for observability. It integrates with the request-id interceptor
 * to propagate correlation IDs across services.
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] as string | undefined;

  // Log the incoming request
  const logData = {
    method: req.method,
    path: req.path,
    requestId: requestId ?? 'none',
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  };

  console.log('Incoming request:', JSON.stringify(logData));

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const responseLog = {
      ...logData,
      statusCode: res.statusCode,
      durationMs: duration,
    };
    console.log('Response:', JSON.stringify(responseLog));
  });

  next();
}

export default requestLogger;