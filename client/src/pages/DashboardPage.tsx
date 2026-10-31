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
  Compass,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { AICareerMentor } from '../components/AICareerMentor';
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
  const percentComplete = Math.round((tasksCompleted / totalTasks) * 100);

  const modules = [
    {
      title: 'AI Career Assessment',
      desc: 'Multi-dimensional evaluation mapping degree & skills to top roles',
      path: '/assessment',
      icon: Compass,
      badge: 'Start Here',
      color: 'border-neon-purple text-neon-purple',
    },
    {
      title: 'Resume Evidence Analyzer',
      desc: 'Extract verifiable technical evidence, ATS scores & edit bullets',
      path: '/resume-analyzer',
      icon: FileText,
      badge: 'Step 1',
      color: 'border-blue-500 text-blue-400',
    },
    {
      title: 'Skill Gap Analyzer',
      desc: 'Benchmark your profile against verified job specifications',
      path: '/skill-gap',
      icon: Target,
      badge: 'Step 2',
      color: 'border-emerald-500 text-emerald-400',
    },
    {
      title: 'Learning Roadmap',
      desc: '4-week structured sprint with daily deliverables & code tasks',
      path: '/roadmap',
      icon: Map,
      badge: 'Step 3',
      color: 'border-electric-400 text-electric-400',
    },
    {
      title: 'Portfolio Projects',
      desc: '3 curated blueprints specifically designed to bridge your gaps',
      path: '/projects',
      icon: FolderGit2,
      badge: 'Step 4',
      color: 'border-amber-500 text-amber-400',
    },
    {
      title: 'AI Mock Interview',
      desc: 'Practice technical & HR drills on the 100-point rubric',
      path: '/mock-interview',
      icon: Mic,
      badge: 'Step 5',
      color: 'border-rose-500 text-rose-400',
    },
    {
      title: 'Job Recommendations',
      desc: 'Search genuine roles filtered by remote, role, & match score',
      path: '/jobs',
      icon: Briefcase,
      badge: 'Step 6',
      color: 'border-cyan-500 text-cyan-400',
    },
    {
      title: 'Application Pipeline',
      desc: 'Track response rates, interview loops, and conversion metrics',
      path: '/applications',
      icon: Briefcase,
      badge: 'Tracker',
      color: 'border-purple-500 text-purple-400',
    },
  ];

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Welcome Banner */}
          <div className="relative overflow-hidden rounded-3xl cyber-card p-6 md:p-8 border-electric-500/25 bg-gradient-to-r from-cyber-surface via-cyber-bg to-cyber-surface">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-electric-400 animate-pulse shadow-glow-sm"></span>
                  <span className="text-xs font-mono font-semibold text-electric-400 uppercase tracking-wider">
                    Candidate Intelligence Hub
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Welcome back, {profile?.fullName || user?.email?.split('@')[0] || 'Candidate'}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  Target Role: <strong className="text-electric-300 font-mono">{targetRole}</strong> • Education: <span className="text-slate-300">{profile?.education || 'Computer Science / Engineering'}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/assessment"
                  className="rounded-xl border border-neon-purple/40 bg-neon-purple/10 px-4 py-2.5 text-xs font-bold text-neon-purple hover:bg-neon-purple/20 transition-all flex items-center gap-1.5"
                >
                  <Compass className="h-4 w-4" />
                  <span>Retake Assessment</span>
                </Link>

                <Link
                  to="/roadmap"
                  className="rounded-xl bg-gradient-to-r from-brand-600 via-electric-600 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow-sm hover:shadow-glow-md transition-all flex items-center gap-1.5"
                >
                  <span>Continue 4-Week Sprint</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Core Analytics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl cyber-card p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase">Roadmap Progress</p>
                <p className="text-2xl font-black text-white mt-0.5">{percentComplete}%</p>
                <p className="text-[10px] text-electric-400 mt-0.5 font-mono">{tasksCompleted} of {totalTasks} milestones</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric-500/10 text-electric-400 border border-electric-500/20">
                <Map className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-2xl cyber-card p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase">Active Streak</p>
                <p className="text-2xl font-black text-amber-400 mt-0.5">{streakDays} Days</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Daily learning activity</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Flame className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-2xl cyber-card p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase">Interview Score</p>
                <p className="text-2xl font-black text-emerald-400 mt-0.5">{avgInterview}/100</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Rubric benchmark</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Award className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-2xl cyber-card p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase">AI Mentor</p>
                <p className="text-base font-bold text-white mt-1">Live Grounded</p>
                <p className="text-[10px] text-neon-purple mt-0.5 font-mono">Profile calibrated</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Module Navigation Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Your Integrated Career Modules</h2>
              <span className="text-xs font-mono text-slate-400">8 Modules Connected</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {modules.map((m, idx) => (
                <Link
                  key={idx}
                  to={m.path}
                  className="rounded-2xl cyber-card p-5 flex flex-col justify-between hover:-translate-y-1 transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-cyber-bg border ${m.color}`}>
                        <m.icon className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">{m.badge}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white group-hover:text-electric-400 transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {m.desc}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-electric-400 font-mono">
                    <span>Launch &rarr;</span>
                    <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </main>
      </div>

      <AICareerMentor />
    </div>
  );
};
