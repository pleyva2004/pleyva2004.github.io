'use client';

import dynamic from 'next/dynamic';

const PDFViewer = dynamic(() => import('./PDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col h-full bg-dark-card border border-accent-blue/20 rounded-lg overflow-hidden">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
          <p className="text-gray-400">Loading PDF Viewer...</p>
        </div>
      </div>
    </div>
  ),
});

export default PDFViewer;
