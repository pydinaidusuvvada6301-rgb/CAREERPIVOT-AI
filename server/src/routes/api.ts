import { Router } from 'express';
import {
  analyzeResumeHandler,
  analyzeSkillGapHandler,
  generateRoadmapHandler,
  recommendProjectsHandler,
  generateInterviewHandler,
  evaluateInterviewHandler,
  getSampleJobsHandler,
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
import { isGeminiConfigured, isSupabaseConfigured } from '../config/index.js';

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
