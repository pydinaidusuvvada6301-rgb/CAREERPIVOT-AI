import { callGeminiText } from './geminiClient.js';
import { isGeminiConfigured } from '../config/index.js';

export interface MentorChatRequest {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  userProfile?: {
    education?: string;
    targetRole?: string;
    currentSkills?: string[];
    careerStage?: string;
  };
}

export interface MentorChatResponse {
  reply: string;
  suggestedActions: string[];
  recommendedTopic?: string;
  isLiveAi: boolean;
}

export async function generateMentorResponse(
  req: MentorChatRequest
): Promise<MentorChatResponse> {
  const profileContext = req.userProfile
    ? `CANDIDATE AUTHORIZED PROFILE:
- Target Role: ${req.userProfile.targetRole || 'Software Engineer'}
- Education / Stage: ${req.userProfile.education || 'Engineering / Technology'} (${req.userProfile.careerStage || 'Fresh Graduate / Transitioner'})
- Known Current Skills: ${req.userProfile.currentSkills?.join(', ') || 'Not explicitly specified'}`
    : 'No profile context provided.';

  const formattedHistory = (req.history || [])
    .slice(-8)
    .map(h => `${h.role === 'user' ? 'Candidate' : 'Mentor'}: ${h.content}`)
    .join('\n');

  const systemInstruction = `You are CareerPivot AI Mentor, an elite, highly empathetic tech career architect, hiring manager, and senior software mentor.

CORE PRINCIPLES:
1. Natural Language & Context: Maintain conversational continuity with the previous chat history. Understand follow-up questions seamlessly.
2. Grounded Personalization: Reference the candidate's declared background, current skills, and target role. Never pretend to know information the user has not provided; if critical details are missing, ask a concise clarifying question.
3. Actionable & Evidence-Based:
   - When asked "What should I learn next?", diagnose their current level and explain the exact recommended sequence with reasons.
   - When asked to create a roadmap or multi-month plan, break it down into realistic milestones (Foundations -> Hands-on Projects -> Production Patterns -> Interview Prep).
   - If they ask about pivoting into AI/ML, clearly explain prerequisites (Linear Algebra/Calculus, Python data structures, scikit-learn, deep learning, PyTorch, RAG) instead of oversimplifying.
4. Scope Discipline: If the user asks non-career, completely off-topic questions, politely guide them back to career development, tech roadmaps, resume improvements, or interview prep.
5. Formatting: Use clean markdown with bold section headers and bullet points. Conclude with a helpful question or next step.`;

  const prompt = `${profileContext}

CONVERSATION HISTORY:
${formattedHistory || 'No previous messages in this session.'}

CANDIDATE'S CURRENT MESSAGE:
"${req.message}"

Respond directly to the candidate as their mentor.`;

  if (isGeminiConfigured) {
    try {
      const { text, isLiveAi } = await callGeminiText(prompt, {
        systemInstruction,
        temperature: 0.4,
      });

      // Generate contextually relevant suggested actions
      const lower = (req.message + ' ' + text).toLowerCase();
      let suggestedActions = [
        `Review 4-Week Roadmap for ${req.userProfile?.targetRole || 'Target Role'}`,
        'Practice in AI Mock Interview with 100-point rubric',
        'Inspect ATS keyword match in Resume Analyzer',
      ];

      if (lower.includes('project') || lower.includes('portfolio') || lower.includes('build')) {
        suggestedActions = [
          'What architecture patterns should I use for this project?',
          'How should I document this project in my resume bullets?',
          'What are the most common interview questions about this stack?',
        ];
      } else if (lower.includes('interview') || lower.includes('question') || lower.includes('prep')) {
        suggestedActions = [
          'Give me a technical interview question on this topic',
          'How do I explain trade-offs during a system design interview?',
          'What STAR questions should I prepare for HR rounds?',
        ];
      } else if (lower.includes('ai') || lower.includes('machine learning') || lower.includes('ml')) {
        suggestedActions = [
          'What math concepts do I need before learning PyTorch?',
          'Can you explain RAG architecture simply?',
          'What is a beginner-friendly first AI portfolio project?',
        ];
      }

      return {
        reply: text,
        suggestedActions,
        recommendedTopic: req.userProfile?.targetRole || 'Career Guidance',
        isLiveAi,
      };
    } catch (err: any) {
      console.warn('[MentorService] Gemini text call failed, activating intelligent fallback:', err.message);
    }
  }

  // Intelligent Context-Aware Fallback
  const lowerMsg = req.message.toLowerCase();
  const role = req.userProfile?.targetRole || 'Full-Stack Software Engineer';
  const skills = req.userProfile?.currentSkills || ['Python', 'HTML', 'CSS'];

  let reply = `Great question! Based on your target role of **${role}** and your foundation in **${skills.join(', ')}**, here is your strategic guidance:\n\n` +
    `1. **Next Core Focus**: Master API design, relational data structures, and state management.\n` +
    `2. **Production Deliverables**: Build an end-to-end project featuring authentication, database queries, and test coverage.\n` +
    `3. **Interview Verification**: Score your responses against our 100-point rubric in the AI Mock Interview module.`;

  if (lowerMsg.includes('python') && lowerMsg.includes('next')) {
    reply = `Since you know **basic Python and HTML**, here is your optimal sequence with reasons:\n\n` +
      `1. **Data Structures & Problem Solving** (2 weeks): Dictionaries, lists, sets, and algorithmic thinking. *Why:* Required for all technical screening interviews.\n` +
      `2. **Backend Web Frameworks** (3 weeks): Learn **FastAPI** or **Flask**. *Why:* Bridges your Python scripting with HTTP APIs and database connections.\n` +
      `3. **Relational Databases & SQL** (2 weeks): PostgreSQL basics, joins, and indexing. *Why:* Every real-world application requires persistent data storage.\n` +
      `4. **Git & Testing** (1 week): Write automated tests with \`pytest\` and maintain clean GitHub commits.\n\n` +
      `Would you like me to outline a 3-month milestone schedule for this?`;
  }

  return {
    reply,
    suggestedActions: [
      `Review personalized roadmap for ${role}`,
      'Practice technical interview questions',
      'Analyze your resume against verified job listings',
    ],
    recommendedTopic: role,
    isLiveAi: false,
  };
}

