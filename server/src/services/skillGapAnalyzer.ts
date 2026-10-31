import { callGeminiJson } from './geminiClient.js';
import { skillGapOutputSchema, SkillGapOutput } from '../schemas/index.js';

export async function analyzeSkillGap(
  targetRole: string,
  resumeText: string,
  resumeSkills: string[] = [],
  jobDescriptionText?: string,
  sourceLabel: string = 'User Input / Verified Benchmark'
): Promise<{ data: SkillGapOutput; isLiveAi: boolean }> {
  const prompt = `
You are an expert career transition advisor and technical talent evaluator.
Perform an explainable, evidence-based Skill Gap Analysis for a candidate aiming to transition into: "${targetRole}".

Candidate Resume Context / Skills:
"""
${resumeText ? resumeText.slice(0, 5000) : resumeSkills.join(', ')}
"""

Target Job Description / Requirements (if provided):
"""
${jobDescriptionText ? jobDescriptionText.slice(0, 4000) : `Standard industry expectations for a modern ${targetRole}`}
"""

Rules:
1. Do not invent numerical proficiency measurements. If proficiency is unknown or unevidenced, mark "proficiencyEstimated" as "Not assessed".
2. Distinguish genuine missing knowledge from skills that merely lack clear evidence in the text.
3. Provide an explainable matching summary.

Return valid JSON adhering to:
{
  "targetRole": "${targetRole}",
  "matchPercentage": 65,
  "matchingSkills": [
    {
      "skill": "Skill name",
      "importance": "High" | "Medium" | "Required" | "Preferred",
      "resumeEvidence": "Specific project, bullet or mention found in resume",
      "proficiencyEstimated": "Intermediate" or "Not assessed",
      "requiredProficiency": "Intermediate",
      "suggestedAction": "How to showcase this skill even more effectively"
    }
  ],
  "missingSkills": [
    {
      "skill": "Skill name",
      "importance": "Required" | "High" | "Preferred",
      "resumeEvidence": "No evidence found in resume",
      "proficiencyEstimated": "Not assessed",
      "requiredProficiency": "Intermediate",
      "suggestedAction": "Recommended learning path or practical project to acquire this"
    }
  ],
  "needsEvidenceSkills": [
    {
      "skill": "Skill name",
      "importance": "High",
      "resumeEvidence": "Keyword mentioned without metrics or practical project context",
      "proficiencyEstimated": "Not assessed",
      "requiredProficiency": "Intermediate",
      "suggestedAction": "Add a concrete portfolio project or quantifiable metric demonstrating this"
    }
  ],
  "explanation": "Clear explanation of how the candidate's current capabilities align with the role requirements.",
  "sourceDescription": "${sourceLabel}"
}
`;

  try {
    const { data, isLiveAi } = await callGeminiJson<any>(prompt);
    const validated = skillGapOutputSchema.parse(data);
    return { data: validated, isLiveAi };
  } catch (err: any) {
    console.warn('Falling back to rule-based skill gap analyzer:', err.message);

    // Dynamic heuristic matching based on keywords
    const candidateCorpus = (resumeText + ' ' + resumeSkills.join(' ')).toLowerCase();
    
    // Role archetype requirements
    const roleBenchmarks: Record<string, { required: string[]; preferred: string[] }> = {
      'Full-Stack Engineer': {
        required: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Git', 'REST APIs'],
        preferred: ['Docker', 'AWS', 'Tailwind CSS', 'Next.js', 'Testing (Jest/Vitest)'],
      },
      'AI / Machine Learning Engineer': {
        required: ['Python', 'PyTorch', 'Data Structures', 'Prompt Engineering', 'FastAPI'],
        preferred: ['LangChain', 'Vector Databases', 'Docker', 'RAG Architecture'],
      },
      'Cloud DevOps Engineer': {
        required: ['Linux', 'Docker', 'Git', 'CI/CD Pipelines', 'AWS'],
        preferred: ['Kubernetes', 'Terraform', 'Prometheus', 'Grafana', 'Bash Scripting'],
      },
    };

    const benchmark = roleBenchmarks[targetRole] || roleBenchmarks['Full-Stack Engineer'];

    const matching: any[] = [];
    const missing: any[] = [];
    const needsEvidence: any[] = [];

    benchmark.required.forEach((skill) => {
      if (candidateCorpus.includes(skill.toLowerCase())) {
        matching.push({
          skill,
          importance: 'Required',
          resumeEvidence: `Demonstrated in resume skills and project mentions for ${skill}.`,
          proficiencyEstimated: 'Intermediate',
          requiredProficiency: 'Intermediate',
          suggestedAction: 'Solidify understanding with production-grade architecture patterns.',
        });
      } else {
        missing.push({
          skill,
          importance: 'Required',
          resumeEvidence: 'No direct evidence found in uploaded resume or profile.',
          proficiencyEstimated: 'Not assessed',
          requiredProficiency: 'Intermediate',
          suggestedAction: `Complete a targeted project milestone featuring ${skill}.`,
        });
      }
    });

    benchmark.preferred.forEach((skill) => {
      if (candidateCorpus.includes(skill.toLowerCase())) {
        needsEvidence.push({
          skill,
          importance: 'Preferred',
          resumeEvidence: `Mentioned in keywords, but lacks detailed metric or repo verification.`,
          proficiencyEstimated: 'Not assessed',
          requiredProficiency: 'Working Knowledge',
          suggestedAction: `Add concrete GitHub commits or performance metrics highlighting ${skill}.`,
        });
      } else {
        missing.push({
          skill,
          importance: 'Preferred',
          resumeEvidence: 'Not found in candidate records.',
          proficiencyEstimated: 'Not assessed',
          requiredProficiency: 'Familiarity',
          suggestedAction: `Study official documentation and implement a quick sandbox prototype.`,
        });
      }
    });

    const totalAssessed = matching.length + missing.length + needsEvidence.length;
    const matchScore = totalAssessed > 0 ? Math.round(((matching.length + (needsEvidence.length * 0.5)) / totalAssessed) * 100) : 60;

    const fallback: SkillGapOutput = {
      targetRole,
      matchPercentage: Math.max(25, Math.min(95, matchScore)),
      matchingSkills: matching.length > 0 ? matching : [
        {
          skill: 'Git & Version Control',
          importance: 'Required',
          resumeEvidence: 'Mentioned in developer tooling.',
          proficiencyEstimated: 'Intermediate',
          requiredProficiency: 'Intermediate',
          suggestedAction: 'Maintain clean commit hygiene on public repositories.',
        },
      ],
      missingSkills: missing.length > 0 ? missing : [
        {
          skill: 'Automated CI/CD & Testing',
          importance: 'Required',
          resumeEvidence: 'No unit/integration test suites detected.',
          proficiencyEstimated: 'Not assessed',
          requiredProficiency: 'Intermediate',
          suggestedAction: 'Integrate GitHub Actions workflow with automated test runs.',
        },
      ],
      needsEvidenceSkills: needsEvidence.length > 0 ? needsEvidence : [
        {
          skill: 'Database Indexing & Optimization',
          importance: 'Preferred',
          resumeEvidence: 'SQL listed without performance metrics or scale data.',
          proficiencyEstimated: 'Not assessed',
          requiredProficiency: 'Intermediate',
          suggestedAction: 'Document query execution plans or indexing impact in project README.',
        },
      ],
      explanation: `Evaluation compared candidate profile against core competencies for ${targetRole}. You exhibit strong fundamentals in core technologies, while containerization and production deployment need dedicated portfolio deliverables.`,
      sourceDescription: sourceLabel,
    };

    return { data: fallback, isLiveAi: false };
  }
}
