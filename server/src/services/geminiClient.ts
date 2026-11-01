import { getGemini, isGeminiConfigured } from '../config/index.js';

export interface GeminiCallOptions {
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
  modelName?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

// Active supported Gemini models in order of priority:
// 1. gemini-3.5-flash: fast, highly accurate, low latency
// 2. gemini-3.8-flash: next-generation reasoning fallback
// 3. gemini-3.5-flash-lite: ultra-efficient speed fallback
const CANDIDATE_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.8-flash',
  'gemini-3.5-flash-lite',
];

/**
 * Safely extract and parse JSON from LLM responses, handling markdown wrappers,
 * explanatory text, or trailing formatting.
 */
function extractJson<T>(rawText: string): T {
  const trimmed = rawText.trim();

  // 1. Try direct parse
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // Continue to heuristics
  }

  // 2. Remove markdown code fences
  let cleaned = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Continue to bracket extraction
  }

  // 3. Extract outermost JSON object { ... }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const objectCandidate = cleaned.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(objectCandidate) as T;
    } catch {
      // Continue
    }
  }

  // 4. Extract outermost JSON array [ ... ]
  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket > firstBracket) {
    const arrayCandidate = cleaned.slice(firstBracket, lastBracket + 1);
    try {
      return JSON.parse(arrayCandidate) as T;
    } catch {
      // Continue
    }
  }

  throw new Error(`Failed to parse structured JSON from model response. Snippet: "${rawText.slice(0, 150)}..."`);
}

/**
 * Execute a structured prompt with Google Gemini across a resilient fallback chain
 * and return validated, parsed JSON.
 */
export async function callGeminiJson<T>(
  prompt: string,
  options: GeminiCallOptions = {}
): Promise<{ data: T; isLiveAi: boolean; modelUsed: string }> {
  const gemini = getGemini();

  if (!isGeminiConfigured || !gemini) {
    throw new Error('GEMINI_NOT_CONFIGURED');
  }

  // Build model try-list: explicit model first (if given), followed by supported candidates
  const modelsToTry: string[] = [];
  if (options.modelName && !modelsToTry.includes(options.modelName)) {
    modelsToTry.push(options.modelName);
  }
  for (const m of CANDIDATE_MODELS) {
    if (!modelsToTry.includes(m)) {
      modelsToTry.push(m);
    }
  }

  let lastError: any = null;

  for (const currentModelName of modelsToTry) {
    const maxRetries = options.maxRetries ?? 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const model = gemini.getGenerativeModel({
          model: currentModelName,
          systemInstruction:
            options.systemInstruction ||
            'You are an expert technical career architect and recruiter. Return valid JSON only, without markdown fences or extraneous text.',
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: options.temperature ?? 0.2,
            maxOutputTokens: options.maxOutputTokens ?? 8192,
          },
        });

        // Timeout wrapper for network resiliency
        const timeoutMs = options.timeoutMs ?? 55000;
        const resultPromise = model.generateContent(prompt);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Gemini request timeout after ${timeoutMs}ms on model ${currentModelName}`)), timeoutMs)
        );

        const result = await Promise.race([resultPromise, timeoutPromise]);
        const response = await result.response;
        const rawText = response.text();

        const parsed = extractJson<T>(rawText);
        return { data: parsed, isLiveAi: true, modelUsed: currentModelName };
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        const status = err?.status || (msg.includes('404') ? 404 : msg.includes('429') ? 429 : msg.includes('503') ? 503 : 500);

        // If model not found or deprecated, immediately try next model in cascade
        if (status === 404 || msg.includes('not found') || msg.includes('no longer available')) {
          console.warn(`[Gemini Cascade] Model ${currentModelName} unavailable (404). Falling back to next model...`);
          break; // Break retry loop, try next model
        }

        // If rate limited (429) or high demand (503), back off and retry or fall back
        if ((status === 429 || status === 503 || msg.includes('high demand')) && attempt < maxRetries) {
          const backoff = (attempt + 1) * 1500;
          console.warn(`[Gemini Cascade] Model ${currentModelName} received ${status}. Retrying in ${backoff}ms (attempt ${attempt + 1}/${maxRetries})...`);
          await new Promise((res) => setTimeout(res, backoff));
          continue;
        }

        // On last attempt or non-retryable error, proceed to next candidate model
        console.warn(`[Gemini Cascade] Model ${currentModelName} attempt ${attempt} failed: ${msg.slice(0, 100)}`);
        break;
      }
    }
  }

  console.error('[Gemini Cascade] All model candidates failed:', lastError?.message || lastError);
  throw lastError || new Error('All Gemini model candidates failed to respond.');
}

/**
 * Execute a conversational or free-form text prompt with Google Gemini across a resilient fallback chain.
 */
export async function callGeminiText(
  prompt: string,
  options: GeminiCallOptions = {}
): Promise<{ text: string; isLiveAi: boolean; modelUsed: string }> {
  const gemini = getGemini();

  if (!isGeminiConfigured || !gemini) {
    throw new Error('GEMINI_NOT_CONFIGURED');
  }

  const modelsToTry: string[] = [];
  if (options.modelName && !modelsToTry.includes(options.modelName)) {
    modelsToTry.push(options.modelName);
  }
  for (const m of CANDIDATE_MODELS) {
    if (!modelsToTry.includes(m)) {
      modelsToTry.push(m);
    }
  }

  let lastError: any = null;

  for (const currentModelName of modelsToTry) {
    const maxRetries = options.maxRetries ?? 2;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const model = gemini.getGenerativeModel({
          model: currentModelName,
          systemInstruction:
            options.systemInstruction ||
            'You are CareerPivot AI Mentor, a senior tech career coach. Provide clear, direct, actionable guidance grounded in the candidate\'s actual background.',
          generationConfig: {
            temperature: options.temperature ?? 0.4,
            maxOutputTokens: options.maxOutputTokens ?? 2048,
          },
        });

        const timeoutMs = options.timeoutMs ?? 55000;
        const resultPromise = model.generateContent(prompt);
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Gemini request timeout after ${timeoutMs}ms on model ${currentModelName}`)), timeoutMs)
        );

        const result = await Promise.race([resultPromise, timeoutPromise]);
        const response = await result.response;
        const text = response.text().trim();

        return { text, isLiveAi: true, modelUsed: currentModelName };
      } catch (err: any) {
        lastError = err;
        const msg = err?.message || String(err);
        const status = err?.status || (msg.includes('404') ? 404 : msg.includes('429') ? 429 : msg.includes('503') ? 503 : 500);

        if (status === 404 || msg.includes('not found') || msg.includes('no longer available')) {
          console.warn(`[Gemini Cascade] Text Model ${currentModelName} unavailable (404). Falling back to next model...`);
          break;
        }

        if ((status === 429 || status === 503 || msg.includes('high demand')) && attempt < maxRetries) {
          const backoff = (attempt + 1) * 1500;
          console.warn(`[Gemini Cascade] Text Model ${currentModelName} received ${status}. Retrying in ${backoff}ms...`);
          await new Promise((res) => setTimeout(res, backoff));
          continue;
        }

        console.warn(`[Gemini Cascade] Text Model ${currentModelName} failed: ${msg.slice(0, 100)}`);
        break;
      }
    }
  }

  console.error('[Gemini Cascade] All text model candidates failed:', lastError?.message || lastError);
  throw lastError || new Error('All Gemini text model candidates failed to respond.');
}

