import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config, isGeminiConfigured, isSupabaseConfigured } from './config/index.js';
import apiRouter from './routes/api.js';
import { apiLimiter } from './middleware/rateLimit.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// 1. Security Headers via Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// 2. Strict CORS Configuration
const allowedOrigins = [
  config.frontendOrigin,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (such as mobile apps, curl, or server-to-server)
      if (!origin || allowedOrigins.includes(origin) || config.nodeEnv === 'development') {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

// 3. General Rate Limiter
app.use('/api', apiLimiter);

// 4. Body Parsers with reasonable size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 5. Mount API Routes
app.use('/api', apiRouter);

// 6. Global Centralized Error Handler
app.use(errorHandler);

// 7. Start HTTP Server
const server = app.listen(config.port, () => {
  console.log(`=======================================================`);
  console.log(`🚀 CAREERPIVOT AI BACKEND SERVER ACTIVE`);
  console.log(`📡 URL: http://localhost:${config.port}`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
  console.log(`🤖 Gemini API: ${isGeminiConfigured ? '🟢 Live Connected' : '🟡 Offline / Demo Mode (Set GEMINI_API_KEY in server/.env)'}`);
  console.log(`🗄️ Supabase:   ${isSupabaseConfigured ? '🟢 Live Connected' : '🟡 Offline / Dev Fallback (Set SUPABASE_URL in server/.env)'}`);
  console.log(`=======================================================`);
});

export default app;
