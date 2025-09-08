"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { X, Zap, Code, Network } from 'lucide-react';

interface WorkInProgressProps {
  isVisible: boolean;
  onClose: () => void;
}

const WorkInProgress: React.FC<WorkInProgressProps> = ({ isVisible, onClose }) => {
  if (!isVisible) return null;

  const icons = [Code, Network, Zap];
  const iconVariants = {
    animate: {
      y: [0, -20, 0],
      rotate: [0, 180, 360],
      scale: [1, 1.2, 1],
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.5, 1],
      opacity: [0.5, 0.8, 0.5],
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center">
      <div className="relative bg-dark-card border border-dark-border rounded-xl p-8 max-w-md mx-4 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors z-20"
        >
          <X size={16} />
        </button>

        {/* Animated Background Pulses */}
        <motion.div
          className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10"
          variants={pulseVariants}
          animate="animate"
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating Icons */}
        <div className="relative mb-6">
          {icons.map((Icon, index) => (
            <motion.div
              key={index}
              className="absolute text-white/60"
              style={{
                left: `${30 + index * 20}%`,
                top: '50%',
              }}
              variants={iconVariants}
              animate="animate"
              transition={{
                duration: 2 + index * 0.5,
                repeat: Infinity,
                delay: index * 0.3,
                ease: "easeInOut"
              }}
            >
              <Icon size={24} />
            </motion.div>
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 mt-16">
          <motion.h2 
            className="text-3xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Network Graph
          </motion.h2>
          
          <motion.p 
            className="text-gray-400 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Coming Soon
          </motion.p>

          <motion.div 
            className="text-sm text-gray-500 space-y-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p>Learn about me in a more interactive way</p>
            <p>Build a network graph of my skills, projects & experiences</p>
            <p>Mapping connections between skills, projects & experiences</p>
          </motion.div>

          {/* Progress Bar */}
          <div className="mt-8 bg-dark-bg rounded-full h-2 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              initial={{ width: 0 }}
              animate={{ width: "75%" }}
              transition={{ duration: 2, delay: 0.8, ease: "easeOut" }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">75% Complete</p>
        </div>
      </div>
    </div>
  );
};

export default WorkInProgress;