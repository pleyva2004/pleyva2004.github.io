'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiCalendar, FiUser, FiBook } from 'react-icons/fi';
import jsPDF from 'jspdf';
import { ResearchPaper } from '@/constants/research/research-papers';
import PDFViewer from '@/components/PDFViewer';

interface ResearchDetailProps {
  paper: ResearchPaper;
}

export default function ResearchDetail({ paper }: ResearchDetailProps) {
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 1;
    const maxWidth = pageWidth - 2 * margin;
    let yPos = margin;

    const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0], lineSpacing: number = 0.7) => {
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setTextColor(color[0], color[1], color[2]);

      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        if (yPos > pageHeight - margin) {
          doc.addPage();
          yPos = margin;
        }
        doc.text(line, margin, yPos);
        yPos += fontSize * lineSpacing;
      });
      yPos += fontSize * 0.3; // Add paragraph spacing
    };

    const addSpacing = (space: number) => {
      yPos += space;
      if (yPos > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
    };

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    const title = doc.splitTextToSize(paper.title, maxWidth);
    title.forEach((line: string) => {
      doc.text(line, margin, yPos);
      yPos += 10;
    });
    addSpacing(10);

    // Author info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text(paper.author, margin, yPos);
    yPos += 6;
    doc.text(paper.date, margin, yPos);
    yPos += 6;
    doc.text('Undergraduate Researcher - Applied Statistics and Computer Science', margin, yPos);
    yPos += 6;
    doc.text(paper.institution, margin, yPos);
    addSpacing(15);

    // Abstract
    addText('Abstract', 14, true, [0, 102, 204]);
    addText(paper.abstract, 11);
    addSpacing(10);

    // Introduction
    addText('1. Introduction & Background', 14, true, [128, 0, 128]);
    addText(paper.sections.introduction, 11);
    addSpacing(10);

    // Objectives
    addText('2. Objectives / Research Questions', 14, true, [0, 153, 0]);
    paper.sections.objectives.forEach((obj, idx) => {
      addText(`${idx + 1}. ${obj}`, 11);
    });
    addSpacing(10);

    // Significance
    addText('3. Significance & Innovation', 14, true, [0, 102, 204]);
    addText(paper.sections.significance.content, 11);
    paper.sections.significance.innovations.forEach((innovation) => {
      addText(`• ${innovation}`, 11);
    });
    addSpacing(10);

    // Methodology
    addText('4. Methodology / Research Design', 14, true, [128, 0, 128]);
    Object.entries(paper.sections.methodology).forEach(([key, values]) => {
      addText(key, 12, true);
      values.forEach((value) => {
        addText(`• ${value}`, 11);
      });
    });
    addSpacing(10);

    // Expected Results
    addText('5. Expected Results / Outcomes', 14, true, [0, 153, 0]);
    paper.sections.expectedResults.outcomes.forEach((outcome) => {
      addText(`• ${outcome}`, 11);
    });

    addSpacing(5);
    addText('Potential Challenges / Limitations', 12, true);
    paper.sections.expectedResults.challenges.forEach((challenge) => {
      addText(`• ${challenge}`, 11);
    });
    addText(`Mitigation: ${paper.sections.expectedResults.mitigation}`, 11, true);
    addSpacing(10);

    // Timeline
    addText('6. Timeline (Semester)', 14, true, [0, 102, 204]);
    paper.sections.timeline.forEach((item) => {
      addText(`${item.phase}: ${item.description}`, 11);
    });
    addSpacing(10);

    // References
    addText('References / Bibliography', 14, true, [128, 0, 128]);
    
    paper.sections.references.forEach((ref, idx) => {
      if (yPos > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text(`${idx + 1}. ${ref.title}`, margin, yPos);
      doc.textWithLink(ref.url, margin + 8, yPos + 5, { url: ref.url });
      yPos += 12;
    });

    doc.save(`Research_Proposal_${paper.author.replace(/\s+/g, '_')}.pdf`);
  };

  // If this is a completed project with a PDF, render the PDF viewer
  if (paper.status === 'completed' && paper.pdfFileName) {
    return (
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text ">
            {paper.title}
          </h1>

          <div className="flex flex-wrap gap-6 text-gray-400 mb-6">
            <div className="flex items-center gap-2">
              <FiUser className="text-accent-blue" />
              <span>{paper.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiCalendar className="text-accent-purple" />
              <span>{paper.date}</span>
            </div>
            <div className="flex items-center gap-2">
              <FiBook className="text-accent-green" />
              <span>{paper.institution}</span>
            </div>
          </div>

          <div className="bg-dark-card border border-accent-blue/20 rounded-lg p-6 mb-6">
            <p className="text-gray-300 leading-relaxed">{paper.abstract}</p>
          </div>
        </motion.div>

        {/* PDF Viewer with Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full h-[80vh]"
        >
          <PDFViewer
            pdfUrl={`/research/my-papers/${paper.pdfFileName}`}
            title={paper.title}
          />
        </motion.div>
      </div>
    );
  }

  // Otherwise, render the full proposal content
  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text ">
          {paper.title}
        </h1>

        <div className="flex flex-wrap gap-6 text-gray-400 mb-6">
          <div className="flex items-center gap-2">
            <FiUser className="text-accent-blue" />
            <span>{paper.author}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiCalendar className="text-accent-purple" />
            <span>{paper.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiBook className="text-accent-green" />
            <span>{paper.institution}</span>
          </div>
        </div>

        <button
          onClick={generatePDF}
          className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white border-2 border-white rounded-lg transition-all duration-300 hover:bg-white hover:text-black hover:border-black"
        >
          <FiDownload />
          Download PDF
        </button>
      </motion.div>

      {/* Abstract */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-4 text-accent-blue">Abstract</h2>
        <div className="bg-dark-card border border-accent-blue/20 rounded-lg p-6">
          <p className="text-gray-300 leading-relaxed">{paper.abstract}</p>
        </div>
      </motion.section>

      {/* Introduction */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-4 text-accent-purple">1. Introduction & Background</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed whitespace-pre-line">{paper.sections.introduction}</p>
        </div>
      </motion.section>

      {/* Objectives */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-4 text-accent-green">2. Objectives / Research Questions</h2>
        <div className="bg-dark-card border border-accent-green/20 rounded-lg p-6">
          <ul className="space-y-3 text-gray-300">
            {paper.sections.objectives.map((objective, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-accent-green mt-1">{idx + 1}.</span>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      {/* Significance */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-4 text-accent-blue">3. Significance & Innovation</h2>
        <div className="prose prose-invert max-w-none">
          <p className="text-gray-300 leading-relaxed mb-4">{paper.sections.significance.content}</p>
          <ul className="space-y-3 text-gray-300">
            {paper.sections.significance.innovations.map((innovation, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-accent-blue">•</span>
                <span dangerouslySetInnerHTML={{ __html: innovation }} />
              </li>
            ))}
          </ul>
        </div>
      </motion.section>

      {/* Methodology */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-4 text-accent-purple">4. Methodology / Research Design</h2>
        <div className="space-y-6">
          {Object.entries(paper.sections.methodology).map(([key, values]) => (
            <div key={key}>
              <h3 className="text-xl font-semibold mb-3 text-gray-200">{key}</h3>
              <ul className="space-y-2 text-gray-300">
                {values.map((value, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-accent-purple">•</span>
                    <span>{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Expected Results */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-4 text-accent-green">5. Expected Results / Outcomes</h2>
        <div className="prose prose-invert max-w-none">
          <ul className="space-y-3 text-gray-300 mb-6">
            {paper.sections.expectedResults.outcomes.map((outcome, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <span className="text-accent-green">•</span>
                <span>{outcome}</span>
              </li>
            ))}
          </ul>
          <div className="bg-dark-bg/50 border border-accent-green/20 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-accent-green mb-3">Potential Challenges / Limitations</h4>
            <ul className="space-y-2 text-gray-300">
              {paper.sections.expectedResults.challenges.map((challenge, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-accent-green text-xs mt-1">▪</span>
                  <span>{challenge}</span>
                </li>
              ))}
            </ul>
            <p className="text-gray-400 text-sm mt-3">
              <strong>Mitigation:</strong> {paper.sections.expectedResults.mitigation}
            </p>
          </div>
        </div>
      </motion.section>

      {/* Timeline */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.7 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-4 text-accent-blue">6. Timeline (Semester)</h2>
        <div className="bg-dark-card border border-accent-blue/20 rounded-lg p-6">
          <div className="space-y-4">
            {paper.sections.timeline.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className={`font-semibold min-w-[120px] ${idx % 3 === 0 ? 'text-accent-blue' : idx % 3 === 1 ? 'text-accent-purple' : 'text-accent-green'}`}>
                  {item.phase}
                </div>
                <div className="text-gray-300">{item.description}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* References */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold mb-4 text-accent-purple">References / Bibliography</h2>
        <div className="prose prose-invert max-w-none">
          <ol className="list-decimal list-inside space-y-3 text-gray-300">
            {paper.sections.references.map((ref, idx) => (
              <li key={idx}>
                <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:text-accent-blue/80 underline">
                  {ref.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </motion.section>
    </div>
  );
}
