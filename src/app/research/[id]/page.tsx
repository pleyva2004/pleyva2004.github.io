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
      <div className="min-h-screen text-foreground flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4 font-display text-blue-500">Research Not Found</h1>
          <p className="text-gray-400 mb-8">The research paper you&apos;re looking for doesn&apos;t exist.</p>
          <Link
            href="/research"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors backdrop-blur-md border border-white/5"
          >
            <FiArrowLeft />
            Back to Research
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-card/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-full px-6 py-4">
          <Link
            href="/research"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <FiArrowLeft /> Back to Research
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="pt-32 pb-48 px-4 md:px-6">
        <ResearchDetail paper={paper} />
      </main>

      <ChatInput />
    </div>
  );
}
