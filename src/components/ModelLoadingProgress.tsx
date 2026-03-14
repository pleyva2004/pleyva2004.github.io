// src/components/ModelLoadingProgress.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { LoadingProgress } from '@/lib/webllm/types';

interface ModelLoadingProgressProps {
  progress: LoadingProgress;
  modelName?: string;
}

export const ModelLoadingProgress: React.FC<ModelLoadingProgressProps> = ({
  progress,
  modelName
}) => {
  const stageEmoji: Record<LoadingProgress['stage'], string> = {
    downloading: '📥',
    initializing: '⚙️',
    compiling: '🔧',
    ready: '✅',
    error: '❌'
  };

  return (
    <div className="w-full p-4 bg-white/5 rounded-lg border border-white/10">
      <div className="flex items-center gap-2 mb-2">
        <span>{stageEmoji[progress.stage]}</span>
        <span className="text-white/80 text-sm">
          {modelName ? `Loading ${modelName}...` : 'Loading AI Model...'}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-blue-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress.percent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Status text */}
      <p className="text-white/60 text-xs mt-2">
        {progress.text}
      </p>
    </div>
  );
};
