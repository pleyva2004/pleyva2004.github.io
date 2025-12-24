'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import ResearchCard from '@/components/ResearchCard';
import ReadingListSidebar from '@/components/ReadingListSidebar';
import { researchPapers } from '@/constants/research/research-papers';
import { readingList } from '@/constants/research/reading-list';
import ChatInput from '@/components/ChatInput';
import { useChatContext } from '@/contexts/ChatContext';

export default function ResearchDashboard() {
  const [filter, setFilter] = useState<'all' | 'ongoing' | 'completed'>('all');
  const { setPageContext } = useChatContext();

  const filteredPapers = useMemo(() => {
    return researchPapers.filter((paper) => {
      if (filter === 'all') return true;
      return paper.status === filter;
    });
  }, [filter]);

  useEffect(() => {
    setPageContext({
      type: 'research-list',
      data: {
        papers: filteredPapers,
        readingList: readingList,
        currentFilter: filter,
      },
    });
  }, [filteredPapers, filter, setPageContext]);

  return (
    <div className="min-h-screen text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-card border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <FiArrowLeft /> Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-48 md:pb-56">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Research Cards (70%) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-white/60">
                Research
              </h1>
              <p className="text-gray-400 text-base md:text-lg mb-8 font-light">
                Explore my research projects and academic work
              </p>

              {/* Filter Tabs */}
              <div className="flex gap-2 md:gap-4 border-b border-white/10 pb-4 overflow-x-auto">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 text-sm font-semibold transition-all rounded-full whitespace-nowrap ${filter === 'all'
                      ? 'bg-white text-black'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('ongoing')}
                  className={`px-4 py-2 text-sm font-semibold transition-all rounded-full whitespace-nowrap flex items-center gap-2 ${filter === 'ongoing'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20'
                      : 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10'
                    }`}
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                  Ongoing
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-4 py-2 text-sm font-semibold transition-all rounded-full whitespace-nowrap flex items-center gap-2 ${filter === 'completed'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                      : 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Completed
                </button>
              </div>
            </motion.div>

            {/* Research Cards Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={filter}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filteredPapers.length > 0 ? (
                  filteredPapers.map((paper, index) => (
                    <ResearchCard key={paper.id} paper={paper} index={index} />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="col-span-full py-24 text-center"
                  >
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                      <FiArrowLeft className="text-gray-500 text-2xl" />
                    </div>
                    <p className="text-gray-400 text-lg">No {filter} research projects yet.</p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column - Reading List Sidebar (30%) */}
          <div className="lg:col-span-1">
            <ReadingListSidebar items={readingList} />
          </div>
        </div>
      </main>

      <ChatInput />
    </div>
  );
}
