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
  preferredLocation?: string;
  salaryExpectations?: string;
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
  beginnerSuitability: 'High' | 'Moderate' | 'Prerequisites Required';
  potentialCareerProgression: string[];
  suggestedNextAction: string;
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
  const prompt = `You are a Principal Career Product Architect and Technical Talent Advisor.
Analyze the following candidate's genuine background and generate 3 top, highly tailored tech career recommendations.

CANDIDATE INPUTS:
- Degree: ${input.degree} in ${input.branch} (${input.academicYear})
- Known Programming Languages: ${input.programmingLanguages.join(', ') || 'None specified'}
- Technical Skills: ${input.technicalSkills.join(', ') || 'General fundamentals'}
- Interests: ${input.interests.join(', ') || 'Software & Technology'}
- Work/Project Experience: ${input.workExperience || 'Academic & personal exploration'}
- Preferred Industries: ${input.preferredIndustries.join(', ') || 'Technology'}
- Career Goal: ${input.careerGoal || 'Tech career transition'}
- Work Environment: ${input.preferredEnvironment}
- Location / Relocation: ${input.preferredLocation || 'Flexible'}
- Salary Expectation Context: ${input.salaryExpectations || 'Market standard entry/mid'}

STRICT PERSONALIZATION RULES:
1. Ground recommendations strictly in the candidate's degree, actual skills, and genuine interests.
2. DO NOT return the same generic roles for everyone.
   - If candidate has BTech CSE with basic Python/HTML and AI interest: recommend Python Developer (high match, beginner friendly), AI/ML Engineer (explain missing math, data structures, and ML libraries), and Data Analyst (explain missing SQL and statistics).
   - If candidate has BTech ECE with electronics/embedded systems interest: recommend Embedded Systems Engineer, Firmware Developer, or IoT Solutions Engineer.
   - If candidate has frontend/React skills: recommend Frontend Specialist, Full-Stack Developer, or Mobile App Developer.
3. For each recommendation, provide:
   - roleTitle
   - matchScore (0-100 realistic score)
   - matchExplanation (why their specific skills and degree align)
   - marketDemandTier ('High' | 'Very High' | 'Exceptional')
   - requiredTechnicalSkills (actual industry requirements)
   - requiredSoftSkills
   - userStrengths (skills from their input that transfer directly)
   - missingSkills (clear, precise gaps they must acquire)
   - difficultyToPivot ('Beginner Friendly' | 'Moderate Sprint' | 'Intensive Focus')
   - estimatedTimeToReady (e.g. '6-8 Weeks', '3-4 Months')
   - beginnerSuitability ('High' | 'Moderate' | 'Prerequisites Required')
   - potentialCareerProgression (array of 3 progressive job titles)
   - suggestedNextAction (concrete first milestone, e.g. 'Build a REST API with FastAPI')
   - recommendedFirstProject (title & description bridging their exact missing skill)
   - learningRoadmapSummary (4 distinct weekly learning phases)

Return strictly valid JSON conforming to this schema:
{
  "executiveSummary": "Personalized 2-3 sentence strategic synthesis of the candidate's unique pivot potential.",
  "topRecommendations": [
    {
      "roleTitle": "Title",
      "matchScore": 85,
      "matchExplanation": "Why it matches their background.",
      "marketDemandTier": "High",
      "requiredTechnicalSkills": ["Skill 1", "Skill 2"],
      "requiredSoftSkills": ["Soft Skill 1"],
      "userStrengths": ["Matching skill from user"],
      "missingSkills": ["Skills they still need to learn"],
      "difficultyToPivot": "Moderate Sprint",
      "estimatedTimeToReady": "8-10 Weeks",
      "beginnerSuitability": "High",
      "potentialCareerProgression": ["Junior Title", "Mid Title", "Lead Title"],
      "suggestedNextAction": "First actionable step.",
      "recommendedFirstProject": {
        "title": "Project Title",
        "description": "Specific project bridging their exact missing skill."
      },
      "learningRoadmapSummary": [
        "Phase 1: Foundations",
        "Phase 2: Project Deliverables",
        "Phase 3: Production Patterns",
        "Phase 4: Interview Readiness"
      ]
    }
  ],
  "alternativePaths": ["Alternative Role 1", "Alternative Role 2", "Alternative Role 3"]
}`;

  if (isGeminiConfigured) {
    try {
      const { data, isLiveAi } = await callGeminiJson<AssessmentResult>(prompt, {
        systemInstruction: 'You are an elite tech career coach. Provide evidence-based, personalized career path recommendations with zero generic placeholders.',
        temperature: 0.3,
      });
      return { ...data, isLiveAi };
    } catch (err: any) {
      console.warn('[AssessmentService] Gemini API failed, activating domain-aware career recommendation engine:', err.message);
    }
  }

  // Domain-Aware Heuristic Engine: customize output based on degree, skills, and interests
  const isECE = /ece|electronics|embedded|hardware|vlsi|telecom|iot/i.test(`${input.branch} ${input.interests.join(' ')}`);
  const isAI = /ai|machine learning|data science|deep learning|nlp/i.test(`${input.interests.join(' ')} ${input.careerGoal}`);
  const hasPython = input.programmingLanguages.some((l) => /python/i.test(l)) || input.technicalSkills.some((s) => /python/i.test(s));

  if (isECE) {
    return {
      executiveSummary: `Given your academic background in ${input.degree} (${input.branch}), your electronics foundations pair strongly with firmware development, embedded systems programming, and IoT hardware-software integration.`,
      topRecommendations: [
        {
          roleTitle: 'Embedded Systems & Firmware Engineer',
          matchScore: 84,
          matchExplanation: 'Your electronics background provides the circuit and microcontroller foundation required for low-level embedded software.',
          marketDemandTier: 'High',
          requiredTechnicalSkills: ['Embedded C', 'C++', 'Microcontrollers (ARM/STM32/ESP32)', 'RTOS', 'SPI/I2C/UART Protocols'],
          requiredSoftSkills: ['Hardware Debugging', 'Technical Documentation'],
          userStrengths: input.programmingLanguages.filter((l) => /c|python/i.test(l)),
          missingSkills: ['FreeRTOS', 'Device Driver Architecture', 'Logic Analyzer Debugging'],
          difficultyToPivot: 'Beginner Friendly',
          estimatedTimeToReady: '8-12 Weeks',
          beginnerSuitability: 'High',
          potentialCareerProgression: ['Junior Firmware Engineer', 'Senior Embedded Systems Developer', 'Embedded Systems Architect'],
          suggestedNextAction: 'Build an ESP32 sensor telemetry client transmitting readings over MQTT.',
          recommendedFirstProject: {
            title: 'IoT Sensor Telemetry Hub on ESP32',
            description: 'Program an ESP32 to sample temperature and humidity sensors via I2C and transmit data to a cloud dashboard over Wi-Fi.',
          },
          learningRoadmapSummary: [
            'Phase 1: Memory management, bitwise operations, and pointer arithmetic in Embedded C',
            'Phase 2: Peripheral bus protocols (GPIO, UART, I2C, SPI) and datasheet analysis',
            'Phase 3: Real-Time Operating Systems (FreeRTOS) task scheduling and mutexes',
            'Phase 4: Low-power states, watchdog timers, and hardware-in-the-loop testing',
          ],
        },
        {
          roleTitle: 'IoT Solutions Developer',
          matchScore: 80,
          matchExplanation: 'Bridges hardware sensors with cloud dashboards, leveraging both electronic interfacing and Python/cloud connectivity.',
          marketDemandTier: 'Very High',
          requiredTechnicalSkills: ['Python', 'MQTT / WebSockets', 'AWS IoT Core or Azure IoT', 'Linux CLI', 'Edge Computing'],
          requiredSoftSkills: ['End-to-End System Integration', 'Network Troubleshooting'],
          userStrengths: ['Hardware Fundamentals', ...input.programmingLanguages.slice(0, 1)],
          missingSkills: ['MQTT Message Brokers', 'Cloud IoT Ingestion Pipelines', 'Edge Containerization'],
          difficultyToPivot: 'Moderate Sprint',
          estimatedTimeToReady: '6-8 Weeks',
          beginnerSuitability: 'High',
          potentialCareerProgression: ['IoT Application Engineer', 'Cloud IoT Architect', 'Director of Connected Devices'],
          suggestedNextAction: 'Connect a simulated edge device to an MQTT broker and ingest events into Node.js.',
          recommendedFirstProject: {
            title: 'Cloud-Connected Smart Fleet Monitor',
            description: 'Publish GPS telemetry via MQTT and visualize device state in a real-time web portal.',
          },
          learningRoadmapSummary: [
            'Phase 1: Networking protocols, MQTT pub/sub patterns, and TLS security',
            'Phase 2: Gateway programming with Python and Raspberry Pi / ESP32',
            'Phase 3: Cloud IoT ingestion rules and time-series database storage',
            'Phase 4: Fleet management, remote over-the-air (OTA) updates, and security',
          ],
        },
      ],
      alternativePaths: ['Robotics Software Engineer', 'Hardware Verification Engineer', 'Industrial Automation Specialist'],
      isLiveAi: false,
    };
  }

  if (isAI && hasPython) {
    return {
      executiveSummary: `Based on your ${input.degree} in ${input.branch} and Python fundamentals, you can build a strong bridge from software scripting into Applied AI and data engineering by mastering math fundamentals and production API integration.`,
      topRecommendations: [
        {
          roleTitle: 'Python Software Developer',
          matchScore: 88,
          matchExplanation: 'Your current Python knowledge and CS fundamentals provide an immediate runway for backend development and automation.',
          marketDemandTier: 'High',
          requiredTechnicalSkills: ['Python', 'FastAPI or Django', 'PostgreSQL', 'Git', 'RESTful APIs', 'Unit Testing'],
          requiredSoftSkills: ['API Schema Design', 'Code Modularity'],
          userStrengths: ['Python Basics', 'Problem Solving Logic'],
          missingSkills: ['FastAPI REST Design', 'SQL Indexing & Joins', 'Pytest Test Suites'],
          difficultyToPivot: 'Beginner Friendly',
          estimatedTimeToReady: '6-8 Weeks',
          beginnerSuitability: 'High',
          potentialCareerProgression: ['Junior Python Developer', 'Backend Software Engineer', 'Staff API Architect'],
          suggestedNextAction: 'Build a production REST API with FastAPI, PostgreSQL, and JWT auth.',
          recommendedFirstProject: {
            title: 'Production REST API with FastAPI and PostgreSQL',
            description: 'Create a secured API with Zod/Pydantic validation, relational database queries, and automated unit tests.',
          },
          learningRoadmapSummary: [
            'Phase 1: Advanced Python (generators, decorators, type hints, asyncio)',
            'Phase 2: FastAPI REST routing, Pydantic validation, and dependency injection',
            'Phase 3: Relational modeling in PostgreSQL with SQLAlchemy and Alembic migrations',
            'Phase 4: Docker containerization, pytest suites, and GitHub Actions CI',
          ],
        },
        {
          roleTitle: 'Associate AI / Machine Learning Engineer',
          matchScore: 78,
          matchExplanation: 'High demand for developers who can integrate LLMs, build RAG pipelines, and connect vector databases to production backends.',
          marketDemandTier: 'Exceptional',
          requiredTechnicalSkills: ['Python', 'Linear Algebra / Calculus', 'PyTorch or scikit-learn', 'Vector Databases', 'RAG Architecture'],
          requiredSoftSkills: ['Mathematical Reasoning', 'Model Evaluation & Grounding'],
          userStrengths: ['Python Syntax', 'Logical Structuring'],
          missingSkills: ['Applied Linear Algebra & Statistics', 'scikit-learn / PyTorch', 'Vector Embeddings & Semantic Search'],
          difficultyToPivot: 'Moderate Sprint',
          estimatedTimeToReady: '12-16 Weeks',
          beginnerSuitability: 'Prerequisites Required',
          potentialCareerProgression: ['Associate AI Engineer', 'Machine Learning Engineer', 'Staff AI Product Architect'],
          suggestedNextAction: 'Study matrix operations and train a regression/classification baseline with scikit-learn.',
          recommendedFirstProject: {
            title: 'Semantic Document Search & Question-Answering System',
            description: 'Ingest PDF manuals, generate vector embeddings, and build a Retrieval-Augmented Generation (RAG) assistant with source citation.',
          },
          learningRoadmapSummary: [
            'Phase 1: Essential mathematics for ML (linear algebra, probability, loss functions)',
            'Phase 2: Data preprocessing, feature engineering, and model training with scikit-learn',
            'Phase 3: Deep learning fundamentals and PyTorch model architectures',
            'Phase 4: LLM application engineering (vector search, chunking, and evaluation)',
          ],
        },
      ],
      alternativePaths: ['Data Analyst / BI Specialist', 'Machine Learning Operations (MLOps) Engineer', 'Data Pipeline Developer'],
      isLiveAi: false,
    };
  }

  // Default Full-Stack Software Path
  return {
    executiveSummary: `Based on your academic background in ${input.degree} (${input.branch}), your programming skills in ${input.programmingLanguages.join(' and ') || 'modern software'} provide a strong foundation for full-stack and cloud engineering.`,
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
        difficultyToPivot: 'Beginner Friendly',
        estimatedTimeToReady: '6-8 Weeks',
        beginnerSuitability: 'High',
        potentialCareerProgression: ['Junior Developer', 'Full-Stack Software Engineer', 'Technical Lead'],
        suggestedNextAction: 'Build a multi-user CRUD application with TypeScript and PostgreSQL.',
        recommendedFirstProject: {
          title: 'Full-Stack SaaS Task Engine',
          description: 'Build a multi-user workspace with JWT authentication, PostgreSQL queries, and real-time UI.',
        },
        learningRoadmapSummary: [
          'Phase 1: TypeScript and modern React component architecture',
          'Phase 2: Express REST API design and Zod validation',
          'Phase 3: PostgreSQL schemas, joins, and indexing',
          'Phase 4: Automated integration testing and cloud deployment',
        ],
      },
    ],
    alternativePaths: ['DevOps & Cloud Automation Specialist', 'Technical Solutions Architect', 'Frontend Development Specialist'],
    isLiveAi: false,
  };
}

