'use client';

import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { FiDownload, FiZoomIn, FiZoomOut, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PDFViewerProps {
  pdfUrl: string;
  title: string;
}

export default function PDFViewer({ pdfUrl, title }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function onDocumentLoadError(error: Error) {
    console.error(title, 'Error loading PDF:', error);
    setError('Failed to load PDF. Please try downloading it instead.');
    setLoading(false);
  }

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => {
      const newPageNumber = prevPageNumber + offset;
      return Math.min(Math.max(1, newPageNumber), numPages);
    });
  };

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 2.0));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  // Show loading state until component is mounted on client
  if (!isClient) {
    return (
      <div className="flex flex-col h-full bg-dark-card border border-accent-blue/20 rounded-lg overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
            <p className="text-gray-400">Loading PDF Viewer...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-dark-card border border-accent-blue/20 rounded-lg overflow-hidden">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-3 md:p-4 gap-3 sm:gap-4 border-b border-accent-blue/20 bg-dark-bg">
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => changePage(-1)}
            disabled={pageNumber <= 1}
            className="p-1.5 md:p-2 rounded-lg bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiChevronLeft size={18} className="md:w-5 md:h-5" />
          </button>
          <span className="text-gray-300 text-xs md:text-sm whitespace-nowrap">
            Page {pageNumber} of {numPages || '...'}
          </span>
          <button
            onClick={() => changePage(1)}
            disabled={pageNumber >= numPages}
            className="p-1.5 md:p-2 rounded-lg bg-accent-blue/20 text-accent-blue hover:bg-accent-blue/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiChevronRight size={18} className="md:w-5 md:h-5" />
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={zoomOut}
            disabled={scale <= 0.5}
            className="p-1.5 md:p-2 rounded-lg bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiZoomOut size={18} className="md:w-5 md:h-5" />
          </button>
          <span className="text-gray-300 text-xs md:text-sm whitespace-nowrap min-w-[45px] text-center">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            disabled={scale >= 2.0}
            className="p-1.5 md:p-2 rounded-lg bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <FiZoomIn size={18} className="md:w-5 md:h-5" />
          </button>

          <a
            href={pdfUrl}
            download
            className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-accent-green/20 text-accent-green rounded-lg hover:bg-accent-green/30 transition-colors"
          >
            <FiDownload size={16} className="md:w-[18px] md:h-[18px]" />
            <span className="text-xs md:text-sm font-semibold">Download</span>
          </a>
        </div>
      </div>

      {/* PDF Display */}
      <div className="flex-1 overflow-auto p-4 bg-gray-900">
        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-blue mx-auto mb-4"></div>
              <p className="text-gray-400">Loading PDF...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <p className="text-red-400 mb-4">{error}</p>
              <a
                href={pdfUrl}
                download
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent-blue text-white rounded-lg hover:bg-accent-blue/80 transition-colors"
              >
                <FiDownload />
                Download PDF
              </a>
            </div>
          </div>
        )}

        {!error && (
          <div className="flex justify-center">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading=""
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer={true}
                renderAnnotationLayer={true}
                className="shadow-2xl"
              />
            </Document>
          </div>
        )}
      </div>
    </div>
  );
}
