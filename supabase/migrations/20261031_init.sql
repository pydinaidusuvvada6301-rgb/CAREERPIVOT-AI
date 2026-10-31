-- ====================================================================
-- CAREERPIVOT AI — SUPABASE DATABASE MIGRATION
-- Production-Ready Schema with Row Level Security (RLS) and Constraints
-- ====================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  education TEXT,
  college TEXT,
  graduation_year INTEGER,
  career_stage TEXT,
  current_skills TEXT[] DEFAULT '{}',
  target_role TEXT,
  preferred_industry TEXT,
  weekly_hours INTEGER DEFAULT 10,
  target_duration TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RESUMES TABLE
CREATE TABLE IF NOT EXISTS public.resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT,
  raw_text TEXT NOT NULL,
  parsed_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. JOB DESCRIPTIONS TABLE
CREATE TABLE IF NOT EXISTS public.job_descriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  location TEXT,
  source_url TEXT,
  is_sample BOOLEAN DEFAULT false,
  raw_text TEXT NOT NULL,
  required_skills TEXT[] DEFAULT '{}',
  preferred_skills TEXT[] DEFAULT '{}',
  responsibilities TEXT[] DEFAULT '{}',
  technical_requirements TEXT[] DEFAULT '{}',
  retrieval_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SKILL GAPS TABLE
CREATE TABLE IF NOT EXISTS public.skill_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  job_description_id UUID REFERENCES public.job_descriptions(id) ON DELETE SET NULL,
  resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
  matching_skills JSONB DEFAULT '[]'::jsonb,
  missing_skills JSONB DEFAULT '[]'::jsonb,
  needs_evidence_skills JSONB DEFAULT '[]'::jsonb,
  match_percentage NUMERIC(5,2) DEFAULT 0,
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LEARNING PLANS TABLE
CREATE TABLE IF NOT EXISTS public.learning_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  duration_weeks INTEGER DEFAULT 4,
  overview TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. LEARNING TASKS TABLE
