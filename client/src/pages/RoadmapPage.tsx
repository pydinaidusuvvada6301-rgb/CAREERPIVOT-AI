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
  Plus,
  Edit2,
  Check,
  Clock,
  BookOpen,
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
  const [difficultyLevel, setDifficultyLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [selectedWeek, setSelectedWeek] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set(['w1-d1', 'w1-d2']));
  const [revealedAssessments, setRevealedAssessments] = useState<Set<string>>(new Set());
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  // Custom task modal
  const [showAddTask, setShowAddTask] = useState(false);
  const [customTaskTitle, setCustomTaskTitle] = useState('');
  const [customTaskDesc, setCustomTaskDesc] = useState('');
  const [customDeliverable, setCustomDeliverable] = useState('');

  // Generate roadmap
  const initRoadmap = async () => {
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
    setError(null);
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
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate personalized roadmap.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initRoadmap();
  }, [targetRole, difficultyLevel]);

  const toggleTaskCompletion = async (taskId: string) => {
    const nextCompleted = new Set(completedTaskIds);
    const isNowCompleted = !nextCompleted.has(taskId);

    if (isNowCompleted) {
      nextCompleted.add(taskId);
    } else {
      nextCompleted.delete(taskId);
    }
    setCompletedTaskIds(nextCompleted);

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

  const handleAddCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTaskTitle.trim() || !roadmap) return;

    const newTask: RoadmapDayTask = {
      dayNumber: 6,
      title: customTaskTitle.trim(),
      description: customTaskDesc.trim() || 'Custom study milestone',
      practicalExercise: 'Implement and test code deliverable in your repository.',
      deliverable: customDeliverable.trim() || 'GitHub commit or PR',
      resources: [{ title: 'Official Documentation', url: 'https://developer.mozilla.org', type: 'Documentation' }],
      assessmentQuestion: 'What core trade-offs did you evaluate during this implementation?',
    };

    const updatedWeeks = roadmap.weeks.map((w) => {
      if (w.weekNumber === selectedWeek) {
        return { ...w, dailyTasks: [...w.dailyTasks, newTask] };
      }
      return w;
    });

    setRoadmap({ ...roadmap, weeks: updatedWeeks });
    setCustomTaskTitle('');
    setCustomTaskDesc('');
    setCustomDeliverable('');
    setShowAddTask(false);
  };

  const currentWeekData: RoadmapWeek | undefined = roadmap?.weeks.find(
    (w) => w.weekNumber === selectedWeek
  );

  const totalTasksCount = (roadmap?.weeks.length || 4) * 5;
  const completedCount = completedTaskIds.size;
  const completionPercentage = Math.round((completedCount / totalTasksCount) * 100);

  return (
    <div className="min-h-screen bg-cyber-bg text-cyber-text flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-electric-500/15">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-electric-500/20 px-2.5 py-0.5 text-xs font-mono font-bold text-electric-400 border border-electric-500/40">
                  Module 3
                </span>
                <span className="text-xs font-mono text-slate-400">Structured Skill Acquisition</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white mt-1">Smart Learning Roadmap</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Structured daily sprint targeting your verified skill gaps with tangible code deliverables.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/projects', { state: { targetRole, skillGaps } })}
                className="rounded-xl bg-gradient-to-r from-brand-600 via-electric-600 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow-sm hover:scale-105 transition-all flex items-center gap-1.5"
              >
                <span>Recommended Portfolio Projects</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Sprints Overview & Level Selectors */}
          <div className="rounded-3xl cyber-card p-6 border-electric-500/20 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-mono text-slate-400 uppercase font-bold">Target Sprint Level</span>
                <div className="flex items-center gap-2">
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setDifficultyLevel(lvl)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                        difficultyLevel === lvl
                          ? 'bg-electric-500/20 text-electric-400 border border-electric-500/40 shadow-glow-sm'
                          : 'text-slate-400 bg-cyber-bg border border-slate-800 hover:text-white'
                      }`}
                    >
                      {lvl} Sprint
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress ribbon */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Roadmap Progress</span>
                  <p className="text-lg font-black text-white font-mono">{completionPercentage}%</p>
                </div>
                <div className="w-24 sm:w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-600 to-electric-400 rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  />
                </div>
              </div>
            </div>

            {roadmap?.overview && (
              <p className="text-xs text-slate-300 font-sans leading-relaxed pt-2 border-t border-slate-800">
                {roadmap.overview}
              </p>
            )}
          </div>

          {error && <ErrorState message={error} onRetry={initRoadmap} />}

          {loading && (
            <LoadingState
              message="Synthesizing Structured 4-Week Learning Sprint..."
              subtext="Assembling day-by-day practical exercises, code deliverables, and verified documentation resources."
            />
          )}

          {/* Week Selector Tabs */}
          {roadmap && !loading && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {roadmap.weeks.map((w) => (
                    <button
                      key={w.weekNumber}
                      onClick={() => setSelectedWeek(w.weekNumber)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-mono font-bold transition-all flex items-center gap-2 shrink-0 ${
                        selectedWeek === w.weekNumber
                          ? 'bg-electric-500/20 text-electric-400 border border-electric-500/40 shadow-glow-sm'
                          : 'bg-cyber-card text-slate-400 border border-slate-800 hover:text-white'
                      }`}
                    >
                      <span>Week {w.weekNumber}</span>
                      <span className="text-[10px] text-slate-500">
                        ({w.dailyTasks.filter((t) => completedTaskIds.has(`w${w.weekNumber}-d${t.dayNumber}`)).length}/{w.dailyTasks.length})
                      </span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowAddTask(true)}
                  className="rounded-xl border border-slate-800 bg-cyber-bg px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-700 flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="h-3.5 w-3.5 text-electric-400" />
                  <span>Add Task</span>
                </button>
              </div>

              {/* Selected Week View */}
              {currentWeekData && (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl cyber-card border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-electric-400 font-bold">Week {selectedWeek} Objective</span>
                      <h3 className="text-sm font-bold text-white mt-0.5">{currentWeekData.objective}</h3>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {currentWeekData.topics.map((top, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-md bg-cyber-bg border border-slate-800 text-[10px] font-mono text-cyan-300">
                          {top}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Daily Tasks Cards */}
                  <div className="space-y-3">
                    {currentWeekData.dailyTasks.map((task) => {
                      const taskId = `w${selectedWeek}-d${task.dayNumber}`;
                      const isCompleted = completedTaskIds.has(taskId);
                      const isAssessmentOpen = revealedAssessments.has(taskId);

                      return (
                        <div
                          key={taskId}
                          className={`rounded-2xl p-5 border transition-all ${
                            isCompleted
                              ? 'bg-cyber-surface/60 border-emerald-500/30'
                              : 'bg-cyber-surface/90 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => toggleTaskCompletion(taskId)}
                                className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-lg border transition-all ${
                                  isCompleted
                                    ? 'bg-emerald-500 border-emerald-400 text-black'
                                    : 'border-slate-700 bg-cyber-bg hover:border-electric-400'
                                }`}
                              >
                                {isCompleted && <Check className="h-4 w-4 stroke-[3]" />}
                              </button>

                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono font-bold uppercase text-slate-500">
                                    Day {task.dayNumber}
                                  </span>
                                  <h4 className={`text-sm font-bold ${isCompleted ? 'line-through text-slate-400' : 'text-white'}`}>
                                    {task.title}
                                  </h4>
                                </div>
                                <p className="text-xs text-slate-300 font-sans leading-relaxed">{task.description}</p>
                              </div>
                            </div>
                          </div>

                          {/* Exercise & Deliverable */}
                          <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-xl bg-cyber-bg border border-slate-800/80 space-y-1">
                              <span className="text-[10px] font-mono text-electric-400 font-bold block">Practical Code Exercise</span>
                              <p className="text-slate-300 text-[11px] font-sans">{task.practicalExercise}</p>
                            </div>

                            <div className="p-3 rounded-xl bg-cyber-bg border border-slate-800/80 space-y-1">
                              <span className="text-[10px] font-mono text-emerald-400 font-bold block">Tangible Deliverable</span>
                              <p className="text-slate-300 text-[11px] font-sans">{task.deliverable}</p>
                            </div>
                          </div>

                          {/* Assessment Question & Resources */}
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] font-mono">
                            <div className="flex items-center gap-2">
                              {task.resources?.map((res, rIdx) => (
                                <a
                                  key={rIdx}
                                  href={res.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-cyan-400 hover:underline flex items-center gap-1"
                                >
                                  <BookOpen className="h-3 w-3" />
                                  <span>{res.title}</span>
                                  <ExternalLink className="h-2.5 w-2.5" />
                                </a>
                              ))}
                            </div>

                            <button
                              onClick={() => toggleAssessmentReveal(taskId)}
                              className="text-slate-400 hover:text-white flex items-center gap-1"
                            >
                              <HelpCircle className="h-3.5 w-3.5 text-electric-400" />
                              <span>{isAssessmentOpen ? 'Hide Check Question' : 'Self-Assessment Question'}</span>
                            </button>
                          </div>

                          {isAssessmentOpen && (
                            <div className="mt-2.5 p-3 rounded-xl bg-electric-500/10 border border-electric-500/20 text-xs text-slate-300 animate-in fade-in">
                              <span className="font-bold text-electric-300 block mb-0.5">Verification Check:</span>
                              <p className="font-sans text-[11px]">{task.assessmentQuestion}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Add Task Modal */}
          {showAddTask && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="relative w-full max-w-md rounded-3xl cyber-card p-6 border-electric-500/30 space-y-4">
                <h3 className="text-base font-extrabold text-white">Add Task to Week {selectedWeek}</h3>
                <form onSubmit={handleAddCustomTask} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">Task Title *</label>
                    <input
                      type="text"
                      required
                      value={customTaskTitle}
                      onChange={(e) => setCustomTaskTitle(e.target.value)}
                      placeholder="e.g. Build GraphQL API with DataLoader"
                      className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-electric-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={customTaskDesc}
                      onChange={(e) => setCustomTaskDesc(e.target.value)}
                      placeholder="Core concepts to master..."
                      className="w-full rounded-xl bg-cyber-bg border border-slate-800 p-2.5 text-xs text-white focus:outline-hidden focus:border-electric-400"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-slate-300 block mb-1">Deliverable</label>
                    <input
                      type="text"
                      value={customDeliverable}
                      onChange={(e) => setCustomDeliverable(e.target.value)}
                      placeholder="e.g. Passing Jest tests in repo"
                      className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3.5 py-2 text-xs text-white focus:outline-hidden focus:border-electric-400"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddTask(false)}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-1.5 rounded-lg bg-electric-600 text-xs font-mono font-bold text-white hover:bg-electric-500"
                    >
                      Add Task
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
