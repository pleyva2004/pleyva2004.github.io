export interface ReadingItem {
  id: string;
  title: string;
  authors: string;
  year: string;
  pdfFileName: string;
  notesFileName?: string; // Markdown file
  category: 'favorites' | 'read';
}

export const readingList: ReadingItem[] = [
  {
    id: 'super-weights',
    title: 'The Super Weight in Large Language Models',
    authors: 'Yu, M. et al.',
    year: '2025',
    pdfFileName: 'super-weights.pdf',
    notesFileName: 'super-weights-notes.md',
    category: 'favorites'
  },
  {
    id: 'bitnet',
    title: 'The Era of 1-bit LLMs: All Large Language Models are in 1.58 Bits',
    authors: 'Ma, S. et al.',
    year: '2024',
    pdfFileName: 'bitnet.pdf',
    notesFileName: 'bitnet-notes.md',
    category: 'favorites'
  },
  {
    id: 'apple-intelligence',
    title: 'Apple Intelligence Foundation Language Models',
    authors: 'Apple',
    year: '2024',
    pdfFileName: 'apple-intelligence.pdf',
    notesFileName: 'apple-intelligence-notes.md',
    category: 'read'
  },
  {
    id: 'agentic-slm',
    title: 'Small Language Models are the Future of Agentic AI',
    authors: 'Belcak, P. et al.',
    year: '2025',
    pdfFileName: 'agentic-slm.pdf',
    notesFileName: 'agentic-slm-notes.md',
    category: 'read'
  }
];
