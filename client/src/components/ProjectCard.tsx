import React, { useState } from 'react';
import {
  FolderGit2,
  Clock,
  Layers,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  ExternalLink,
  Sparkles,
  GitBranch,
  Globe,
  Trash2,
  CheckCircle2,
  PlayCircle,
} from 'lucide-react';
import { PortfolioProject } from '../types';

export interface ExtendedProject extends PortfolioProject {
  id?: string;
  githubUrl?: string;
  demoUrl?: string;
  projectStatus?: 'Recommended' | 'In Progress' | 'Completed';
  isCustom?: boolean;
}

interface ProjectCardProps {
  project: ExtendedProject;
  index: number;
  onUpdateStatus?: (status: 'Recommended' | 'In Progress' | 'Completed') => void;
  onUpdateLinks?: (githubUrl: string, demoUrl: string) => void;
  onDelete?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  index,
  onUpdateStatus,
  onUpdateLinks,
  onDelete,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [editingLinks, setEditingLinks] = useState(false);
  const [githubUrl, setGithubUrl] = useState(project.githubUrl || '');
  const [demoUrl, setDemoUrl] = useState(project.demoUrl || '');

  const difficultyColors = {
    Beginner: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    Intermediate: 'bg-electric-500/20 text-electric-400 border-electric-500/40',
    Advanced: 'bg-neon-purple/20 text-neon-purple border-neon-purple/40',
  }[project.difficulty] || 'bg-slate-800 text-slate-300 border-slate-700';

  const statusColors = {
    Recommended: 'bg-slate-800 text-slate-400 border-slate-700',
    'In Progress': 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    Completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
  }[project.projectStatus || 'Recommended'];

  const handleSaveLinks = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateLinks) {
      onUpdateLinks(githubUrl, demoUrl);
    }
    setEditingLinks(false);
  };

  return (
    <div className="rounded-3xl cyber-card p-6 border-electric-500/25 transition-all hover:border-electric-400/60 space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-electric-500/15 text-electric-400 font-mono font-bold border border-electric-500/30 shrink-0">
            #{index + 1}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight">{project.title}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1 font-mono text-xs">
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${difficultyColors}`}>
                {project.difficulty}
              </span>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${statusColors}`}>
                {project.projectStatus || 'Recommended'}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Clock className="h-3 w-3 text-slate-500" />
                {project.estimatedDuration}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Status selector toggle */}
          {onUpdateStatus && (
            <select
              value={project.projectStatus || 'Recommended'}
              onChange={(e) => onUpdateStatus(e.target.value as any)}
              className="rounded-xl bg-cyber-bg border border-slate-800 px-2.5 py-1.5 text-[11px] font-mono text-slate-300 focus:border-electric-400 focus:outline-hidden"
            >
              <option value="Recommended">Recommended</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-cyber-bg px-3 py-1.5 text-xs font-mono font-bold text-electric-400 hover:text-white hover:border-slate-700 transition-all"
          >
            {expanded ? 'Collapse Blueprint' : 'Full Architecture & Milestones'}
            {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>

          {project.isCustom && onDelete && (
            <button
              onClick={onDelete}
              className="p-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
              title="Delete Project"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Summary and Problem Statement */}
      <div className="space-y-3">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Problem Statement</span>
          <p className="text-xs sm:text-sm text-slate-200 mt-0.5 leading-relaxed font-sans">
            {project.problemStatement}
          </p>
        </div>

        <div className="rounded-2xl border border-neon-purple/20 bg-neon-purple/5 p-3.5 text-xs text-slate-300">
          <span className="font-bold text-neon-purple flex items-center gap-1.5 mb-0.5">
            <Sparkles className="h-3.5 w-3.5" /> Why Recruiters Value This Project:
          </span>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{project.whyRecommended}</p>
        </div>
      </div>

      {/* Technologies & Demonstrations */}
      <div className="space-y-2">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">Tech Stack</span>
        <div className="flex flex-wrap gap-1.5">
          {project.technologies.map((tech, i) => (
            <span
              key={i}
              className="rounded-lg bg-cyber-bg border border-slate-800 px-2.5 py-1 text-[11px] font-mono text-cyan-300"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Repository & Demo links ribbon */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-slate-300 hover:text-white font-mono hover:underline"
            >
              <GitBranch className="h-4 w-4 text-electric-400" />
              <span>GitHub Repo</span>
              <ExternalLink className="h-3 w-3 text-slate-500" />
            </a>
          ) : (
            <button
              onClick={() => setEditingLinks(true)}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-300 font-mono text-[11px]"
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span>+ Add GitHub Link</span>
            </button>
          )}

          {project.demoUrl ? (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-cyan-300 hover:text-cyan-200 font-mono hover:underline"
            >
              <Globe className="h-4 w-4 text-cyan-400" />
              <span>Live Demo</span>
              <ExternalLink className="h-3 w-3 text-slate-500" />
            </a>
          ) : (
            <button
              onClick={() => setEditingLinks(true)}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-300 font-mono text-[11px]"
            >
              <Globe className="h-3.5 w-3.5" />
              <span>+ Add Live Demo</span>
            </button>
          )}
        </div>

        {onUpdateLinks && !editingLinks && (
          <button
            onClick={() => setEditingLinks(true)}
            className="text-[11px] font-mono text-electric-400 hover:underline"
          >
            Edit Links
          </button>
        )}
      </div>

      {/* Edit Links inline modal */}
      {editingLinks && (
        <form onSubmit={handleSaveLinks} className="p-3.5 rounded-2xl bg-cyber-bg border border-slate-800 space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">GitHub Repository URL</label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/username/project"
                className="w-full rounded-xl bg-cyber-surface border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono text-slate-400 block mb-1">Live Demo Deployment URL</label>
              <input
                type="url"
                value={demoUrl}
                onChange={(e) => setDemoUrl(e.target.value)}
                placeholder="https://my-project.vercel.app"
                className="w-full rounded-xl bg-cyber-surface border border-slate-700 px-3 py-1.5 text-xs text-white focus:outline-hidden"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setEditingLinks(false)}
              className="px-3 py-1 rounded-lg text-xs font-mono text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1 rounded-lg bg-electric-600 text-xs font-mono font-bold text-white hover:bg-electric-500"
            >
              Save Deliverables
            </button>
          </div>
        </form>
      )}

      {/* Expanded Architecture & Milestones */}
      {expanded && (
        <div className="pt-4 border-t border-slate-800 space-y-5 animate-in fade-in duration-200">
          {/* Key Features */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
              Architecture Capabilities & Deliverables
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {project.features.map((feat, i) => (
                <div key={i} className="flex items-start gap-2 p-2.5 rounded-xl bg-cyber-bg border border-slate-800/80 text-xs text-slate-300">
                  <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Development Milestones */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-2">
              Step-by-Step Implementation Milestones
            </h4>
            <div className="space-y-2">
              {project.milestones.map((m, i) => (
                <div key={i} className="p-3 rounded-xl bg-cyber-bg border border-slate-800 flex items-start justify-between gap-3 text-xs">
                  <div>
                    <span className="font-mono text-electric-400 font-bold">Phase {i + 1}: </span>
                    <strong className="text-white font-sans">{m.milestone}</strong>
                    <p className="text-[11px] text-slate-400 mt-0.5 font-mono">Deliverable: {m.deliverable}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-slate-800 text-slate-400">
                    Phase {i + 1}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
