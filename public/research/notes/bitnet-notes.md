# The Era of 1-bit LLMs - BitNet b1.58 - Notes

## Overview

BitNet b1.58 introduces **ternary quantization** for LLM weights: {-1, 0, +1}

## Key Innovation

### Ternary Weight Quantization

Instead of FP16 (16 bits per weight):
- Use only 3 values: **-1, 0, +1**
- Represented in ~1.58 bits per weight
- 8-bit activations maintained

### Quantization Formula

```
w_quantized = sign(w) * round(|w| / mean(|w|))
```

Where:
- `w` = original weight
- Result ∈ {-1, 0, +1}

## Performance Results

| Metric | FP16 Baseline | BitNet b1.58 | Improvement |
|--------|---------------|--------------|-------------|
| Memory | 100% | ~10% | **10× reduction** |
| Speed | 1× | 2.5-3× | **2.5-3× faster** |
| Energy | 100% | ~30% | **3× more efficient** |
| Accuracy | 100% | 98-99% | Minimal degradation |

## Implementation Strategy

### 1. Quantization-Aware Training
- Train model with quantization from scratch
- Use straight-through estimator for gradients
- Maintain shadow FP16 weights during training

### 2. Inference Optimization
- Integer-only matrix multiplication
- Specialized kernels for ternary ops
- Reduced memory bandwidth requirements

## Practical Considerations

**Advantages:**
-  Massive memory savings
-  Faster inference
-  Lower energy consumption
-  Suitable for edge devices

**Limitations:**
- ⚠️ Requires training from scratch (not post-training quantization)
- ⚠️ May lose some nuance in weight representation
- ⚠️ Specialized hardware can maximize benefits

## Integration with Super Weights

**Hybrid Approach:**
1. Identify super weights (as per Yu et al.)
2. Keep super weights in FP16
3. Apply BitNet b1.58 to remaining weights
4. Best of both worlds: quality + efficiency

## Code Example

```python
import torch

def bitnet_quantize(weight):
    """BitNet b1.58 quantization"""
    scale = torch.mean(torch.abs(weight))
    quantized = torch.sign(weight) * torch.round(torch.abs(weight) / scale)
    # Clip to {-1, 0, 1}
    quantized = torch.clamp(quantized, -1, 1)
    return quantized, scale

# Usage
weight = torch.randn(1024, 1024)  # Original FP16 weight
quantized_weight, scale = bitnet_quantize(weight)
```

## My Research Application

For my SLM project:
1. Start with 3B parameter model
2. Apply BitNet b1.58 quantization
3. Preserve identified super weights in FP16
4. Target: **~300MB model size** (vs 6GB FP16)
5. Deploy on laptop GPU/NPU

## Next Steps

- [ ] Implement quantization pipeline
- [ ] Test on LLaMA 3B architecture
- [ ] Benchmark accuracy vs baseline
- [ ] Measure inference latency
- [ ] Profile memory usage

---

**Status:** ⭐ Favorite - Core technique for my thesis
**Read Date:** January 2025
