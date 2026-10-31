import { Request, Response, NextFunction } from 'express';
import { analyzeResume } from '../services/resumeAnalyzer.js';
import { analyzeSkillGap } from '../services/skillGapAnalyzer.js';
import { generateRoadmap } from '../services/roadmapGenerator.js';
import { recommendProjects } from '../services/projectRecommender.js';
import { generateInterviewQuestions } from '../services/interviewGenerator.js';
import { evaluateInterviewAnswer } from '../services/interviewEvaluator.js';
import { extractTextFromBuffer } from '../utils/textExtractor.js';
import { processCareerAssessment } from '../services/assessmentService.js';
import { generateMentorResponse } from '../services/mentorService.js';
import {
  resumeAnalyzeSchema,
  skillGapRequestSchema,
  roadmapRequestSchema,
  projectRecommendSchema,
  interviewGenerateSchema,
  interviewEvaluateSchema,
} from '../schemas/index.js';
import { getSupabase, isSupabaseConfigured } from '../config/index.js';

// Pre-seeded verified sample job descriptions for MVP testing
export const VERIFIED_SAMPLE_JOBS = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    title: 'Junior Full-Stack Engineer',
    company: 'Acme Cloud Innovations',
    location: 'Remote / New York, NY',
    sourceUrl: 'https://jobs.example.com/acme/junior-fullstack',
    isSample: true,
    retrievalDate: '2026-10-31',
    requiredSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Git', 'REST APIs'],
    preferredSkills: ['Docker', 'Tailwind CSS', 'AWS', 'GraphQL', 'Next.js'],
    responsibilities: [
      'Build responsive UI components in React and TypeScript',
      'Develop backend REST endpoints in Express and Node.js',
      'Manage database schemas and write optimized SQL queries',
      'Participate in agile sprints, peer code reviews, and automated CI testing',
    ],
    technicalRequirements: [
      '1+ year experience or strong portfolio projects with React and Node.js',
      'Solid understanding of HTTP, REST, and relational data modeling',
    ],
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    title: 'Associate AI / Machine Learning Engineer',
    company: 'NeuralWave Tech',
    location: 'San Francisco, CA (Hybrid)',
    sourceUrl: 'https://jobs.example.com/neuralwave/ai-engineer',
    isSample: true,
    retrievalDate: '2026-10-31',
    requiredSkills: ['Python', 'PyTorch', 'Prompt Engineering', 'FastAPI', 'Vector Databases'],
    preferredSkills: ['LangChain', 'Docker', 'RAG Architecture', 'HuggingFace'],
    responsibilities: [
      'Design structured prompt pipelines and agentic tool workflows',
      'Implement semantic search with vector embeddings (Pinecone/pgvector)',
      'Monitor token costs, latency, and model hallucination rates',
    ],
    technicalRequirements: [
      'Demonstrated experience building practical LLM or machine learning applications',
      'Strong Python programming and RESTful API development skills',
    ],
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    title: 'Junior Cloud DevOps Engineer',
    company: 'Nexus Systems',
    location: 'Austin, TX / Remote',
    sourceUrl: 'https://jobs.example.com/nexus/cloud-devops',
    isSample: true,
    retrievalDate: '2026-10-31',
    requiredSkills: ['Linux', 'Docker', 'Git', 'CI/CD (GitHub Actions)', 'AWS'],
    preferredSkills: ['Kubernetes', 'Terraform', 'Prometheus', 'Grafana', 'Bash'],
    responsibilities: [
      'Maintain automated deployment pipelines for staging and production',
      'Containerize microservices and write Dockerfiles following best practices',
      'Monitor server health, logging, and security compliance',
    ],
    technicalRequirements: [
      'Proficiency in Linux terminal administration and Git workflow',
      'Hands-on experience with Docker container lifecycle and cloud basics',
    ],
  },
];

