/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import {GoogleGenAI} from '@google/genai';

const STORAGE_KEY = 'gemini_api_key';

export function getStoredApiKey(): string {
  return localStorage.getItem(STORAGE_KEY) || (typeof process !== 'undefined' && process.env?.API_KEY) || '';
}

export function setStoredApiKey(key: string): void {
  localStorage.setItem(STORAGE_KEY, key.trim());
}

function getGenAIClient(): GoogleGenAI {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    throw new Error('API key is not configured. Please enter your Gemini API key.');
  }
  return new GoogleGenAI({ apiKey });
}

import {
  getStoredTextModel,
  setStoredTextModel,
  getStoredArtModel,
  setStoredArtModel,
  getStoredAutoFallback,
  FALLBACK_TEXT_MODEL,
  FALLBACK_ART_MODEL,
  getModelDisplayName,
} from './modelsConfig';

export {
  getStoredTextModel,
  setStoredTextModel,
  getStoredArtModel,
  setStoredArtModel,
  getStoredAutoFallback,
  getModelDisplayName,
};

/**
 * Checks if an error is a Quota Exceeded (429 / RESOURCE_EXHAUSTED) error.
 */
export function isQuotaError(error: unknown): boolean {
  if (!error) return false;
  const message = error instanceof Error ? error.message : String(error);
  return (
    message.includes('429') ||
    message.includes('RESOURCE_EXHAUSTED') ||
    message.toLowerCase().includes('quota') ||
    message.toLowerCase().includes('rate limit')
  );
}

/**
 * Art-direction toggle for ASCII art generation.
 * `true`: Slower, higher-quality results (allows the model to "think").
 * `false`: Faster, potentially lower-quality results (skips thinking).
 */
const ENABLE_THINKING_FOR_ASCII_ART = false;

/**
 * Art-direction toggle for blocky ASCII text generation.
 * `true`: Generates both creative art and blocky text for the topic name.
 * `false`: Generates only the creative ASCII art.
 */
const ENABLE_ASCII_TEXT_GENERATION = false;

export interface AsciiArtData {
  art: string;
  text?: string; // Text is now optional
}


export interface StreamDefinitionOptions {
  model?: string;
  onFallback?: (fallbackModel: string, reason: string) => void;
}

/**
 * Streams a definition for a given topic from the Gemini API.
 * @param topic The word or term to define.
 * @param options Optional configuration including model override and onFallback callback.
 * @returns An async generator that yields text chunks of the definition.
 */
export async function* streamDefinition(
  topic: string,
  options?: StreamDefinitionOptions,
): AsyncGenerator<string, void, undefined> {
  const apiKey = getStoredApiKey();
  if (!apiKey) {
    yield 'Error: API key is not configured. Please set your Gemini API key to continue.';
    return;
  }

  const prompt = `Provide a concise, single-paragraph encyclopedia-style definition for the term: "${topic}". Be informative and neutral. Do not use markdown, titles, or any special formatting. Respond with only the text of the definition itself.`;

  let currentModel = options?.model || getStoredTextModel();
  const autoFallback = getStoredAutoFallback();
  let triedFallback = false;

  while (true) {
    try {
      const ai = getGenAIClient();
      const config: any = {};
      
      // Configure thinking appropriately for the selected model
      if (currentModel.startsWith('gemini-3')) {
        config.thinkingConfig = { thinkingLevel: 'minimal' };
      } else if (currentModel.startsWith('gemini-2')) {
        config.thinkingConfig = { thinkingBudget: 0 };
      }
      // Other models (like Gemma) do not support thinkingConfig

      const response = await ai.models.generateContentStream({
        model: currentModel,
        contents: prompt,
        config: Object.keys(config).length > 0 ? config : undefined,
      });

      for await (const chunk of response) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
      return;
    } catch (error) {
      if (
        !triedFallback &&
        autoFallback &&
        currentModel !== FALLBACK_TEXT_MODEL &&
        isQuotaError(error)
      ) {
        triedFallback = true;
        const prevModelName = getModelDisplayName(currentModel);
        currentModel = FALLBACK_TEXT_MODEL;
        const fallbackName = getModelDisplayName(currentModel);
        setStoredTextModel(currentModel);
        if (options?.onFallback) {
          options.onFallback(currentModel, `Quota limit reached on ${prevModelName}. Auto-switched to ${fallbackName}.`);
        }
        console.warn(`[Quota Fallback] Switched text model from ${prevModelName} to ${fallbackName}`);
        continue;
      }

      console.error('Error streaming from Gemini:', error);
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      yield `Error: Could not generate content for "${topic}". ${errorMessage}`;
      throw new Error(errorMessage);
    }
  }
}

/**
 * Generates a single random word or concept using the Gemini API.
 * @returns A promise that resolves to a single random word.
 */
