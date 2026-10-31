import { Request, Response, NextFunction } from 'express';
import { optimizeProgress } from '../services/progressOptimizer.js';
import { getSupabase, isSupabaseConfigured } from '../config/index.js';

interface ProgressState {
  userId: string;
  targetRole: string;
  tasksCompleted: number;
  totalTasks: number;
  streakDays: number;
  lastActivityDate: string;
  averageInterviewScore: number;
  recentAssessments: { topic: string; score: number; date: string }[];
  completedProjectsCount: number;
}

const localProgressStore: Map<string, ProgressState> = new Map();

function getInitialProgress(userId: string): ProgressState {
  return {
    userId,
    targetRole: 'Full-Stack Software Engineer',
    tasksCompleted: 6,
    totalTasks: 20,
    streakDays: 4,
    lastActivityDate: new Date().toISOString().split('T')[0],
    averageInterviewScore: 82,
    recentAssessments: [
      { topic: 'TypeScript Strict Types', score: 90, date: '2026-10-28' },
      { topic: 'REST Architecture & Zod', score: 85, date: '2026-10-29' },
      { topic: 'PostgreSQL RLS Policies', score: 78, date: '2026-10-30' },
    ],
    completedProjectsCount: 1,
  };
}

export const getProgressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id || 'demo-user';
    let progress: ProgressState;

    if (isSupabaseConfigured && req.user && !req.user.isDemoUser) {
      const supabase = getSupabase();
      if (supabase) {
        // Query tasks and records from Supabase
        const { data: record } = await supabase
          .from('progress_records')
          .select('*')
          .eq('user_id', userId)
          .single();

        const { count: completedCount } = await supabase
          .from('learning_tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('completed', true);

        const { count: totalCount } = await supabase
          .from('learning_tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        const { data: interviewData } = await supabase
          .from('interviews')
          .select('total_score')
          .eq('user_id', userId);

        const scores = (interviewData || []).map((i: any) => i.total_score).filter(Boolean);
        const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 80;

        progress = {
          userId,
          targetRole: record?.target_role || 'Full-Stack Software Engineer',
          tasksCompleted: completedCount || record?.tasks_completed || 0,
          totalTasks: totalCount || record?.total_tasks || 20,
          streakDays: record?.streak_days || 1,
          lastActivityDate: record?.last_activity_date || new Date().toISOString().split('T')[0],
          averageInterviewScore: avgScore,
          recentAssessments: [],
          completedProjectsCount: 0,
        };
      } else {
        progress = localProgressStore.get(userId) || getInitialProgress(userId);
      }
    } else {
      if (!localProgressStore.has(userId)) {
        localProgressStore.set(userId, getInitialProgress(userId));
      }
      progress = localProgressStore.get(userId)!;
    }

    // Call AI progress optimizer for evidence-based recommendations
    const { data: recommendations, isLiveAi } = await optimizeProgress(
      progress.targetRole,
      progress.tasksCompleted,
      progress.totalTasks,
      progress.streakDays,
      progress.averageInterviewScore
    );

    res.status(200).json({
      success: true,
      progress,
      recommendations,
      isLiveAi,
    });
  } catch (err) {
    next(err);
  }
};

export const updateProgressHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id || 'demo-user';
    const { taskId, completed, targetRole } = req.body;

    let progress = localProgressStore.get(userId) || getInitialProgress(userId);

    if (completed !== undefined) {
      if (completed) {
        progress.tasksCompleted = Math.min(progress.totalTasks, progress.tasksCompleted + 1);
      } else {
        progress.tasksCompleted = Math.max(0, progress.tasksCompleted - 1);
      }
      progress.lastActivityDate = new Date().toISOString().split('T')[0];
    }

    if (targetRole) {
      progress.targetRole = targetRole;
    }

    localProgressStore.set(userId, progress);

    if (isSupabaseConfigured && req.user && !req.user.isDemoUser) {
      const supabase = getSupabase();
      if (supabase && taskId) {
        await supabase
          .from('learning_tasks')
          .update({
            completed: Boolean(completed),
            completed_at: completed ? new Date().toISOString() : null,
          })
          .eq('id', taskId)
          .eq('user_id', userId);
      }
    }

    res.status(200).json({
      success: true,
      progress,
      message: 'Progress updated successfully',
    });
  } catch (err) {
    next(err);
  }
};
