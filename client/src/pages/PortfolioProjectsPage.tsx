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
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { api } from '../api/client';
import { PortfolioProject } from '../types';
import { ProjectCard } from '../components/ProjectCard';
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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [apiNotice, setApiNotice] = useState<string | null>(null);

  useEffect(() => {
    async function loadProjects() {
      setLoading(true);
      setError(null);

      try {
        const res = await api.recommendProjects({
          targetRole,
          skillGaps,
          existingSkills: profile?.currentSkills || ['JavaScript', 'HTML/CSS', 'Python'],
        });

        if (res.success && res.data.projects) {
          setProjects(res.data.projects);
          setApiNotice(res.notice || null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load portfolio recommendations.');
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, [targetRole]);

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
                <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 border border-amber-200">
                  Module 4
                </span>
                <span className="text-xs text-slate-500">Recruiter-Targeted Deliverables</span>
              </div>
              <h1 className="text-2xl font-bold text-navy-900 mt-1">Portfolio Project Recommendations</h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Three production blueprints explicitly mapped to bridge your identified skill gaps.
              </p>
            </div>

            <button
              onClick={() => navigate('/mock-interview', { state: { targetRole } })}
              className="rounded-xl bg-brand-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-brand-700 transition-colors flex items-center gap-1.5"
            >
              <span>Practice AI Mock Interview</span>
              <ArrowRight className="h-4 w-4" />
            </button>
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
              message="Architecting Custom Portfolio Blueprints..."
              subtext="Generating problem statements, milestone deliverables, and GitHub specs matching your target role."
            />
          )}

          {/* Project List */}
          {!loading && projects.length > 0 && (
            <div className="space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-navy-900 to-slate-900 text-white p-6 shadow-sm">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
                  Target Role: {targetRole}
                </span>
                <h2 className="text-xl font-extrabold mt-1">Proof-Over-Promises Strategy</h2>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed max-w-2xl">
                  Recruiters prioritize candidates with tangible, deployed GitHub repositories solving genuine architectural problems. Complete any of these 3 blueprints to turn your identified skill gaps into demonstrable proof.
                </p>
              </div>

              <div className="space-y-6">
                {projects.map((proj, idx) => (
                  <ProjectCard key={idx} project={proj} index={idx} />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
