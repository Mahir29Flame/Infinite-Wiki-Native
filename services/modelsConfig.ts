export interface ModelOption {
  id: string;
  name: string;
  description: string;
  tag?: string;
  type: 'text' | 'art';
}

export const TEXT_MODELS: ModelOption[] = [
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash Lite',
    description: 'Fast latency & highest quota tier',
    tag: 'Recommended',
    type: 'text',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    description: 'Fastest Ultra lightweight backup model for text',
    type: 'text',
  },
  {
    id: 'gemma-4-26b-a4b-it',
    name: 'Gemma 4 26B (Cloud)',
    description: 'Open-weights architecture via Google Cloud',
    type: 'text',
  },
  {
    id: 'gemma-4-31b-it',
    name: 'Gemma 4 31B (Cloud)',
    description: 'High capability cloud open model',
    type: 'text',
  },
];

export const ART_MODELS: ModelOption[] = [
  {
    id: 'gemma-4-31b-it',
    name: 'Gemma 4 31B (Cloud)',
    description: 'Creative and detailed ASCII art structures',
    type: 'art',
  },
  {
    id: 'gemma-4-26b-a4b-it',
    name: 'Gemma 4 26B (Cloud)',
    description: 'Fastest and responsive open model but bas ASCII Result',
    type: 'art',
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash Lite',
    description: 'Generation with high quota limit but very slow',
    tag: 'Recommended',
    type: 'art',
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash Lite',
    description: 'High quota limit backup for ASCII art yet slow',
    type: 'art',
  },
];

export const DEFAULT_TEXT_MODEL = 'gemini-3.5-flash-lite';
export const DEFAULT_ART_MODEL = 'gemini-3.5-flash-lite';
export const FALLBACK_TEXT_MODEL = 'gemini-3.1-flash-lite';
export const FALLBACK_ART_MODEL = 'gemini-3.1-flash-lite';

export const TEXT_MODEL_STORAGE_KEY = 'infinite_wiki_text_model';
export const ART_MODEL_STORAGE_KEY = 'infinite_wiki_art_model';
export const AUTO_FALLBACK_STORAGE_KEY = 'infinite_wiki_auto_fallback';

export function getStoredTextModel(): string {
  return localStorage.getItem(TEXT_MODEL_STORAGE_KEY) || DEFAULT_TEXT_MODEL;
}

export function setStoredTextModel(modelId: string): void {
  localStorage.setItem(TEXT_MODEL_STORAGE_KEY, modelId);
}

export function getStoredArtModel(): string {
  return localStorage.getItem(ART_MODEL_STORAGE_KEY) || DEFAULT_ART_MODEL;
}

export function setStoredArtModel(modelId: string): void {
  localStorage.setItem(ART_MODEL_STORAGE_KEY, modelId);
}

export function getStoredAutoFallback(): boolean {
  const stored = localStorage.getItem(AUTO_FALLBACK_STORAGE_KEY);
  return stored === null ? true : stored === 'true';
}

export function setStoredAutoFallback(enabled: boolean): void {
  localStorage.setItem(AUTO_FALLBACK_STORAGE_KEY, String(enabled));
}

export function getModelDisplayName(modelId: string): string {
  const found = [...TEXT_MODELS, ...ART_MODELS].find(m => m.id === modelId);
  return found ? found.name : modelId;
}
