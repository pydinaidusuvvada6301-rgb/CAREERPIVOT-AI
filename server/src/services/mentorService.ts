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
    ? `CANDIDATE CONTEXT:
- Target Role: ${req.userProfile.targetRole || 'Software Engineer'}
- Education / Stage: ${req.userProfile.education || 'Computer Science / Engineering'} (${req.userProfile.careerStage || 'Fresh Graduate'})
- Current Skills: ${req.userProfile.currentSkills?.join(', ') || 'Not specified'}`
    : 'No profile context provided.';

  const formattedHistory = (req.history || [])
    .slice(-6)
    .map(h => `${h.role === 'user' ? 'Candidate' : 'Mentor'}: ${h.content}`)
    .join('\n');

  const systemInstruction = `You are CareerPivot AI Mentor, an elite tech career coach and hiring manager.
Your advice must be grounded in the user's specific background and target tech career.
Rules:
1. Be concise, highly actionable, encouraging, and clear.
2. Recommend concrete technologies, projects, or next steps to bridge their gaps.
3. If they ask about switching to a new field (e.g. from C/Java to AI or Full-Stack), give exact 3-step learning progressions.
4. Conclude with 2-3 short suggested next questions or actions.`;

  const prompt = `${profileContext}

RECENT CHAT HISTORY:
${formattedHistory || 'No previous messages.'}

CANDIDATE'S CURRENT MESSAGE:
"${req.message}"

Provide a thorough, structured, and realistic mentorship response.`;

  if (isGeminiConfigured) {
    try {
      const { text, isLiveAi } = await callGeminiText(prompt, { systemInstruction });
      
      // Extract suggested actions or generate intelligent defaults
      const suggestedActions = [
        `Review 4-Week Roadmap for ${req.userProfile?.targetRole || 'Target Role'}`,
        'Test your knowledge in AI Mock Interview',
        'Analyze your resume against real job listings',
      ];

      return {
        reply: text,
        suggestedActions,
        recommendedTopic: req.userProfile?.targetRole || 'Skill Gap Analysis',
        isLiveAi,
      };
    } catch (err) {
      console.warn('Gemini chat failed, falling back to deterministic mentor logic:', err);
    }
  }

  // Deterministic fallback response when offline
  const role = req.userProfile?.targetRole || 'Full-Stack Software Engineer';
  return {
    reply: `Based on your goal to pivot into **${role}**, here is your priority roadmap:
1. **Core Competencies**: Strengthen your foundation with hands-on coding exercises.
2. **Portfolio Proof**: Build a production project demonstrating REST/GraphQL APIs, database indexing, and automated tests.
3. **Mock Drills**: Complete mock interviews on our platform to score your answers against hiring rubrics.`,
    suggestedActions: [
      `Generate 4-Week Roadmap for ${role}`,
      'Run Skill Gap Analysis with verified job descriptions',
      'Start a 100-point Technical Mock Interview',
    ],
    recommendedTopic: role,
    isLiveAi: false,
  };
}
