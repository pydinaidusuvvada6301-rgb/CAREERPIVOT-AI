import {
  ResumeParsedData,
  SkillGapData,
  RoadmapData,
  PortfolioProject,
  InterviewQuestionItem,
  InterviewEvaluation,
  JobApplication,
  ApplicationAnalytics,
  ProgressSummary,
  ProgressRecommendations,
  CareerAssessmentInput,
  AssessmentResult,
} from '../types';

const CANONICAL_BACKEND_URL = 'https://careerpivot-ai.onrender.com/api';
let resolvedBaseUrl: string = '';

function getApiBaseUrl(): string {
  if (resolvedBaseUrl) return resolvedBaseUrl;

  let url = (import.meta.env.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');

  // Self-healing: autocorrect outdated/typo backend hostname to live Render web service
  if (url.includes('careerpivot-backend.onrender.com')) {
    url = url.replace('careerpivot-backend.onrender.com', 'careerpivot-ai.onrender.com');
  }

  // If in browser on any non-localhost domain (Vercel, preview, custom domain):
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    if (!url || url.includes('localhost') || url.includes('127.0.0.1')) {
      resolvedBaseUrl = CANONICAL_BACKEND_URL;
      return CANONICAL_BACKEND_URL;
    }
  }

  resolvedBaseUrl = url || 'http://localhost:5000/api';
  return resolvedBaseUrl;
}

