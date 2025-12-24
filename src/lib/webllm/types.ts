// src/lib/webllm/types.ts

/**
 * Model tier based on size and hardware requirements
 */
export type ModelTier = 'small' | 'medium' | 'large';

/**
 * Which backend is handling chat
 */
export type ChatBackend = 'webllm' | 'openai';

/**
 * Chat mode: text uses WebLLM, voice uses OpenAI
 */
export type ChatMode = 'text' | 'voice';

/**
 * Configuration for each available model
 */
export interface ModelConfig {
  id: string;           // WebLLM model identifier
  name: string;         // Display name
  size: string;         // Human-readable size (e.g., "~300MB")
  tier: ModelTier;      // small/medium/large
  minVRAM: number;      // Minimum VRAM in GB
  contextWindow: number; // Max context length
}

/**
 * All available models - ordered from smallest to largest
 */
export const AVAILABLE_MODELS: ModelConfig[] = [
  {
    id: 'Qwen2-0.5B-Instruct-q4f16_1-MLC',
    name: 'Qwen2 0.5B (Fast)',
    size: '~300MB',
    tier: 'small',
    minVRAM: 1,
    contextWindow: 4096
  },
  {
    id: 'Phi-3-mini-4k-instruct-q4f16_1-MLC',
    name: 'Phi-3 Mini (Balanced)',
    size: '~2GB',
    tier: 'medium',
    minVRAM: 4,
    contextWindow: 4096
  },
  {
    id: 'Llama-3.1-8B-Instruct-q4f32_1-MLC',
    name: 'Llama 3.1 8B (Quality)',
    size: '~4GB',
    tier: 'large',
    minVRAM: 8,
    contextWindow: 8192
  }
];

/**
 * Default model (smallest, works on most devices)
 */
export const DEFAULT_MODEL_ID = 'Qwen2-0.5B-Instruct-q4f16_1-MLC';

/**
 * Engine initialization state
 */
export type EngineStatus = 'idle' | 'loading' | 'ready' | 'error' | 'switching';

/**
 * Progress information during model loading
 */
export interface LoadingProgress {
  percent: number;      // 0-100
  text: string;         // Human-readable status
  stage: 'downloading' | 'initializing' | 'compiling' | 'ready' | 'error';
}

/**
 * Complete engine state
 */
export interface EngineState {
  status: EngineStatus;
  progress: LoadingProgress;
  currentModelId: string | null;
  error: Error | null;
}

/**
 * Parsed tool call extracted from model output
 */
export interface ParsedToolCall {
  action: string;                    // Tool name (check_availability, book_meeting)
  args: Record<string, unknown>;     // Tool arguments
  rawMatch: string;                  // Original <tool>...</tool> text for removal
}

/**
 * Hardware capabilities detected
 */
export interface HardwareCapabilities {
  webgpuSupported: boolean;
  estimatedVRAM: number;            // In GB, 0 if unknown
  recommendedModelId: string;
  reason: string;                   // Why this model was recommended
}
