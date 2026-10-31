import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Map,
  CheckCircle2,
  Circle,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Code2,
  Calendar,
  Sparkles,
  RefreshCw,
  FolderGit2,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { api } from '../api/client';
import { RoadmapData, RoadmapWeek, RoadmapDayTask } from '../types';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { useAuth } from '../context/AuthContext';

export const RoadmapPage: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [targetRole, setTargetRole] = useState(
    (location.state as any)?.targetRole || profile?.targetRole || 'Full-Stack Software Engineer'
  );
  const [skillGaps, setSkillGaps] = useState<string[]>(
    (location.state as any)?.skillGaps || ['Docker', 'AWS', 'Automated CI/CD', 'Database Indexing']
  );
  const [weeklyHours, setWeeklyHours] = useState(profile?.weeklyHours || 12);
  const [selectedWeek, setSelectedWeek] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [revealedAssessments, setRevealedAssessments] = useState<Set<string>>(new Set());
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  // Generate roadmap on mount or if not yet generated
  useEffect(() => {
    async function initRoadmap() {
      // Check if skill gaps passed from previous screen or storage
      const storedGaps = sessionStorage.getItem('careerpivot_skill_gaps');
      if (storedGaps && (!location.state || !(location.state as any).skillGaps)) {
        try {
          const parsed = JSON.parse(storedGaps);
          if (parsed.missingSkills) {
            setSkillGaps(parsed.missingSkills.map((s: any) => s.skill));
          }
        } catch {
          // ignore
        }
      }

      setLoading(true);
      try {
        const res = await api.generateRoadmap({
          targetRole,
          skillGaps,
          existingSkills: profile?.currentSkills || ['JavaScript', 'HTML/CSS', 'Python'],
          weeklyHours,
        });

        if (res.success) {
          setRoadmap(res.data);
          setApiNotice(res.notice || null);
          // Pre-check task 1 & 2 for demo delight
          setCompletedTaskIds(new Set(['w1-d1', 'w1-d2']));
        }
      } catch (err: any) {
        setError(err.message || 'Failed to generate personalized roadmap.');
      } finally {
        setLoading(false);
      }
    }

    initRoadmap();
  }, [targetRole]);

  const toggleTaskCompletion = async (taskId: string) => {
    const nextCompleted = new Set(completedTaskIds);
    const isNowCompleted = !nextCompleted.has(taskId);

    if (isNowCompleted) {
      nextCompleted.add(taskId);
    } else {
      nextCompleted.delete(taskId);
    }
    setCompletedTaskIds(nextCompleted);

    // Call API to persist progress
    try {
      await api.updateProgress({
        taskId,
        completed: isNowCompleted,
        targetRole,
      });
    } catch (err) {
      console.warn('Could not update progress on server:', err);
    }
  };

  const toggleAssessmentReveal = (taskId: string) => {
    const next = new Set(revealedAssessments);
    if (next.has(taskId)) {
      next.delete(taskId);
    } else {
      next.add(taskId);
    }
    setRevealedAssessments(next);
  };

  const currentWeekData: RoadmapWeek | undefined = roadmap?.weeks.find(
    (w) => w.weekNumber === selectedWeek
  );

  const totalTasksCount = (roadmap?.weeks.length || 4) * 5;
  const completedCount = completedTaskIds.size;
  const completionPercentage = Math.round((completedCount / totalTasksCount) * 100);

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
                <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700 border border-purple-200">
                  Module 3
                </span>
                <span className="text-xs text-slate-500">Structured Skill Acquisition</span>
              </div>
              <h1 className="text-2xl font-bold text-navy-900 mt-1">Personalized 4-Week Roadmap</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Structured daily sprint targeting your verified skill gaps with tangible code deliverables.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/projects', { state: { targetRole, skillGaps } })}
                className="rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition-colors flex items-center gap-1.5"
              >
                <span>Recommended Portfolio Projects</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {apiNotice && (
            <div className="flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 p-3 text-xs text-brand-800">
              <Sparkles className="h-4 w-4 text-brand-600 shrink-0" />
              <span>{apiNotice}</span>
            </div>
          )}

          {error && <ErrorState message={error} onRetry={() => setError(null)} />}

          {loading && (
            <LoadingState
              message="Synthesizing Tailored 4-Week Learning Roadmap..."
              subtext="Aligning daily coding exercises, documentation links, and deliverables with your weekly hours."
            />
          )}

          {roadmap && !loading && (
            <div className="space-y-6">
              {/* Progress Overview Card */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div>
                    <h3 className="text-base font-bold text-navy-900">{roadmap.targetRole} Roadmap Overview</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-2xl">
                      {roadmap.overview}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 shrink-0 text-center">
                    <span className="text-2xl font-black text-brand-600 leading-none">
                      {completionPercentage}%
                    </span>
                    <span className="block text-[11px] font-semibold text-slate-500 uppercase mt-0.5">
                      {completedCount} of {totalTasksCount} Completed
                    </span>
                  </div>
                </div>

                {/* 4-Week Tab Nav */}
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {roadmap.weeks.map((w) => (
                    <button
                      key={w.weekNumber}
                      onClick={() => setSelectedWeek(w.weekNumber)}
                      className={`rounded-xl p-3 text-left transition-all border ${
                        selectedWeek === w.weekNumber
                          ? 'border-brand-500 bg-brand-50/60 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[11px] font-bold uppercase tracking-wider text-brand-700 block">
                        Week {w.weekNumber}
                      </span>
                      <p className="text-xs font-semibold text-navy-900 truncate mt-0.5">
                        {w.objective}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Week Tasks */}
              {currentWeekData && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-bold text-navy-900">
                        Week {currentWeekData.weekNumber}: {currentWeekData.objective}
                      </h2>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {currentWeekData.topics.map((topic, i) => (
                          <span
                            key={i}
                            className="rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 border border-purple-200"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {currentWeekData.dailyTasks.map((task) => {
                      const taskId = `w${currentWeekData.weekNumber}-d${task.dayNumber}`;
                      const isCompleted = completedTaskIds.has(taskId);
                      const isAssessmentOpen = revealedAssessments.has(taskId);

                      return (
                        <div
                          key={taskId}
                          className={`rounded-2xl border p-5 transition-all bg-white ${
                            isCompleted ? 'border-emerald-200 shadow-xs' : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => toggleTaskCompletion(taskId)}
                                className="mt-0.5 text-slate-400 hover:text-emerald-600 transition-colors"
                                title={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                ) : (
                                  <Circle className="h-5 w-5" />
                                )}
                              </button>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                                    Day {task.dayNumber}
                                  </span>
                                  <h3
                                    className={`text-sm font-bold ${
                                      isCompleted ? 'line-through text-slate-400' : 'text-navy-900'
                                    }`}
                                  >
                                    {task.title}
                                  </h3>
                                </div>
                                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                                  {task.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Practical Exercise & Expected Deliverable */}
                          <div className="mt-3.5 pl-8 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                              <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                                <Code2 className="h-3.5 w-3.5 text-brand-600" /> Hands-On Exercise
                              </span>
                              <p className="text-slate-600 leading-relaxed text-[11px]">
                                {task.practicalExercise}
                              </p>
                            </div>

                            <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                              <span className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                                <FolderGit2 className="h-3.5 w-3.5 text-purple-600" /> Tangible Deliverable
                              </span>
                              <p className="text-slate-600 leading-relaxed text-[11px]">
                                {task.deliverable}
                              </p>
                            </div>
                          </div>

                          {/* Curated Resources */}
                          {task.resources.length > 0 && (
                            <div className="mt-3 pl-8 flex flex-wrap items-center gap-2 text-xs">
                              <span className="text-[11px] font-semibold text-slate-400">Curated Guides:</span>
                              {task.resources.map((res, idx) => (
                                <a
                                  key={idx}
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-200 transition-colors"
                                >
                                  <span>{res.title}</span>
                                  <ExternalLink className="h-2.5 w-2.5 text-slate-400" />
                                </a>
                              ))}
                            </div>
                          )}

                          {/* Verification Assessment Question */}
                          <div className="mt-3 pl-8">
                            <button
                              onClick={() => toggleAssessmentReveal(taskId)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700"
                            >
                              <HelpCircle className="h-3 w-3" />
                              {isAssessmentOpen ? 'Hide Check Question' : 'Self-Assessment Verification Question'}
                            </button>
                            {isAssessmentOpen && (
                              <div className="mt-2 rounded-xl bg-brand-50/50 p-3 border border-brand-100 text-xs text-brand-900 leading-relaxed">
                                <span className="font-bold">Verification Question: </span>
                                {task.assessmentQuestion}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
