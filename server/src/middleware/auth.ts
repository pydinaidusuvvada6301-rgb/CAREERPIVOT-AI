import { Request, Response, NextFunction } from 'express';
import { getSupabase, isSupabaseConfigured } from '../config/index.js';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
  isDemoUser?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Check if local dev demo mode is allowed when Supabase is unconfigured
      if (!isSupabaseConfigured) {
        req.user = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'demo@careerpivot.ai',
          role: 'authenticated',
          isDemoUser: true,
        };
        return next();
      }

      res.status(401).json({
        error: 'Unauthorized',
        message: 'Missing or malformed Authorization header with Bearer token',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    // If client is sending a mock demo token in dev mode
    if (token === 'demo-token' || !isSupabaseConfigured) {
      req.user = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'demo@careerpivot.ai',
        role: 'authenticated',
        isDemoUser: true,
      };
      return next();
    }

    const supabase = getSupabase();
    if (!supabase) {
      res.status(500).json({ error: 'Database service unavailable' });
      return;
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        error: 'Unauthorized',
        message: error?.message || 'Invalid or expired session token',
      });
      return;
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      isDemoUser: false,
    };

    next();
  } catch (err: any) {
    res.status(401).json({
      error: 'Authentication failed',
      message: err.message || 'Unable to authenticate request',
    });
  }
};
