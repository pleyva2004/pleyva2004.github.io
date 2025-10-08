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
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-md border-b border-accent-blue/20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-accent-blue hover:text-accent-blue/80 transition-colors"
          >
            <FiArrowLeft /> Back to Home
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Research Cards (70%) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
                Research
              </h1>
              <p className="text-gray-400 text-lg mb-6">
                Explore my research projects and academic work
              </p>

              {/* Filter Tabs */}
              <div className="flex gap-4 border-b border-accent-blue/20 pb-4">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 font-semibold transition-all ${
                    filter === 'all'
                      ? 'text-accent-blue border-b-2 border-accent-blue'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('ongoing')}
                  className={`px-4 py-2 font-semibold transition-all ${
                    filter === 'ongoing'
                      ? 'text-accent-blue border-b-2 border-accent-blue'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  Ongoing
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-4 py-2 font-semibold transition-all ${
                    filter === 'completed'
                      ? 'text-accent-green border-b-2 border-accent-green'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
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
                className="grid grid-cols-3 gap-6"
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
                    className="col-span-full text-center py-16 text-gray-400"
                  >
                    <p className="text-xl">No {filter} research projects yet.</p>
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
