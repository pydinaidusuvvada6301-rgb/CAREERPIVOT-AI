import { callGeminiJson } from './geminiClient.js';
import { interviewEvaluationOutputSchema, InterviewEvaluationOutput } from '../schemas/index.js';

export async function evaluateInterviewAnswer(
  question: string,
  userAnswer: string,
  targetRole: string,
  interviewType: 'technical' | 'hr' | 'behavioral' | 'coding',
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): Promise<{ evaluation: InterviewEvaluationOutput; isLiveAi: boolean }> {
  const prompt = `
You are a senior hiring committee member evaluating a candidate's response in an interview for: "${targetRole}".
Interview Type: ${interviewType}
Difficulty Level: ${difficulty}

Interview Question:
"${question}"

Candidate Answer:
"${userAnswer}"

EVALUATION RUBRIC (Strict 100-point scale):
1. Technical correctness (Max 30 pts): Accuracy of concepts, terminologies, and domain mechanics.
2. Problem-solving (Max 25 pts): Systematic reasoning, consideration of edge cases, and architectural awareness.
3. Communication (Max 20 pts): Articulation, tone, professional conciseness.
4. Practical examples (Max 15 pts): Real-world project references, metrics, or tangible engineering trade-offs.
5. Clarity and structure (Max 10 pts): Organization, logical flow (e.g. STAR method or top-down structuring).

Total score MUST equal the exact sum of these 5 breakdown items.

Provide:
- Specific positive points in the candidate's answer
- Crucial concepts or trade-offs that were missed
- Points where explanation was weak or superficial
- Actionable suggestions to improve the answer
- A model "Stronger Example Answer" demonstrating how a top 5% candidate would answer this question.

Return JSON adhering strictly to:
{
  "score": 82,
  "breakdown": {
    "technicalCorrectness": 26,
    "problemSolving": 21,
    "communication": 16,
    "practicalExamples": 11,
    "clarityStructure": 8
  },
  "positivePoints": ["Clear understanding of ...", "..."],
  "missingConcepts": ["Did not mention ...", "..."],
  "weakExplanations": ["Explanation of ... was vague", "..."],
  "suggestedImprovements": ["Structure using STAR method", "Quantify with specific latency or memory metrics"],
  "strongerExample": "A polished, structured answer illustrating ideal depth, metrics, and architecture trade-offs.",
  "evaluationNote": "Scored using standard CareerPivot 100-point rubric. Not an official employer hiring prediction."
}
`;

  try {
    const { data, isLiveAi } = await callGeminiJson<any>(prompt);
    
    // Ensure the total score strictly matches breakdown sum
    if (data.breakdown) {
      data.score = Math.min(
        100,
        Math.max(
          0,
          (data.breakdown.technicalCorrectness || 0) +
          (data.breakdown.problemSolving || 0) +
          (data.breakdown.communication || 0) +
          (data.breakdown.practicalExamples || 0) +
          (data.breakdown.clarityStructure || 0)
        )
      );
    }
    
    data.evaluationNote = "Scored using standard CareerPivot 100-point rubric. Not an official employer hiring prediction.";
    const validated = interviewEvaluationOutputSchema.parse(data);
    return { evaluation: validated, isLiveAi };
  } catch (err: any) {
    console.warn('Falling back to rule-based evaluation rubric:', err.message);

    // Deterministic evaluation based on length, keywords, and structure
    const wordCount = userAnswer.trim().split(/\s+/).length;
    const hasExample = /\b(for example|such as|in my project|specifically|reduced|increased|built|implemented)\b/i.test(userAnswer);
    const hasTechnicalKeywords = /\b(security|database|latency|cache|index|token|async|state|api|testing|ci\/cd|framework|architecture)\b/i.test(userAnswer);

    let technical = Math.min(30, Math.max(12, Math.round(wordCount * 0.15) + (hasTechnicalKeywords ? 12 : 5)));
    let problemSolving = Math.min(25, Math.max(10, Math.round(wordCount * 0.12) + 8));
    let communication = Math.min(20, Math.max(8, Math.round(wordCount * 0.1) + 6));
    let practical = hasExample ? Math.min(15, 12) : 6;
    let clarity = wordCount > 40 ? 8 : 5;

    const total = technical + problemSolving + communication + practical + clarity;

    const fallback: InterviewEvaluationOutput = {
      score: total,
      breakdown: {
        technicalCorrectness: technical,
        problemSolving: problemSolving,
        communication: communication,
        practicalExamples: practical,
        clarityStructure: clarity,
      },
      positivePoints: [
        'Directly addressed the central prompt without unnecessary evasion',
        userAnswer.length > 100 ? 'Showcased sound conceptual familiarity with the underlying domain' : 'Articulated core thoughts clearly',
        ...(hasExample ? ['Included an illustrative reference to practical implementation'] : []),
      ],
      missingConcepts: [
        'Could dive deeper into trade-offs and edge-case handling',
        'Did not explicitly quantify business or technical performance impact (e.g. latency, throughput, or failure rates)',
      ],
      weakExplanations: [
        wordCount < 60 ? 'Answer was somewhat concise; technical interviewers prefer deeper architectural walkthroughs.' : 'Some assertions could be backed by specific architectural decisions.',
      ],
      suggestedImprovements: [
        'Adopt the STAR format: Start with the context, state the technical bottleneck, describe your specific action, and quantify the result.',
        'Anticipate failure modes and state how you monitor errors in production.',
      ],
      strongerExample: `To tackle this effectively, I focus on three pillars: architecture isolation, security boundaries, and observable metrics. For instance, when designing auth state, I combine short-lived JWTs stored in memory with HttpOnly Secure cookies for session refresh, preventing XSS token theft. On the backend, we enforce strict rate limiting (e.g. 100 req/15 min) and schema validation with Zod. In my last project, this pattern eliminated unauthorized access attempts while maintaining sub-15ms verification latency.`,
      evaluationNote: 'Scored using standard CareerPivot 100-point rubric. Not an official employer hiring prediction.',
    };

    return { evaluation: fallback, isLiveAi: false };
  }
}
