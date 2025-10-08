'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type PageContextType =
  | {
      type: 'research-list';
      data: {
        papers: any[];
        readingList: any[];
        currentFilter: string;
      };
    }
  | {
      type: 'research-detail';
      data: {
        paper: any;
      };
    }
  | {
      type: 'reading-page';
      data: {
        paper: any;
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