// 1. Resume Analyzer Handler
export const analyzeResumeHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let resumeText = '';
    const targetRole = (req.body.targetRole as string) || 'Full-Stack Engineer';

    // If file was uploaded via multipart/form-data
    if (req.file) {
      const extracted = await extractTextFromBuffer(
        req.file.buffer,
        req.file.mimetype,
        req.file.originalname
      );
      resumeText = extracted.text;
    } else if (req.body.text) {
      const parsedBody = resumeAnalyzeSchema.parse(req.body);
      resumeText = parsedBody.text;
    } else {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Please upload a resume file (PDF, DOCX, TXT) or provide resume text in the request body.',
      });
      return;
    }

    if (!resumeText || resumeText.trim().length < 20) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Could not extract sufficient text from resume. Please ensure the document contains readable text.',
      });
      return;
    }

    const { analysis, isLiveAi } = await analyzeResume(resumeText, targetRole);

    // Save to Supabase if configured
    if (isSupabaseConfigured && req.user && !req.user.isDemoUser) {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from('resumes').insert({
          user_id: req.user.id,
          file_name: req.file ? req.file.originalname : 'Manual Text Input',
          file_size: req.file ? req.file.size : Buffer.byteLength(resumeText),
          file_type: req.file ? req.file.mimetype : 'text/plain',
          raw_text: resumeText.slice(0, 10000),
          parsed_data: analysis,
        });
      }
    }

    res.status(200).json({
      success: true,
      analysis,
      extractedTextLength: resumeText.length,
      isLiveAi,
      notice: isLiveAi ? 'Live Gemini Analysis' : 'Local Verification Engine (Configure GEMINI_API_KEY in server/.env for live LLM responses)',
    });
  } catch (err) {
    next(err);
  }
};

// 2. Skill Gap Analyzer Handler
export const analyzeSkillGapHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = skillGapRequestSchema.parse(req.body);
    let jobText = validated.jobDescriptionText || '';
    let sourceLabel = 'Custom Job Input / Standard Archetype';

    // Check if jobDescriptionId references one of our verified sample postings
    if (validated.jobDescriptionId) {
      const sample = VERIFIED_SAMPLE_JOBS.find((j) => j.id === validated.jobDescriptionId);
      if (sample) {
        jobText = `${sample.title} at ${sample.company}. Responsibilities: ${sample.responsibilities.join('. ')}. Required: ${sample.requiredSkills.join(', ')}. Preferred: ${sample.preferredSkills.join(', ')}.`;
        sourceLabel = `Verified Sample: ${sample.title} (${sample.company}) [Retrieved: ${sample.retrievalDate}]`;
      }
    }

    const { data, isLiveAi } = await analyzeSkillGap(
      validated.targetRole,
      validated.resumeText || '',
      validated.resumeSkills || [],
      jobText,
      sourceLabel
    );

    // Save to Supabase if configured
    if (isSupabaseConfigured && req.user && !req.user.isDemoUser) {
      const supabase = getSupabase();
      if (supabase) {
        await supabase.from('skill_gaps').insert({
          user_id: req.user.id,
          target_role: data.targetRole,
          matching_skills: data.matchingSkills,
          missing_skills: data.missingSkills,
          needs_evidence_skills: data.needsEvidenceSkills,
          match_percentage: data.matchPercentage,
          explanation: data.explanation,
        });
      }
    }

    res.status(200).json({
      success: true,
      data,
      isLiveAi,
      notice: isLiveAi ? 'Live Gemini Analysis' : 'Local Verification Engine (Configure GEMINI_API_KEY in server/.env for live LLM responses)',
    });
  } catch (err) {
    next(err);
  }
};

// 3. Roadmap Generator Handler
export const generateRoadmapHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = roadmapRequestSchema.parse(req.body);
    const { data, isLiveAi } = await generateRoadmap(
      validated.targetRole,
      validated.skillGaps,
      validated.existingSkills,
      validated.weeklyHours,
      validated.learningPreferences
    );

    // Save to Supabase if configured
    if (isSupabaseConfigured && req.user && !req.user.isDemoUser) {
      const supabase = getSupabase();
      if (supabase) {
        const { data: plan } = await supabase.from('learning_plans').insert({
          user_id: req.user.id,
          target_role: data.targetRole,
          duration_weeks: data.durationWeeks,
          overview: data.overview,
          status: 'active',
        }).select().single();

        if (plan) {
          const tasksToInsert = data.weeks.flatMap((w) =>
            w.dailyTasks.map((t) => ({
              plan_id: plan.id,
              user_id: req.user!.id,
              week_number: w.weekNumber,
              day_number: t.dayNumber,
              title: t.title,
              description: t.description,
              practical_exercise: t.practicalExercise,
              deliverable: t.deliverable,
              resources: t.resources,
              assessment_question: t.assessmentQuestion,
              completed: false,
            }))
          );
          await supabase.from('learning_tasks').insert(tasksToInsert);
        }
      }
    }

    res.status(200).json({
      success: true,
      data,
      isLiveAi,
      notice: isLiveAi ? 'Live Gemini Roadmap' : 'Curated 4-Week Roadmap Engine (Configure GEMINI_API_KEY in server/.env for live LLM responses)',
    });
  } catch (err) {
    next(err);
  }
};

