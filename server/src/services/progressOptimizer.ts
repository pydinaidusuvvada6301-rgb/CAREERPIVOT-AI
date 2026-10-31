import { callGeminiJson } from './geminiClient.js';
import { z } from 'zod';

export const progressOptimizationSchema = z.object({
  summary: z.string(),
  recommendations: z.array(z.string()),
  recommendedPractice: z.string(),
  revisedScheduleFocus: z.string(),
  portfolioRefinements: z.array(z.string()),
});

export type ProgressOptimization = z.infer<typeof progressOptimizationSchema>;

export async function optimizeProgress(
  targetRole: string,
  tasksCompleted: number,
  totalTasks: number,
  streakDays: number,
  averageInterviewScore: number
): Promise<{ data: ProgressOptimization; isLiveAi: boolean }> {
  const prompt = `
Analyze the candidate's learning progress and provide recommendations:
- Target Role: ${targetRole}
- Tasks Completed: ${tasksCompleted} of ${totalTasks} (${totalTasks > 0 ? Math.round((tasksCompleted / totalTasks) * 100) : 0}%)
- Current Daily Streak: ${streakDays} days
- Average Mock Interview Score: ${averageInterviewScore}/100

Provide evidence-grounded recommendations:
1. Additional practice areas
2. Revised study schedule adjustments
3. Targeted portfolio refinements

Do not fabricate progress. Return valid JSON:
{
  "summary": "Objective assessment of current trajectory",
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "recommendedPractice": "Focused high-yield exercise",
  "revisedScheduleFocus": "Adjustment for remaining weekly study hours",
  "portfolioRefinements": ["Portfolio task 1", "Portfolio task 2"]
}
`;

  try {
    const { data, isLiveAi } = await callGeminiJson<any>(prompt);
    const validated = progressOptimizationSchema.parse(data);
    return { data: validated, isLiveAi };
  } catch (err: any) {
    console.warn('Falling back to rule-based progress optimizer:', err.message);

    const completionRate = totalTasks > 0 ? (tasksCompleted / totalTasks) : 0;
    const fallback: ProgressOptimization = {
      summary: `You have completed ${tasksCompleted} of ${totalTasks} milestones (${Math.round(completionRate * 100)}%) with a ${streakDays}-day active learning streak and an average interview score of ${averageInterviewScore}/100.`,
      recommendations: [
        completionRate < 0.5
          ? 'Maintain steady 1-hour daily blocks to build momentum on Week 1 & 2 foundations.'
          : 'Shift focus toward system design interview drills and multi-container Docker deployments.',
        averageInterviewScore < 75
          ? 'Practice articulating technical trade-offs using STAR structure to lift communication and practical example scores.'
          : 'High interview performance! Polish GitHub repository READMEs with interactive architecture diagrams.',
      ],
      recommendedPractice: 'Complete one end-to-end integration test suite and document error handling edge cases.',
      revisedScheduleFocus: 'Allocate 60% of available hours to coding deliverables and 40% to mock interview practice.',
      portfolioRefinements: [
        'Add a live demo badge and test coverage badge to your main GitHub repository README.',
        'Record a 2-minute video walkthrough demonstrating key features and architecture trade-offs.',
      ],
    };

    return { data: fallback, isLiveAi: false };
  }
}
