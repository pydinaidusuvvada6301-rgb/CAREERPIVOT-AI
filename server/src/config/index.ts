import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
};

// Check if Gemini is configured
export const isGeminiConfigured = Boolean(
  config.geminiApiKey && config.geminiApiKey.trim() !== '' && !config.geminiApiKey.includes('placeholder')
);

// Check if Supabase is configured
export const isSupabaseConfigured = Boolean(
  config.supabaseUrl && 
  config.supabaseAnonKey && 
  !config.supabaseUrl.includes('placeholder') &&
  !config.supabaseAnonKey.includes('placeholder')
);

// Gemini Client
let geminiInstance: GoogleGenerativeAI | null = null;
if (isGeminiConfigured) {
  try {
    geminiInstance = new GoogleGenerativeAI(config.geminiApiKey);
  } catch (err) {
    console.error('Failed to initialize Google Generative AI:', err);
  }
}

export const getGemini = () => geminiInstance;

// Supabase Admin/Auth Client
let supabaseInstance: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  try {
    supabaseInstance = createClient(
      config.supabaseUrl,
      config.supabaseServiceRoleKey || config.supabaseAnonKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
  }
}

export const getSupabase = () => supabaseInstance;
