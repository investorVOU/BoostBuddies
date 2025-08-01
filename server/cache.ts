
import { Request, Response, NextFunction } from 'express';

interface CacheOptions {
  duration: number; // in seconds
  key?: (req: Request) => string;
}

const cache = new Map<string, { data: any; timestamp: number; maxAge: number }>();

export function cacheMiddleware(options: CacheOptions) {
  return (req: Request, res: Response, next: NextFunction) => {
    const cacheKey = options.key ? options.key(req) : req.originalUrl;
    const cached = cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp) < cached.maxAge * 1000) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('Cache-Control', `public, max-age=${options.duration}`);
      return res.json(cached.data);
    }
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(body: any) {
      cache.set(cacheKey, {
        data: body,
        timestamp: Date.now(),
        maxAge: options.duration
      });
      
      res.setHeader('X-Cache', 'MISS');
      res.setHeader('Cache-Control', `public, max-age=${options.duration}`);
      return originalJson.call(this, body);
    };
    
    next();
  };
}

// Clean up expired cache entries every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > value.maxAge * 1000) {
      cache.delete(key);
    }
  }
}, 10 * 60 * 1000);
