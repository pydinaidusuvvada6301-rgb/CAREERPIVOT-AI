import React, { useEffect, useState } from 'react';
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
  CheckCircle2,
  Clock,
  Award,
  ChevronRight,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { api } from '../api/client';
import { ProgressSummary, ProgressRecommendations } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [recommendations, setRecommendations] = useState<ProgressRecommendations | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const res = await api.getProgress();
        if (res.success) {
          setProgress(res.progress);
          setRecommendations(res.recommendations);
        }
      } catch (err) {
        console.warn('Could not fetch progress from API, using default:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const targetRole = profile?.targetRole || 'Full-Stack Software Engineer';
  const tasksCompleted = progress?.tasksCompleted || 6;
  const totalTasks = progress?.totalTasks || 20;
  const streakDays = progress?.streakDays || 4;
  const avgInterview = progress?.averageInterviewScore || 82;

  const modules = [
    {
      title: 'Resume Analyzer',
      desc: 'Extract verifiable technical evidence & improve ATS readability',
      path: '/resume-analyzer',
      icon: FileText,
      badge: 'Step 1',
      color: 'from-blue-600 to-indigo-600',
    },
    {
      title: 'Skill Gap Analyzer',
      desc: 'Benchmark your profile against verified job specifications',
      path: '/skill-gap',
      icon: Target,
      badge: 'Step 2',
      color: 'from-emerald-600 to-teal-600',
    },
    {
      title: 'Learning Roadmap',
      desc: '4-week structured sprint with daily deliverables & code tasks',
      path: '/roadmap',
      icon: Map,
      badge: 'Step 3',
      color: 'from-purple-600 to-pink-600',
    },
    {
      title: 'Portfolio Projects',
      desc: '3 curated blueprints specifically designed to bridge your gaps',
      path: '/projects',
      icon: FolderGit2,
      badge: 'Step 4',
      color: 'from-amber-600 to-orange-600',
    },
    {
      title: 'AI Mock Interview',
      desc: 'Evaluate technical answers on the 100-point rubric',
      path: '/mock-interview',
      icon: Mic,
      badge: 'Step 5',
      color: 'from-rose-600 to-red-600',
    },
    {
      title: 'Job Application Tracker',
      desc: 'Track response rates, interview loops, and conversion metrics',
      path: '/applications',
      icon: Briefcase,
      badge: 'Step 6',
      color: 'from-cyan-600 to-blue-600',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Welcome Banner */}
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-r from-navy-900 via-slate-900 to-navy-950 p-6 md:p-8 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-brand-500/10 blur-3xl" />
            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-brand-500/20 px-3 py-1 text-xs font-semibold text-brand-300 border border-brand-400/20 mb-3">
                <Sparkles className="h-3.5 w-3.5 text-brand-300" />
                <span>Target Career: {targetRole}</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Welcome back, {profile?.fullName || user?.email?.split('@')[0] || 'Candidate'}
              </h1>
              <p className="mt-2 text-xs md:text-sm text-slate-300 leading-relaxed">
                Your career pivot trajectory is active. Complete today's milestone to keep your {streakDays}-day streak burning.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/roadmap"
                  className="rounded-xl bg-brand-500 hover:bg-brand-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-colors flex items-center gap-2"
                >
                  <span>Continue Learning Plan</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/resume-analyzer"
                  className="rounded-xl bg-white/10 hover:bg-white/15 px-4 py-2.5 text-xs font-semibold text-white border border-white/15 transition-colors"
                >
                  Analyze Resume
                </Link>
              </div>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Role Fit Match</span>
                <Target className="h-4 w-4 text-brand-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-navy-900">68%</span>
                <span className="text-xs font-semibold text-emerald-600">+14% this month</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Benchmarked against {targetRole}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Sprint Milestones</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-navy-900">{tasksCompleted} / {totalTasks}</span>
                <span className="text-xs font-semibold text-brand-600">
                  {Math.round((tasksCompleted / totalTasks) * 100)}%
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">4-week sprint progress</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Daily Streak</span>
                <Flame className="h-4 w-4 text-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-navy-900">{streakDays} Days</span>
                <span className="text-xs font-semibold text-amber-600">Active</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Consistent daily study logged</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Avg Interview Score</span>
                <Award className="h-4 w-4 text-purple-600" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-black text-navy-900">{avgInterview}</span>
                <span className="text-xs font-semibold text-slate-500">/ 100</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Scored on 100-pt rubric</p>
            </div>
          </div>

          {/* AI Trajectory Insights & Recommendation */}
          {recommendations && (
            <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-brand-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-900">
                  AI Transition Advisor Strategy
                </h3>
              </div>
              <p className="text-xs text-brand-900 font-medium leading-relaxed">
                {recommendations.summary}
              </p>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-white p-3 border border-brand-100">
                  <span className="font-semibold text-slate-700 block">High-Yield Practice:</span>
                  <span className="text-slate-600 mt-0.5 block">{recommendations.recommendedPractice}</span>
                </div>
                <div className="rounded-xl bg-white p-3 border border-brand-100">
                  <span className="font-semibold text-slate-700 block">Schedule Calibration:</span>
                  <span className="text-slate-600 mt-0.5 block">{recommendations.revisedScheduleFocus}</span>
                </div>
              </div>
            </div>
          )}

          {/* Core Modules Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-navy-900">Core Career Transition Systems</h2>
                <p className="text-xs text-slate-500">Click any module to execute targeted analysis and milestone workflows.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((m, idx) => (
                <Link
                  key={idx}
                  to={m.path}
                  className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all hover:border-brand-300 hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                        <m.icon className="h-5 w-5" />
                      </div>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                        {m.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-navy-900 group-hover:text-brand-600 transition-colors">
                      {m.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">{m.desc}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-brand-600 group-hover:text-brand-700">
                    <span>Launch Module</span>
                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
