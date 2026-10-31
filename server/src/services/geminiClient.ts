import { getGemini, isGeminiConfigured } from '../config/index.js';

export interface GeminiCallOptions {
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  modelName?: string;
}

/**
 * Execute a structured prompt with Google Gemini and return parsed JSON
 */
export async function callGeminiJson<T>(
  prompt: string,
  options: GeminiCallOptions = {}
): Promise<{ data: T; isLiveAi: boolean }> {
  const gemini = getGemini();

  if (!isGeminiConfigured || !gemini) {
    throw new Error('GEMINI_NOT_CONFIGURED');
  }

  const model = gemini.getGenerativeModel({
    model: options.modelName || 'gemini-1.5-flash',
    systemInstruction: options.systemInstruction || 'You are an expert career transition coach and technical recruiter. Output valid JSON only with no markdown formatting or backticks.',
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: options.temperature ?? 0.2,
      maxOutputTokens: options.maxOutputTokens ?? 4096,
    },
  });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean potential markdown blocks if present
    const cleanedText = text
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/```$/i, '')
      .trim();

    const parsed = JSON.parse(cleanedText) as T;
    return { data: parsed, isLiveAi: true };
  } catch (err: any) {
    console.error('Gemini API call failed:', err.message || err);
    throw err;
  }
}

/**
 * Execute a conversational prompt with Google Gemini and return text
 */
export async function callGeminiText(
  prompt: string,
  options: GeminiCallOptions = {}
): Promise<{ text: string; isLiveAi: boolean }> {
  const gemini = getGemini();

  if (!isGeminiConfigured || !gemini) {
    throw new Error('GEMINI_NOT_CONFIGURED');
  }

  const model = gemini.getGenerativeModel({
    model: options.modelName || 'gemini-1.5-flash',
    systemInstruction: options.systemInstruction || 'You are CareerPivot AI Mentor, a senior tech career coach. Provide clear, direct, and actionable guidance for career switchers and tech students.',
    generationConfig: {
      temperature: options.temperature ?? 0.4,
      maxOutputTokens: options.maxOutputTokens ?? 2048,
    },
  });

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return { text: response.text().trim(), isLiveAi: true };
  } catch (err: any) {
    console.error('Gemini Text API call failed:', err.message || err);
    throw err;
  }
}
