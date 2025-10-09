export interface ReadingItem {
  id: string;
  title: string;
  authors: string;
  year: string;
  pdfFileName: string;
  notesFileName?: string; // Markdown file
  category: 'favorites' | 'read' | 'currently-reading';
  readDate?: string; // e.g., "Jan 2025"
}

export const readingList: ReadingItem[] = [
  
  //Currently Reading
  {
    id: 'sperating-long-tail-and-common-knowledge',
    title: 'Separating long-tail and common-knowledge of pretraining for LLMs',
    authors: 'HadiPouransari, DavidGrangier, CThomas, MichaelKirchhof, OncelTuzel',
    year: '2025',
    pdfFileName: 'sperating-long-tail-and-common-knowledge.pdf',
    notesFileName: 'sperating-long-tail-and-common-knowledge-notes.md',
    category: 'currently-reading'
  },
  {
    id: 'recursive-reasoning-tiny-networks',
    title: 'Recursive Reasoning with Tiny Networks',
    authors: 'Alexia Jolicoeur-Martineau',
    year: '2025',
    pdfFileName: 'recursive-reasoning-with-tiny-networks.pdf',
    notesFileName: 'recursive-reasoning-with-tiny-networks-notes.md',
    category: 'currently-reading'
  },
  {
    id: 'evolution-strategies-scale',
    title: 'Evolution Strategies at Scale',
    authors: 'Xin Qiu, Yulu Gan, Conor F. Hayes, Qiyao Liang, Elliot Meyerson, Babak Hodjat, Risto Miikkulainen',
    year: '2025',
    pdfFileName: 'evolution-strategies-at-scale.pdf',
    notesFileName: 'evolution-strategies-at-scale-notes.md',
    category: 'currently-reading'
  },
  {
    id: 'rethinking-classifier-based-quality-filtering',
    title: 'Rethinking Classifier-Based Quality Filtering',
    authors: 'Thiziri Nait Saadats, Louis Bethune, Michal Klein, David Grangier, Marco Cuturit, Pierre Ablin',
    year: '2025',
    pdfFileName: 'rethinking-classifier-based-quality-filtering.pdf',
    notesFileName: 'rethinking-classifier-based-quality-filtering-notes.md',
    category: 'currently-reading'
  },
  
  //Favorites
  {
    id: 'cross-universe-symmbolic-regression',
    title: 'Cross-Universe Symbolic Regression',
    authors: 'Joshua Kyan Aalampour',
    year: '2025',
    pdfFileName: 'cross-universe-symbolic-regression.pdf',
    notesFileName: 'cross-universe-symbolic-regression-notes.md',
    category: 'favorites',
    readDate: 'September 2025'
  },
  {
    id: 'super-weights',
    title: 'The Super Weight in Large Language Models',
    authors: 'Yu, M. et al.',
    year: '2025',
    pdfFileName: 'super-weights.pdf',
    notesFileName: 'super-weights-notes.md',
    category: 'favorites',
    readDate: 'July 2025'
  },
  {
    id: 'bitnet',
    title: 'The Era of 1-bit LLMs: All Large Language Models are in 1.58 Bits',
    authors: 'Ma, S. et al.',
    year: '2024',
    pdfFileName: 'bitnet.pdf',
    notesFileName: 'bitnet-notes.md',
    category: 'favorites',
    readDate: 'May 2025'
  },
  
  //Read
  {
    id: 'agentic-slm',
    title: 'Small Language Models are the Future of Agentic AI',
    authors: 'Belcak, P. et al.',
    year: '2025',
    pdfFileName: 'agentic-slm.pdf',
    notesFileName: 'agentic-slm-notes.md',
    category: 'read',
    readDate: 'September 2025'
  },
  {
    id: 'apple-intelligence',
    title: 'Apple Intelligence Foundation Language Models',
    authors: 'Apple',
    year: '2025',
    pdfFileName: 'apple-intelligence.pdf',
    notesFileName: 'apple-intelligence-notes.md',
    category: 'read',
    readDate: 'August 2025'
  },
  {
    id: 'optimal-classification-qubit-states',
    title: 'Optimal Classification of Qubit States',
    authors: 'M ˘ad ˘alin Gut¸ a, Wojciech Kotłowski',
    year: '2010',
    pdfFileName: 'optimal-classification-qubit-states.pdf',
    notesFileName: 'optimal-classification-qubit-states-notes.md',
    category: 'read',
    readDate: 'February 2025'
  },
  {
    id: 'opportunities-limitations-quantum-machine-learning',
    title: 'Opportunities and Limitations of Quantum Machine Learning',
    authors: 'Elies Gil-Fuster, Jonas R. Naujoks, Grégoire Montavon, Thomas Wiegand, Wojciech Samek, Jens Eisert',
    year: '2024',
    pdfFileName: 'opportunities-limitations-quantum-machine-learning.pdf',
    notesFileName: 'opportunities-limitations-quantum-machine-learning-notes.md',
    category: 'read',
    readDate: 'February 2025'
  },
  {
    id: 'quantum-classification',
    title: 'Quantum Classification',
    authors: 'Sebastien Gambs',
    year: '2008',
    pdfFileName: 'quantum-classification.pdf',
    notesFileName: 'quantum-classification-notes.md',
    category: 'read',
    readDate: 'January 2025'
  },
  {
    id: 'adaptive-learning-quantum-linear-regression',
    title: 'Adaptive Learning for Quantum Linear Regression',
    authors: 'Costantino Carugno, Maurizio Ferrari Dacrema, Paolo Cremonesi',
    year: '2024',
    pdfFileName: 'adaptive-learning-quantum-linear-regression.pdf',
    notesFileName: 'adaptive-learning-quantum-linear-regression-notes.md',
    category: 'read',
    readDate: 'November 2024'
  },
 
  


];
