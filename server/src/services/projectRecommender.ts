import { callGeminiJson } from './geminiClient.js';
import { projectRecommendOutputSchema, ProjectRecommendOutput } from '../schemas/index.js';

export async function recommendProjects(
  targetRole: string,
  skillGaps: string[] = [],
  existingSkills: string[] = []
): Promise<{ data: ProjectRecommendOutput; isLiveAi: boolean }> {
  const prompt = `
Recommend exactly 3 distinctive, practical, production-grade portfolio projects for a developer pivoting into: "${targetRole}".

Candidate Skills: ${existingSkills.join(', ') || 'Core programming'}
Identified Skill Gaps to Bridge: ${skillGaps.join(', ') || 'Full-stack integration, automated testing, cloud deployment'}

Every single project MUST be explicitly connected to at least one identified skill gap so the candidate has irrefutable portfolio proof for recruiters.

Return JSON conforming strictly to:
{
  "targetRole": "${targetRole}",
  "projects": [
    {
      "title": "Project Title",
      "problemStatement": "Clear real-world business or engineering problem solved",
      "whyRecommended": "Explains exactly which candidate skill gap this bridges and why it impresses hiring managers",
      "skillsDemonstrated": ["Skill 1", "Skill 2"],
      "technologies": ["Tech 1", "Tech 2"],
      "difficulty": "Beginner" | "Intermediate" | "Advanced",
      "estimatedDuration": "2 Weeks",
      "features": ["Feature 1", "Feature 2", "Feature 3"],
      "milestones": [
        { "milestone": "Milestone 1", "deliverable": "Tangible deliverable" },
        { "milestone": "Milestone 2", "deliverable": "Tangible deliverable" }
      ],
      "githubDeliverables": ["Deliverable 1", "Deliverable 2"],
      "targetRoleSupport": "How this specific project directly maps to hiring requirements for the target role"
    }
  ]
}
`;

  try {
    const { data, isLiveAi } = await callGeminiJson<any>(prompt);
    const validated = projectRecommendOutputSchema.parse(data);
    return { data: validated, isLiveAi };
  } catch (err: any) {
    console.warn('Falling back to curated project recommendations:', err.message);

    const fallback: ProjectRecommendOutput = {
      targetRole,
      projects: [
        {
          title: 'Distributed Real-Time Task & Observability Hub',
          problemStatement: 'Modern distributed engineering teams lack a unified, lightweight system to track asynchronous background jobs, monitor latency spikes, and trigger automated webhook alerts.',
          whyRecommended: `Directly targets key skill gaps (${skillGaps[0] || 'Node.js event architecture and PostgreSQL indexing'}), proving you can design reliable backend workflows under concurrency.`,
          skillsDemonstrated: ['TypeScript', 'Express', 'PostgreSQL', 'WebSockets / SSE', 'Docker'],
          technologies: ['Node.js', 'React', 'PostgreSQL', 'Tailwind CSS', 'Docker'],
          difficulty: 'Intermediate',
          estimatedDuration: '2 Weeks (20 hours)',
          features: [
            'Live background job progress streaming via Server-Sent Events',
            'Queue worker concurrency controls and exponential retry policies',
            'Interactive latency metrics chart and failure alert triggers',
            'Role-based API authentication with signed JWT tokens',
          ],
          milestones: [
            { milestone: 'Phase 1: Database & Queue Schema', deliverable: 'PostgreSQL migration with job status states and foreign keys' },
            { milestone: 'Phase 2: Worker Daemon & Event Stream', deliverable: 'Express API with SSE endpoints and simulated processing delay' },
            { milestone: 'Phase 3: Real-Time UI & Containerization', deliverable: 'React dashboard with live Recharts metrics and Dockerfile' },
          ],
          githubDeliverables: [
            'Clean GitHub repository with modular src/ architecture',
            'Comprehensive README with architecture diagrams and API spec',
            'Automated GitHub Actions CI workflow for test coverage',
          ],
          targetRoleSupport: `Hiring managers for ${targetRole} look for proof of asynchronous processing, database indexing, and real-time frontend integration.`,
        },
        {
          title: 'Smart Resume & Job Fit Vector Matcher',
          problemStatement: 'Job seekers struggle to understand why their applications are screened out by Applicant Tracking Systems (ATS) due to opaque keyword filters.',
          whyRecommended: `Bridges the gap in ${skillGaps[1] || 'AI integrations and complex data parsing'}, showing you can handle unstructured text extraction and semantic scoring.`,
          skillsDemonstrated: ['Zod Validation', 'AI API Integration', 'File Buffering', 'Tailwind CSS', 'Data Visualization'],
          technologies: ['React', 'TypeScript', 'Node.js', 'Google Gemini API', 'Recharts'],
          difficulty: 'Intermediate',
          estimatedDuration: '2 Weeks (25 hours)',
          features: [
            'Multi-format resume parsing (PDF, DOCX, TXT) with 5 MB buffer validation',
            'Evidence-based skill gap classification into Matching, Missing, and Needs-Evidence',
            'Interactive radar and bar charts visualizing competency coverage',
            'Actionable resume rewrite recommendations with exportable report',
          ],
          milestones: [
            { milestone: 'Phase 1: File Ingestion & Text Extraction', deliverable: 'Multer & pdf-parse backend endpoints with mime-type safety' },
            { milestone: 'Phase 2: Structured AI Prompting & Zod Schemas', deliverable: 'Strict JSON contract validation rejecting hallucinated outputs' },
            { milestone: 'Phase 3: Interactive Visual Dashboards', deliverable: 'Responsive React UI with skill priority badges and export triggers' },
          ],
          githubDeliverables: [
            'Unit tests validating document parsers against sample inputs',
            'Live staging URL deployed on Vercel and Render',
            'Architecture explanation and defense document against prompt injections',
          ],
          targetRoleSupport: `Directly demonstrates practical full-stack execution, generative AI engineering, and enterprise input sanitization essential for ${targetRole}.`,
        },
        {
          title: 'Full-Cycle SaaS Application & Candidate Pipeline CRM',
          problemStatement: 'Early-stage tech startups struggle with bloated applicant tracking systems and need a fast, streamlined candidate pipeline with stage-based Kanban analytics.',
          whyRecommended: `Tackles ${skillGaps[2] || 'Row Level Security, relational modeling, and production deployment'}, proving you build secure multi-tenant web applications.`,
          skillsDemonstrated: ['Row Level Security (RLS)', 'React Router 6', 'RESTful CRUD', 'Complex State Management', 'Cloud Deployment'],
          technologies: ['React', 'TypeScript', 'Express', 'Supabase PostgreSQL', 'Tailwind CSS'],
          difficulty: 'Advanced',
          estimatedDuration: '3 Weeks (30 hours)',
          features: [
            'Multi-stage application pipeline (Saved, Applied, Interview, Offer, Rejected)',
            'Real-time conversion rate and response analytics computed from database records',
            'Granular PostgreSQL Row Level Security isolating each candidate\'s private records',
            'Full OAuth 2.0 (Google/GitHub) and email password authentication',
          ],
          milestones: [
            { milestone: 'Phase 1: Security & RLS Database Architecture', deliverable: 'Production SQL migration with RLS policies and indexes' },
            { milestone: 'Phase 2: Express REST Controller Suite', deliverable: 'Validated endpoints for application lifecycle with token verification' },
            { milestone: 'Phase 3: Analytics Dashboard & Deployment', deliverable: 'Responsive client with conversion rate charts and production staging' },
          ],
          githubDeliverables: [
            'Documented SECURITY.md covering threat model and RLS guarantees',
            'End-to-end user journey test suite with Supertest and React Testing Library',
            'One-click deployment configuration for Render and Vercel',
          ],
          targetRoleSupport: `Demonstrates high-leverage SaaS fundamentals, cloud deployment, and secure database architecture required of seasoned ${targetRole} engineers.`,
        },
      ],
    };

    return { data: fallback, isLiveAi: false };
  }
}
