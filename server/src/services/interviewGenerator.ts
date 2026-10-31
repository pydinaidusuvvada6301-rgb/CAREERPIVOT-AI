import { callGeminiJson } from './geminiClient.js';
import { z } from 'zod';

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  hints: string[];
}

export const interviewQuestionsListSchema = z.object({
  questions: z.array(
    z.object({
      id: z.string(),
      question: z.string(),
      category: z.string(),
      hints: z.array(z.string()).default([]),
    })
  ),
});

export async function generateInterviewQuestions(
  targetRole: string,
  interviewType: 'technical' | 'hr' | 'behavioral' | 'coding',
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  questionCount: number = 5
): Promise<{ questions: InterviewQuestion[]; isLiveAi: boolean }> {
  const typeDescription = {
    technical: 'Technical Architecture & System Concepts',
    hr: 'General HR, Cultural Alignment & Professional Background',
    behavioral: 'Behavioral Scenarios, STAR Method, Conflict Resolution & Leadership',
    coding: 'Data Structures, Algorithms & Practical Code Design',
  }[interviewType] || 'Technical Engineering Concepts';

  const prompt = `
Generate ${questionCount} realistic, high-quality interview questions for a candidate interviewing for: "${targetRole}".
Interview Type: ${typeDescription}
Difficulty Level: ${difficulty}

Rules:
- Questions must be thoughtful, realistic, and reflective of actual top tech company interviews.
- For each question provide 2-3 helpful hints that guide the candidate on what key areas to mention.

Return valid JSON:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text",
      "category": "e.g. Distributed Systems, Frontend Performance, Conflict Resolution",
      "hints": ["Hint 1", "Hint 2"]
    }
  ]
}
`;

  try {
    const { data, isLiveAi } = await callGeminiJson<any>(prompt);
    const validated = interviewQuestionsListSchema.parse(data);
    return { questions: validated.questions, isLiveAi };
  } catch (err: any) {
    console.warn('Falling back to curated interview question bank:', err.message);

    const questionsBank: Record<string, InterviewQuestion[]> = {
      technical: [
        {
          id: 'q1',
          question: `In modern web applications, how do you manage authentication state securely across client and backend APIs, and how do you protect against XSS and CSRF attacks?`,
          category: 'Security & Auth Architecture',
          hints: [
            'Discuss HTTP-only cookies vs Authorization Bearer headers in memory',
            'Explain JWT expiration, refresh tokens, and CSRF tokens',
            'Mention sanitizing user inputs and Content Security Policy (CSP)',
          ],
        },
        {
          id: 'q2',
          question: `Explain how you design a relational database schema for high-volume transactions. When would you add indexes, and what trade-offs do indexes introduce?`,
          category: 'Database Optimization',
          hints: [
            'Discuss B-Tree indexes, composite keys, and query execution plans (EXPLAIN ANALYZE)',
            'Mention write performance penalty on INSERT/UPDATE operations',
            'Cover foreign key constraints and normalization vs denormalization',
          ],
        },
        {
          id: 'q3',
          question: `How do you diagnose and resolve a severe performance bottleneck or memory leak in a React or Node.js application?`,
          category: 'Performance & Profiling',
          hints: [
            'Discuss React DevTools Profiler, unnecessary re-renders, and memoization',
            'Cover Node.js heap snapshots, event loop lag, and unclosed database connections',
            'Mention real-world metrics like TTFB, LCP, and CPU profiling',
          ],
        },
        {
          id: 'q4',
          question: `Describe how you implement error handling and resilient retries when communicating with external 3rd-party APIs (such as payment gateways or LLM endpoints).`,
          category: 'Reliability Engineering',
          hints: [
            'Explain exponential backoff with jitter and circuit breaker patterns',
            'Discuss idempotency keys to prevent duplicate operations',
            'Cover graceful fallback responses to ensure user experience does not break',
          ],
        },
        {
          id: 'q5',
          question: `Walk through your approach to designing a modular, maintainable full-stack application structure from scratch. How do you enforce separation of concerns?`,
          category: 'System Design',
          hints: [
            'Differentiate controllers, business services, and database layers',
            'Discuss shared contract types and schema validation (e.g. Zod)',
            'Explain dependency injection and isolated testing strategies',
          ],
        },
      ],
      hr: [
        {
          id: 'q1',
          question: `Tell me about a time you faced a difficult technical challenge or bug with a tight deadline. How did you prioritize and what was the outcome?`,
          category: 'Problem Solving & Resilience',
          hints: [
            'Use the STAR method (Situation, Task, Action, Result)',
            'Highlight trade-offs you evaluated under time constraints',
            'Quantify the final resolution and team impact',
          ],
        },
        {
          id: 'q2',
          question: `Why are you looking to transition into this specific role, and what proactive steps have you taken to prepare yourself for its day-to-day responsibilities?`,
          category: 'Career Motivation & Initiative',
          hints: [
            'Connect past experiences with what excites you about this target role',
            'Mention concrete projects, self-directed learning, or hackathons',
            'Demonstrate clear understanding of what success looks like in this position',
          ],
        },
        {
          id: 'q3',
          question: `Describe a situation where you had a strong disagreement with a teammate or stakeholder regarding a technical or product decision. How did you handle it?`,
          category: 'Collaboration & Communication',
          hints: [
            'Focus on listening and seeking objective criteria (data/benchmarks)',
            'Avoid finger-pointing; emphasize constructive alignment',
            'Demonstrate commitment to the team goal even if a compromise was made',
          ],
        },
        {
          id: 'q4',
          question: `How do you approach continuous learning in a fast-evolving technology landscape, especially with generative AI transforming development practices?`,
          category: 'Adaptability & Growth Mindset',
          hints: [
            'Give examples of new tools or libraries you adopted recently',
            'Discuss evaluating new tools critically rather than chasing hype',
            'Share how you contribute knowledge back to peers or open source',
          ],
        },
        {
          id: 'q5',
          question: `What kind of engineering team culture enables you to do your best work, and how do you contribute to a positive, inclusive team environment?`,
          category: 'Culture & Values Fit',
          hints: [
            'Highlight psychological safety, blameless postmortems, and transparent communication',
            'Mention active peer mentorship, thorough code reviews, and documentation',
          ],
        },
      ],
    };

    const questions = (interviewType === 'hr' ? questionsBank.hr : questionsBank.technical).slice(0, questionCount);
    return { questions, isLiveAi: false };
  }
}
