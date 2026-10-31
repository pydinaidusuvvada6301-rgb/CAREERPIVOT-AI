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
} from 'lucide-react';
import { PortfolioProject } from '../types';

interface ProjectCardProps {
  project: PortfolioProject;
  index: number;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index }) => {
  const [expanded, setExpanded] = useState(false);

  const difficultyColors = {
    Beginner: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Intermediate: 'bg-blue-50 text-brand-700 border-brand-200',
    Advanced: 'bg-purple-50 text-purple-700 border-purple-200',
  }[project.difficulty] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:border-brand-200 hover:shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 font-bold border border-brand-100 shrink-0">
            #{index + 1}
          </div>
          <div>
            <h3 className="text-lg font-bold text-navy-900 tracking-tight">{project.title}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${difficultyColors}`}>
                {project.difficulty}
              </span>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                {project.estimatedDuration}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-lg px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
        >
          {expanded ? 'Collapse Blueprint' : 'Full Architecture & Milestones'}
          {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Real-World Problem Statement
          </h4>
          <p className="mt-1 text-xs text-slate-700 leading-relaxed">
            {project.problemStatement}
          </p>
        </div>

        {/* Why this bridges candidate skill gaps */}
        <div className="rounded-xl bg-gradient-to-r from-brand-50/70 to-blue-50/40 border border-brand-100 p-3.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-900">
            <Sparkles className="h-4 w-4 text-brand-600" />
            <span>Why This Bridges Your Skill Gaps</span>
          </div>
          <p className="mt-1 text-xs text-brand-800 leading-relaxed">
            {project.whyRecommended}
          </p>
        </div>

        {/* Technologies & Demonstrated Skills */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Technologies & Competencies
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.map((tech) => (
              <span
                key={tech}
                className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-200"
              >
                {tech}
              </span>
            ))}
            {project.skillsDemonstrated.map((skill) => (
              <span
                key={skill}
                className="rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 border border-brand-200"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Expandable Milestones & GitHub Deliverables */}
        {expanded && (
          <div className="space-y-4 pt-3 border-t border-slate-100 animate-in fade-in duration-200">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Core Features
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {project.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Implementation Milestones
              </h4>
              <div className="space-y-2">
                {project.milestones.map((m, idx) => (
                  <div key={idx} className="rounded-lg bg-slate-50 p-2.5 border border-slate-200 text-xs">
                    <span className="font-semibold text-navy-900">{m.milestone}:</span>{' '}
                    <span className="text-slate-600">{m.deliverable}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Expected GitHub Deliverables
              </h4>
              <ul className="space-y-1 text-xs text-slate-700">
                {project.githubDeliverables.map((g, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <FolderGit2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>{g}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 text-xs">
              <span className="font-bold text-slate-800">Target Role Impact:</span>{' '}
              <span className="text-slate-600">{project.targetRoleSupport}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
