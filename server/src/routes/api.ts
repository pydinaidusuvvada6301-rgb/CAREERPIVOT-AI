import { Router } from 'express';
import {
  analyzeResumeHandler,
  analyzeSkillGapHandler,
  generateRoadmapHandler,
  recommendProjectsHandler,
  generateInterviewHandler,
  evaluateInterviewHandler,
  getSampleJobsHandler,
  assessCareerHandler,
  mentorChatHandler,
} from '../controllers/careerController.js';
import {
  getApplicationsHandler,
  createApplicationHandler,
  updateApplicationHandler,
  deleteApplicationHandler,
} from '../controllers/applicationController.js';
import {
  getProgressHandler,
  updateProgressHandler,
} from '../controllers/progressController.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadResume } from '../middleware/upload.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import { isGeminiConfigured, isSupabaseConfigured, getSupabase } from '../config/index.js';

const router = Router();

// ==========================================
// SYSTEM HEALTH ENDPOINT
// ==========================================
router.get('/health', (_req, res) => {
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

// ==========================================
// DIRECT SECURE REGISTRATION (Bypasses Email Rate Limits)
// ==========================================
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const supabase = getSupabase();
    if (!supabase) {
      res.status(500).json({ error: 'Database service unavailable' });
      return;
    }

    // Use admin service role to create user and auto-confirm email
    const { data, error } = await supabase.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName || '' },
    });

    if (error) {
      if (
        error.message.toLowerCase().includes('already registered') ||
        error.message.toLowerCase().includes('already exists')
      ) {
        res.status(400).json({
          error: 'User already registered',
          message: 'This email is already registered. Please sign in on the login page.',
        });
        return;
      }
      res.status(400).json({ error: 'Registration error', message: error.message });
      return;
    }

    res.status(201).json({
      success: true,
      user: data.user,
      message: 'Account created and verified successfully.',
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error', message: err.message });
  }
});

// ==========================================
// RESUME ANALYZER (Part 6)
// ==========================================
router.post(
  '/resume/analyze',
  requireAuth,
  aiLimiter,
  uploadResume.single('resume'),
  analyzeResumeHandler
);

// ==========================================
// SKILL GAP ANALYZER (Part 7 & 8)
// ==========================================
router.post(
  '/skills/analyze',
  requireAuth,
  aiLimiter,
  analyzeSkillGapHandler
);

// ==========================================
// PERSONALIZED ROADMAP (Part 9)
// ==========================================
router.post(
  '/roadmap/generate',
  requireAuth,
  aiLimiter,
  generateRoadmapHandler
);

// ==========================================
// PORTFOLIO PROJECT RECOMMENDATIONS (Part 10)
// ==========================================
router.post(
  '/projects/recommend',
  requireAuth,
  aiLimiter,
  recommendProjectsHandler
);

// ==========================================
// AI MOCK INTERVIEW (Part 11)
// ==========================================
router.post(
  '/interview/generate',
  requireAuth,
  aiLimiter,
  generateInterviewHandler
);

router.post(
  '/interview/evaluate',
  requireAuth,
  aiLimiter,
  evaluateInterviewHandler
);

// ==========================================
// AI CAREER ASSESSMENT & RECOMMENDATIONS (Part 5 & 6)
// ==========================================
router.post(
  '/career/assess',
  requireAuth,
  aiLimiter,
  assessCareerHandler
);

// ==========================================
// AI CAREER MENTOR (Part 10)
// ==========================================
router.post(
  '/mentor/chat',
  requireAuth,
  aiLimiter,
  mentorChatHandler
);


// ==========================================
// VERIFIED SAMPLE JOB POSTINGS
// ==========================================
router.get(
  '/job-descriptions/samples',
  requireAuth,
  getSampleJobsHandler
);

// ==========================================
// PROGRESS TRACKER (Part 12)
// ==========================================
router.get(
  '/progress',
  requireAuth,
  getProgressHandler
);

router.post(
  '/progress',
  requireAuth,
  updateProgressHandler
);

// ==========================================
// JOB APPLICATION TRACKER (Part 13)
// ==========================================
router.get(
  '/applications',
  requireAuth,
  getApplicationsHandler
);

router.post(
  '/applications',
  requireAuth,
  createApplicationHandler
);

router.patch(
  '/applications/:id',
  requireAuth,
  updateApplicationHandler
);

router.delete(
  '/applications/:id',
  requireAuth,
  deleteApplicationHandler
);

export default router;
