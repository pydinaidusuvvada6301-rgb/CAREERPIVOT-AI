import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Gauge,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  FileText,
  Target,
  Mic,
  FolderGit2,
  Briefcase,
} from 'lucide-react';

interface ReadinessBreakdown {
  resumeScore: number;
  skillAlignmentScore: number;
  interviewScore: number;
  portfolioScore: number;
  applicationActivityScore: number;
}

interface CareerReadinessScoreCardProps {
  targetRole: string;
  breakdown: ReadinessBreakdown;
}

export const CareerReadinessScoreCard: React.FC<CareerReadinessScoreCardProps> = ({
  targetRole,
  breakdown,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  // Weighted calculation (100% total):
  // Resume 25%, Skills 25%, Interview 25%, Portfolio 15%, Applications 10%
  const overallScore = Math.round(
    breakdown.resumeScore * 0.25 +
    breakdown.skillAlignmentScore * 0.25 +
    breakdown.interviewScore * 0.25 +
    breakdown.portfolioScore * 0.15 +
    breakdown.applicationActivityScore * 0.10
  );

  const getReadinessTier = (score: number) => {
    if (score >= 85) return { label: 'Interview & Offer Ready', color: 'text-emerald-400', bg: 'bg-emerald-500/20 border-emerald-500/40' };
    if (score >= 70) return { label: 'Competitive Candidate', color: 'text-electric-400', bg: 'bg-electric-500/20 border-electric-500/40' };
    if (score >= 50) return { label: 'Actively Bridging Gaps', color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/40' };
    return { label: 'Early Transition Phase', color: 'text-rose-400', bg: 'bg-rose-500/20 border-rose-500/40' };
  };

  const tier = getReadinessTier(overallScore);

  const categories = [
    {
      name: 'Resume ATS & Evidence',
      weight: '25%',
      score: breakdown.resumeScore,
      icon: FileText,
      link: '/resume-analyzer',
      action: 'Refine Bullets',
      hint: breakdown.resumeScore < 75 ? 'Improve STAR metrics & keywords' : 'Strong verified evidence',
    },
    {
      name: 'Technical Skill Alignment',
      weight: '25%',
      score: breakdown.skillAlignmentScore,
      icon: Target,
      link: '/skill-gap',
      action: 'Check Gaps',
      hint: breakdown.skillAlignmentScore < 75 ? 'Bridge missing core competencies' : 'High role compatibility',
    },
    {
      name: 'Mock Interview Rubric',
      weight: '25%',
      score: breakdown.interviewScore,
      icon: Mic,
      link: '/mock-interview',
      action: 'Drill Questions',
      hint: breakdown.interviewScore < 75 ? 'Practice structured responses' : 'Solid technical articulation',
    },
    {
      name: 'Portfolio Projects',
      weight: '15%',
      score: breakdown.portfolioScore,
      icon: FolderGit2,
      link: '/projects',
      action: 'View Blueprints',
      hint: breakdown.portfolioScore < 70 ? 'Ship gap-bridging repo deliverable' : 'Demonstrated project proof',
    },
    {
      name: 'Pipeline & Application Flow',
      weight: '10%',
      score: breakdown.applicationActivityScore,
      icon: Briefcase,
      link: '/applications',
      action: 'Manage Pipeline',
      hint: breakdown.applicationActivityScore < 70 ? 'Maintain active application pacing' : 'Consistent response tracking',
    },
  ];

  return (
    <div className="rounded-3xl cyber-card p-6 md:p-8 border-electric-500/25 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-electric-400 animate-pulse"></span>
            <span className="text-xs font-mono font-bold text-electric-400 uppercase tracking-wider">
              Composite Readiness Index
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-white mt-1">
            Explainable Career Readiness Score
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Holistic readiness benchmark for <strong className="text-electric-300 font-mono">{targetRole}</strong>.
          </p>
        </div>

        <button
          onClick={() => setShowExplanation(!showExplanation)}
          className="rounded-xl border border-slate-800 bg-cyber-bg px-3.5 py-2 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <HelpCircle className="h-4 w-4 text-electric-400" />
          <span>{showExplanation ? 'Hide Methodology' : 'How Score is Calculated'}</span>
        </button>
      </div>

      {/* Methodology Explainer Banner */}
      {showExplanation && (
        <div className="rounded-2xl border border-electric-500/30 bg-electric-500/10 p-4 text-xs text-slate-300 space-y-2 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-electric-400 font-bold">
            <Sparkles className="h-4 w-4" />
            <span>Explainable Heuristic Mathematical Weighting</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your Overall Score is a weighted composite: <strong>Resume Evidence (25%)</strong> + <strong>Skill Alignment (25%)</strong> + <strong>Interview Rubric (25%)</strong> + <strong>Portfolio Proof (15%)</strong> + <strong>Pipeline Pacing (10%)</strong>.
          </p>
          <p className="text-[11px] text-slate-400 italic">
            Notice: This indicator is an objective heuristic based on candidate data and platform activity to guide preparation, not an endorsement or guaranteed hiring outcome from any employer.
          </p>
        </div>
      )}

      {/* Score Centerpiece & Category Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Radial Badge */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-cyber-bg border border-slate-800 text-center">
          <div className="relative flex items-center justify-center">
            {/* SVG Ring Gauge */}
            <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                className="text-slate-800"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                className="text-electric-400 transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 50}
                strokeDashoffset={2 * Math.PI * 50 * (1 - overallScore / 100)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white font-mono">{overallScore}</span>
              <span className="text-[10px] font-mono text-slate-400 uppercase">out of 100</span>
            </div>
          </div>

          <div className="mt-4">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold border ${tier.bg} ${tier.color}`}>
              {tier.label}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-2 font-mono">
            {overallScore >= 80 ? 'Competitive across top tech employers' : 'Recommended: complete 2 more modules'}
          </p>
        </div>

        {/* 5-Category Breakdown Bars */}
        <div className="lg:col-span-8 space-y-3.5">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div
                key={idx}
                className="rounded-xl p-3.5 bg-cyber-bg/80 border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-electric-400" />
                    <span className="font-bold text-white">{cat.name}</span>
                    <span className="text-[10px] font-mono text-slate-500">({cat.weight})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-200">{cat.score}%</span>
                    <Link
                      to={cat.link}
                      className="text-[11px] font-mono text-electric-400 hover:text-electric-300 flex items-center gap-0.5 hover:underline"
                    >
                      <span>{cat.action}</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

                {/* Bar */}
                <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      cat.score >= 80
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                        : cat.score >= 60
                        ? 'bg-gradient-to-r from-electric-500 to-cyan-400'
                        : 'bg-gradient-to-r from-amber-500 to-rose-400'
                    }`}
                    style={{ width: `${Math.min(100, cat.score)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-mono">
                  <span>{cat.hint}</span>
                  <span>{cat.score >= 75 ? 'Target Met' : 'Needs Focus'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
