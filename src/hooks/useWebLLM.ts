// src/hooks/useWebLLM.ts
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatCompletionMessageParam } from '@mlc-ai/web-llm';
import {
  initializeEngine,
  getEngine,
  switchModel,
  disposeEngine
} from '@/lib/webllm/engine';
import { checkHardwareCapabilities } from '@/lib/webllm/hardware-check';
import { buildWebLLMSystemPrompt, GENERATION_CONFIG } from '@/lib/webllm/config';
import { extractToolCalls, removeToolBlocks, toApiToolCall } from '@/lib/webllm/tool-parser';
import type {
  EngineState,
  LoadingProgress,
  HardwareCapabilities,
  ParsedToolCall
} from '@/lib/webllm/types';

export interface UseWebLLMReturn {
  // State
  engineState: EngineState;
  hardware: HardwareCapabilities | null;
  isReady: boolean;
  currentModelId: string | null;

  // Actions
  initialize: (modelId?: string) => Promise<void>;
  switchModelTo: (modelId: string) => Promise<void>;
  sendMessage: (
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    onDelta: (delta: string, fullText: string) => void,
    onToolCall: (toolCall: ParsedToolCall, result: unknown) => void,
    onComplete: (finalText: string) => void,
    onError: (error: Error) => void
  ) => Promise<void>;
  abort: () => void;
  dispose: () => void;
}

export function useWebLLM(): UseWebLLMReturn {
  const [engineState, setEngineState] = useState<EngineState>({
    status: 'idle',
    progress: { percent: 0, text: '', stage: 'initializing' },
    currentModelId: null,
    error: null
  });

  const [hardware, setHardware] = useState<HardwareCapabilities | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Check hardware on mount
  useEffect(() => {
    checkHardwareCapabilities().then(setHardware);
  }, []);

  const handleProgress = useCallback((progress: LoadingProgress) => {
    setEngineState(prev => ({
      ...prev,
      status: progress.stage === 'error' ? 'error' :
              progress.stage === 'ready' ? 'ready' : 'loading',
      progress
    }));
  }, []);

  const initialize = useCallback(async (modelId?: string) => {
    const targetModel = modelId || hardware?.recommendedModelId || 'Qwen2-0.5B-Instruct-q4f16_1-MLC';

    setEngineState(prev => ({
      ...prev,
      status: 'loading',
      error: null
    }));

    try {
      await initializeEngine(targetModel, handleProgress);
      setEngineState(prev => ({
        ...prev,
        status: 'ready',
        currentModelId: targetModel,
        error: null
      }));
    } catch (error) {
      setEngineState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error : new Error('Unknown error')
      }));
      throw error;
    }
  }, [hardware, handleProgress]);

  const switchModelTo = useCallback(async (modelId: string) => {
    setEngineState(prev => ({ ...prev, status: 'switching' }));

    try {
      await switchModel(modelId, handleProgress);
      setEngineState(prev => ({
        ...prev,
        status: 'ready',
        currentModelId: modelId,
        error: null
      }));
    } catch (error) {
      setEngineState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error : new Error('Failed to switch model')
      }));
      throw error;
    }
  }, [handleProgress]);

  const sendMessage = useCallback(async (
    userMessage: string,
    conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
    onDelta: (delta: string, fullText: string) => void,
    onToolCall: (toolCall: ParsedToolCall, result: unknown) => void,
    onComplete: (finalText: string) => void,
    onError: (error: Error) => void
  ) => {
    const engine = getEngine();
    if (!engine) {
      onError(new Error('Engine not initialized'));
      return;
    }

    // Create abort controller for this request
    abortControllerRef.current = new AbortController();

    try {
      // Build messages array
      const systemPrompt = buildWebLLMSystemPrompt();
      const messages: ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        })),
        { role: 'user', content: userMessage }
      ];

      // Stream the response
      const chunks = await engine.chat.completions.create({
        messages,
        stream: true,
        ...GENERATION_CONFIG
      });

      let fullText = '';

      for await (const chunk of chunks) {
        // Check for abort
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        const delta = chunk.choices[0]?.delta?.content || '';
        fullText += delta;

        // Check for completed tool calls
        const toolCalls = extractToolCalls(fullText);

        if (toolCalls.length > 0) {
          // Execute each tool call
          for (const toolCall of toolCalls) {
            try {
              const response = await fetch('/api/tools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(toApiToolCall(toolCall))
              });

              const result = await response.json();
              onToolCall(toolCall, result);

              // Add tool result to conversation and continue generation
              // For simplicity, we append the result and let the model continue
              const resultText = `\n\nTool result for ${toolCall.action}:\n${JSON.stringify(result, null, 2)}\n\n`;
              fullText += resultText;

            } catch (err) {
              console.error('[useWebLLM] Tool execution failed:', err);
            }
          }
        }

        // Send clean text (without tool blocks) to UI
        const displayText = removeToolBlocks(fullText);
        onDelta(delta, displayText);
      }

      // Final cleanup
      const finalText = removeToolBlocks(fullText);
      onComplete(finalText);

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // User aborted, not an error
        return;
      }
      onError(error instanceof Error ? error : new Error('Unknown error during generation'));
    }
  }, []);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
  }, []);

  const dispose = useCallback(() => {
    abort();
    disposeEngine();
    setEngineState({
      status: 'idle',
      progress: { percent: 0, text: '', stage: 'initializing' },
      currentModelId: null,
      error: null
    });
  }, [abort]);

  return {
    engineState,
    hardware,
    isReady: engineState.status === 'ready',
    currentModelId: engineState.currentModelId,
    initialize,
    switchModelTo,
    sendMessage,
    abort,
    dispose
  };
}
