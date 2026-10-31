import rateLimit from 'express-rate-limit';

// General API rate limiter (100 requests per 15 minutes)
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'Rate limit exceeded. Please wait a few minutes before trying again.',
  },
});

// Stricter rate limiter for expensive AI endpoints (30 requests per 10 minutes)
export const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'AI request limit reached',
    message: 'You have reached the maximum number of AI generation requests. Please wait a short while.',
  },
});
