import { z } from 'zod';

// ==========================================
// RESUME SCHEMAS
// ==========================================
export const resumeAnalyzeSchema = z.object({
  text: z.string().min(20, 'Resume text must be at least 20 characters long'),
  targetRole: z.string().optional(),
});

export const resumeParsedOutputSchema = z.object({
  name: z.string().nullable().optional(),
  summary: z.string(),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string().nullish(),
      year: z.string().nullish(),
      details: z.string().nullish(),
    })
  ).default([]),
  technicalSkills: z.array(z.string()).default([]),
  programmingLanguages: z.array(z.string()).default([]),
  frameworks: z.array(z.string()).default([]),
  softSkills: z.array(z.string()).default([]),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      technologies: z.array(z.string()).default([]),
      link: z.string().nullish(),
    })
  ).default([]),
  experience: z.array(
    z.object({
      role: z.string(),
      company: z.string().nullish(),
      duration: z.string().nullish(),
      responsibilities: z.array(z.string()).default([]),
    })
  ).default([]),
  certifications: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  strongSkills: z.array(z.string()).default([]),
  skillsRequiringEvidence: z.array(z.string()).default([]),
  missingSections: z.array(z.string()).default([]),
  improvementSuggestions: z.array(z.string()).default([]),
  overallScore: z.number().min(0).max(100).default(75),
  atsScore: z.number().min(0).max(100).default(75),
  scoreRubric: z.object({
    keywordMatch: z.number().default(20),
    quantifiedMetrics: z.number().default(18),
    structureAndLayout: z.number().default(20),
    roleAlignment: z.number().default(17),
  }).default({ keywordMatch: 20, quantifiedMetrics: 18, structureAndLayout: 20, roleAlignment: 17 }),
  missingKeywords: z.array(z.string()).default([]),
  recommendedSkills: z.array(z.string()).default([]),
  roleSuitability: z.string().default('Role alignment determined by evidence-based skill evaluation.'),
  grammarFeedback: z.array(z.string()).default([]),
  suggestedBullets: z.array(
    z.object({
      context: z.string(),
      starRewrite: z.string(),
      reason: z.string(),
    })
  ).default([]),
});

export type ResumeParsedOutput = z.infer<typeof resumeParsedOutputSchema>;

// ==========================================
// SKILL GAP SCHEMAS
// ==========================================
export const skillDetailSchema = z.object({
  skill: z.string(),
  importance: z.preprocess((val) => {
    if (typeof val === 'string') {
      const lower = val.toLowerCase();
      if (lower.includes('req')) return 'Required';
      if (lower.includes('pref')) return 'Preferred';
      if (lower.includes('med')) return 'Medium';
      if (lower.includes('low')) return 'Low';
      return 'High';
    }
    return 'High';
  }, z.enum(['High', 'Medium', 'Low', 'Required', 'Preferred'])).default('High'),
  resumeEvidence: z.string().default(''),
  proficiencyEstimated: z.string().default('Not assessed'),
  requiredProficiency: z.string().default('Intermediate'),
  suggestedAction: z.string().default(''),
});

export const skillGapRequestSchema = z.object({
  targetRole: z.string().min(2, 'Target role is required'),
  resumeText: z.string().optional(),
  resumeSkills: z.array(z.string()).optional(),
  jobDescriptionText: z.string().optional(),
  jobDescriptionId: z.string().uuid().optional(),
});

export const skillGapOutputSchema = z.object({
  targetRole: z.string(),
  matchPercentage: z.number().min(0).max(100),
  matchingSkills: z.array(skillDetailSchema),
  missingSkills: z.array(skillDetailSchema),
  needsEvidenceSkills: z.array(skillDetailSchema),
  explanation: z.string(),
  sourceDescription: z.string(),
});

export type SkillGapOutput = z.infer<typeof skillGapOutputSchema>;

// ==========================================
// ROADMAP SCHEMAS
// ==========================================
export const roadmapRequestSchema = z.object({
  targetRole: z.string().min(2),
  skillGaps: z.array(z.string()).default([]),
  existingSkills: z.array(z.string()).default([]),
  weeklyHours: z.number().min(1).max(80).default(10),
  learningPreferences: z.string().optional(),
});

export const taskResourceSchema = z.object({
  title: z.string(),
  url: z.string(),
  type: z.string().default('Documentation'),
});

export const roadmapDayTaskSchema = z.object({
  dayNumber: z.number(),
  title: z.string(),
  description: z.string(),
  practicalExercise: z.string(),
  deliverable: z.string(),
  resources: z.array(taskResourceSchema).default([]),
  assessmentQuestion: z.string(),
});