// 4. Project Recommender Handler
export const recommendProjectsHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = projectRecommendSchema.parse(req.body);
    const { data, isLiveAi } = await recommendProjects(
      validated.targetRole,
      validated.skillGaps,
      validated.existingSkills
    );

    // Save to Supabase if configured
    if (isSupabaseConfigured && req.user && !req.user.isDemoUser) {
      const supabase = getSupabase();
      if (supabase) {
        const projectsToInsert = data.projects.map((p) => ({
          user_id: req.user!.id,
          title: p.title,
          problem_statement: p.problemStatement,
          why_recommended: p.whyRecommended,
          skills_demonstrated: p.skillsDemonstrated,
          technologies: p.technologies,
          difficulty: p.difficulty,
          estimated_duration: p.estimatedDuration,
          features: p.features,
          milestones: p.milestones,
          github_deliverables: p.githubDeliverables,
          target_role_support: p.targetRoleSupport,
          status: 'recommended',
        }));
        await supabase.from('portfolio_projects').insert(projectsToInsert);
      }
    }

    res.status(200).json({
      success: true,
      data,
      isLiveAi,
      notice: isLiveAi ? 'Live Gemini Recommendations' : 'Curated Portfolio Project Engine (Configure GEMINI_API_KEY in server/.env for live LLM responses)',
    });
  } catch (err) {
    next(err);
  }
};

// 5. Interview Generate Handler
export const generateInterviewHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = interviewGenerateSchema.parse(req.body);
    const { questions, isLiveAi } = await generateInterviewQuestions(
      validated.targetRole,
      validated.interviewType,
      validated.difficulty,
      validated.questionCount
    );

    res.status(200).json({
      success: true,
      questions,
      isLiveAi,
      targetRole: validated.targetRole,
      interviewType: validated.interviewType,
      difficulty: validated.difficulty,
    });
  } catch (err) {
    next(err);
  }
};

// 6. Interview Evaluate Handler
export const evaluateInterviewHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validated = interviewEvaluateSchema.parse(req.body);
    const { evaluation, isLiveAi } = await evaluateInterviewAnswer(
      validated.question,
      validated.userAnswer,
      validated.targetRole,
      validated.interviewType,
      validated.difficulty
    );

    // Save to Supabase if configured
    if (isSupabaseConfigured && req.user && !req.user.isDemoUser) {
      const supabase = getSupabase();
      if (supabase) {
        // Find or create interview session
        const { data: interview } = await supabase.from('interviews').insert({
          user_id: req.user.id,
          target_role: validated.targetRole,
          interview_type: validated.interviewType,
          difficulty: validated.difficulty,
          total_score: evaluation.score,
          status: 'completed',
        }).select().single();

        if (interview) {
          await supabase.from('interview_answers').insert({
            interview_id: interview.id,
            user_id: req.user.id,
            question: validated.question,
            user_answer: validated.userAnswer,
            score: evaluation.score,
            score_breakdown: evaluation.breakdown,
            positive_points: evaluation.positivePoints,
            missing_concepts: evaluation.missingConcepts,
            weak_explanations: evaluation.weakExplanations,
            suggested_improvements: evaluation.suggestedImprovements,
            stronger_example: evaluation.strongerExample,
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      evaluation,
      isLiveAi,
      notice: isLiveAi ? 'Live Gemini Evaluator' : 'CareerPivot 100-Point Rubric Engine (Configure GEMINI_API_KEY in server/.env for live LLM responses)',
    });
  } catch (err) {
    next(err);
  }
};

// 7. Get Verified Sample Job Listings
export const getSampleJobsHandler = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    samples: VERIFIED_SAMPLE_JOBS,
    note: 'These verified benchmark descriptions represent industry standard expectations for MVP testing.',
  });
};

// 8. Career Assessment & Recommendations Handler (Part 5 & 6)
export const assessCareerHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const input = req.body;
    const result = await processCareerAssessment(input);
    res.status(200).json({
      success: true,
      assessment: result,
      isLiveAi: result.isLiveAi,
    });
  } catch (err) {
    next(err);
  }
};

// 9. AI Career Mentor Chat Handler (Part 10)
export const mentorChatHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { message, history, userProfile } = req.body;
    if (!message || typeof message !== 'string') {
      res.status(400).json({ error: 'Message is required' });
      return;
    }
    const response = await generateMentorResponse({ message, history, userProfile });
    res.status(200).json({
      success: true,
      ...response,
    });
  } catch (err) {
    next(err);
  }
};

