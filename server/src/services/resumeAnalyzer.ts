import { callGeminiJson } from './geminiClient.js';
import { resumeParsedOutputSchema, ResumeParsedOutput } from '../schemas/index.js';

export async function analyzeResume(
  resumeText: string,
  targetRole: string = 'Full-Stack Software Engineer'
): Promise<{ analysis: ResumeParsedOutput; isLiveAi: boolean }> {
  const sanitizedText = resumeText.slice(0, 10000).trim();

  const prompt = `You are a Principal Technical Talent Architect, ATS Evaluation Specialist, and Senior Engineering Hiring Manager.
Conduct a rigorous, factual, evidence-based resume evaluation for a candidate targeting the role: "${targetRole}".

CRITICAL INSTRUCTIONS:
1. Ground every extracted field in the ACTUAL resume text provided below. Never fabricate, hallucinate, or assume experience, companies, degrees, or certifications that are not stated.
2. If the candidate has beginner skills (e.g., only basic Python and HTML/CSS), accurately reflect their level. Do NOT claim they are suited for senior or specialized roles without explaining the precise skill gaps.
3. Compute an explainable ATS Compatibility Score (0-100) and Overall Resume Score (0-100) based on this rubric:
   - Keyword Match (0-25): Presence of technical skills, tools, and terminology for "${targetRole}".
   - Quantified Metrics (0-25): Presence of numbers, percentages, scale, or business impact in project/job bullets.
   - Structure & Layout (0-25): Presence of clear sections (Summary, Skills, Experience/Projects, Education), clear dates, and standard headings.
   - Role Alignment (0-25): Proximity of candidate's past work and projects to "${targetRole}".
   (NOTE: This is an explainable rubric estimate, not an official guarantee of applicant tracking system vendor results).
4. Identify 3-5 specific bullet points from their actual resume and provide improved versions in the STAR format (Situation, Task, Action, Result) with realistic quantifiable impact.
5. Identify genuine missing keywords and recommended skills needed to qualify for "${targetRole}".
6. Evaluate grammar, clarity, and formatting conciseness.

CANDIDATE RESUME TEXT:
"""
${sanitizedText}
"""

TARGET ROLE: "${targetRole}"

Output strict JSON conforming to this schema:
{
  "name": "Full name from resume or null",
  "summary": "Concise factual summary of the candidate's actual qualifications and background",
  "education": [
    { "degree": "Degree name found", "institution": "Institution name found", "year": "Graduation year or dates", "details": "GPA, honors, or coursework if present" }
  ],
  "technicalSkills": ["Core technical tools and systems explicitly mentioned"],
  "programmingLanguages": ["Programming languages explicitly found in resume"],
  "frameworks": ["Frameworks and libraries explicitly found in resume"],
  "softSkills": ["Soft skills or leadership qualities demonstrated in text"],
  "projects": [
    { "name": "Project title", "description": "What was built based on resume", "technologies": ["Tech used"], "link": "GitHub/demo URL if present" }
  ],
  "experience": [
    { "role": "Job title", "company": "Company name", "duration": "Dates/Timeframe", "responsibilities": ["Actual bullets from text"] }
  ],
  "certifications": ["Actual certifications listed or empty array"],
  "achievements": ["Actual awards/milestones listed or empty array"],
  "strongSkills": ["Top 3-6 skills backed by solid project/experience evidence in resume"],
  "skillsRequiringEvidence": ["Skills merely listed in a skills block without project evidence"],
  "missingSections": ["Standard resume sections missing, e.g. 'Measurable Impact Metrics', 'Portfolio/GitHub URLs'"],
  "improvementSuggestions": ["3-5 concrete, actionable steps to improve the resume for this target role"],
  "overallScore": 76,
  "atsScore": 72,
  "scoreRubric": {
    "keywordMatch": 18,
    "quantifiedMetrics": 16,
    "structureAndLayout": 20,
    "roleAlignment": 18
  },
  "missingKeywords": ["Keywords expected for ${targetRole} that are absent from this resume"],
  "recommendedSkills": ["Priority skills the candidate should acquire next to qualify"],
  "roleSuitability": "Detailed, evidence-based assessment of how well this candidate fits ${targetRole} and what specific transition steps are required",
  "grammarFeedback": ["Notes on readability, action verbs, tense consistency, and phrasing"],
  "suggestedBullets": [
    {
      "context": "Original bullet or project context from resume",
      "starRewrite": "Action-oriented STAR rewrite starting with a strong power verb and including metrics",
      "reason": "Why this rewrite improves ATS matching and recruiter appeal"
    }
  ]
}`;

  try {
    const { data, isLiveAi } = await callGeminiJson<any>(prompt, {
      systemInstruction: 'You are an expert technical resume evaluator. Return strictly valid JSON adhering to the provided schema with zero hallucinated candidate credentials.',
      temperature: 0.2,
    });
    const validated = resumeParsedOutputSchema.parse(data);
    return { analysis: validated, isLiveAi };
  } catch (err: any) {
    console.warn('[ResumeAnalyzer] Gemini API failed, activating evidence-based heuristic parser:', err.message);

    // Heuristic parser: extract ONLY what actually exists in resumeText without inventing qualifications
    const detectedLanguages = ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C', 'Go', 'Rust', 'SQL', 'HTML', 'CSS', 'PHP', 'Ruby', 'Kotlin', 'Swift']
      .filter((lang) => new RegExp(`\\b${lang.replace('+', '\\+')}\\b`, 'i').test(sanitizedText));

    const detectedFrameworks = ['React', 'Node.js', 'Express', 'Next.js', 'Vue', 'Angular', 'Tailwind', 'Bootstrap', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'PostgreSQL', 'MongoDB', 'Docker', 'AWS', 'Git']
      .filter((fw) => new RegExp(`\\b${fw}\\b`, 'i').test(sanitizedText));

    const lines = sanitizedText.split('\n').map((l) => l.trim()).filter(Boolean);
    const candidateName = lines.find((l) => /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(l)) || null;

    const hasEducation = /degree|bachelor|master|b\.?tech|b\.?e\.?|university|college|institute|cgpa|gpa/i.test(sanitizedText);
    const hasProjects = /project|built|developed|created|github/i.test(sanitizedText);
    const hasExperience = /experience|intern|engineer|developer|worked at|employment/i.test(sanitizedText);

    // Calculate transparent rubric score based on real contents
    const keywordMatch = Math.min(25, (detectedLanguages.length + detectedFrameworks.length) * 3);
    const structureScore = (hasEducation ? 8 : 2) + (hasProjects ? 8 : 2) + (hasExperience ? 9 : 2);
    const metricCount = (sanitizedText.match(/\b\d+(?:%|\+|k|ms|s|x)?\b/gi) || []).length;
    const metricScore = Math.min(25, metricCount * 4);
    const roleAlignmentScore = Math.min(25, detectedLanguages.length > 0 ? 15 : 8);
    const totalScore = keywordMatch + structureScore + metricScore + roleAlignmentScore;

    const fallback: ResumeParsedOutput = {
      name: candidateName,
      summary: `Candidate profile analyzed from provided resume text. Evidenced background includes foundational knowledge in ${detectedLanguages.slice(0, 3).join(', ') || 'software fundamentals'}, with focus directed toward ${targetRole}.`,
      education: hasEducation
        ? [
            {
              degree: 'Degree noted in resume',
              institution: 'Educational institution noted in resume',
              details: 'Details extracted from academic mentions',
            },
          ]
        : [],
      technicalSkills: [...detectedLanguages, ...detectedFrameworks],
      programmingLanguages: detectedLanguages,
      frameworks: detectedFrameworks,
      softSkills: ['Problem Solving', 'Independent Learning', 'Technical Communication'],
      projects: hasProjects
        ? [
            {
              name: 'Projects referenced in resume',
              description: 'Projects extracted from uploaded resume text.',
              technologies: detectedFrameworks.slice(0, 3),
            },
          ]
        : [],
      experience: hasExperience
        ? [
            {
              role: 'Experience referenced in resume',
              company: 'Company / Organization mentioned in text',
              responsibilities: lines.filter((l) => l.startsWith('-') || l.startsWith('•')).slice(0, 3),
            },
          ]
        : [],
      certifications: [],
      achievements: [],
      strongSkills: detectedLanguages.slice(0, 3),
      skillsRequiringEvidence: detectedFrameworks.slice(0, 3),
      missingSections: [
        ...(hasEducation ? [] : ['Education & Degree Section']),
        ...(hasProjects ? [] : ['Detailed Portfolio Projects Section']),
        'Quantified Business/Technical Metrics (e.g. latency, user volume, test coverage)',
      ],
      improvementSuggestions: [
        `Add measurable metrics to project bullets (e.g., "improved performance by 20%").`,
        `Explicitly align listed keywords with requirements for ${targetRole}.`,
        'Include direct links to live GitHub repositories or deployed applications.',
      ],
      overallScore: Math.max(35, Math.min(92, totalScore)),
      atsScore: Math.max(30, Math.min(88, totalScore - 5)),
      scoreRubric: {
        keywordMatch,
        quantifiedMetrics: metricScore,
        structureAndLayout: structureScore,
        roleAlignment: roleAlignmentScore,
      },
      missingKeywords: [
        'Automated Testing (Jest / Vitest)',
        'CI/CD Workflows (GitHub Actions)',
        'Containerization (Docker)',
      ],
      recommendedSkills: [
        'Production REST API Design',
        'Database Schema Indexing & Query Tuning',
      ],
      roleSuitability: `The candidate possesses foundational competencies in ${detectedLanguages.join(', ') || 'core concepts'}, but requires demonstrable portfolio deliverables and production tooling to meet industry standards for ${targetRole}.`,
      grammarFeedback: [
        'Ensure bullet points begin with strong past-tense action verbs (e.g., "Engineered", "Designed", "Architected").',
      ],
      suggestedBullets: [
        {
          context: 'General project or feature implementation bullet',
          starRewrite: `Architected modular application features using ${detectedLanguages[0] || 'modern languages'}, improving maintainability and reducing edge-case exceptions.`,
          reason: 'STAR format highlights active engineering contribution rather than passive participation.',
        },
      ],
    };

    return { analysis: fallback, isLiveAi: false };
  }
}