export async function getRandomWord(model?: string): Promise<string> {
  const ai = getGenAIClient();
  const prompt = `Generate a single, random, interesting English word or a two-word concept. It can be a noun, verb, adjective, or a proper noun. Respond with only the word or concept itself, with no extra text, punctuation, or formatting.`;
  const activeModel = model || getStoredTextModel();

  try {
    const config: any = {};
    if (activeModel.startsWith('gemini-3')) {
      config.thinkingConfig = { thinkingLevel: 'minimal' };
    } else if (activeModel.startsWith('gemini-2')) {
      config.thinkingConfig = { thinkingBudget: 0 };
    }

    const response = await ai.models.generateContent({
      model: activeModel,
      contents: prompt,
      config: Object.keys(config).length > 0 ? config : undefined,
    });
    return response.text.trim();
  } catch (error) {
    console.error('Error getting random word from Gemini:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    throw new Error(`Could not get random word: ${errorMessage}`);
  }
}

export interface AsciiArtOptions {
  model?: string;
  onFallback?: (fallbackModel: string, reason: string) => void;
}

/**
 * Generates ASCII art and optionally text for a given topic.
 * @param topic The topic to generate art for.
 * @param options Optional configuration including model override and onFallback callback.
 * @returns A promise that resolves to an object with art and optional text.
 */
export async function generateAsciiArt(
  topic: string,
  options?: AsciiArtOptions,
): Promise<AsciiArtData> {
  const ai = getGenAIClient();
  
  const artPromptPart = `1. "art": meta ASCII visualization of the word "${topic}":
  - Palette: │─┌┐└┘├┤┬┴┼►◄▲▼○●◐◑░▒▓█▀▄■□▪▫★☆♦♠♣♥⟨⟩/\\_|
  - Shape mirrors concept - make the visual form embody the word's essence
  - Examples: 
    * "explosion" → radiating lines from center
    * "hierarchy" → pyramid structure
    * "flow" → curved directional lines
  - Return as single string with \\n for line breaks`;

  const keysDescription = `one key: "art"`;
  const promptBody = artPromptPart;

  const prompt = `For "${topic}", create a JSON object with ${keysDescription}.
${promptBody}

Return ONLY the raw JSON object, no additional text. The response must start with "{" and end with "}" and contain only the art property.`;

  let currentModel = options?.model || getStoredArtModel();
  const autoFallback = getStoredAutoFallback();
  let triedFallback = false;

  const maxRetries = 2;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const config: any = {
        responseMimeType: 'application/json',
      };
      if (!ENABLE_THINKING_FOR_ASCII_ART) {
        if (currentModel.startsWith('gemini-3')) {
          config.thinkingConfig = { thinkingLevel: 'minimal' };
        } else if (currentModel.startsWith('gemini-2')) {
          config.thinkingConfig = { thinkingBudget: 0 };
        }
      }

      const response = await ai.models.generateContent({
        model: currentModel,
        contents: prompt,
        config: config,
      });

      let jsonStr = response.text.trim();
      
      // Remove any markdown code fences if present
      const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
      const match = jsonStr.match(fenceRegex);
      if (match && match[1]) {
        jsonStr = match[1].trim();
      }

      if (!jsonStr.startsWith('{') || !jsonStr.endsWith('}')) {
        throw new Error('Response is not a valid JSON object');
      }

      const parsedData = JSON.parse(jsonStr) as AsciiArtData;
      
      if (typeof parsedData.art !== 'string' || parsedData.art.trim().length === 0) {
        throw new Error('Invalid or empty ASCII art in response');
      }
      
      const result: AsciiArtData = {
        art: parsedData.art,
      };

      if (ENABLE_ASCII_TEXT_GENERATION && parsedData.text) {
        result.text = parsedData.text;
      }
      
      return result;

    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      
      // Handle quota error fallback immediately if enabled
      if (
        !triedFallback &&
        autoFallback &&
        currentModel !== FALLBACK_ART_MODEL &&
        isQuotaError(lastError)
      ) {
        triedFallback = true;
        const prevModelName = getModelDisplayName(currentModel);
        currentModel = FALLBACK_ART_MODEL;
        const fallbackName = getModelDisplayName(currentModel);
        setStoredArtModel(currentModel);
        if (options?.onFallback) {
          options.onFallback(currentModel, `Quota limit reached on ${prevModelName}. Auto-switched to ${fallbackName}.`);
        }
        console.warn(`[Quota Fallback] Switched art model from ${prevModelName} to ${fallbackName}`);
        continue;
      }

      console.warn(`Attempt ${attempt}/${maxRetries} failed:`, lastError.message);
      
      if (attempt === maxRetries) {
        console.error('All retry attempts failed for ASCII art generation');
        throw new Error(`Could not generate ASCII art after ${maxRetries} attempts: ${lastError.message}`);
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}

