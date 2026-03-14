'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import { ResearchPaper } from '@/constants/research/research-papers';
import TiltCard from './TiltCard';

interface ResearchCardProps {
  paper: ResearchPaper;
  index: number;
}

export default function ResearchCard({ paper, index }: ResearchCardProps) {
  const statusColors = {
    ongoing: 'border-blue-500/40 bg-blue-500/5',
    completed: 'border-emerald-500/40 bg-emerald-500/5'
  };

  const badgeColors = {
    ongoing: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/research/${paper.id}`}>
        <TiltCard className="h-full">
          <div
            className={`h-full border rounded-xl p-5 flex flex-col justify-between backdrop-blur-md shadow-lg ${statusColors[paper.status]} hover:border-white/20 transition-colors`}
          >
            <div>
              {/* Status Badge */}
              <div className="flex items-center justify-between mb-4">
                <span
                  className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeColors[paper.status]}`}
                >
                  {paper.status}
                </span>
                {paper.status === 'completed' && paper.pdfFileName && (
                  <FiFileText className="text-emerald-400" size={16} />
                )}
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold mb-3 text-white font-display leading-tight group-hover:text-blue-400 transition-colors line-clamp-3">
                {paper.title}
              </h3>
            </div>

            {/* Meta Info at bottom */}
            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="text-xs text-gray-400 font-mono">
                <div className="mb-1">{paper.date}</div>
                <div className="line-clamp-1">{paper.institution}</div>
              </div>

              {/* Read More Link */}
              <div className="flex items-center gap-2 text-blue-400 group-hover:text-purple-400 transition-colors">
                <span className="font-semibold text-xs tracking-wide">View details</span>
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={14} />
              </div>
            </div>
          </div>
        </TiltCard>
      </Link>
    </motion.div>
  );
}
