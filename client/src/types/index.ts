export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string;
  education?: string;
  college?: string;
  graduationYear?: number;
  careerStage?: string;
  currentSkills?: string[];
  targetRole?: string;
  preferredIndustry?: string;
  weeklyHours?: number;
  targetDuration?: string;
}

export interface ResumeEducation {
  degree: string;
  institution: string;
  year?: string;
  details?: string;
}

export interface ResumeProject {
  name: string;
  description: string;
  technologies: string[];
  link?: string;
}

export interface ResumeExperience {
  role: string;
  company: string;
  duration?: string;
  responsibilities: string[];
}

export interface ResumeScoreRubric {
  keywordMatch: number;
  quantifiedMetrics: number;
  structureAndLayout: number;
  roleAlignment: number;
}

export interface SuggestedBullet {
  context: string;
  starRewrite: string;
  reason: string;
}

export interface ResumeParsedData {
  name?: string | null;
  summary: string;
  education: ResumeEducation[];
  technicalSkills: string[];
  programmingLanguages: string[];
  frameworks: string[];
  softSkills?: string[];
  projects: ResumeProject[];
  experience: ResumeExperience[];
  certifications: string[];
  achievements: string[];
  strongSkills: string[];
  skillsRequiringEvidence: string[];
  missingSections: string[];
  improvementSuggestions: string[];
  overallScore?: number;
  atsScore?: number;
  scoreRubric?: ResumeScoreRubric;
  missingKeywords?: string[];
  recommendedSkills?: string[];
  roleSuitability?: string;
  grammarFeedback?: string[];
  suggestedBullets?: SuggestedBullet[];
}

export interface SkillDetail {
  skill: string;
  importance: 'Required' | 'High' | 'Medium' | 'Low' | 'Preferred';
  resumeEvidence: string;
  proficiencyEstimated: string;
  requiredProficiency: string;
  suggestedAction: string;
}

export interface SkillGapData {
  targetRole: string;
  matchPercentage: number;
  matchingSkills: SkillDetail[];
  missingSkills: SkillDetail[];
  needsEvidenceSkills: SkillDetail[];
  explanation: string;
  sourceDescription: string;
}

export interface TaskResource {
  title: string;
  url: string;
  type: string;
}

export interface RoadmapDayTask {
  dayNumber: number;
  title: string;
  description: string;
  practicalExercise: string;
  deliverable: string;
  resources: TaskResource[];
  assessmentQuestion: string;
  completed?: boolean;
}

export interface RoadmapWeek {
  weekNumber: number;
  objective: string;
  topics: string[];
  dailyTasks: RoadmapDayTask[];
}

export interface RoadmapData {
  targetRole: string;
  durationWeeks: number;
  overview: string;
  weeks: RoadmapWeek[];
}

export interface ProjectMilestone {
  milestone: string;
  deliverable: string;
}

export interface PortfolioProject {
  title: string;
  problemStatement: string;
  whyRecommended: string;
  skillsDemonstrated: string[];
  technologies: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: string;
  features: string[];
  milestones: ProjectMilestone[];
  githubDeliverables: string[];
  targetRoleSupport: string;
}

export interface InterviewQuestionItem {
  id: string;
  question: string;
  category: string;
  hints: string[];
}

export interface InterviewScoreBreakdown {
  technicalCorrectness: number;
  problemSolving: number;
  communication: number;
  practicalExamples: number;
  clarityStructure: number;
}

export interface InterviewEvaluation {
  score: number;
  breakdown: InterviewScoreBreakdown;
  positivePoints: string[];
  missingConcepts: string[];
  weakExplanations: string[];
  suggestedImprovements: string[];
  strongerExample: string;
  evaluationNote: string;
}

export interface JobApplication {
  id: string;
  companyName: string;
  jobTitle: string;
  jobUrl?: string;
  jobCategory: string;
  applicationDate: string;
  status: 'Interested' | 'Applied' | 'Assessment' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn' | 'Saved';
  notes?: string;
  recruiterName?: string;
  recruiterEmail?: string;
  interviewDate?: string;
  followUpDate?: string;
}

export interface ApplicationAnalytics {
  totalApplications: number;
  totalResponses: number;
  interviewInvitations: number;
  rejections: number;
  offers: number;
  responseRate: number;
  interviewConversionRate: number;
  categoryBreakdown: {
    category: string;
    total: number;
    interviews: number;
    offers: number;
  }[];
  sampleSize: number;
  dateRange: {
    earliest: string | null;
    latest: string | null;
  };
  statisticalNote: string;
}

export interface ProgressSummary {
  userId: string;
  targetRole: string;
  tasksCompleted: number;
  totalTasks: number;
  streakDays: number;
  lastActivityDate: string;
  averageInterviewScore: number;
  recentAssessments: { topic: string; score: number; date: string }[];
  completedProjectsCount: number;
}

export interface ProgressRecommendations {
  summary: string;
  recommendations: string[];
  recommendedPractice: string;
  revisedScheduleFocus: string;
  portfolioRefinements: string[];
}

export interface CareerAssessmentInput {
  degree: string;
  branch: string;
  academicYear: string;
  technicalSkills: string[];
  programmingLanguages: string[];
  interests: string[];
  workExperience: string;
  preferredIndustries: string[];
  careerGoal: string;
  preferredEnvironment: 'Remote' | 'Hybrid' | 'On-site' | 'Flexible';
  learningPreferences: string[];
  preferredLocation?: string;
  salaryExpectations?: string;
}

export interface CareerRecommendation {
  roleTitle: string;
  matchScore: number;
  matchExplanation: string;
  marketDemandTier: 'High' | 'Very High' | 'Exceptional';
  requiredTechnicalSkills: string[];
  requiredSoftSkills: string[];
  userStrengths: string[];
  missingSkills: string[];
  difficultyToPivot: 'Beginner Friendly' | 'Moderate Sprint' | 'Intensive Focus' | 'Beginner' | 'Intermediate' | 'Advanced' | string;
  estimatedTimeToReady: string;
  beginnerSuitability?: 'High' | 'Moderate' | 'Prerequisites Required' | string;
  potentialCareerProgression?: string | string[];
  suggestedNextAction?: string;
  recommendedFirstProject: {
    title: string;
    description: string;
  };
  learningRoadmapSummary: string[];
}

export interface AssessmentResult {
  topRecommendations: CareerRecommendation[];
  alternativePaths: string[];
  executiveSummary: string;
  isLiveAi: boolean;
}

export interface MentorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: string[];
}

