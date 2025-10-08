'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PDFViewer from '@/components/PDFViewer';
import MarkdownNotesPanel from '@/components/MarkdownNotesPanel';
import { readingList } from '@/constants/research/reading-list';
import ChatInput from '@/components/ChatInput';
import { useChatContext } from '@/contexts/ChatContext';

export default function ReadingViewPage() {
  const params = useParams();
  const id = params?.id as string;
  const { setPageContext } = useChatContext();
  const [notesContent, setNotesContent] = useState<string>('');

  const paper = readingList.find((p) => p.id === id);

  if (!paper) {
    return (
      <div className="h-screen bg-dark-bg text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-accent-blue">Paper Not Found</h1>
          <p className="text-gray-400 mb-8">The paper you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/research"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition-colors"
          >
            <FiArrowLeft />
            Back to Research
          </Link>
        </div>
      </div>
    );
  }

  const pdfUrl = `/research/papers/${paper.pdfFileName}`;
  const notesUrl = paper.notesFileName ? `/research/notes/${paper.notesFileName}` : '';

  // Load notes content for context
  useEffect(() => {
    if (notesUrl) {
      fetch(notesUrl)
        .then((response) => response.text())
        .then((text) => setNotesContent(text))
        .catch((err) => console.error('Error loading notes for context:', err));
    }
  }, [notesUrl]);

  // Update chat context whenever paper or notes change
  useEffect(() => {
    if (paper) {
      setPageContext({
        type: 'reading-page',
        data: {
          paper: paper,
          notes: notesContent,
        },
      });
    }
  }, [paper, notesContent, setPageContext]);

  return (
    <div className="h-screen bg-dark-bg text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-md border-b border-accent-blue/20">
        <div className="max-w-full px-6 py-4">
          <Link
            href="/research"
            className="inline-flex items-center gap-2 text-accent-blue hover:text-accent-blue/80 transition-colors"
          >
            <FiArrowLeft /> Back to Research
          </Link>
        </div>
      </nav>

      {/* Header */}
      <div className="pt-20 pb-4 px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-full"
        >
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
            {paper.title}
          </h1>
          <p className="text-gray-400">
            {paper.authors} ({paper.year})
          </p>
        </motion.div>
      </div>

      {/* Main Content - Side by Side View */}
      <main className="h-[calc(100vh-240px)] p-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
          {/* Left Panel - PDF (2/3 width) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-2 h-[70vh]"
          >
            <PDFViewer pdfUrl={pdfUrl} title={paper.title} />
          </motion.div>

          {/* Right Panel - Notes (1/3 width) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-1 h-[70vh]"
          >
            {notesUrl ? (
              <MarkdownNotesPanel notesUrl={notesUrl} title={paper.title} />
            ) : (
              <div className="flex flex-col h-full bg-dark-card border border-accent-purple/20 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-accent-purple/20 bg-dark-bg">
                  <h3 className="text-lg font-semibold text-accent-purple">My Notes</h3>
                </div>
                <div className="flex items-center justify-center h-full p-8">
                  <p className="text-gray-400 text-center">Notes coming soon...</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Mobile Tab View (for small screens)pdf */}
      <style jsx global>{`
        @media (max-width: 1024px) {
          .lg\\:col-span-2,
          .lg\\:col-span-1 {
            grid-column: span 1;
          }
        }
      `}</style>

      <ChatInput />
    </div>
  );
}
