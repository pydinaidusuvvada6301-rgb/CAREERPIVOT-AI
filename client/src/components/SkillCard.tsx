import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight } from 'lucide-react';
import { SkillDetail } from '../types';

interface SkillCardProps {
  skill: SkillDetail;
  status: 'matching' | 'missing' | 'needsEvidence';
}

export const SkillCard: React.FC<SkillCardProps> = ({ skill, status }) => {
  const statusConfig = {
    matching: {
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      label: 'Verified Match',
    },
    missing: {
      badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle,
      iconColor: 'text-rose-600',
      label: 'Missing Skill',
    },
    needsEvidence: {
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      label: 'Needs Evidence',
    },
  }[status];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-xs">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <StatusIcon className={`h-5 w-5 shrink-0 ${statusConfig.iconColor}`} />
          <h4 className="font-bold text-slate-900 text-sm">{skill.skill}</h4>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold border ${statusConfig.badgeBg}`}>
            {statusConfig.label}
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
            {skill.importance} Priority
          </span>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-y border-slate-100 py-2.5 my-2.5">
        <div>
          <span className="text-slate-400 font-medium">Estimated Proficiency:</span>{' '}
          <span className={`font-semibold ${skill.proficiencyEstimated === 'Not assessed' ? 'text-slate-500 italic' : 'text-slate-800'}`}>
            {skill.proficiencyEstimated}
          </span>
        </div>
        <div>
          <span className="text-slate-400 font-medium">Required Level:</span>{' '}
          <span className="font-semibold text-slate-800">{skill.requiredProficiency}</span>
        </div>
      </div>

      <div className="space-y-1.5 text-xs">
        <div>
          <span className="font-semibold text-slate-700">Resume Evidence:</span>
          <p className="text-slate-600 mt-0.5 text-[11px] leading-relaxed bg-slate-50 p-2 rounded-lg border border-slate-100">
            {skill.resumeEvidence || 'No direct evidence found in uploaded resume.'}
          </p>
        </div>
        <div className="pt-1">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <ArrowRight className="h-3 w-3 text-brand-600" /> Suggested Action:
          </span>
          <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed pl-4">
            {skill.suggestedAction}
          </p>
        </div>
      </div>
    </div>
  );
};