CREATE TABLE IF NOT EXISTS public.learning_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.learning_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  day_number INTEGER,
  title TEXT NOT NULL,
  description TEXT,
  practical_exercise TEXT,
  deliverable TEXT,
  resources JSONB DEFAULT '[]'::jsonb,
  assessment_question TEXT,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PORTFOLIO PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  why_recommended TEXT NOT NULL,
  skills_demonstrated TEXT[] DEFAULT '{}',
  technologies TEXT[] DEFAULT '{}',
  difficulty TEXT CHECK (difficulty IN ('Beginner', 'Intermediate', 'Advanced')),
  estimated_duration TEXT,
  features TEXT[] DEFAULT '{}',
  milestones JSONB DEFAULT '[]'::jsonb,
  github_deliverables TEXT[] DEFAULT '{}',
  target_role_support TEXT,
  status TEXT DEFAULT 'recommended' CHECK (status IN ('recommended', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. INTERVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_role TEXT NOT NULL,
  interview_type TEXT NOT NULL CHECK (interview_type IN ('technical', 'hr')),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  total_score INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. INTERVIEW ANSWERS TABLE
CREATE TABLE IF NOT EXISTS public.interview_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  interview_id UUID NOT NULL REFERENCES public.interviews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  score INTEGER NOT NULL,
  score_breakdown JSONB NOT NULL DEFAULT '{}'::jsonb,
  positive_points TEXT[] DEFAULT '{}',
  missing_concepts TEXT[] DEFAULT '{}',
  weak_explanations TEXT[] DEFAULT '{}',
  suggested_improvements TEXT[] DEFAULT '{}',
  stronger_example TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  job_url TEXT,
  job_category TEXT NOT NULL DEFAULT 'Software Engineering',
  application_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'Saved' CHECK (status IN ('Saved', 'Applied', 'Interview', 'Rejected', 'Offer')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PROGRESS RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.progress_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_days INTEGER DEFAULT 0,
  last_activity_date DATE DEFAULT CURRENT_DATE,
  tasks_completed INTEGER DEFAULT 0,
  total_tasks INTEGER DEFAULT 0,
  average_interview_score NUMERIC(5,2) DEFAULT 0,
  ai_recommendations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- INDEXES FOR HIGH-PERFORMANCE USER-SPECIFIC QUERIES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_resumes_user ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_skill_gaps_user ON public.skill_gaps(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_plans_user ON public.learning_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_tasks_plan ON public.learning_tasks(plan_id);
CREATE INDEX IF NOT EXISTS idx_learning_tasks_user ON public.learning_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_projects_user ON public.portfolio_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_user ON public.interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_answers_interview ON public.interview_answers(interview_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_records_user ON public.progress_records(user_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_descriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_records ENABLE ROW LEVEL SECURITY;

-- Profiles: users can select/update only their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Resumes: users can manage only their own resumes
CREATE POLICY "Users manage own resumes" ON public.resumes
  FOR ALL USING (auth.uid() = user_id);

-- Job Descriptions: users manage their own, or view verified sample listings
CREATE POLICY "Users view verified or own job descriptions" ON public.job_descriptions
  FOR SELECT USING (is_sample = true OR auth.uid() = user_id);

CREATE POLICY "Users insert own job descriptions" ON public.job_descriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own job descriptions" ON public.job_descriptions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users delete own job descriptions" ON public.job_descriptions
  FOR DELETE USING (auth.uid() = user_id);

-- Skill Gaps: users manage only their own
CREATE POLICY "Users manage own skill gaps" ON public.skill_gaps
  FOR ALL USING (auth.uid() = user_id);

-- Learning Plans: users manage only their own
CREATE POLICY "Users manage own learning plans" ON public.learning_plans
  FOR ALL USING (auth.uid() = user_id);

-- Learning Tasks: users manage only their own
CREATE POLICY "Users manage own learning tasks" ON public.learning_tasks
  FOR ALL USING (auth.uid() = user_id);

-- Portfolio Projects: users manage only their own
CREATE POLICY "Users manage own portfolio projects" ON public.portfolio_projects
  FOR ALL USING (auth.uid() = user_id);

-- Interviews: users manage only their own
CREATE POLICY "Users manage own interviews" ON public.interviews
  FOR ALL USING (auth.uid() = user_id);

-- Interview Answers: users manage only their own
CREATE POLICY "Users manage own interview answers" ON public.interview_answers
  FOR ALL USING (auth.uid() = user_id);

-- Applications: users manage only their own
CREATE POLICY "Users manage own applications" ON public.applications
  FOR ALL USING (auth.uid() = user_id);

-- Progress Records: users manage only their own
CREATE POLICY "Users manage own progress records" ON public.progress_records
  FOR ALL USING (auth.uid() = user_id);

-- ====================================================================
-- AUTH TRIGGER FOR AUTOMATIC PROFILE CREATION
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed some verified sample job descriptions
INSERT INTO public.job_descriptions (title, company, location, source_url, is_sample, raw_text, required_skills, preferred_skills, responsibilities, technical_requirements)
VALUES 
(
  'Junior Full-Stack Engineer',
  'Acme Cloud Innovations',
  'Remote / New York, NY',
  'https://jobs.example.com/acme/junior-fullstack',
  true,
  'We are seeking a Junior Full-Stack Engineer to build scalable web applications. You will collaborate with product designers, implement React frontends, design REST APIs in Node.js/TypeScript, and manage PostgreSQL databases.',
  ARRAY['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'Git', 'REST APIs'],
  ARRAY['Docker', 'Tailwind CSS', 'AWS', 'GraphQL', 'Next.js'],
  ARRAY['Build responsive UI components in React', 'Develop backend REST endpoints in Express/TypeScript', 'Write SQL queries and manage schema migrations', 'Participate in peer code reviews'],
  ARRAY['B.S. in Computer Science or equivalent practical portfolio experience', 'Solid understanding of data structures and web protocols', '1+ year experience or strong portfolio projects with React and Node.js']
),
(
  'AI / Machine Learning Engineer (Associate)',
  'NeuralWave Tech',
  'San Francisco, CA (Hybrid)',
  'https://jobs.example.com/neuralwave/ai-engineer',
  true,
  'NeuralWave is looking for an Associate AI Engineer to integrate Large Language Models (LLMs) into customer-facing applications. The candidate will design prompt pipelines, build retrieval-augmented generation (RAG) systems, and fine-tune models with Python and LangChain.',
  ARRAY['Python', 'PyTorch', 'Large Language Models (LLMs)', 'RAG Architecture', 'FastAPI', 'Vector Databases'],
  ARRAY['LangChain', 'HuggingFace', 'Docker', 'Kubernetes', 'Cloud AI Services'],
  ARRAY['Design and evaluate LLM prompt chains and agents', 'Implement semantic search with vector embeddings', 'Optimize model inference latency and token costs', 'Monitor model drift and hallucination metrics'],
  ARRAY['Degree in AI, Data Science, or Software Engineering with strong math foundation', 'Demonstrated projects building LLM applications or fine-tuning models']
),
(
  'Junior Cloud DevOps Engineer',
  'Nexus Systems',
  'Austin, TX / Remote',
  'https://jobs.example.com/nexus/cloud-devops',
  true,
  'Join our infrastructure team to automate CI/CD pipelines, maintain containerized microservices in Kubernetes, and manage AWS infrastructure using Terraform. Ideal for a developer passionate about reliability, observability, and automation.',
  ARRAY['Linux', 'Docker', 'Kubernetes', 'CI/CD (GitHub Actions)', 'AWS', 'Terraform', 'Bash/Python'],
  ARRAY['Prometheus', 'Grafana', 'Security Compliance', 'Helm', 'ArgoCD'],
  ARRAY['Maintain automated deployment pipelines for staging and production', 'Provision cloud resources via Infrastructure as Code (Terraform)', 'Troubleshoot container networking and cluster performance', 'Implement security policies and secret management'],
  ARRAY['Strong knowledge of Linux systems administration', 'Hands-on experience with Docker and basic Kubernetes orchestration']
)
ON CONFLICT DO NOTHING;
