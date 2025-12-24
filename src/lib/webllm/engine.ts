// src/lib/webllm/engine.ts
import { CreateMLCEngine, type MLCEngine } from '@mlc-ai/web-llm';
import {
  AVAILABLE_MODELS,
  DEFAULT_MODEL_ID,
  type LoadingProgress
} from './types';

/**
 * Singleton engine instance
 */
let engineInstance: MLCEngine | null = null;
let currentModelId: string | null = null;
let initializationPromise: Promise<MLCEngine> | null = null;

/**
 * Get the current engine instance (may be null if not initialized)
 */
export function getEngine(): MLCEngine | null {
  return engineInstance;
}

/**
 * Check if engine is ready for inference
 */
export function isEngineReady(): boolean {
  return engineInstance !== null;
}

/**
 * Get the currently loaded model ID
 */
export function getCurrentModelId(): string | null {
  return currentModelId;
}

/**
 * Initialize the WebLLM engine with a specific model
 *
 * @param modelId - WebLLM model identifier (default: smallest model)
 * @param onProgress - Callback for loading progress updates
 * @returns Promise resolving to the initialized engine
 */
export async function initializeEngine(
  modelId: string = DEFAULT_MODEL_ID,
  onProgress?: (progress: LoadingProgress) => void
): Promise<MLCEngine> {
  // If already loading the same model, return existing promise
  if (initializationPromise && currentModelId === modelId) {
    return initializationPromise;
  }

  // If switching models, dispose current engine first
  if (engineInstance && currentModelId !== modelId) {
    await disposeEngine();
  }

  // Validate model exists
  const modelConfig = AVAILABLE_MODELS.find(m => m.id === modelId);
  if (!modelConfig) {
    throw new Error(`Unknown model: ${modelId}. Available models: ${AVAILABLE_MODELS.map(m => m.id).join(', ')}`);
  }

  // Create initialization promise
  initializationPromise = (async () => {
    try {
      onProgress?.({
        percent: 0,
        text: `Initializing ${modelConfig.name}...`,
        stage: 'initializing'
      });

      const engine = await CreateMLCEngine(modelId, {
        initProgressCallback: (report) => {
          // Parse WebLLM progress report
          const percent = Math.round(report.progress * 100);
          let stage: LoadingProgress['stage'] = 'downloading';
          let text = report.text || 'Loading...';

          if (text.toLowerCase().includes('download')) {
            stage = 'downloading';
          } else if (text.toLowerCase().includes('init') || text.toLowerCase().includes('load')) {
            stage = 'initializing';
          } else if (text.toLowerCase().includes('compil') || text.toLowerCase().includes('shader')) {
            stage = 'compiling';
          }

          onProgress?.({
            percent,
            text: `${text} (${percent}%)`,
            stage
          });
        }
      });

      engineInstance = engine;
      currentModelId = modelId;

      onProgress?.({
        percent: 100,
        text: `${modelConfig.name} ready!`,
        stage: 'ready'
      });

      console.log(`[WebLLM Engine] Initialized ${modelConfig.name}`);
      return engine;

    } catch (error) {
      console.error('[WebLLM Engine] Initialization failed:', error);

      onProgress?.({
        percent: 0,
        text: error instanceof Error ? error.message : 'Failed to load model',
        stage: 'error'
      });

      initializationPromise = null;
      throw error;
    }
  })();

  return initializationPromise;
}

/**
 * Switch to a different model
 *
 * @param modelId - New model to load
 * @param onProgress - Callback for loading progress
 */
export async function switchModel(
  modelId: string,
  onProgress?: (progress: LoadingProgress) => void
): Promise<MLCEngine> {
  if (currentModelId === modelId && engineInstance) {
    return engineInstance;
  }

  return initializeEngine(modelId, onProgress);
}

/**
 * Dispose the current engine and free resources
 */
export async function disposeEngine(): Promise<void> {
  if (engineInstance) {
    try {
      // WebLLM engines may have a dispose/cleanup method
      if ('unload' in engineInstance && typeof engineInstance.unload === 'function') {
        await engineInstance.unload();
      }
    } catch (error) {
      console.warn('[WebLLM Engine] Error during disposal:', error);
    }

    engineInstance = null;
    currentModelId = null;
    initializationPromise = null;

    console.log('[WebLLM Engine] Disposed');
  }
}
