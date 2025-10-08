'use client';

import React, { useEffect } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ResearchDetail from '@/components/ResearchDetail';
import { researchPapers } from '@/constants/research/research-papers';
import ChatInput from '@/components/ChatInput';
import { useChatContext } from '@/contexts/ChatContext';

export default function ResearchDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { setPageContext } = useChatContext();

  const paper = researchPapers.find((p) => p.id === id);

  useEffect(() => {
    if (paper) {
      setPageContext({
        type: 'research-detail',
        data: {
          paper: paper,
        },
      });
    }
  }, [paper, setPageContext]);

  if (!paper) {
    return (
      <div className="min-h-screen bg-dark-bg text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 text-accent-blue">Research Not Found</h1>
          <p className="text-gray-400 mb-8">The research paper you&apos;re looking for doesn&apos;t exist.</p>
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

  return (
    <div className="min-h-screen bg-dark-bg text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-md border-b border-accent-blue/20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link
            href="/research"
            className="inline-flex items-center gap-2 text-accent-blue hover:text-accent-blue/80 transition-colors"
          >
            <FiArrowLeft /> Back to Research
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-6 pt-24 pb-56 md:pb-64">
        <ResearchDetail paper={paper} />
      </main>

      <ChatInput />
    </div>
  );
}