export const roadmapWeekSchema = z.object({
  weekNumber: z.number(),
  objective: z.string(),
  topics: z.array(z.string()),
  dailyTasks: z.array(roadmapDayTaskSchema),
});

export const roadmapOutputSchema = z.object({
  targetRole: z.string(),
  durationWeeks: z.number().default(4),
  overview: z.string(),
  weeks: z.array(roadmapWeekSchema),
});

export type RoadmapOutput = z.infer<typeof roadmapOutputSchema>;

// ==========================================
// PORTFOLIO PROJECT SCHEMAS
// ==========================================
export const projectRecommendSchema = z.object({
  targetRole: z.string().min(2),
  skillGaps: z.array(z.string()).default([]),
  existingSkills: z.array(z.string()).default([]),
});

export const portfolioProjectSchema = z.object({
  title: z.string(),
  problemStatement: z.string(),
  whyRecommended: z.string(),
  skillsDemonstrated: z.array(z.string()),
  technologies: z.array(z.string()),
  difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
  estimatedDuration: z.string(),
  features: z.array(z.string()),
  milestones: z.array(
    z.object({
      milestone: z.string(),
      deliverable: z.string(),
    })
  ),
  githubDeliverables: z.array(z.string()),
  targetRoleSupport: z.string(),
});

export const projectRecommendOutputSchema = z.object({
  targetRole: z.string(),
  projects: z.array(portfolioProjectSchema).min(1),
});

export type ProjectRecommendOutput = z.infer<typeof projectRecommendOutputSchema>;

// ==========================================
// MOCK INTERVIEW SCHEMAS
// ==========================================
export const interviewGenerateSchema = z.object({
  targetRole: z.string().min(2),
  interviewType: z.enum(['technical', 'hr', 'behavioral', 'coding']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  questionCount: z.number().min(1).max(10).default(5),
});

export const interviewQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  category: z.string(),
  hints: z.array(z.string()).default([]),
});

export const interviewEvaluateSchema = z.object({
  question: z.string(),
  userAnswer: z.string().min(5, 'Answer must be at least 5 characters long'),
  targetRole: z.string(),
  interviewType: z.enum(['technical', 'hr', 'behavioral', 'coding']).default('technical'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('intermediate'),
});

export const interviewScoreBreakdownSchema = z.object({
  technicalCorrectness: z.number().min(0).max(30),
  problemSolving: z.number().min(0).max(25),
  communication: z.number().min(0).max(20),
  practicalExamples: z.number().min(0).max(15),
  clarityStructure: z.number().min(0).max(10),
});

export const interviewEvaluationOutputSchema = z.object({
  score: z.number().min(0).max(100),
  breakdown: interviewScoreBreakdownSchema,
  positivePoints: z.array(z.string()),
  missingConcepts: z.array(z.string()),
  weakExplanations: z.array(z.string()),
  suggestedImprovements: z.array(z.string()),
  strongerExample: z.string(),
  evaluationNote: z.string().default('Scored using standard CareerPivot 100-point rubric. Not an official employer hiring prediction.'),
});

export type InterviewEvaluationOutput = z.infer<typeof interviewEvaluationOutputSchema>;

// ==========================================
// JOB APPLICATIONS SCHEMAS
// ==========================================
export const applicationCreateSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  jobUrl: z.string().url('Invalid URL format').optional().or(z.literal('')),
  jobCategory: z.string().default('Software Engineering'),
  applicationDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  status: z.enum(['Saved', 'Applied', 'Interested', 'Assessment', 'Interview', 'Offer', 'Rejected', 'Withdrawn']).default('Applied'),
  notes: z.string().optional(),
  recruiterName: z.string().optional(),
  recruiterEmail: z.string().optional(),
  interviewDate: z.string().optional(),
  followUpDate: z.string().optional(),
});

export const applicationUpdateSchema = applicationCreateSchema.partial();

// ==========================================
// USER ONBOARDING & PROFILE SCHEMAS
// ==========================================
export const profileOnboardingSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  education: z.string().min(2, 'Education level is required'),
  college: z.string().optional(),
  graduationYear: z.number().min(1970).max(2035).optional(),
  careerStage: z.enum(['Student', 'Fresh Graduate', 'Career Switcher', 'Working Professional']),
  currentSkills: z.array(z.string()).default([]),
  targetRole: z.string().min(2, 'Target role is required'),
  preferredIndustry: z.string().optional(),
  weeklyHours: z.number().min(1).max(80).default(10),
  targetDuration: z.string().default('1 Month'),
});
