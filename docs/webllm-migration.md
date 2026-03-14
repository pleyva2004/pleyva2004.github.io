# WebLLM Integration: Complete Technical Documentation

This document provides exhaustive documentation for the WebLLM integration that enables client-side LLM inference in the chat interface, replacing the dependency on OpenAI's Realtime API for text-based conversations.

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Package Dependencies](#package-dependencies)
4. [File Structure](#file-structure)
5. [Core Modules](#core-modules)
   - [Types Definition](#types-definition-srclibwebllmtypests)
   - [Hardware Detection](#hardware-detection-srclibwebllmhardware-checkts)
   - [Tool Parser](#tool-parser-srclibwebllmtool-parserts)
   - [Configuration](#configuration-srclibwebllmconfigts)
   - [Engine Manager](#engine-manager-srclibwebllmenginets)
6. [React Hook](#react-hook-srchooksusewebllmts)
7. [UI Components](#ui-components)
   - [ModelLoadingProgress](#modelloading-progress)
   - [ModelSelector](#model-selector)
8. [ChatInterface Integration](#chatinterface-integration)
9. [API Reference](#api-reference)
10. [Browser Compatibility](#browser-compatibility)
11. [Known Issues & Fixes](#known-issues--fixes)
12. [Testing Guide](#testing-guide)
13. [Performance Considerations](#performance-considerations)

---

## Overview

### What is WebLLM?

WebLLM is an open-source project by MLC AI that enables running large language models directly in the browser using WebGPU for hardware acceleration. This eliminates the need for server-side inference for text-based chat while maintaining streaming capabilities.

### Why This Migration?

| Aspect | Before (OpenAI Realtime) | After (WebLLM) |
|--------|--------------------------|----------------|
| **Cost** | Per-token API charges | Free (runs locally) |
| **Privacy** | Data sent to OpenAI servers | Data stays on device |
| **Latency** | Network round-trip required | Direct GPU inference |
| **Offline** | Requires internet | Works offline after model download |
| **Voice** | Supported | Falls back to OpenAI |

### Hybrid Architecture

The implementation uses a **hybrid approach**:
- **Text Mode**: Uses WebLLM for local inference
- **Voice Mode**: Uses OpenAI Realtime API (WebLLM doesn't support audio)
- **Fallback**: Automatically uses OpenAI if WebGPU is unavailable

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ChatInterface.tsx                         │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Mode Selection                            ││
│  │  ┌─────────────┐              ┌─────────────┐               ││
│  │  │  Text Mode  │              │ Voice Mode  │               ││
│  │  └──────┬──────┘              └──────┬──────┘               ││
│  └─────────┼────────────────────────────┼──────────────────────┘│
│            │                            │                        │
│            ▼                            ▼                        │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │   useWebLLM Hook    │    │  OpenAI WebSocket   │            │
│  │  (Local Inference)  │    │  (Cloud Inference)  │            │
│  └──────────┬──────────┘    └──────────┬──────────┘            │
└─────────────┼───────────────────────────┼───────────────────────┘
              │                           │
              ▼                           ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│   WebLLM Engine         │   │   OpenAI Realtime API   │
│   (Browser/WebGPU)      │   │   (wss://api.openai.com)│
│                         │   │                         │
│  ┌───────────────────┐  │   │  - Voice transcription  │
│  │ Model Options:    │  │   │  - Text-to-speech       │
│  │ - Qwen2 0.5B     │  │   │  - Streaming responses  │
│  │ - Phi-3 Mini     │  │   │  - Function calling     │
│  │ - Llama 3.1 8B   │  │   │                         │
│  └───────────────────┘  │   └─────────────────────────┘
└─────────────────────────┘
              │
              ▼
┌─────────────────────────┐
│   /api/tools (Server)   │
│   - check_availability  │
│   - book_meeting        │
│   (Cal.com Integration) │
└─────────────────────────┘
```

---

## Package Dependencies

### Installation

```bash
npm install @mlc-ai/web-llm
```

### Package Details

| Package | Version | Purpose |
|---------|---------|---------|
| `@mlc-ai/web-llm` | ^0.2.x | Core WebLLM engine for browser-based LLM inference |

### Peer Dependencies (Already in Project)

- `react` ^19.x
- `framer-motion` ^11.x
- `lucide-react` ^0.x

---

## File Structure

```
src/
├── lib/
│   └── webllm/
│       ├── types.ts           # Type definitions & model configs
│       ├── hardware-check.ts  # WebGPU detection & VRAM estimation
│       ├── tool-parser.ts     # Manual tool call extraction
│       ├── config.ts          # System prompts & generation config
│       └── engine.ts          # Singleton engine manager
├── hooks/
│   └── useWebLLM.ts           # React hook for WebLLM lifecycle
└── components/
    ├── ModelLoadingProgress.tsx  # Loading progress bar
    ├── ModelSelector.tsx         # Model dropdown selector
    └── ChatInterface.tsx         # Main chat component (modified)
```

---

## Core Modules

### Types Definition (`src/lib/webllm/types.ts`)

This file contains all TypeScript type definitions and model configurations.

#### Model Tier Enum

```typescript
export type ModelTier = 'small' | 'medium' | 'large';
```

Categorizes models by size and capability:
- `small`: Fast inference, lower quality (0.5B params)
- `medium`: Balanced speed/quality (3-4B params)
- `large`: Best quality, slower (8B+ params)

#### Backend & Mode Types

```typescript
export type ChatBackend = 'webllm' | 'openai';
export type ChatMode = 'text' | 'voice';
```

- `ChatBackend`: Which inference engine is active
- `ChatMode`: User-selected interaction mode

#### Model Configuration Interface

```typescript
export interface ModelConfig {
  id: string;           // WebLLM model identifier (e.g., "Qwen2-0.5B-Instruct-q4f16_1-MLC")
  name: string;         // Display name (e.g., "Qwen2 0.5B (Fast)")
  size: string;         // Human-readable size (e.g., "~300MB")
  tier: ModelTier;      // small/medium/large
  minVRAM: number;      // Minimum VRAM in GB
  contextWindow: number; // Maximum context length in tokens
}
```

#### Available Models

```typescript
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
```

**Model Selection Rationale:**
- **Qwen2 0.5B**: Smallest, fastest. Works on integrated graphics. Good for quick responses.
- **Phi-3 Mini**: Microsoft's efficient model. Best balance of speed and quality.
- **Llama 3.1 8B**: Meta's flagship. Best quality but requires dedicated GPU.

#### Default Model

```typescript
export const DEFAULT_MODEL_ID = 'Qwen2-0.5B-Instruct-q4f16_1-MLC';
```

The smallest model is default to ensure maximum compatibility.

#### Engine Status Types

```typescript
export type EngineStatus = 'idle' | 'loading' | 'ready' | 'error' | 'switching';
```

State machine for engine lifecycle:
- `idle`: Not initialized
- `loading`: Downloading/initializing model
- `ready`: Ready for inference
- `error`: Initialization failed
- `switching`: Transitioning between models

#### Loading Progress Interface

```typescript
export interface LoadingProgress {
  percent: number;      // 0-100
  text: string;         // Human-readable status
  stage: 'downloading' | 'initializing' | 'compiling' | 'ready' | 'error';
}
```

Stages correspond to WebLLM initialization phases:
1. `downloading`: Fetching model weights from CDN
2. `initializing`: Loading model into memory
3. `compiling`: Compiling WebGPU shaders
4. `ready`: Model ready for inference
5. `error`: Something went wrong

#### Engine State Interface

```typescript
export interface EngineState {
  status: EngineStatus;
  progress: LoadingProgress;
  currentModelId: string | null;
  error: Error | null;
}
```

Complete state object for the engine.

#### Parsed Tool Call Interface

```typescript
export interface ParsedToolCall {
  action: string;                    // Tool name (check_availability, book_meeting)
  args: Record<string, unknown>;     // Tool arguments
  rawMatch: string;                  // Original <tool>...</tool> text for removal
}
```

Represents a tool call extracted from model output.

#### Hardware Capabilities Interface

```typescript
export interface HardwareCapabilities {
  webgpuSupported: boolean;
  estimatedVRAM: number;            // In GB, 0 if unknown
  recommendedModelId: string;
  reason: string;                   // Why this model was recommended
}
```

Result of hardware detection.

---

### Hardware Detection (`src/lib/webllm/hardware-check.ts`)

Detects WebGPU support and estimates available VRAM to recommend the best model.

#### WebGPU Type Declarations

```typescript
interface GPUAdapterInfo {
  vendor?: string;
  architecture?: string;
  device?: string;
  description?: string;
}

interface GPUAdapter {
  info?: GPUAdapterInfo;  // Modern Chrome (synchronous property)
  requestAdapterInfo?: () => Promise<GPUAdapterInfo>;  // Older API (async method)
}

interface GPU {
  requestAdapter(): Promise<GPUAdapter | null>;
}
```

**Important**: The WebGPU API evolved over time. Modern Chrome uses `adapter.info` (synchronous), while older implementations use `requestAdapterInfo()` (async). Our code handles both.

#### Main Detection Function

```typescript
export async function checkHardwareCapabilities(): Promise<HardwareCapabilities>
```

**Algorithm:**

1. **Check WebGPU availability**
   ```typescript
   if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
     return { webgpuSupported: false, ... };
   }
   ```

2. **Request GPU adapter**
   ```typescript
   const gpu = (navigator as unknown as { gpu: GPU }).gpu;
   const adapter = await gpu.requestAdapter();
   ```

3. **Get adapter info (handles both API versions)**
   ```typescript
   let adapterInfo: GPUAdapterInfo = {};
   if (adapter.info) {
     adapterInfo = adapter.info;  // Modern Chrome
   } else if (typeof adapter.requestAdapterInfo === 'function') {
     adapterInfo = await adapter.requestAdapterInfo();  // Older API
   }
   ```

4. **Estimate VRAM based on GPU description**
   ```typescript
   // High-end: RTX 30/40, RX 6/7 → 12GB
   // Mid-range: RTX 20, GTX 16, RX 5 → 8GB
   // Apple Silicon → 8GB
   // Intel/Integrated → 2GB
   // Unknown → 4GB (default)
   ```

5. **Recommend best fitting model**
   ```typescript
   const availableVRAM = estimatedVRAM - 1;  // 1GB headroom
   const sortedModels = [...AVAILABLE_MODELS].sort((a, b) => b.minVRAM - a.minVRAM);
   const recommendedModel = sortedModels.find(m => m.minVRAM <= availableVRAM);
   ```

#### Synchronous Check

```typescript
export function isWebGPULikelySupported(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}
```

Quick check without initializing adapter. Useful for early UI decisions.

---

### Tool Parser (`src/lib/webllm/tool-parser.ts`)

Since WebLLM's native function calling is work-in-progress, we implement **manual tool calling** using XML-like tags.

#### Tool Block Format

```
<tool>{"action": "tool_name", "arg1": "value1", ...}</tool>
```

#### Regex Pattern

```typescript
const TOOL_BLOCK_REGEX = /<tool>([\s\S]*?)<\/tool>/g;
```

Matches `<tool>` tags and captures the JSON content inside.

#### Extract Tool Calls

```typescript
export function extractToolCalls(text: string): ParsedToolCall[]
```

**Process:**
1. Find all `<tool>...</tool>` matches
2. Parse JSON content
3. Validate `action` field exists
4. Return array of parsed tool calls

**Example:**
```typescript
const text = "Let me check. <tool>{\"action\":\"check_availability\",\"date\":\"2025-01-15\"}</tool>";
const calls = extractToolCalls(text);
// Result: [{ action: "check_availability", args: { date: "2025-01-15" }, rawMatch: "<tool>...</tool>" }]
```

#### Remove Tool Blocks

```typescript
export function removeToolBlocks(text: string): string
```

Strips tool blocks from text for clean display to users.

#### Check Incomplete Tool Call

```typescript
export function hasIncompleteToolCall(text: string): boolean
```

Detects if the model is mid-generation of a tool call (opened `<tool>` but no `</tool>` yet). Useful for streaming.

#### Convert to API Format

```typescript
export function toApiToolCall(toolCall: ParsedToolCall): {
  id: string;
  name: string;
  argumentsJson: string;
}
```

Converts ParsedToolCall to the format expected by `/api/tools`.

---

### Configuration (`src/lib/webllm/config.ts`)

System prompts and generation parameters.

#### System Prompt Builder

```typescript
export function buildWebLLMSystemPrompt(): string
```

Combines:
1. **Pablo's information** (imported from `@/lib/realtime/session-config`)
2. **Manual tool calling instructions**

**Tool Instructions Template:**
```
## Available Actions

You have access to tools that you can use by outputting a special <tool> block.
When you need to use a tool, output it in exactly this format:

<tool>{"action": "TOOL_NAME", ...arguments}</tool>

After outputting a tool block, STOP and wait for the result.

### Tool 1: check_availability
Check Pablo's calendar for available meeting slots on a specific date.

Usage:
<tool>{"action": "check_availability", "date": "YYYY-MM-DD", "timezone": "America/New_York"}</tool>

### Tool 2: book_meeting
Book a meeting on Pablo's calendar.
...
```

#### Generation Configuration

```typescript
export const GENERATION_CONFIG = {
  temperature: 0.7,      // Creativity level (0=deterministic, 1=creative)
  max_tokens: 1024,      // Maximum response length
  top_p: 0.95,           // Nucleus sampling threshold
  frequency_penalty: 0,  // Penalize repeated tokens
  presence_penalty: 0    // Penalize repeated topics
};
```

---

### Engine Manager (`src/lib/webllm/engine.ts`)

Singleton pattern for managing the WebLLM engine instance.

#### Module State

```typescript
let engineInstance: MLCEngine | null = null;
let currentModelId: string | null = null;
let initializationPromise: Promise<MLCEngine> | null = null;
```

#### Get Engine

```typescript
export function getEngine(): MLCEngine | null
```

Returns the current engine instance, or null if not initialized.

#### Check Ready

```typescript
export function isEngineReady(): boolean
```

Returns true if engine is initialized and ready for inference.

#### Get Current Model

```typescript
export function getCurrentModelId(): string | null
```

Returns the ID of the currently loaded model.

#### Initialize Engine

```typescript
export async function initializeEngine(
  modelId: string = DEFAULT_MODEL_ID,
  onProgress?: (progress: LoadingProgress) => void
): Promise<MLCEngine>
```

**Behavior:**
1. If already loading same model, returns existing promise (deduplication)
2. If switching models, disposes current engine first
3. Validates model exists in AVAILABLE_MODELS
4. Creates engine with progress callback
5. Maps WebLLM progress reports to our LoadingProgress format

**Progress Mapping:**
```typescript
initProgressCallback: (report) => {
  const percent = Math.round(report.progress * 100);
  let stage = 'downloading';

  if (text.includes('download')) stage = 'downloading';
  else if (text.includes('init') || text.includes('load')) stage = 'initializing';
  else if (text.includes('compil') || text.includes('shader')) stage = 'compiling';

  onProgress?.({ percent, text, stage });
}
```

#### Switch Model

```typescript
export async function switchModel(
  modelId: string,
  onProgress?: (progress: LoadingProgress) => void
): Promise<MLCEngine>
```

Convenience wrapper that handles model switching with same-model optimization.

#### Dispose Engine

```typescript
export async function disposeEngine(): Promise<void>
```

Cleans up resources:
1. Calls `engine.unload()` if available
2. Nullifies all module state
3. Logs disposal

---

## React Hook (`src/hooks/useWebLLM.ts`)

React hook providing a clean interface to WebLLM functionality.

### Return Type

```typescript
export interface UseWebLLMReturn {
  // State
  engineState: EngineState;
  hardware: HardwareCapabilities | null;
  isReady: boolean;
  currentModelId: string | null;

  // Actions
  initialize: (modelId?: string) => Promise<void>;
  switchModelTo: (modelId: string) => Promise<void>;
  sendMessage: (...) => Promise<void>;
  abort: () => void;
  dispose: () => void;
}
```

### State Management

```typescript
const [engineState, setEngineState] = useState<EngineState>({
  status: 'idle',
  progress: { percent: 0, text: '', stage: 'initializing' },
  currentModelId: null,
  error: null
});

const [hardware, setHardware] = useState<HardwareCapabilities | null>(null);
const abortControllerRef = useRef<AbortController | null>(null);
```

### Hardware Check on Mount

```typescript
useEffect(() => {
  checkHardwareCapabilities().then(setHardware);
}, []);
```

Automatically detects hardware capabilities when component mounts.

### Initialize Function

```typescript
const initialize = useCallback(async (modelId?: string) => {
  const targetModel = modelId || hardware?.recommendedModelId || DEFAULT_MODEL_ID;

  setEngineState(prev => ({ ...prev, status: 'loading', error: null }));

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
```

### Send Message Function

```typescript
const sendMessage = useCallback(async (
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  onDelta: (delta: string, fullText: string) => void,
  onToolCall: (toolCall: ParsedToolCall, result: unknown) => void,
  onComplete: (finalText: string) => void,
  onError: (error: Error) => void
) => { ... }, []);
```

**Parameters:**
- `userMessage`: The new user message
- `conversationHistory`: Previous messages for context
- `onDelta`: Called for each streaming token
- `onToolCall`: Called when a tool is executed
- `onComplete`: Called when generation finishes
- `onError`: Called on error

**Process:**
1. Get engine instance
2. Build messages array with system prompt
3. Create streaming completion
4. For each chunk:
   - Accumulate text
   - Check for tool calls
   - Execute tools via `/api/tools`
   - Call onDelta with clean text
5. Call onComplete with final text

### Abort Function

```typescript
const abort = useCallback(() => {
  abortControllerRef.current?.abort();
  abortControllerRef.current = null;
}, []);
```

Allows canceling in-progress generation.

---

## UI Components

### ModelLoadingProgress

**File:** `src/components/ModelLoadingProgress.tsx`

Displays a progress bar during model loading.

#### Props

```typescript
interface ModelLoadingProgressProps {
  progress: LoadingProgress;
  modelName?: string;
}
```

#### Stage Indicators

```typescript
const stageEmoji: Record<LoadingProgress['stage'], string> = {
  downloading: '📥',
  initializing: '⚙️',
  compiling: '🔧',
  ready: '✅',
  error: '❌'
};
```

#### Visual Structure

```
┌─────────────────────────────────────────┐
│ 📥 Loading Qwen2 0.5B (Fast)...        │
│ ████████████░░░░░░░░░░░░░  45%         │
│ Downloading model weights (45%)         │
└─────────────────────────────────────────┘
```

### ModelSelector

**File:** `src/components/ModelSelector.tsx`

Dropdown for selecting between available models.

#### Props

```typescript
interface ModelSelectorProps {
  currentModelId: string | null;
  recommendedModelId: string | null;
  onSelectModel: (modelId: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}
```

#### Tier Icons

```typescript
const tierIcons: Record<ModelTier, React.ComponentType> = {
  small: Zap,      // ⚡ Fast
  medium: Cpu,     // 🔲 Balanced
  large: Brain     // 🧠 Quality
};
```

#### Visual Structure

```
┌──────────────────────────┐
│ ⚡ Qwen2 0.5B (Fast)  ▼ │
└──────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│ ⚡ Qwen2 0.5B (Fast)     │
│   ~300MB • 1GB VRAM min  │
│                        ✓ │
├──────────────────────────┤
│ 🔲 Phi-3 Mini (Balanced) │
│   ~2GB • 4GB VRAM min    │
│              Recommended │
├──────────────────────────┤
│ 🧠 Llama 3.1 8B (Quality)│
│   ~4GB • 8GB VRAM min    │
└──────────────────────────┘
```

---

## ChatInterface Integration

### New State Variables

```typescript
// Backend selection
const [chatMode, setChatMode] = useState<ChatMode>('text');
const [chatBackend, setChatBackend] = useState<ChatBackend>('webllm');

// WebLLM hook
const {
  engineState,
  hardware,
  isReady: isWebLLMReady,
  currentModelId,
  initialize: initializeWebLLM,
  switchModelTo,
  sendMessage: sendWebLLMMessage,
  abort: abortWebLLM
} = useWebLLM();
```

### Initialization Logic

```typescript
useEffect(() => {
  const init = async () => {
    if (!hardware) return;

    if (!hardware.webgpuSupported) {
      // No WebGPU - fall back to OpenAI
      setChatBackend('openai');
      connectToOpenAI();
      return;
    }

    // WebGPU available - preload recommended model
    try {
      await initializeWebLLM(hardware.recommendedModelId);
    } catch (err) {
      // Fallback on failure
      setChatBackend('openai');
      connectToOpenAI();
    }
  };

  init();
}, [hardware, initializeWebLLM]);
```

### Message Routing

```typescript
const handleSendMessage = async (text: string) => {
  // ... validation and special commands ...

  // Route to appropriate backend
  if (chatMode === 'voice' || chatBackend === 'openai') {
    await handleOpenAIMessage(text);
  } else {
    await handleWebLLMMessage(text);
  }
};
```

### Header UI Changes

```typescript
<div className="flex items-center gap-2">
  {/* Mode Toggle */}
  <button onClick={handleModeToggle}>
    {chatMode === 'voice' ? <Mic /> : <MessageSquare />}
  </button>

  {/* Model Selector (only for WebLLM text mode) */}
  {chatBackend === 'webllm' && chatMode === 'text' && (
    <ModelSelector
      currentModelId={currentModelId}
      recommendedModelId={hardware?.recommendedModelId}
      onSelectModel={handleModelSwitch}
      disabled={engineState.status === 'loading'}
      isLoading={engineState.status === 'loading'}
    />
  )}

  {/* Close Button */}
  <button onClick={onClose}>
    <X />
  </button>
</div>
```

### Status Display

```typescript
<p className="text-white/60 text-xs">
  {chatBackend === 'webllm'
    ? `Local AI • ${currentModel?.name || 'Loading...'}`
    : 'Cloud AI • OpenAI'
  }
</p>
```

---

## API Reference

### Tool Execution Endpoint

**Endpoint:** `POST /api/tools`

**Request Body:**
```typescript
{
  id: string;            // Unique tool call ID
  name: string;          // "check_availability" | "book_meeting"
  argumentsJson: string; // JSON-stringified arguments
}
```

**Response (check_availability):**
```typescript
{
  success: boolean;
  availableSlots?: Array<{
    time: string;     // "09:00"
    endTime: string;  // "09:30"
    available: boolean;
  }>;
  error?: string;
}
```

**Response (book_meeting):**
```typescript
{
  success: boolean;
  booking?: {
    id: string;
    startTime: string;
    endTime: string;
  };
  error?: string;
}
```

---

## Browser Compatibility

### WebGPU Support Matrix

| Browser | WebGPU | WebLLM Works |
|---------|--------|--------------|
| Chrome 113+ | ✅ | ✅ |
| Edge 113+ | ✅ | ✅ |
| Firefox | ⚠️ Flag | ⚠️ Experimental |
| Safari 18+ | ✅ | ✅ |
| Safari <18 | ❌ | ❌ (uses OpenAI fallback) |
| Mobile Chrome | ⚠️ Limited | ⚠️ Device dependent |
| Mobile Safari | ❌ | ❌ (uses OpenAI fallback) |

### Fallback Behavior

When WebGPU is unavailable:
1. `checkHardwareCapabilities()` returns `webgpuSupported: false`
2. `ChatInterface` sets `chatBackend = 'openai'`
3. All messages route through OpenAI Realtime API
4. User sees "Cloud AI • OpenAI" in header

---

## Known Issues & Fixes

### Issue: `adapter.requestAdapterInfo is not a function`

**Symptom:** Runtime error on Chrome 120+

**Root Cause:** WebGPU API changed. Modern Chrome uses synchronous `adapter.info` property instead of async `requestAdapterInfo()` method.

**Fix Applied:**
```typescript
// Get adapter info - handle both API versions
let adapterInfo: GPUAdapterInfo = {};

if (adapter.info) {
  // Modern Chrome/Edge: synchronous property
  adapterInfo = adapter.info;
} else if (typeof adapter.requestAdapterInfo === 'function') {
  // Older API: async method
  adapterInfo = await adapter.requestAdapterInfo();
}
// If neither exists, use defaults
```

### Issue: Model download stalls

**Symptom:** Progress stuck at certain percentage

**Cause:** CDN issues or network interruption

**Mitigation:**
- Progress bar shows current status
- User can close and reopen chat to retry
- Fallback to OpenAI still available

### Issue: Out of memory on large models

**Symptom:** Browser tab crashes when loading Llama 3.1 8B

**Cause:** Insufficient GPU VRAM

**Mitigation:**
- Hardware detection recommends appropriate model
- Users can manually select smaller model
- Error caught and displayed in UI

---

## Testing Guide

### Manual Test Matrix

| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| WebGPU Detection | Open chat on Chrome | Shows "Loading AI Model..." |
| Model Loading | Wait for progress | Model loads, shows "Local AI • [Model]" |
| Text Generation | Send "Hello" | Streaming response appears |
| Model Switch | Select different model | Progress bar, then new model active |
| Tool: Availability | Ask "What's Pablo's availability?" | Model emits tool call, result shown |
| Tool: Booking | Complete booking flow | Meeting scheduled via Cal.com |
| Voice Mode | Click mic button | Switches to OpenAI, shows "Cloud AI" |
| Safari Fallback | Open chat on Safari <18 | Auto-uses OpenAI, shows "Cloud AI" |
| Abort | Send message, click X | Generation stops |
| Error Handling | Disconnect network during load | Error shown, can retry |

### Console Logs to Check

```javascript
// Successful initialization
[Hardware Check] WebGPU supported, estimated VRAM: 8GB
[Chat] WebGPU supported, preloading model: Llama-3.1-8B-Instruct-q4f32_1-MLC
[WebLLM Engine] Initialized Llama 3.1 8B (Quality)

// Tool execution
[Chat] Tool executed: check_availability { ... }

// Fallback
[Chat] WebGPU not supported, using OpenAI backend
```

---

## Performance Considerations

### Model Download Sizes

| Model | Download Size | GPU Memory | First Token Latency |
|-------|---------------|------------|---------------------|
| Qwen2 0.5B | ~300MB | ~1GB | ~500ms |
| Phi-3 Mini | ~2GB | ~4GB | ~1-2s |
| Llama 3.1 8B | ~4GB | ~8GB | ~3-5s |

### Caching

WebLLM uses IndexedDB to cache downloaded models. Subsequent loads are faster (~2-5s for Qwen, ~10-15s for Llama).

### Memory Management

- Only one model loaded at a time
- `disposeEngine()` frees GPU memory
- Switching models disposes previous model first

### Streaming Performance

- Tokens stream at ~20-50 tokens/second (device dependent)
- UI updates on each token via React state
- `removeToolBlocks()` runs on each update for clean display

---

## Future Improvements

1. **Web Worker**: Move engine to web worker to prevent UI blocking
2. **Quantization Options**: Allow users to choose quantization level
3. **Model Preloading**: Background-load models based on usage patterns
4. **Offline Mode**: Full offline support with service worker
5. **Native Tool Calling**: Migrate when WebLLM adds native function calling
6. **Voice Synthesis**: Add TTS for local voice responses

---

## References

- [WebLLM GitHub Repository](https://github.com/mlc-ai/web-llm)
- [WebLLM Documentation](https://webllm.mlc.ai/docs/)
- [MLC Model List](https://mlc.ai/models)
- [WebGPU Specification](https://www.w3.org/TR/webgpu/)
- [WebGPU Browser Support](https://caniuse.com/webgpu)

---

*Document Version: 1.0*
*Last Updated: December 2024*
*Author: Claude Code*
