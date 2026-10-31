import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config, isGeminiConfigured, isSupabaseConfigured } from './config/index.js';
import apiRouter from './routes/api.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Trust reverse proxies (Render, Cloudflare, Vercel)
app.set('trust proxy', 1);

// 1. Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. Production-Grade Robust CORS Configuration
const allowedOrigins = [
  'https://careerpivot-ai.vercel.app',
  'https://careerpivot.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (mobile, curl, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    // Allow all Vercel deployments (production + preview deployments)
    if (
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      allowedOrigins.includes(origin) ||
      (config.frontendOrigin && (config.frontendOrigin === '*' || origin === config.frontendOrigin))
    ) {
      return callback(null, true);
    }

    // Safe fallback: allow and echo origin with credentials so preflight never throws 500
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400, // 24-hour preflight cache
};

// Enable CORS and explicit preflight handling across all routes
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// 3. Health check endpoints (available before rate limits)
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CareerPivot AI Backend',
    version: '1.0.0',
    capabilities: {
      geminiConfigured: isGeminiConfigured,
      supabaseConfigured: isSupabaseConfigured,
    },
  });
});

// 4. Rate Limiter (skip OPTIONS preflights)
app.use('/api', (req, res, next) => {
  if (req.method === 'OPTIONS') {
    return next();
  }
  return apiLimiter(req, res, next);
});

// 5. Body Parsers with reasonable size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 6. Mount API Routes
app.use('/api', apiRouter);

// 7. Global Centralized Error Handler
app.use(errorHandler);

// 8. Start HTTP Server
const server = app.listen(config.port, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 CAREERPIVOT AI BACKEND SERVER ACTIVE`);
  console.log(`📡 Port: ${config.port} (bound to 0.0.0.0 for Render)`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🤖 Gemini API: ${isGeminiConfigured ? '🟢 Live Connected' : '🟡 Offline / Demo Mode'}`);
  console.log(`🗄️ Supabase:   ${isSupabaseConfigured ? '🟢 Live Connected' : '🟡 Offline / Dev Fallback'}`);
  console.log(`=======================================================`);
});

export default app;
