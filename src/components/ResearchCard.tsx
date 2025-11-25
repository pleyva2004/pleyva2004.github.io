'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';
import { ResearchPaper } from '@/constants/research/research-papers';

interface ResearchCardProps {
  paper: ResearchPaper;
  index: number;
}

export default function ResearchCard({ paper, index }: ResearchCardProps) {
  const statusColors = {
    ongoing: 'border-accent-blue/40 bg-accent-blue/5',
    completed: 'border-accent-green/40 bg-accent-green/5'
  };

  const badgeColors = {
    ongoing: 'bg-accent-blue/20 text-accent-blue border-accent-blue/40',
    completed: 'bg-accent-green/20 text-accent-green border-accent-green/40'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/research/${paper.id}`}>
        <div
          className={`group relative border-2 rounded-lg p-3 aspect-square flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl cursor-pointer ${statusColors[paper.status]}`}
        >
          <div>
            {/* Status Badge */}
            <div className="flex items-center justify-between mb-2">
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border ${badgeColors[paper.status]}`}
              >
                {paper.status}
              </span>
              {paper.status === 'completed' && paper.pdfFileName && (
                <FiFileText className="text-accent-green" size={14} />
              )}
            </div>

            {/* Title */}
            <h3 className="text-sm font-bold mb-2 text-white group-hover:text-accent-blue transition-colors line-clamp-4">
              {paper.title}
            </h3>
          </div>

          {/* Meta Info at bottom */}
          <div className="space-y-1.5">
            <div className="text-[10px] text-gray-400">
              <div>{paper.date}</div>
              <div className="line-clamp-1">{paper.institution}</div>
            </div>

            {/* Read More Link */}
            <div className="flex items-center gap-1.5 text-accent-blue group-hover:text-accent-purple transition-colors">
              <span className="font-semibold text-[10px]">View details</span>
              <FiArrowRight className="group-hover:translate-x-1 transition-transform" size={12} />
            </div>
          </div>

          {/* Gradient Border Glow Effect */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-accent-blue/0 via-accent-purple/0 to-accent-blue/0 group-hover:from-accent-blue/20 group-hover:via-accent-purple/20 group-hover:to-accent-blue/20 transition-all duration-300 pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  );
}