class ApiClient {
  private getToken(): string | null {
    // Check localStorage for active session token or demo token
    const token = localStorage.getItem('careerpivot_token');
    return token || 'demo-token';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers = new Headers(options.headers || {});

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const baseUrl = getApiBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    // 45-second timeout for Render cold start tolerance
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: options.signal || controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // If 404 or 502 on wrong backend host in production, attempt automatic failover
        if (
          (response.status === 404 || response.status === 502) &&
          baseUrl !== CANONICAL_BACKEND_URL &&
          typeof window !== 'undefined' &&
          window.location.hostname !== 'localhost'
        ) {
          resolvedBaseUrl = CANONICAL_BACKEND_URL;
          const fallbackUrl = `${CANONICAL_BACKEND_URL}${endpoint}`;
          const retryRes = await fetch(fallbackUrl, {
            ...options,
            headers,
          });
          if (retryRes.ok) return retryRes.json();
        }

        let errorMessage = `HTTP Error ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // use fallback status
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (err: any) {
      clearTimeout(timeoutId);

      // Automatic fallback if initial network request failed (e.g. host not found, SSL error, 404)
      if (
        baseUrl !== CANONICAL_BACKEND_URL &&
        typeof window !== 'undefined' &&
        window.location.hostname !== 'localhost'
      ) {
        try {
          resolvedBaseUrl = CANONICAL_BACKEND_URL;
          const fallbackUrl = `${CANONICAL_BACKEND_URL}${endpoint}`;
          const retryRes = await fetch(fallbackUrl, {
            ...options,
            headers,
          });
          if (retryRes.ok) return retryRes.json();
        } catch {
          // If failover also failed, continue to standard error formatting
        }
      }

      if (err.name === 'AbortError') {
        throw new Error(
          'Request timed out. The Render backend may be waking up from cold sleep (takes ~45s). Please click Retry in a few seconds.'
        );
      }

      if (err.message && err.message.toLowerCase().includes('failed to fetch')) {
        throw new Error(
          `Unable to connect to backend service (${baseUrl}). The Render free instance may be spinning up from sleep (~40s). Please wait a moment and click Retry.`
        );
      }

      throw err;
    }
  }

  // Health
  async checkHealth() {
    return this.request<{ status: string; capabilities: any }>('/health');
  }

  // 1. Resume Analyzer
  async analyzeResume(data: FormData | { text: string; targetRole?: string }) {
    if (data instanceof FormData) {
      return this.request<{
        success: boolean;
        analysis: ResumeParsedData;
        isLiveAi: boolean;
        notice?: string;
      }>('/resume/analyze', {
        method: 'POST',
        body: data,
      });
    }

    return this.request<{
      success: boolean;
      analysis: ResumeParsedData;
      isLiveAi: boolean;
      notice?: string;
    }>('/resume/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // 2. Skill Gap Analyzer
  async analyzeSkillGap(payload: {
    targetRole: string;
    resumeText?: string;
    resumeSkills?: string[];
    jobDescriptionText?: string;
    jobDescriptionId?: string;
  }) {
    return this.request<{
      success: boolean;
      data: SkillGapData;
      isLiveAi: boolean;
      notice?: string;
    }>('/skills/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // 3. Learning Roadmap
  async generateRoadmap(payload: {
    targetRole: string;
    skillGaps: string[];
    existingSkills?: string[];
    weeklyHours?: number;
    learningPreferences?: string;
  }) {
    return this.request<{
      success: boolean;
      data: RoadmapData;
      isLiveAi: boolean;
      notice?: string;
    }>('/roadmap/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // 4. Portfolio Projects
  async recommendProjects(payload: {
    targetRole: string;
    skillGaps: string[];
    existingSkills?: string[];
  }) {
    return this.request<{
      success: boolean;
      data: { targetRole: string; projects: PortfolioProject[] };
      isLiveAi: boolean;
      notice?: string;
    }>('/projects/recommend', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // 5. Mock Interview
  async generateInterview(payload: {
    targetRole: string;
    interviewType: 'technical' | 'hr';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    questionCount?: number;
  }) {
    return this.request<{
      success: boolean;
      questions: InterviewQuestionItem[];
      isLiveAi: boolean;
    }>('/interview/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async evaluateInterview(payload: {
    question: string;
    userAnswer: string;
    targetRole: string;
    interviewType: 'technical' | 'hr';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }) {
    return this.request<{
      success: boolean;
      evaluation: InterviewEvaluation;
      isLiveAi: boolean;
      notice?: string;
    }>('/interview/evaluate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // Verified Sample Job Postings
  async getSampleJobs() {
    return this.request<{
      success: boolean;
      samples: Array<{
        id: string;
        title: string;
        company: string;
        location: string;
        sourceUrl: string;
        retrievalDate: string;
        requiredSkills: string[];
        preferredSkills: string[];
        responsibilities: string[];
        technicalRequirements: string[];
      }>;
    }>('/job-descriptions/samples');
  }

  // 6. Progress
  async getProgress() {
    return this.request<{
      success: boolean;
      progress: ProgressSummary;
      recommendations: ProgressRecommendations;
      isLiveAi: boolean;
    }>('/progress');
  }

  async updateProgress(payload: { taskId?: string; completed?: boolean; targetRole?: string }) {
    return this.request<{
      success: boolean;
      progress: ProgressSummary;
      message: string;
    }>('/progress', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // 7. Applications
  async getApplications() {
    return this.request<{
      success: boolean;
      applications: JobApplication[];
      analytics: ApplicationAnalytics;
    }>('/applications');
  }

  async createApplication(payload: Omit<JobApplication, 'id'>) {
    return this.request<{
      success: boolean;
      application: JobApplication;
      message: string;
    }>('/applications', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async updateApplication(id: string, payload: Partial<Omit<JobApplication, 'id'>>) {
    return this.request<{
      success: boolean;
      application: JobApplication;
      message: string;
    }>(`/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  async deleteApplication(id: string) {
    return this.request<{ success: boolean; message: string }>(`/applications/${id}`, {
      method: 'DELETE',
    });
  }

  // 8. Career Assessment & Recommendations (Part 5 & 6)
  async assessCareer(payload: CareerAssessmentInput) {
    return this.request<{
      success: boolean;
      assessment: AssessmentResult;
      isLiveAi: boolean;
    }>('/career/assess', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  // 9. AI Career Mentor Chat (Part 10)
  async sendMentorMessage(payload: {
    message: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
    userProfile?: any;
  }) {
    return this.request<{
      success: boolean;
      reply: string;
      suggestedActions: string[];
      recommendedTopic?: string;
      isLiveAi: boolean;
    }>('/mentor/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}

export const api = new ApiClient();

