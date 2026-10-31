import React from 'react';
import {
  Award,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  FileCode2,
  TrendingUp,
} from 'lucide-react';
import { InterviewEvaluation } from '../types';

interface InterviewScoreProps {
  evaluation: InterviewEvaluation;
  onRetake?: () => void;
  onNextQuestion?: () => void;
}

export const InterviewScore: React.FC<InterviewScoreProps> = ({
  evaluation,
  onRetake,
  onNextQuestion,
}) => {
  const { breakdown, score } = evaluation;

  const getScoreColor = (pts: number) => {
    if (pts >= 80) return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
    if (pts >= 60) return 'text-amber-400 bg-amber-500/15 border-amber-500/30';
    return 'text-rose-400 bg-rose-500/15 border-rose-500/30';
  };

  return (
    <div className="rounded-3xl cyber-card p-6 md:p-8 border-electric-500/25 space-y-6">
      {/* Header and Total Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <span className="rounded-full bg-electric-500/20 px-3 py-1 text-xs font-mono font-bold text-electric-400 border border-electric-500/40">
            Hiring Rubric 100-Point Evaluation
          </span>
          <h3 className="text-xl font-extrabold text-white mt-2">Evaluation Breakdown</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {evaluation.evaluationNote || 'Scored across the standard CareerPivot 100-point 5-criteria rubric.'}
          </p>
        </div>

        <div className={`flex items-center gap-3 rounded-2xl px-5 py-3 border ${getScoreColor(score)}`}>
          <Award className="h-8 w-8 shrink-0" />
          <div>
            <div className="text-3xl font-black font-mono leading-none">{score} / 100</div>
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider mt-1">Rubric Score</div>
          </div>
        </div>
      </div>

      {/* 5-Criteria Rubric Breakdown */}
      <div>
        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 mb-3">
          5-Axis Rubric Breakdown
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="rounded-2xl p-3.5 bg-cyber-bg border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
              <span className="text-slate-300">Technical</span>
              <span className="font-bold text-electric-400">{breakdown.technicalCorrectness} / 30</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-electric-400 rounded-full"
                style={{ width: `${(breakdown.technicalCorrectness / 30) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">Max 30 pts</span>
          </div>

          <div className="rounded-2xl p-3.5 bg-cyber-bg border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
              <span className="text-slate-300">Problem Solving</span>
              <span className="font-bold text-cyan-400">{breakdown.problemSolving} / 25</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full"
                style={{ width: `${(breakdown.problemSolving / 25) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">Max 25 pts</span>
          </div>

          <div className="rounded-2xl p-3.5 bg-cyber-bg border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
              <span className="text-slate-300">Communication</span>
              <span className="font-bold text-neon-purple">{breakdown.communication} / 20</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-neon-purple rounded-full"
                style={{ width: `${(breakdown.communication / 20) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">Max 20 pts</span>
          </div>

          <div className="rounded-2xl p-3.5 bg-cyber-bg border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
              <span className="text-slate-300">Examples</span>
              <span className="font-bold text-amber-400">{breakdown.practicalExamples} / 15</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full"
                style={{ width: `${(breakdown.practicalExamples / 15) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">Max 15 pts</span>
          </div>

          <div className="rounded-2xl p-3.5 bg-cyber-bg border border-slate-800">
            <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
              <span className="text-slate-300">Structure</span>
              <span className="font-bold text-emerald-400">{breakdown.clarityStructure} / 10</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-full"
                style={{ width: `${(breakdown.clarityStructure / 10) * 100}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-slate-500 mt-1 block">Max 10 pts</span>
          </div>
        </div>
      </div>

      {/* Positive Points & Missing Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-2">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span>Demonstrated Strengths</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-200">
            {evaluation.positivePoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 mb-2">
            <AlertCircle className="h-4 w-4 text-rose-400" />
            <span>Missing Concepts & Trade-offs</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-200">
            {evaluation.missingConcepts.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-rose-400 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggested Improvements */}
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-400 mb-2">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          <span>Actionable Improvement Tips</span>
        </div>
        <ul className="space-y-1 text-xs text-slate-200">
          {evaluation.suggestedImprovements.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-amber-400 font-bold">→</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Stronger Example Answer */}
      <div className="rounded-2xl border border-electric-500/30 bg-cyber-bg p-5 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-electric-400">
          <FileCode2 className="h-4 w-4 text-electric-400" />
          <span>Model Stronger Example Answer (Top 5% Candidate Benchmark)</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {evaluation.strongerExample}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        {onRetake && (
          <button
            onClick={onRetake}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-300 bg-cyber-bg border border-slate-800 hover:text-white hover:border-slate-700 transition-colors"
          >
            Refine & Retake Answer
          </button>
        )}
        {onNextQuestion && (
          <button
            onClick={onNextQuestion}
            className="rounded-xl px-5 py-2 text-xs font-semibold text-white bg-gradient-to-r from-brand-600 to-electric-600 hover:scale-105 transition-all shadow-glow-sm"
          >
            Proceed to Next Question →
          </button>
        )}
      </div>
    </div>
  );
};
