'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Paper {
  id: string;
  title: string;
  author: string;
  date: string;
  institution: string;
  status: 'ongoing' | 'completed';
  pdfFileName?: string;
  abstract: string;
  sections: {
    introduction: string;
    objectives: string[];
    significance: {
      content: string;
      innovations: string[];
    };
    methodology: {
      [key: string]: string[];
    };
    expectedResults: {
      outcomes: string[];
      challenges: string[];
      mitigation: string;
    };
    timeline: {
      phase: string;
      description: string;
    }[];
    references: {
      title: string;
      url: string;
    }[];
  };
}

interface ReadingPaper {
  id: string;
  title: string;
  authors: string;
  year: string;
  pdfFileName: string;
  notesFileName?: string;
  category: 'favorites' | 'read' | 'currently-reading';
  readDate?: string;
}

export type PageContextType =
  | {
      type: 'research-list';
      data: {
        papers: Paper[];
        readingList: ReadingPaper[];
        currentFilter: string;
      };
    }
  | {
      type: 'research-detail';
      data: {
        paper: Paper;
      };
    }
  | {
      type: 'reading-page';
      data: {
        paper: ReadingPaper;
        notes: string;
        currentPage?: number;
      };
    }
  | null;

interface ChatContextType {
  pageContext: PageContextType;
  setPageContext: (context: PageContextType) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [pageContext, setPageContext] = useState<PageContextType>(null);

  return (
    <ChatContext.Provider value={{ pageContext, setPageContext }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
