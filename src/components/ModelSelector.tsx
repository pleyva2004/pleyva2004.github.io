// src/components/ModelSelector.tsx
'use client';

import React, { useState } from 'react';
import { ChevronDown, Check, Cpu, Zap, Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AVAILABLE_MODELS, type ModelTier } from '@/lib/webllm/types';

interface ModelSelectorProps {
  currentModelId: string | null;
  recommendedModelId: string | null;
  onSelectModel: (modelId: string) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const tierIcons: Record<ModelTier, React.ComponentType<{ size: number; className?: string }>> = {
  small: Zap,      // Fast
  medium: Cpu,     // Balanced
  large: Brain     // Quality
};

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  currentModelId,
  recommendedModelId,
  onSelectModel,
  disabled = false,
  isLoading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentModel = AVAILABLE_MODELS.find(m => m.id === currentModelId);

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm
          bg-white/10 border border-white/10 text-white/80
          hover:bg-white/15 transition-colors
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          currentModel && React.createElement(tierIcons[currentModel.tier], { size: 14 })
        )}
        <span>{currentModel?.name || 'Select Model'}</span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-0 w-64 bg-gray-900 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden"
          >
            {AVAILABLE_MODELS.map(model => {
              const Icon = tierIcons[model.tier];
              const isSelected = model.id === currentModelId;
              const isRecommended = model.id === recommendedModelId;

              return (
                <button
                  key={model.id}
                  onClick={() => {
                    onSelectModel(model.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-start gap-3 p-3 text-left
                    hover:bg-white/10 transition-colors
                    ${isSelected ? 'bg-white/5' : ''}
                  `}
                >
                  <Icon size={18} className="mt-0.5 text-white/60" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-medium">{model.name}</span>
                      {isRecommended && (
                        <span className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 rounded">
                          Recommended
                        </span>
                      )}
                    </div>
                    <p className="text-white/50 text-xs mt-0.5">
                      {model.size} • {model.minVRAM}GB VRAM min
                    </p>
                  </div>
                  {isSelected && <Check size={16} className="text-green-400 mt-0.5" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
