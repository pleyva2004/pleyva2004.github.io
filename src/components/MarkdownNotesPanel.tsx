'use client';

import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { FiDownload } from 'react-icons/fi';
import 'highlight.js/styles/tokyo-night-dark.css';

interface MarkdownNotesPanelProps {
  notesUrl: string;
  title: string;
}

export default function MarkdownNotesPanel({ notesUrl, title }: MarkdownNotesPanelProps) {
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetch(notesUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load notes');
        }
        return response.text();
      })
      .then((text) => {
        setMarkdownContent(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading markdown:', err);
        setError('Notes coming soon...');
        setLoading(false);
      });
  }, [notesUrl]);

  if (loading) {
    return (
      <div className="flex flex-col h-full bg-dark-card border border-accent-purple/20 rounded-lg overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-purple mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm">Loading notes...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !markdownContent) {
    return (
      <div className="flex flex-col h-full bg-dark-card border border-accent-purple/20 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-accent-purple/20 bg-dark-bg">
          <h3 className="text-lg font-semibold text-accent-purple">My Notes</h3>
        </div>
        <div className="flex items-center justify-center h-full p-8">
          <p className="text-gray-400 text-center">{error || 'No notes available.'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-dark-card border border-accent-purple/20 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-accent-purple/20 bg-dark-bg">
        <h3 className="text-lg font-semibold text-accent-purple">My Notes</h3>
        <a
          href={notesUrl}
          download={`${title}-notes.md`}
          className="flex items-center gap-2 px-3 py-1.5 bg-accent-green/20 text-accent-green rounded-lg hover:bg-accent-green/30 transition-colors text-sm"
        >
          <FiDownload size={16} />
          <span className="font-semibold">Download</span>
        </a>
      </div>

      {/* Markdown Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-dark-bg custom-scrollbar">
        <article className="prose prose-invert prose-sm max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              h1: ({ ...props }) => (
                <h1 className="text-2xl font-bold text-accent-blue mb-4 mt-6" {...props} />
              ),
              h2: ({ ...props }) => (
                <h2 className="text-xl font-semibold text-accent-purple mb-3 mt-5" {...props} />
              ),
              h3: ({ ...props }) => (
                <h3 className="text-lg font-semibold text-accent-green mb-2 mt-4" {...props} />
              ),
              h4: ({ ...props }) => (
                <h4 className="text-base font-semibold text-gray-200 mb-2 mt-3" {...props} />
              ),
              a: ({ ...props }) => (
                <a
                  className="text-accent-blue hover:text-accent-blue/80 underline transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  {...props}
                />
              ),
              p: ({ ...props }) => (
                <p className="text-gray-300 leading-relaxed mb-4" {...props} />
              ),
              ul: ({ ...props }) => (
                <ul className="list-disc list-inside space-y-2 text-gray-300 mb-4" {...props} />
              ),
              ol: ({ ...props }) => (
                <ol className="list-decimal list-inside space-y-2 text-gray-300 mb-4" {...props} />
              ),
              li: ({ ...props }) => (
                <li className="text-gray-300 ml-4" {...props} />
              ),
              blockquote: ({ ...props }) => (
                <blockquote
                  className="border-l-4 border-accent-purple pl-4 italic text-gray-400 my-4"
                  {...props}
                />
              ),
              code: ({ inline, className, children, ...props }: { inline?: boolean; className?: string; children?: React.ReactNode }) =>
                inline ? (
                  <code
                    className="bg-dark-card px-1.5 py-0.5 rounded text-accent-blue text-sm font-mono"
                    {...props}
                  >
                    {children}
                  </code>
                ) : (
                  <code
                    className={`block bg-dark-card p-4 rounded-lg overflow-x-auto text-sm font-mono ${className || ''}`}
                    {...props}
                  >
                    {children}
                  </code>
                ),
              pre: ({ ...props }) => (
                <pre className="bg-dark-card rounded-lg overflow-x-auto mb-4" {...props} />
              ),
              table: ({ ...props }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full border border-accent-blue/20" {...props} />
                </div>
              ),
              thead: ({ ...props }) => (
                <thead className="bg-accent-blue/10" {...props} />
              ),
              th: ({ ...props }) => (
                <th className="border border-accent-blue/20 px-4 py-2 text-left text-accent-blue font-semibold" {...props} />
              ),
              td: ({ ...props }) => (
                <td className="border border-accent-blue/20 px-4 py-2 text-gray-300" {...props} />
              ),
              hr: ({ ...props }) => (
                <hr className="border-accent-blue/20 my-6" {...props} />
              ),
              strong: ({ ...props }) => (
                <strong className="text-gray-100 font-semibold" {...props} />
              ),
              em: ({ ...props }) => (
                <em className="text-gray-300 italic" {...props} />
              ),
            }}
          >
            {markdownContent}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
