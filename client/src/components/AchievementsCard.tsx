import React, { useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  Lock,
  Sparkles,
  Award,
  Zap,
  Target,
  FileCheck,
  Mic,
  Flame,
  Send,
} from 'lucide-react';

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  unlocked: boolean;
  progressText: string;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
}

interface AchievementsCardProps {
  stats: {
    hasResumeAnalysis: boolean;
    interviewCount: number;
    highestInterviewScore: number;
    projectsCompleted: number;
    streakDays: number;
    applicationsCount: number;
    skillMatchPercentage: number;
  };
}

export const AchievementsCard: React.FC<AchievementsCardProps> = ({ stats }) => {
  const [filter, setFilter] = useState<'all' | 'unlocked'>('all');

  const achievements: AchievementItem[] = [
    {
      id: 'first_resume',
      title: 'First Resume Evidence Audit',
      description: 'Extracted and verified structured technical evidence from your resume.',
      icon: FileCheck,
      unlocked: stats.hasResumeAnalysis,
      progressText: stats.hasResumeAnalysis ? 'Completed' : 'Upload your resume to unlock',
      tier: 'Bronze',
    },
    {
      id: 'first_interview',
      title: 'First Drill in the Arena',
      description: 'Completed your first AI Mock Interview simulation under rubric scoring.',
      icon: Mic,
      unlocked: stats.interviewCount >= 1,
      progressText: `${Math.min(stats.interviewCount, 1)} / 1 interview completed`,
      tier: 'Bronze',
    },
    {
      id: 'first_project',
      title: 'Portfolio Architect',
      description: 'Initiated or launched your first gap-bridging portfolio project.',
      icon: Target,
      unlocked: stats.projectsCompleted >= 1,
      progressText: `${Math.min(stats.projectsCompleted, 1)} / 1 project active`,
      tier: 'Silver',
    },
    {
      id: 'seven_streak',
      title: '7-Day Discipline Streak',
      description: 'Maintained consistent learning activity for 7 consecutive days.',
      icon: Flame,
      unlocked: stats.streakDays >= 7,
      progressText: `${Math.min(stats.streakDays, 7)} / 7 days active`,
      tier: 'Silver',
    },
    {
      id: 'ten_applications',
      title: 'Pipeline Momentum',
      description: 'Tracked your first 10 job applications with structured conversion metrics.',
      icon: Send,
      unlocked: stats.applicationsCount >= 10,
      progressText: `${Math.min(stats.applicationsCount, 10)} / 10 applications tracked`,
      tier: 'Gold',
    },
    {
      id: 'skill_master',
      title: 'Skill Alignment Master',
      description: 'Attained an 80%+ skill match against verified target job specifications.',
      icon: Zap,
      unlocked: stats.skillMatchPercentage >= 80,
      progressText: `${Math.round(stats.skillMatchPercentage)}% / 80% benchmark`,
      tier: 'Gold',
    },
    {
      id: 'interview_ready',
      title: 'Interview Ready Standard',
      description: 'Demonstrated mastery with an average mock interview score of 85+.',
      icon: Trophy,
      unlocked: stats.highestInterviewScore >= 85,
      progressText: `${stats.highestInterviewScore}/100 points (Requires 85+)`,
      tier: 'Diamond',
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const filteredAchievements = filter === 'unlocked' ? achievements.filter((a) => a.unlocked) : achievements;

  const getTierColor = (tier: AchievementItem['tier']) => {
    switch (tier) {
      case 'Diamond':
        return 'border-cyan-400/50 bg-cyan-500/10 text-cyan-300';
      case 'Gold':
        return 'border-amber-400/50 bg-amber-500/10 text-amber-300';
      case 'Silver':
        return 'border-slate-400/50 bg-slate-500/10 text-slate-300';
      default:
        return 'border-electric-400/50 bg-electric-500/10 text-electric-300';
    }
  };

  return (
    <div className="rounded-3xl cyber-card p-6 border-electric-500/25 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Trophy className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              Career Milestone Achievements
              <span className="rounded-full bg-electric-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-electric-400 border border-electric-500/40">
                {unlockedCount} / {achievements.length} Unlocked
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Objective gamification tied directly to verified real user activity without fabricated unlocks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-cyber-bg border border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              filter === 'all'
                ? 'bg-electric-500/20 text-electric-400 border border-electric-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({achievements.length})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              filter === 'unlocked'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
        </div>
      </div>

      {/* Progress meter */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-mono">
          <span className="text-slate-400">Platform Progression</span>
          <span className="text-electric-400 font-bold">{Math.round((unlockedCount / achievements.length) * 100)}% Complete</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-electric-500 via-cyan-400 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Achievement Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-2">
        {filteredAchievements.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`rounded-2xl p-4 transition-all border ${
                item.unlocked
                  ? 'bg-cyber-surface/90 border-electric-500/40 shadow-glow-sm hover:border-electric-400'
                  : 'bg-cyber-bg/60 border-slate-800/80 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl border ${
                    item.unlocked
                      ? getTierColor(item.tier)
                      : 'border-slate-800 bg-slate-900 text-slate-600'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase border ${getTierColor(item.tier)}`}>
                    {item.tier}
                  </span>
                  {item.unlocked ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Lock className="h-3.5 w-3.5 text-slate-500" />
                  )}
                </div>
              </div>

              <h4 className="text-xs font-bold text-white leading-tight">
                {item.title}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {item.description}
              </p>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                <span className={item.unlocked ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
                  {item.progressText}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
