import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Code,
  Layers,
  Plus,
  Filter,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { api } from '../api/client';
import { PortfolioProject } from '../types';
import { ProjectCard, ExtendedProject } from '../components/ProjectCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { useAuth } from '../context/AuthContext';

export const PortfolioProjectsPage: React.FC = () => {
  const { profile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [targetRole, setTargetRole] = useState(
    (location.state as any)?.targetRole || profile?.targetRole || 'Full-Stack Software Engineer'
  );
  const [skillGaps, setSkillGaps] = useState<string[]>(
    (location.state as any)?.skillGaps || ['Docker', 'AWS', 'Automated Testing', 'PostgreSQL RLS']
  );

  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Advanced'>('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Recommended' | 'In Progress' | 'Completed'>('All');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ExtendedProject[]>([]);
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  // Custom project modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customProblem, setCustomProblem] = useState('');
  const [customTech, setCustomTech] = useState('');
  const [customDifficulty, setCustomDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');
  const [customGithub, setCustomGithub] = useState('');
  const [customDemo, setCustomDemo] = useState('');

  // Load projects from API or localStorage
  const loadProjects = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.recommendProjects({
        targetRole,
        skillGaps,
        existingSkills: profile?.currentSkills || ['JavaScript', 'HTML/CSS', 'Python'],
      });

      if (res.success && res.data.projects) {
        // Load custom user projects from local storage
        let customSaved: ExtendedProject[] = [];
        try {
          const stored = localStorage.getItem('careerpivot_custom_projects');
          if (stored) customSaved = JSON.parse(stored);
        } catch {
          // ignore
        }

        const formatted = res.data.projects.map((p: PortfolioProject) => ({
          ...p,
          projectStatus: 'Recommended' as const,
        }));

        setProjects([...customSaved, ...formatted]);
        setApiNotice(res.notice || null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load portfolio recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [targetRole]);

  // Handle adding custom project
  const handleAddCustomProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customProblem.trim()) return;

    const newProject: ExtendedProject = {
      id: `proj-${Date.now()}`,
      title: customTitle.trim(),
      problemStatement: customProblem.trim(),
      whyRecommended: 'Custom personal project aligned with your career goals and verified deliverables.',
      skillsDemonstrated: customTech.split(',').map((s) => s.trim()).filter(Boolean),
      technologies: customTech.split(',').map((s) => s.trim()).filter(Boolean),
      difficulty: customDifficulty,
      estimatedDuration: '2-3 Weeks',
      features: ['Full authentication & authorization', 'Production database with schemas', 'Clean REST API'],
      milestones: [
        { milestone: 'Architecture & API Contracts', deliverable: 'Zod schemas and DB tables' },
        { milestone: 'Core Business Logic', deliverable: 'Endpoints and state management' },
        { milestone: 'Production Deployment', deliverable: 'Live Vercel/Render URLs' },
      ],
      githubDeliverables: ['README with architecture diagram', 'Automated test suite'],
      targetRoleSupport: `Direct evidence for ${targetRole}`,
      githubUrl: customGithub.trim() || undefined,
      demoUrl: customDemo.trim() || undefined,
      projectStatus: 'In Progress',
      isCustom: true,
    };

    const updated = [newProject, ...projects];
    setProjects(updated);

    // Save custom projects in localStorage
    const customs = updated.filter((p) => p.isCustom);
    localStorage.setItem('careerpivot_custom_projects', JSON.stringify(customs));

    // Reset form
    setCustomTitle('');
    setCustomProblem('');
    setCustomTech('');
    setCustomGithub('');
    setCustomDemo('');
    setShowAddModal(false);
  };

  const handleUpdateStatus = (index: number, newStatus: 'Recommended' | 'In Progress' | 'Completed') => {
    setProjects((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], projectStatus: newStatus };
      const customs = updated.filter((p) => p.isCustom);
      localStorage.setItem('careerpivot_custom_projects', JSON.stringify(customs));
      return updated;
    });
  };

  const handleUpdateLinks = (index: number, githubUrl: string, demoUrl: string) => {
    setProjects((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], githubUrl, demoUrl };
      const customs = updated.filter((p) => p.isCustom);
      localStorage.setItem('careerpivot_custom_projects', JSON.stringify(customs));
      return updated;
    });
  };

  const handleDeleteProject = (index: number) => {
    if (confirm('Are you sure you want to delete this custom project?')) {
      setProjects((prev) => {
        const updated = prev.filter((_, i) => i !== index);
        const customs = updated.filter((p) => p.isCustom);
        localStorage.setItem('careerpivot_custom_projects', JSON.stringify(customs));
        return updated;
      });
    }
  };

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    if (difficultyFilter !== 'All' && p.difficulty !== difficultyFilter) return false;
    if (statusFilter !== 'All' && (p.projectStatus || 'Recommended') !== statusFilter) return false;
    return true;
  });

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
                <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-xs font-mono font-bold text-amber-400 border border-amber-500/40">
                  Module 4
                </span>
                <span className="text-xs font-mono text-slate-400">Recruiter-Targeted Deliverables</span>
              </div>
              <h1 className="text-2xl font-extrabold text-white mt-1">Portfolio Project Builder</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Curated production blueprints explicitly mapped to bridge your identified skill gaps with verified code.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                className="rounded-xl border border-electric-500/30 bg-cyber-surface px-4 py-2.5 text-xs font-bold text-white shadow-glow-sm hover:border-electric-400 transition-all flex items-center gap-1.5"
              >
                <Plus className="h-4 w-4 text-electric-400" />
                <span>Add Custom Project</span>
              </button>

              <button
                onClick={() => navigate('/mock-interview', { state: { targetRole } })}
                className="rounded-xl bg-gradient-to-r from-brand-600 via-electric-600 to-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-glow-sm hover:scale-105 transition-all flex items-center gap-1.5"
              >
                <span>Practice Mock Interview</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Filtering and Generator Bar */}
          <div className="rounded-2xl cyber-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-mono">
                <Filter className="h-3.5 w-3.5 text-slate-400" />
                <span className="text-slate-400">Difficulty:</span>
                {(['All', 'Beginner', 'Intermediate', 'Advanced'] as const).map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficultyFilter(diff)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                      difficultyFilter === diff
                        ? 'bg-electric-500/20 text-electric-400 border border-electric-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>

              <div className="h-4 w-px bg-slate-800 hidden md:block" />

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Status:</span>
                {(['All', 'Recommended', 'In Progress', 'Completed'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-all ${
                      statusFilter === st
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={loadProjects}
              disabled={loading}
              className="text-xs font-mono text-electric-400 hover:text-electric-300 flex items-center gap-1.5 self-start md:self-auto"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Regenerate AI Blueprints</span>
            </button>
          </div>

          {error && <ErrorState message={error} onRetry={loadProjects} />}

          {loading && (
            <LoadingState
              message="Architecting Production Project Blueprints..."
              subtext="Generating end-to-end specifications with measurable deliverables and GitHub milestone plans."
            />
          )}

          {/* Project Cards List */}
          {!loading && (
            <div className="space-y-6">
              {filteredProjects.length === 0 ? (
                <div className="p-8 text-center rounded-3xl cyber-card border-slate-800 text-slate-400">
                  <FolderGit2 className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm font-bold text-slate-300">No projects match the selected filters.</p>
                  <p className="text-xs text-slate-500 mt-1">Try resetting the difficulty or status filter.</p>
                </div>
              ) : (
                filteredProjects.map((project, idx) => (
                  <ProjectCard
                    key={project.id || idx}
                    project={project}
                    index={idx}
                    onUpdateStatus={(st) => handleUpdateStatus(idx, st)}
                    onUpdateLinks={(gh, demo) => handleUpdateLinks(idx, gh, demo)}
                    onDelete={() => handleDeleteProject(idx)}
                  />
                ))
              )}
            </div>
          )}

          {/* Add Custom Project Modal */}
          {showAddModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
              <div className="relative w-full max-w-xl rounded-3xl cyber-card p-6 md:p-8 border-electric-500/30 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-base font-extrabold text-white">Add Custom Portfolio Project</h3>
                    <p className="text-xs text-slate-400">Track and demonstrate your own projects in your portfolio pipeline.</p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleAddCustomProject} className="space-y-4">
                  <div>
                    <label className="text-xs font-mono font-bold text-slate-300 block mb-1">Project Title *</label>
                    <input
                      type="text"
                      required
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g. Distributed Task Scheduler with Redis"
                      className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3.5 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono font-bold text-slate-300 block mb-1">Problem Statement & Purpose *</label>
                    <textarea
                      required
                      rows={3}
                      value={customProblem}
                      onChange={(e) => setCustomProblem(e.target.value)}
                      placeholder="Explain the technical challenge, target users, and what business problem this solves."
                      className="w-full rounded-xl bg-cyber-bg border border-slate-800 p-3 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-mono font-bold text-slate-300 block mb-1">Tech Stack (comma separated)</label>
                      <input
                        type="text"
                        value={customTech}
                        onChange={(e) => setCustomTech(e.target.value)}
                        placeholder="React, Node.js, Redis, PostgreSQL"
                        className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono font-bold text-slate-300 block mb-1">Difficulty Level</label>
                      <select
                        value={customDifficulty}
                        onChange={(e) => setCustomDifficulty(e.target.value as any)}
                        className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-mono font-bold text-slate-300 block mb-1">GitHub Repo URL (Optional)</label>
                      <input
                        type="url"
                        value={customGithub}
                        onChange={(e) => setCustomGithub(e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-mono font-bold text-slate-300 block mb-1">Live Demo URL (Optional)</label>
                      <input
                        type="url"
                        value={customDemo}
                        onChange={(e) => setCustomDemo(e.target.value)}
                        placeholder="https://my-app.vercel.app"
                        className="w-full rounded-xl bg-cyber-bg border border-slate-800 px-3 py-2 text-xs text-white focus:border-electric-400 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 rounded-xl text-xs font-mono text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-electric-600 text-xs font-bold text-white shadow-glow-sm hover:scale-105 transition-all"
                    >
                      Add Project to Portfolio
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
