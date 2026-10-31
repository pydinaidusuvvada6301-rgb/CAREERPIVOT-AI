import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  FileText,
  Target,
  Map,
  FolderGit2,
  Mic,
  TrendingUp,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Bot,
  Zap,
  Lock,
  Globe2,
  Terminal,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { ThreeDExperience } from '../components/ThreeDExperience';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { loginAsDemoUser } = useAuth();

  const workflowSteps = [
    {
      step: '01',
      title: 'Evidence-Based Ingestion',
      desc: 'Upload your existing resume or enter your current skills. Our parser extracts verified proof without hallucination.',
      icon: FileText,
    },
    {
      step: '02',
      title: 'Precision Skill Gap Mapping',
      desc: 'Cross-reference your competencies against real employer job listings to categorize Matching, Missing, and Needs-Evidence skills.',
      icon: Target,
    },
    {
      step: '03',
      title: 'Personalized 4-Week Sprint',
      desc: 'Follow day-by-day learning milestones, hands-on coding deliverables, and 3 tailored portfolio project blueprints.',
      icon: Map,
    },
    {
      step: '04',
      title: '100-Point Mock Interview Drills',
      desc: 'Practice realistic technical and HR interview questions evaluated across 5 transparent dimensions with model answers.',
      icon: Mic,
    },
  ];

  const features = [
    {
      title: 'Resume Evidence Extractor',
      desc: 'Parses PDF, DOCX, and text resumes with zero hallucination. Surfaces verifiable skills and detects critical gaps.',
      icon: FileText,
      tag: 'Module 1',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Real Job Description Matcher',
      desc: 'Compares your actual resume against verified job requirements. Categorizes into Matching, Missing, and Needs-Evidence.',
      icon: Target,
      tag: 'Module 2',
      color: 'from-cyan-500 to-teal-500',
    },
    {
      title: 'Personalized 4-Week Roadmap',
      desc: 'Daily milestones, practical code deliverables, curated documentation, and verification questions to bridge your gaps.',
      icon: Map,
      tag: 'Module 3',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      title: 'Portfolio Project Recommender',
      desc: 'Three production-grade portfolio project blueprints specifically designed to prove your missing skills to hiring managers.',
      icon: FolderGit2,
      tag: 'Module 4',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: '100-Point Mock Interviewer',
      desc: 'Realistic technical and HR interview evaluations scored across technical correctness, problem-solving, and communication.',
      icon: Mic,
      tag: 'Module 5',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Progress Analytics & Streaks',
      desc: 'Tracks real task completion, daily streaks, assessment scores, and AI schedule optimization grounded in your data.',
      icon: TrendingUp,
      tag: 'Module 6',
      color: 'from-amber-500 to-orange-500',
    },
    {
      title: 'Job Application Pipeline',
      desc: 'Complete tracking system calculating real recruiter response rates and interview conversion across job categories.',
      icon: Briefcase,
      tag: 'Module 7',
      color: 'from-rose-500 to-red-500',
    },
  ];

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text flex flex-col selection:bg-electric-500 selection:text-black">
      <Navbar />

      {/* Hero Section with Interactive 3D Globe */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-16 md:pb-24 border-b border-electric-500/15">
        {/* Futuristic glowing backdrop */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[500px] w-full max-w-7xl bg-[radial-gradient(ellipse_at_top,rgba(14,165,233,0.18),transparent_60%)]" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Value Proposition & CTAs */}
            <div className="lg:col-span-6 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-electric-500/30 bg-cyber-surface/80 px-3.5 py-1.5 text-xs font-mono font-semibold text-electric-400 shadow-glow-sm">
                <Sparkles className="h-3.5 w-3.5 text-electric-400 animate-pulse" />
                <span>Next-Gen AI Career Transition Platform</span>
              </div>

              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                From Current Skills to Your <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-electric-400 via-brand-400 to-neon-purple bg-clip-text text-transparent neon-glow-blue">
                  Dream Tech Career
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl mx-auto lg:mx-0">
                CareerPivot AI analyzes your verified background against authentic tech industry job descriptions. Built with Google Gemini structured reasoning, PostgreSQL Row Level Security, and 3D career intelligence.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 via-electric-600 to-blue-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-glow-md hover:shadow-glow-lg transition-all hover:scale-105"
                >
                  <span>Start Your Career Pivot Free</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/dashboard"
                  onClick={loginAsDemoUser}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-electric-500/30 bg-cyber-surface/80 px-6 py-3.5 text-xs sm:text-sm font-semibold text-slate-200 hover:border-electric-400 hover:bg-cyber-surface transition-all"
                >
                  <Terminal className="h-4 w-4 text-electric-400" />
                  <span>Instant Demo Mode</span>
                </Link>
              </div>

              {/* Trust Pillars */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-electric-400" />
                  Evidence Extraction (No Hallucination)
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-neon-purple" />
                  Row Level Security Isolation
                </span>
                <span className="flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-emerald-400" />
                  Gemini Structured Engine
                </span>
              </div>
            </div>

            {/* Right Column: Interactive 3D Career Globe */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-lg">
                <ThreeDExperience height="460px" interactive={true} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 border-b border-electric-500/15 bg-cyber-surface/40">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-electric-400">
              Structured Methodology
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1.5">
              How CareerPivot AI Powers Your Transition
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              A transparent, 4-step framework transforming raw candidate potential into interview-ready software engineers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, idx) => (
              <div
                key={idx}
                className="relative rounded-2xl cyber-card p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric-500/10 text-electric-400 border border-electric-500/30">
                      <step.icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-electric-400/80">
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All 7 Functional Modules Showcase */}
      <section className="py-16 md:py-24 border-b border-electric-500/15">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-neon-purple">
              Complete Intelligence Suite
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1.5">
              7 Integrated Coaching Modules
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Every phase of your career pivot is connected through unified AI reasoning and persistent database records.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl cyber-card p-6 hover:-translate-y-1 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric-500/10 text-electric-400 border border-electric-500/30">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{item.title}</h3>
                <p className="mt-2 text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Data Protection Section (PART 15) */}
      <section className="py-16 md:py-20 border-b border-electric-500/15 bg-cyber-surface/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl cyber-card p-8 md:p-12 relative overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8 space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-400">
                  <Lock className="h-3 w-3" />
                  <span>Enterprise Security Architecture</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Private Data Isolation with Row Level Security
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Your resume documents, interview evaluations, and career roadmaps are protected with PostgreSQL Row Level Security (RLS) policies. Sensitive AI API keys remain strictly backend-only, and untrusted resume inputs are delimited against prompt injection.
                </p>
                <div className="pt-2 flex flex-wrap gap-3">
                  <span className="rounded-lg border border-slate-800 bg-cyber-bg px-3 py-1.5 text-[11px] font-mono text-slate-300">
                    5 MB Buffer Limit
                  </span>
                  <span className="rounded-lg border border-slate-800 bg-cyber-bg px-3 py-1.5 text-[11px] font-mono text-slate-300">
                    Memory-Only File Processing
                  </span>
                  <span className="rounded-lg border border-slate-800 bg-cyber-bg px-3 py-1.5 text-[11px] font-mono text-slate-300">
                    JWT Session Verification
                  </span>
                </div>
              </div>

              <div className="md:col-span-4 flex justify-center">
                <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-tr from-brand-600 to-neon-purple p-1 shadow-glow-md">
                  <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-cyber-bg">
                    <ShieldCheck className="h-14 w-14 text-electric-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-cyber-bg py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-white">CareerPivot AI</span>
            <span>• From Your Current Skills to Your Dream Career</span>
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Google Gemini Structured Engine</span>
            <span>•</span>
            <span>Supabase PostgreSQL RLS</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
