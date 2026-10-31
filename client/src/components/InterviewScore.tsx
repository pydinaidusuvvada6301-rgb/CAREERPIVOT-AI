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
    if (pts >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (pts >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
      {/* Header and Total Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 border border-brand-200">
            Official 100-Point Evaluation
          </span>
          <h3 className="text-xl font-bold text-navy-900 mt-2">Evaluation Results</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {evaluation.evaluationNote || 'Scored using standard CareerPivot 100-point rubric.'}
          </p>
        </div>

        <div className={`flex items-center gap-3 rounded-2xl px-5 py-3 border ${getScoreColor(score)}`}>
          <Award className="h-8 w-8 shrink-0" />
          <div>
            <div className="text-2xl font-black leading-none">{score} / 100</div>
            <div className="text-xs font-semibold uppercase tracking-wider mt-0.5">Total Rubric Score</div>
          </div>
        </div>
      </div>

      {/* 5-Criteria Rubric Breakdown */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Rubric Criteria Breakdown
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-600">Technical</span>
              <span className="font-bold text-slate-900">{breakdown.technicalCorrectness} / 30</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full"
                style={{ width: `${(breakdown.technicalCorrectness / 30) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Max 30 pts</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-600">Problem Solving</span>
              <span className="font-bold text-slate-900">{breakdown.problemSolving} / 25</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full"
                style={{ width: `${(breakdown.problemSolving / 25) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Max 25 pts</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-600">Communication</span>
              <span className="font-bold text-slate-900">{breakdown.communication} / 20</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full"
                style={{ width: `${(breakdown.communication / 20) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Max 20 pts</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-600">Practical Examples</span>
              <span className="font-bold text-slate-900">{breakdown.practicalExamples} / 15</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full"
                style={{ width: `${(breakdown.practicalExamples / 15) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Max 15 pts</span>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-medium text-slate-600">Clarity & Structure</span>
              <span className="font-bold text-slate-900">{breakdown.clarityStructure} / 10</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-600 rounded-full"
                style={{ width: `${(breakdown.clarityStructure / 10) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">Max 10 pts</span>
          </div>
        </div>
      </div>

      {/* Positive Points & Missing Concepts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 mb-2">
            <CheckCircle className="h-4 w-4 text-emerald-600" />
            <span>Demonstrated Strengths</span>
          </div>
          <ul className="space-y-1.5 text-xs text-emerald-900/90">
            {evaluation.positivePoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-900 mb-2">
            <AlertCircle className="h-4 w-4 text-rose-600" />
            <span>Missing Concepts & Trade-offs</span>
          </div>
          <ul className="space-y-1.5 text-xs text-rose-900/90">
            {evaluation.missingConcepts.map((item, idx) => (
              <li key={idx} className="flex items-start gap-1.5">
                <span className="text-rose-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggested Improvements */}
      <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-2">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          <span>Actionable Improvement Tips</span>
        </div>
        <ul className="space-y-1 text-xs text-amber-900/90">
          {evaluation.suggestedImprovements.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-amber-500 font-bold">→</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Stronger Example Answer */}
      <div className="rounded-xl border border-slate-200 bg-slate-900 text-slate-100 p-5">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-400 mb-2">
          <FileCode2 className="h-4 w-4 text-brand-400" />
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
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Refine & Retake Answer
          </button>
        )}
        {onNextQuestion && (
          <button
            onClick={onNextQuestion}
            className="rounded-xl px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-colors shadow-xs"
          >
            Proceed to Next Question →
          </button>
        )}
      </div>
    </div>
  );
};
