import { callGeminiJson } from './geminiClient.js';
import { isGeminiConfigured } from '../config/index.js';

export interface CareerAssessmentInput {
  degree: string;
  branch: string;
  academicYear: string;
  technicalSkills: string[];
  programmingLanguages: string[];
  interests: string[];
  workExperience: string;
  preferredIndustries: string[];
  careerGoal: string;
  preferredEnvironment: 'Remote' | 'Hybrid' | 'On-site' | 'Flexible';
  learningPreferences: string[];
}

export interface CareerRecommendation {
  roleTitle: string;
  matchScore: number; // 0-100
  matchExplanation: string;
  marketDemandTier: 'High' | 'Very High' | 'Exceptional';
  requiredTechnicalSkills: string[];
  requiredSoftSkills: string[];
  userStrengths: string[];
  missingSkills: string[];
  difficultyToPivot: 'Beginner Friendly' | 'Moderate Sprint' | 'Intensive Focus';
  estimatedTimeToReady: string;
  recommendedFirstProject: {
    title: string;
    description: string;
  };
  learningRoadmapSummary: string[];
}

export interface AssessmentResult {
  topRecommendations: CareerRecommendation[];
  alternativePaths: string[];
  executiveSummary: string;
  isLiveAi: boolean;
}

export async function processCareerAssessment(
  input: CareerAssessmentInput
): Promise<AssessmentResult> {
  const prompt = `CANDIDATE BACKGROUND:
- Degree: ${input.degree} in ${input.branch} (${input.academicYear})
- Known Languages: ${input.programmingLanguages.join(', ') || 'None specified'}
- Technical Skills: ${input.technicalSkills.join(', ') || 'General fundamentals'}
- Interests: ${input.interests.join(', ') || 'Technology & problem solving'}
- Work/Project Experience: ${input.workExperience || 'Academic & personal projects'}
- Preferred Industries: ${input.preferredIndustries.join(', ') || 'Tech SaaS'}
- Career Goal: ${input.careerGoal || 'Tech career transition'}
- Work Environment: ${input.preferredEnvironment}
- Learning Preferences: ${input.learningPreferences.join(', ')}

TASK:
Analyze this candidate's genuine background and generate 3 top tech career recommendations plus alternative paths.
Return JSON in this EXACT structure:
{
  "executiveSummary": "Concise 2-sentence summary of the candidate's pivot potential.",
  "topRecommendations": [
    {
      "roleTitle": "Full-Stack Software Engineer",
      "matchScore": 88,
      "matchExplanation": "Specific reason why their background aligns.",
      "marketDemandTier": "High",
      "requiredTechnicalSkills": ["TypeScript", "React", "Node.js", "PostgreSQL"],
      "requiredSoftSkills": ["Code Review", "Agile Collaboration"],
      "userStrengths": ["Their matching skills"],
      "missingSkills": ["Skills they still need to learn"],
      "difficultyToPivot": "Moderate Sprint",
      "estimatedTimeToReady": "8-12 Weeks",
      "recommendedFirstProject": {
        "title": "Project Name",
        "description": "Specific project bridging their exact missing skill."
      },
      "learningRoadmapSummary": [
        "Phase 1: Foundations",
        "Phase 2: Project Deliverables",
        "Phase 3: Interview Prep"
      ]
    }
  ],
  "alternativePaths": ["Alternative Role 1", "Alternative Role 2"]
}`;

  if (isGeminiConfigured) {
    try {
      const { data, isLiveAi } = await callGeminiJson<AssessmentResult>(prompt, {
        systemInstruction: 'You are a senior tech career coach. Provide evidence-based, transparent career path recommendations with zero hallucinated salaries.',
      });
      return { ...data, isLiveAi };
    } catch (err) {
      console.warn('Gemini assessment failed, using deterministic evaluation:', err);
    }
  }

  // Fallback assessment output
  return {
    executiveSummary: `Based on your academic background in ${input.degree} (${input.branch}), your programming skills in ${input.programmingLanguages.slice(0, 2).join(' and ') || 'modern software'} provide a strong foundation for full-stack and cloud engineering.`,
    topRecommendations: [
      {
        roleTitle: 'Full-Stack Software Engineer',
        matchScore: 86,
        matchExplanation: 'Your language foundation and problem-solving skills translate directly into frontend React and backend Node.js development.',
        marketDemandTier: 'High',
        requiredTechnicalSkills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'REST APIs'],
        requiredSoftSkills: ['System Design Thinking', 'Collaborative Git Workflow'],
        userStrengths: input.programmingLanguages.slice(0, 3),
        missingSkills: ['PostgreSQL Indexing', 'Full-Stack State Management', 'Automated Testing'],
        difficultyToPivot: 'Moderate Sprint',
        estimatedTimeToReady: '6-8 Weeks',
        recommendedFirstProject: {
          title: 'Full-Stack SaaS Task Engine',
          description: 'Build a multi-user workspace with JWT authentication, PostgreSQL queries, and real-time UI.',
        },
        learningRoadmapSummary: [
          'Week 1: TypeScript and modern React component architecture',
          'Week 2: Express REST API design and Zod validation',
          'Week 3: PostgreSQL schemas, joins, and indexing',
          'Week 4: Automated integration testing and cloud deployment',
        ],
      },
      {
        roleTitle: 'AI & Large Language Model Application Engineer',
        matchScore: 82,
        matchExplanation: 'High demand for developers who can connect LLM APIs with vector databases and full-stack frontends.',
        marketDemandTier: 'Exceptional',
        requiredTechnicalSkills: ['Python / TypeScript', 'Gemini / OpenAI API', 'Vector Databases', 'RAG Pipelines'],
        requiredSoftSkills: ['Prompt Architecture', 'Latency & Token Cost Optimization'],
        userStrengths: ['Analytical logic', ...input.programmingLanguages.slice(0, 1)],
        missingSkills: ['Vector Embeddings', 'Semantic Search', 'RAG Chunking'],
        difficultyToPivot: 'Moderate Sprint',
        estimatedTimeToReady: '8-10 Weeks',
        recommendedFirstProject: {
          title: 'Semantic Document Search & Q&A Assistant',
          description: 'Ingest PDF documentation and answer domain questions with citation grounding.',
        },
        learningRoadmapSummary: [
          'Week 1: Gemini API structured outputs and system instructions',
          'Week 2: Embeddings, cosine similarity, and vector storage',
          'Week 3: Guardrails against prompt injection and hallucination',
          'Week 4: Production evaluation benchmarks',
        ],
      },
    ],
    alternativePaths: ['DevOps & Cloud Automation Specialist', 'Technical Solutions Architect'],
    isLiveAi: false,
  };
}
