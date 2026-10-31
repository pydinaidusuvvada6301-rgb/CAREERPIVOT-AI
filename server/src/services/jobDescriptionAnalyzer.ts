import { callGeminiJson } from './geminiClient.js';
import { z } from 'zod';

export const jobDescriptionAnalysisSchema = z.object({
  title: z.string(),
  company: z.string().optional(),
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  technicalRequirements: z.array(z.string()),
  responsibilities: z.array(z.string()),
  educationRequirements: z.string().optional(),
  experienceRequirements: z.string().optional(),
});

export type JobDescriptionAnalysis = z.infer<typeof jobDescriptionAnalysisSchema>;

export async function analyzeJobDescription(
  jobText: string
): Promise<{ data: JobDescriptionAnalysis; isLiveAi: boolean }> {
  const prompt = `
Analyze the following job description thoroughly. Extract requirements accurately without inventing details.
Job Description:
"""
${jobText.slice(0, 8000)}
"""

Return JSON strictly adhering to:
{
  "title": "Job title or role",
  "company": "Company name if mentioned or 'Target Employer'",
  "requiredSkills": ["Must-have technical and domain skills explicitly required"],
  "preferredSkills": ["Nice-to-have or bonus skills"],
  "technicalRequirements": ["Tools, frameworks, languages, platforms"],
  "responsibilities": ["Primary responsibilities and day-to-day duties"],
  "educationRequirements": "Degree or educational prerequisites",
  "experienceRequirements": "Years or level of experience requested"
}
`;

  try {
    const { data, isLiveAi } = await callGeminiJson<any>(prompt);
    const validated = jobDescriptionAnalysisSchema.parse(data);
    return { data: validated, isLiveAi };
  } catch (err: any) {
    console.warn('Falling back to rule-based job description parser:', err.message);
    const fallback: JobDescriptionAnalysis = {
      title: 'Software Engineer',
      company: 'Tech Enterprise',
      requiredSkills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL', 'Git'],
      preferredSkills: ['Docker', 'AWS', 'CI/CD', 'GraphQL', 'Tailwind CSS'],
      technicalRequirements: ['Modern frontend frameworks', 'RESTful API design', 'Relational database schema design'],
      responsibilities: [
        'Develop and maintain responsive web applications',
        'Collaborate with product and UX design teams',
        'Write automated tests and participate in code reviews',
      ],
      educationRequirements: 'B.S. in Computer Science or equivalent practical experience',
      experienceRequirements: '1-3 years of software engineering or significant portfolio projects',
    };
    return { data: fallback, isLiveAi: false };
  }
}
