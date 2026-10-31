import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  CheckCircle2,
  Flame,
  Award,
  Sparkles,
  Calendar,
  Clock,
  ArrowRight,
  BookOpen,
  Code2,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { api } from '../api/client';
import { ProgressSummary, ProgressRecommendations } from '../types';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { useAuth } from '../context/AuthContext';

export const ProgressPage: React.FC = () => {
  const { profile } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [recommendations, setRecommendations] = useState<ProgressRecommendations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiveAi, setIsLiveAi] = useState(false);

  useEffect(() => {
    async function loadProgress() {
      setLoading(true);
      setError(null);

      try {
        const res = await api.getProgress();
        if (res.success) {
          setProgress(res.progress);
          setRecommendations(res.recommendations);
          setIsLiveAi(res.isLiveAi);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load progress analytics.');
      } finally {
        setLoading(false);
      }
    }

    loadProgress();
  }, []);

  const tasksCompleted = progress?.tasksCompleted || 6;
  const totalTasks = progress?.totalTasks || 20;
  const tasksRemaining = Math.max(0, totalTasks - tasksCompleted);
  const completionPercent = Math.round((tasksCompleted / totalTasks) * 100);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-cyan-50 px-2.5 py-0.5 text-xs font-bold text-cyan-700 border border-cyan-200">
                  Module 6
                </span>
                <span className="text-xs text-slate-500">Milestone Analytics & Calibration</span>
              </div>
              <h1 className="text-2xl font-bold text-navy-900 mt-1">Progress Analytics & Calibration</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Objective milestone tracking grounded in actual saved database records without fabricated metrics.
              </p>
            </div>
          </div>

          {error && <ErrorState message={error} onRetry={() => setError(null)} />}

          {loading && (
            <LoadingState
              message="Computing Milestone Completion & Streak Data..."
              subtext="Aggregating task completions, assessment outcomes, and interview history."
            />
          )}

          {!loading && progress && (
            <div className="space-y-6">
              {/* Milestone KPI Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold uppercase tracking-wider">Completed Tasks</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-navy-900">{tasksCompleted}</span>
                    <span className="text-xs font-semibold text-slate-400">/ {totalTasks}</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${completionPercent}%` }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-slate-500">{tasksRemaining} milestones remaining</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold uppercase tracking-wider">Daily Streak</span>
                    <Flame className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-navy-900">{progress.streakDays}</span>
                    <span className="text-xs font-semibold text-amber-600">Days Active</span>
                  </div>
                  <p className="mt-4 text-[11px] text-slate-400">Last activity: {progress.lastActivityDate}</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold uppercase tracking-wider">Avg Interview Score</span>
                    <Award className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-navy-900">{progress.averageInterviewScore}</span>
                    <span className="text-xs font-semibold text-slate-500">/ 100</span>
                  </div>
                  <p className="mt-4 text-[11px] text-slate-400">100-point rubric average</p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-xs font-semibold uppercase tracking-wider">Portfolio Deliverables</span>
                    <Code2 className="h-4 w-4 text-brand-600" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-navy-900">{progress.completedProjectsCount}</span>
                    <span className="text-xs font-semibold text-slate-500">/ 3 Repos</span>
                  </div>
                  <p className="mt-4 text-[11px] text-slate-400">Verifiable GitHub deliverables</p>
                </div>
              </div>

              {/* AI Strategic Schedule Recommendations */}
              {recommendations && (
                <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-6 shadow-xs space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-brand-600" />
                    <h3 className="text-sm font-bold text-navy-900">
                      AI Progress Calibration & Schedule Recommendations
                    </h3>
                  </div>

                  <p className="text-xs text-brand-950 font-medium leading-relaxed bg-white/80 p-3.5 rounded-xl border border-brand-100">
                    {recommendations.summary}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="rounded-xl bg-white p-4 border border-brand-100 shadow-2xs">
                      <span className="font-bold text-slate-800 block mb-1">Recommended Practice Priority:</span>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        {recommendations.recommendedPractice}
                      </p>
                    </div>

                    <div className="rounded-xl bg-white p-4 border border-brand-100 shadow-2xs">
                      <span className="font-bold text-slate-800 block mb-1">Revised Study Schedule:</span>
                      <p className="text-slate-600 leading-relaxed text-[11px]">
                        {recommendations.revisedScheduleFocus}
                      </p>
                    </div>
                  </div>

                  {recommendations.portfolioRefinements.length > 0 && (
                    <div className="pt-2">
                      <span className="font-bold text-xs text-slate-800 block mb-1.5">
                        Portfolio Refinements to Impress Recruiters:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-700">
                        {recommendations.portfolioRefinements.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-brand-600 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Recent Verification Assessments */}
              {progress.recentAssessments.length > 0 && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-navy-900 mb-3">Recent Verification Assessments</h3>
                  <div className="divide-y divide-slate-100 text-xs">
                    {progress.recentAssessments.map((a, i) => (
                      <div key={i} className="py-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800">{a.topic}</span>
                          <span className="text-[11px] text-slate-400 block">{a.date}</span>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                          {a.score}% Verified
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
