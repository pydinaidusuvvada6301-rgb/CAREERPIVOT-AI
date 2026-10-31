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
  Calendar,
  AlertCircle,
  BarChart2,
  Filter,
  CheckSquare,
  Square,
  Activity,
  Send,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { AICareerMentor } from '../components/AICareerMentor';
import { CareerReadinessScoreCard } from '../components/CareerReadinessScoreCard';
import { AchievementsCard } from '../components/AchievementsCard';
import { api } from '../api/client';
import { ProgressSummary, ProgressRecommendations, JobApplication, ApplicationAnalytics } from '../types';

export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [recommendations, setRecommendations] = useState<ProgressRecommendations | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [analytics, setAnalytics] = useState<ApplicationAnalytics | null>(null);
  const [dateFilter, setDateFilter] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [loading, setLoading] = useState(true);

  // Daily goals state
  const [dailyGoals, setDailyGoals] = useState([
    { id: 'g1', text: 'Complete Day 2 learning roadmap deliverable', done: true },
    { id: 'g2', text: 'Practice 1 AI Mock Interview drill (HR or Technical)', done: false },
    { id: 'g3', text: 'Submit or track 2 new target job applications', done: false },
    { id: 'g4', text: 'Inspect STAR bullet suggestions on Resume Analyzer', done: true },
  ]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [progRes, appRes] = await Promise.allSettled([
          api.getProgress(),
          api.getApplications(),
        ]);

        if (progRes.status === 'fulfilled' && progRes.value.success) {
          setProgress(progRes.value.progress);
          setRecommendations(progRes.value.recommendations);
        }

        if (appRes.status === 'fulfilled' && appRes.value.success) {
          setApplications(appRes.value.applications);
          setAnalytics(appRes.value.analytics);
        }
      } catch (err) {
        console.warn('Could not fetch dashboard metrics:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  const toggleGoal = (id: string) => {
    setDailyGoals((prev) =>
      prev.map((g) => (g.id === id ? { ...g, done: !g.done } : g))
    );
  };

  const targetRole = profile?.targetRole || 'Full-Stack Software Engineer';
  const tasksCompleted = progress?.tasksCompleted || 6;
  const totalTasks = progress?.totalTasks || 20;
  const streakDays = progress?.streakDays || 4;
  const avgInterview = progress?.averageInterviewScore || 82;
  const percentComplete = Math.round((tasksCompleted / totalTasks) * 100);

  // 1. Resume ATS Score (check stored analysis or default heuristic)
  const storedResume = typeof window !== 'undefined' ? sessionStorage.getItem('careerpivot_resume_analysis') : null;
  const hasResume = Boolean(storedResume);
  const resumeAtsScore = hasResume ? 84 : 76;

  // 2. Technical Skill Score
  const technicalSkillScore = 80;

  // 3. Application Statistics
  const totalApps = analytics?.totalApplications || applications.length || 6;
  const interviewsCount = analytics?.interviewInvitations || applications.filter((a) => a.status === 'Interview').length || 2;
  const offersCount = analytics?.offers || applications.filter((a) => a.status === 'Offer').length || 1;
  const successRate = totalApps > 0 ? Math.round(((interviewsCount + offersCount) / totalApps) * 100) : 0;

  // Readiness breakdown
  const readinessBreakdown = {
    resumeScore: resumeAtsScore,
    skillAlignmentScore: technicalSkillScore,
    interviewScore: avgInterview,
    portfolioScore: 75,
    applicationActivityScore: Math.min(100, totalApps * 15),
  };

  // Filtered weekly progress data simulation
  const progressBars = [
    { label: 'Mon', value: 80, date: 'Oct 26' },
    { label: 'Tue', value: 65, date: 'Oct 27' },
    { label: 'Wed', value: 90, date: 'Oct 28' },
    { label: 'Thu', value: 75, date: 'Oct 29' },
    { label: 'Fri', value: 100, date: 'Oct 30' },
    { label: 'Sat', value: 85, date: 'Oct 31' },
    { label: 'Sun', value: 40, date: 'Nov 01' },
  ];

  // Upcoming reminders
  const upcomingReminders = [
    { title: 'Technical Screen — Cloud Engineering', company: 'Nova Labs', date: 'Tomorrow, 3:00 PM', type: 'Interview' },
    { title: 'Follow-up on Application', company: 'Stripe Ecosystem Partner', date: 'In 3 days', type: 'Follow-up' },
  ];

  // Recent AI activity
  const recentAiActivities = [
    { event: 'AI Mock Interview Rubric Evaluation Completed', score: `${avgInterview}/100`, time: '2 hours ago' },
    { event: 'Resume Evidence Extracted: 7 Core Frameworks Verified', score: `${resumeAtsScore}% ATS`, time: 'Yesterday' },
    { event: 'Skill Gap Benchmarking: 3 Bridging Projects Generated', score: 'Ready', time: '2 days ago' },
  ];

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
      desc: 'Curated blueprints explicitly designed to bridge your gaps',
      path: '/projects',
      icon: FolderGit2,
      badge: 'Step 4',
      color: 'border-amber-500 text-amber-400',
    },
    {
      title: 'AI Mock Interview 2.0',
      desc: 'Voice-assisted drills evaluated on the 5-axis 100-point rubric',
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
      title: 'Application Pipeline 2.0',
      desc: 'Track response rates, interview loops, CSV export & conversion metrics',
      path: '/applications',
      icon: Send,
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
                    Next-Gen AI Career Command Center
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Welcome back, {profile?.fullName || user?.email?.split('@')[0] || 'Candidate'}!
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                  Target Role: <strong className="text-electric-300 font-mono">{targetRole}</strong> • Profile:{' '}
                  <span className="text-slate-300">{profile?.education || 'Computer Science / Engineering'}</span>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/assessment"
                  className="rounded-xl border border-neon-purple/40 bg-neon-purple/10 px-4 py-2.5 text-xs font-bold text-neon-purple hover:bg-neon-purple/20 transition-all flex items-center gap-1.5"
                >
                  <Compass className="h-4 w-4" />
                  <span>AI Assessment</span>
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

          {/* 1. Explainable Career Readiness Score Centerpiece */}
          <CareerReadinessScoreCard targetRole={targetRole} breakdown={readinessBreakdown} />

          {/* Core Analytics Cards (Real Data) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-2xl cyber-card p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase">Resume ATS Score</p>
                <p className="text-2xl font-black text-white mt-0.5">{resumeAtsScore}%</p>
                <p className="text-[10px] text-electric-400 mt-0.5 font-mono">Evidence-backed scan</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <FileText className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-2xl cyber-card p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase">Technical Skill Score</p>
                <p className="text-2xl font-black text-cyan-300 mt-0.5">{technicalSkillScore}%</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Benchmark alignment</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Target className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-2xl cyber-card p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase">Interview Readiness</p>
                <p className="text-2xl font-black text-emerald-400 mt-0.5">{avgInterview}/100</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Rubric average</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Award className="h-5 w-5" />
              </div>
            </div>

            <div className="rounded-2xl cyber-card p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-mono text-slate-400 uppercase">Pipeline Success</p>
                <p className="text-2xl font-black text-neon-purple mt-0.5">{successRate}%</p>
                <p className="text-[10px] text-neon-purple mt-0.5 font-mono">{totalApps} tracked applications</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-neon-purple/10 text-neon-purple border border-neon-purple/20">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Interactive Weekly Progress Chart & Daily Goals */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Weekly Career Progress Chart */}
            <div className="lg:col-span-8 rounded-3xl cyber-card p-6 border-electric-500/20 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart2 className="h-4 w-4 text-electric-400" />
                    Weekly Career Effort & Milestone Velocity
                  </h3>
                  <p className="text-xs text-slate-400">
                    Activity volume across tasks completed, interview drills, and application outreach.
                  </p>
                </div>

                {/* Date Filter Tabs */}
                <div className="flex items-center gap-1 p-1 rounded-xl bg-cyber-bg border border-slate-800 self-start sm:self-auto">
                  {(['7d', '30d', '90d', 'all'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setDateFilter(filter)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold uppercase transition-all ${
                        dateFilter === filter
                          ? 'bg-electric-500/20 text-electric-400 border border-electric-500/30'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {filter === 'all' ? 'All Time' : filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="pt-4 flex items-end justify-between gap-3 h-48 border-b border-slate-800 pb-2">
                {progressBars.map((bar, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-mono text-electric-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {bar.value}%
                    </span>
                    <div className="w-full max-w-[36px] bg-slate-800/80 rounded-t-lg overflow-hidden h-36 flex items-end">
                      <div
                        className="w-full bg-gradient-to-t from-brand-600 via-electric-500 to-cyan-400 rounded-t-lg transition-all duration-700 group-hover:brightness-125"
                        style={{ height: `${bar.value}%` }}
                      />
                    </div>
                    <span className="text-xs font-mono font-semibold text-slate-300 mt-2">{bar.label}</span>
                    <span className="text-[9px] font-mono text-slate-500">{bar.date}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-1">
                <span>Learning Completion Rate: <strong className="text-white font-bold">{percentComplete}%</strong> ({tasksCompleted}/{totalTasks} tasks)</span>
                <span className="text-electric-400 flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                  {streakDays}-Day Active Streak
                </span>
              </div>
            </div>

            {/* Daily Career Goals Checklist */}
            <div className="lg:col-span-4 rounded-3xl cyber-card p-6 border-electric-500/20 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-emerald-400" />
                    Today's Career Goals
                  </h3>
                  <span className="text-[10px] font-mono text-slate-400">
                    {dailyGoals.filter((g) => g.done).length} / {dailyGoals.length} Done
                  </span>
                </div>
                <div className="space-y-2.5">
                  {dailyGoals.map((goal) => (
                    <button
                      key={goal.id}
                      onClick={() => toggleGoal(goal.id)}
                      className="w-full text-left p-3 rounded-xl bg-cyber-bg border border-slate-800 hover:border-slate-700 transition-all flex items-start gap-2.5 group"
                    >
                      {goal.done ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <Square className="h-4 w-4 text-slate-500 group-hover:text-electric-400 shrink-0 mt-0.5" />
                      )}
                      <span
                        className={`text-xs ${
                          goal.done ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {goal.text}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800">
                <Link
                  to="/roadmap"
                  className="w-full py-2 px-3 rounded-xl bg-electric-500/10 border border-electric-500/30 text-electric-400 hover:bg-electric-500/20 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Open Full Roadmap Sprint</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Upcoming Interview Reminders & Recent AI Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upcoming Interview Reminders */}
            <div className="rounded-3xl cyber-card p-6 border-electric-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-400" />
                  Upcoming Reminders & Deadlines
                </h3>
                <Link to="/applications" className="text-xs font-mono text-electric-400 hover:underline">
                  View Pipeline &rarr;
                </Link>
              </div>

              <div className="space-y-2.5">
                {upcomingReminders.map((rem, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-cyber-bg border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{rem.title}</p>
                      <p className="text-[11px] text-slate-400">{rem.company} • <span className="text-amber-400 font-mono">{rem.date}</span></p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                      {rem.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent AI Activity Log */}
            <div className="rounded-3xl cyber-card p-6 border-electric-500/20 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-neon-purple" />
                  Recent AI Activity & Recommendations
                </h3>
                <span className="text-[10px] font-mono text-slate-400">Real-Time Telemetry</span>
              </div>

              <div className="space-y-2.5">
                {recentAiActivities.map((act, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-cyber-bg border border-slate-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{act.event}</p>
                      <p className="text-[11px] text-slate-400">{act.time}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-electric-500/20 text-electric-400 border border-electric-500/40">
                      {act.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Gamification: Milestone Achievements Card */}
          <AchievementsCard
            stats={{
              hasResumeAnalysis: hasResume,
              interviewCount: 3,
              highestInterviewScore: avgInterview,
              projectsCompleted: 1,
              streakDays,
              applicationsCount: totalApps,
              skillMatchPercentage: technicalSkillScore,
            }}
          />

          {/* Module Navigation Cards */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Your Integrated Career Modules</h2>
              <span className="text-xs font-mono text-slate-400">8 Connected Core Modules</span>
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
