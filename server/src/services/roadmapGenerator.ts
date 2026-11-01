import { callGeminiJson } from './geminiClient.js';
import { roadmapOutputSchema, RoadmapOutput } from '../schemas/index.js';

export async function generateRoadmap(
  targetRole: string,
  skillGaps: string[] = [],
  existingSkills: string[] = [],
  weeklyHours: number = 10,
  learningPreferences?: string
): Promise<{ data: RoadmapOutput; isLiveAi: boolean }> {
  const prompt = `
Create an intensive, practical 4-week personalized career transition roadmap for an aspiring "${targetRole}".

Candidate Context:
- Existing skills: ${existingSkills.join(', ') || 'General fundamentals'}
- Primary skill gaps to address: ${skillGaps.join(', ') || 'Advanced frameworks, testing, and production deployment'}
- Available study time: ${weeklyHours} hours per week
- Learning preferences: ${learningPreferences || 'Hands-on projects and documentation'}

Structure:
Provide exactly 4 weeks. For each week, outline:
- Weekly objective
- Key topics covered (2-3 topics)
- 3 to 4 focused practical daily tasks (paced for ${weeklyHours} hrs/week), each containing:
  - dayNumber (integer)
  - title (Action-oriented title)
  - description (What to learn concisely)
  - practicalExercise (Hands-on coding or architecture exercise)
  - deliverable (Tangible output, e.g. GitHub repo, SQL migration, Dockerfile)
  - resources (1-2 real documentation links with titles)
  - assessmentQuestion (A specific technical question to verify understanding)

Return JSON adhering strictly to:
{
  "targetRole": "${targetRole}",
  "durationWeeks": 4,
  "overview": "Strategic narrative overview of the 4-week trajectory.",
  "weeks": [
    {
      "weekNumber": 1,
      "objective": "Week objective",
      "topics": ["Topic 1", "Topic 2"],
      "dailyTasks": [
        {
          "dayNumber": 1,
          "title": "Task title",
          "description": "Task description",
          "practicalExercise": "Exercise details",
          "deliverable": "Commit / artifact deliverable",
          "resources": [
            { "title": "Resource name", "url": "https://developer.mozilla.org", "type": "Documentation" }
          ],
          "assessmentQuestion": "Conceptual or coding question"
        }
      ]
    }
  ]
}
`;

  try {
    const { data, isLiveAi } = await callGeminiJson<any>(prompt, {
      systemInstruction: 'You are a senior curriculum architect and engineering manager. Generate realistic, practical 4-week roadmaps tailored to the specified role and skill gaps with concrete coding deliverables.',
      temperature: 0.2,
      maxOutputTokens: 8192,
      timeoutMs: 60000,
    });
    const validated = roadmapOutputSchema.parse(data);
    return { data: validated, isLiveAi };
  } catch (err: any) {
    console.warn('Falling back to structured default 4-week roadmap:', err.message);

    const fallback: RoadmapOutput = {
      targetRole,
      durationWeeks: 4,
      overview: `A structured 4-week mastery sprint specifically tailored to close skill gaps for ${targetRole}, emphasizing practical code deliverables and testable competency.`,
      weeks: [
        {
          weekNumber: 1,
          objective: 'Core Architecture & Advanced Modern Foundations',
          topics: ['Type Systems & Strict Validation', 'Component Lifecycle & State Patterns', 'REST & Schema Contracts'],
          dailyTasks: [
            {
              dayNumber: 1,
              title: 'TypeScript Generics & Zod Schema Validation',
              description: 'Master strict typing, utility types, and runtime data validation pipelines.',
              practicalExercise: 'Write a schema validation suite with Zod and TypeScript infer types.',
              deliverable: 'A validated API request schema utility in a GitHub repo.',
              resources: [
                { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/', type: 'Documentation' },
                { title: 'Zod Documentation', url: 'https://zod.dev', type: 'Guide' },
              ],
              assessmentQuestion: 'Explain the difference between compile-time types and runtime schema validation.',
            },
            {
              dayNumber: 2,
              title: 'API Client Architecture & Token Handling',
              description: 'Build a reusable HTTP client with automatic Authorization header injection and refresh.',
              practicalExercise: 'Implement Axios/Fetch interceptor handling 401 token refreshes.',
              deliverable: 'Working api client module with error interceptors.',
              resources: [
                { title: 'MDN Fetch API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API', type: 'Documentation' },
              ],
              assessmentQuestion: 'Why should sensitive tokens never be stored in localStorage if XSS vulnerabilities exist?',
            },
            {
              dayNumber: 3,
              title: 'Database Normalization & Row Level Security',
              description: 'Understand foreign key constraints, indexes, and PostgreSQL RLS policies.',
              practicalExercise: 'Write SQL migration with RLS policies restricting rows to auth.uid().',
              deliverable: 'A clean SQL migration file tested against PostgreSQL.',
              resources: [
                { title: 'PostgreSQL Row Security Policies', url: 'https://www.postgresql.org/docs/current/ddl-rowsecurity.html', type: 'Documentation' },
              ],
              assessmentQuestion: 'How does an RLS policy differ from a standard WHERE clause in application code?',
            },
            {
              dayNumber: 4,
              title: 'State Management & Custom React Hooks',
              description: 'Refactor complex component state into isolated custom hooks with unit tests.',
              practicalExercise: 'Create a useAsync hook with loading, error, and cached data states.',
              deliverable: 'Reusable custom hook with TypeScript generics.',
              resources: [
                { title: 'React Documentation: Reusing Logic with Custom Hooks', url: 'https://react.dev/learn/reusing-logic-with-custom-hooks', type: 'Documentation' },
              ],
              assessmentQuestion: 'When should you use useReducer instead of useState for complex state?',
            },
            {
              dayNumber: 5,
              title: 'Weekly Milestone: Production CRUD Micro-Feature',
              description: 'Combine frontend forms, backend route, and database persistence with full error handling.',
              practicalExercise: 'Build an end-to-end user item management feature.',
              deliverable: 'Pull Request with functional UI and API integration.',
              resources: [
                { title: 'GitHub PR Best Practices', url: 'https://docs.github.com/en/pull-requests', type: 'Guide' },
              ],
              assessmentQuestion: 'What are the essential layers of defense when validating user-submitted data?',
            },
          ],
        },
        {
          weekNumber: 2,
          objective: 'Backend Systems, Authentication & Data Flow',
          topics: ['OAuth 2.0 & JWT Lifecycle', 'Middleware Chains & Rate Limiting', 'File Buffers & Processing'],
          dailyTasks: [
            {
              dayNumber: 1,
              title: 'OAuth 2.0 Flow & Social Login Handshake',
              description: 'Trace authorization code exchange, state parameter verification, and callback handling.',
              practicalExercise: 'Wire Google/GitHub OAuth redirection and session persistence.',
              deliverable: 'Tested login and callback redirect flow.',
              resources: [
                { title: 'OAuth 2.0 Simplified', url: 'https://www.oauth.com/', type: 'Guide' },
              ],
              assessmentQuestion: 'What security purpose does the OAuth "state" parameter serve?',
            },
            {
              dayNumber: 2,
              title: 'Express Middleware & Security Hardening',
              description: 'Configure Helmet headers, CORS origin restrictions, and request rate limiting.',
              practicalExercise: 'Set up express-rate-limit and Helmet security configurations.',
              deliverable: 'Configured server pipeline passing OWASP security checks.',
              resources: [
                { title: 'Helmet Documentation', url: 'https://helmetjs.github.io/', type: 'Documentation' },
              ],
              assessmentQuestion: 'What attack vector does Content-Security-Policy (CSP) primarily mitigate?',
            },
            {
              dayNumber: 3,
              title: 'File Upload & Secure Text Parsing',
              description: 'Implement stream/buffer uploads with strict MIME-type and size limits.',
              practicalExercise: 'Parse PDF/DOCX buffers in Node.js without writing raw files to disk.',
              deliverable: 'Tested file upload controller rejecting files over 5 MB.',
              resources: [
                { title: 'Multer Documentation', url: 'https://github.com/expressjs/multer', type: 'Documentation' },
              ],
              assessmentQuestion: 'Why should file extensions never be trusted as the sole indicator of file type?',
            },
            {
              dayNumber: 4,
              title: 'Structured AI Prompt Engineering',
              description: 'Formulate system instructions and structured JSON response schemas for LLMs.',
              practicalExercise: 'Integrate Gemini API with zod-validated structured output.',
              deliverable: 'AI service module with automated error fallback.',
              resources: [
                { title: 'Google AI Studio Guides', url: 'https://ai.google.dev/gemini-api/docs', type: 'Documentation' },
              ],
              assessmentQuestion: 'How does few-shot prompting improve JSON output adherence?',
            },
            {
              dayNumber: 5,
              title: 'Weekly Milestone: Secure End-to-End Ingestion Pipeline',
              description: 'Combine file upload, text extraction, and AI structured analysis in a single user flow.',
              practicalExercise: 'Build resume upload to AI analysis pipeline with visual progress states.',
              deliverable: 'Commit with interactive upload and analysis results display.',
              resources: [
                { title: 'Web Accessibility Guidelines (WCAG)', url: 'https://www.w3.org/WAI/standards-guidelines/wcag/', type: 'Standard' },
              ],
              assessmentQuestion: 'How do you handle AI latency gracefully in user interfaces?',
            },
          ],
        },
        {
          weekNumber: 3,
          objective: 'Testing, Reliability & Cloud Deployment',
          topics: ['Unit & Integration Testing', 'Docker Containerization', 'CI/CD Automation'],
          dailyTasks: [
            {
              dayNumber: 1,
              title: 'Unit Testing Business Logic',
              description: 'Write comprehensive test suites for helper functions and Zod schemas using Vitest.',
              practicalExercise: 'Implement tests with 80%+ branch coverage on core calculation services.',
              deliverable: 'Passing Vitest test suite in repository.',
              resources: [
                { title: 'Vitest Guide', url: 'https://vitest.dev/guide/', type: 'Documentation' },
              ],
              assessmentQuestion: 'What is the key difference between unit tests and integration tests?',
            },
            {
              dayNumber: 2,
              title: 'API Integration Testing & Mocks',
              description: 'Test Express endpoints using Supertest with simulated database sessions.',
              practicalExercise: 'Write route tests verifying 200, 400, and 401 response statuses.',
              deliverable: 'Automated API endpoint test script.',
              resources: [
                { title: 'Supertest GitHub', url: 'https://github.com/ladjs/supertest', type: 'Documentation' },
              ],
              assessmentQuestion: 'Why is it critical to test authorization boundaries on every private endpoint?',
            },
            {
              dayNumber: 3,
              title: 'Containerization with Docker',
              description: 'Author multi-stage Dockerfiles for frontend and backend production builds.',
              practicalExercise: 'Create Dockerfile and docker-compose.yml for local full-stack run.',
              deliverable: 'Tested multi-stage Dockerfile with minimal image size.',
              resources: [
                { title: 'Docker Best Practices', url: 'https://docs.docker.com/develop/develop-images/dockerfile_best-practices/', type: 'Guide' },
              ],
              assessmentQuestion: 'Why do multi-stage Docker builds produce smaller and more secure images?',
            },
            {
              dayNumber: 4,
              title: 'CI/CD with GitHub Actions',
              description: 'Automate linting, type-checking, and test runs on every pull request.',
              practicalExercise: 'Create .github/workflows/ci.yml with build and test steps.',
              deliverable: 'Green CI workflow check on GitHub.',
              resources: [
                { title: 'GitHub Actions Documentation', url: 'https://docs.github.com/en/actions', type: 'Documentation' },
              ],
              assessmentQuestion: 'What is branch protection and why is it important in production teams?',
            },
            {
              dayNumber: 5,
              title: 'Weekly Milestone: Automated Staging Deployment',
              description: 'Deploy frontend to Vercel and backend to Render with live environment variables.',
              practicalExercise: 'Verify deployed health endpoint and CORS origins.',
              deliverable: 'Live HTTPS deployment URLs documented in README.',
              resources: [
                { title: 'Vercel Deployment Docs', url: 'https://vercel.com/docs', type: 'Documentation' },
              ],
              assessmentQuestion: 'Why should production database connection pools be tuned carefully on free cloud tiers?',
            },
          ],
        },
        {
          weekNumber: 4,
          objective: 'Capstone Showcase, Portfolio Polish & Interview Readiness',
          topics: ['Performance Optimization', 'Portfolio Presentation', 'Technical Storytelling'],
          dailyTasks: [
            {
              dayNumber: 1,
              title: 'Frontend Performance Audit & Bundle Optimization',
              description: 'Run Lighthouse audits, eliminate unused bundles, and configure image optimization.',
              practicalExercise: 'Achieve 90+ Lighthouse score across Performance, SEO, and Accessibility.',
              deliverable: 'Lighthouse audit report summary in project docs.',
              resources: [
                { title: 'Google Lighthouse Docs', url: 'https://developer.chrome.com/docs/lighthouse/overview/', type: 'Tool' },
              ],
              assessmentQuestion: 'What techniques can you use to reduce Initial Server Response Time (TTFB)?',
            },
            {
              dayNumber: 2,
              title: 'Engineering Portfolio README & Architecture Diagram',
              description: 'Document system architecture, data flow diagrams (Mermaid), and setup guides.',
              practicalExercise: 'Draft a recruiter-ready project README with architecture diagrams and live links.',
              deliverable: 'Polished GitHub README.md with badges, screenshots, and live demo.',
              resources: [
                { title: 'Mermaid JS Docs', url: 'https://mermaid.js.org/', type: 'Documentation' },
              ],
              assessmentQuestion: 'What 3 elements do technical hiring managers look for first in a GitHub repo?',
            },
            {
              dayNumber: 3,
              title: 'Behavioral & STAR Method Interview Prep',
              description: 'Structure past experiences into Situation, Task, Action, and Result frameworks.',
              practicalExercise: 'Draft STAR answers for top 5 behavioral prompts.',
              deliverable: 'Written STAR response bank in CareerPivot mock interview module.',
              resources: [
                { title: 'STAR Technique Guide', url: 'https://en.wikipedia.org/wiki/Situation,_task,_action,_result', type: 'Guide' },
              ],
              assessmentQuestion: 'Why must the "Action" portion comprise the majority of a STAR answer?',
            },
            {
              dayNumber: 4,
              title: 'Technical Deep-Dive Mock Interview Sprint',
              description: 'Complete simulated technical interviews on system design and core algorithms.',
              practicalExercise: 'Score 80+ across technical correctness, communication, and practical examples.',
              deliverable: 'Completed AI mock interview evaluation in CareerPivot dashboard.',
              resources: [
                { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'Resource' },
              ],
              assessmentQuestion: 'How do you structure an answer when asked to design a scalable web service?',
            },
            {
              dayNumber: 5,
              title: 'Final Transition Readiness Check & Live Application Dispatch',
              description: 'Track job applications with customized resumes and tailored cover notes.',
              practicalExercise: 'Submit 3 targeted job applications and log them in Job Application Tracker.',
              deliverable: 'Updated application tracker with company, status, and follow-up alerts.',
              resources: [
                { title: 'CareerPivot Tracker Guide', url: 'https://careerpivot.ai/docs', type: 'Internal' },
              ],
              assessmentQuestion: 'What follow-up cadence produces the highest recruiter response rate?',
            },
          ],
        },
      ],
    };

    return { data: fallback, isLiveAi: false };
  }
}
