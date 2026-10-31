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
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { loginAsDemoUser } = useAuth();

  const features = [
    {
      title: 'Resume Evidence Extractor',
      desc: 'Parses PDF, DOCX, and text resumes with zero hallucination. Surfaces verifiable skills and detects critical gaps.',
      icon: FileText,
      tag: 'Module 1',
    },
    {
      title: 'Real Job Description Matcher',
      desc: 'Compares your actual resume against verified job requirements. Categorizes into Matching, Missing, and Needs-Evidence.',
      icon: Target,
      tag: 'Module 2',
    },
    {
      title: 'Personalized 4-Week Roadmap',
      desc: 'Daily milestones, practical code deliverables, curated documentation, and verification questions to bridge your gaps.',
      icon: Map,
      tag: 'Module 3',
    },
    {
      title: 'Portfolio Project Recommender',
      desc: 'Three production-grade portfolio project blueprints specifically designed to prove your missing skills to hiring managers.',
      icon: FolderGit2,
      tag: 'Module 4',
    },
    {
      title: '100-Point Mock Interviewer',
      desc: 'Realistic technical and HR interview evaluations scored across technical correctness, problem-solving, and communication.',
      icon: Mic,
      tag: 'Module 5',
    },
    {
      title: 'Progress Analytics & Streaks',
      desc: 'Tracks real task completion, daily streaks, assessment scores, and AI schedule optimization grounded in your data.',
      icon: TrendingUp,
      tag: 'Module 6',
    },
    {
      title: 'Job Application Pipeline',
      desc: 'Complete tracking system calculating real recruiter response rates and interview conversion across job categories.',
      icon: Briefcase,
      tag: 'Module 7',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_50%_at_50%_10%,rgba(12,135,235,0.12),transparent)]" />
        
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700 shadow-xs mb-6">
            <Sparkles className="h-3.5 w-3.5 text-brand-600" />
            <span>GenAI Career Pivot Platform • Hackathon MVP</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-navy-900 leading-[1.15]">
            From Your Current Skills to Your <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-600 to-blue-500 bg-clip-text text-transparent">
              Dream Career
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed">
            CareerPivot AI bridges the exact gap between where your skills are today and what top tech employers require. Powered by Google Gemini reasoning and Supabase security.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-all hover:-translate-y-0.5"
            >
              <span>Start Your Career Pivot Free</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/dashboard"
              onClick={loginAsDemoUser}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-xs"
            >
              <span>Explore Instant Demo Mode</span>
            </Link>
          </div>

          {/* Core Trust Pillars */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              Evidence-Based AI Reasoning
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              Row Level Security & Private Data
            </span>
            <span className="flex items-center gap-1.5">
              <Cpu className="h-4 w-4 text-purple-600" />
              Google Gemini Structured Engine
            </span>
          </div>
        </div>
      </section>

      {/* 7 Core Modules Grid */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-600">Complete System Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mt-1">
              All 7 Coaching Modules Working Together
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">
              Every phase of your career transition is supported by a specialized, end-to-end functional module.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition-all hover:bg-white hover:border-brand-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{item.tag}</span>
                </div>
                <h3 className="text-base font-bold text-navy-900">{item.title}</h3>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-navy-900">CareerPivot AI</span>
            <span>• From Your Current Skills to Your Dream Career</span>
          </div>
          <div>
            <span>Built with React, Express, Supabase & Google Gemini API</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
