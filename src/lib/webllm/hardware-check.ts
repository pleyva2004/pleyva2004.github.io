// src/lib/webllm/hardware-check.ts
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID, type HardwareCapabilities } from './types';

// WebGPU type declarations
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

/**
 * Detect WebGPU support and estimate available VRAM to recommend best model
 */
export async function checkHardwareCapabilities(): Promise<HardwareCapabilities> {
  // Check if WebGPU is available
  if (typeof navigator === 'undefined' || !('gpu' in navigator)) {
    return {
      webgpuSupported: false,
      estimatedVRAM: 0,
      recommendedModelId: DEFAULT_MODEL_ID,
      reason: 'WebGPU not available in this browser'
    };
  }

  try {
    const gpu = (navigator as unknown as { gpu: GPU }).gpu;
    const adapter = await gpu.requestAdapter();

    if (!adapter) {
      return {
        webgpuSupported: false,
        estimatedVRAM: 0,
        recommendedModelId: DEFAULT_MODEL_ID,
        reason: 'No WebGPU adapter found'
      };
    }

    // Get adapter info - handle both API versions
    let adapterInfo: GPUAdapterInfo = {};

    if (adapter.info) {
      // Modern Chrome/Edge: synchronous property
      adapterInfo = adapter.info;
    } else if (typeof adapter.requestAdapterInfo === 'function') {
      // Older API: async method
      adapterInfo = await adapter.requestAdapterInfo();
    }
    // If neither exists, adapterInfo stays empty and we use defaults

    // Estimate VRAM based on device type and description
    // This is a heuristic since WebGPU doesn't expose exact VRAM
    let estimatedVRAM = 4; // Default assumption: 4GB

    const description = (adapterInfo.description || '').toLowerCase();
    const device = (adapterInfo.device || '').toLowerCase();

    // Check for high-end desktop GPUs
    if (
      description.includes('rtx 40') ||
      description.includes('rtx 30') ||
      description.includes('rx 7') ||
      description.includes('rx 6')
    ) {
      estimatedVRAM = 12;
    }
    // Mid-range desktop/laptop GPUs
    else if (
      description.includes('rtx 20') ||
      description.includes('gtx 16') ||
      description.includes('rx 5') ||
      description.includes('radeon pro')
    ) {
      estimatedVRAM = 8;
    }
    // Apple Silicon (M1/M2/M3 share system memory)
    else if (
      description.includes('apple') ||
      device.includes('apple')
    ) {
      // M1/M2/M3 can typically use 8-16GB for GPU
      estimatedVRAM = 8;
    }
    // Integrated graphics
    else if (
      description.includes('intel') ||
      description.includes('integrated')
    ) {
      estimatedVRAM = 2;
    }

    // Find the best model that fits within estimated VRAM
    // Leave 1GB headroom for other GPU operations
    const availableVRAM = estimatedVRAM - 1;

    // Sort models by quality (largest first) and pick best that fits
    const sortedModels = [...AVAILABLE_MODELS].sort((a, b) => b.minVRAM - a.minVRAM);
    const recommendedModel = sortedModels.find(m => m.minVRAM <= availableVRAM)
      || AVAILABLE_MODELS[0]; // Fallback to smallest

    return {
      webgpuSupported: true,
      estimatedVRAM,
      recommendedModelId: recommendedModel.id,
      reason: `Estimated ${estimatedVRAM}GB VRAM available. ${recommendedModel.name} recommended.`
    };

  } catch (error) {
    console.error('[Hardware Check] Error detecting capabilities:', error);
    return {
      webgpuSupported: false,
      estimatedVRAM: 0,
      recommendedModelId: DEFAULT_MODEL_ID,
      reason: 'Error detecting WebGPU capabilities'
    };
  }
}

/**
 * Synchronous check if WebGPU is likely supported (doesn't init adapter)
 */
export function isWebGPULikelySupported(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}
