'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiCalendar, FiUser, FiBook } from 'react-icons/fi';
import jsPDF from 'jspdf';
import { ResearchPaper } from '@/constants/research/research-papers';
import PDFViewer from '@/components/PDFViewerWrapper';

interface ResearchDetailProps {
  paper: ResearchPaper;
}

export default function ResearchDetail({ paper }: ResearchDetailProps) {
  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPos = margin;

    // 📐 --- Spacing configuration (LaTeX inspired) ---
    const spacing = {
      sectionBefore: 12,
      sectionAfter: 6,
      subsectionBefore: 8,
      subsectionAfter: 4,
      paragraph: 5,
      listItem: 4,
      listBefore: 4,
      listAfter: 4,
    };

    // ✅ Page break helper
    const ensureSpace = (neededHeight = 0) => {
      if (yPos + neededHeight > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }
    };

    // ✍️ Paragraph / Body Text
    const addText = (
      text: string,
      fontSize: number = 11,
      isBold = false,
      color: [number, number, number] = [0, 0, 0]
    ) => {
      ensureSpace(fontSize * 1.2);
      doc.setFontSize(fontSize);
      doc.setFont('helvetica', isBold ? 'bold' : 'normal');
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, maxWidth);
      lines.forEach((line: string) => {
        ensureSpace(fontSize);
        doc.text(line, margin, yPos);
        yPos += fontSize * 0.5 + 1;
      });
      yPos += spacing.paragraph;
    };

    // 📌 Section headers
    const addSection = (title: string, color: [number, number, number] = [0, 102, 204]) => {
      yPos += spacing.sectionBefore;
      ensureSpace(14);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...color);
      doc.text(title, margin, yPos);
      yPos += spacing.sectionAfter;
    };

    // 📌 Subsection headers
    const addSubsection = (title: string) => {
      yPos += spacing.subsectionBefore;
      ensureSpace(12);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text(title, margin, yPos);
      yPos += spacing.subsectionAfter;
    };

    // • Bullet lists (like LaTeX itemize)
    const addBulletList = (items: string[]) => {
      yPos += spacing.listBefore;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      items.forEach((item: string) => {
        ensureSpace(10);
        const bulletX = margin + 4;
        doc.text('•', margin, yPos);
        const itemLines = doc.splitTextToSize(item, maxWidth - 10);
        itemLines.forEach((line: string, idx: number) => {
          doc.text(line, bulletX + 6, yPos);
          if (idx < itemLines.length - 1) {
            yPos += 11 * 0.5;
          }
        });
        yPos += spacing.listItem;
      });
      yPos += spacing.listAfter;
    };

    // ① Numbered lists (like LaTeX enumerate)
    const addNumberedList = (items: string[]) => {
      yPos += spacing.listBefore;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      items.forEach((item: string, idx: number) => {
        ensureSpace(10);
        const numLabel = `${idx + 1}.`;
        const labelWidth = doc.getTextWidth(numLabel);
        doc.text(numLabel, margin, yPos);
        const itemLines = doc.splitTextToSize(item, maxWidth - labelWidth - 6);
        itemLines.forEach((line: string, lineIdx: number) => {
          doc.text(line, margin + labelWidth + 6, yPos);
          if (lineIdx < itemLines.length - 1) {
            yPos += 11 * 0.5;
          }
        });
        yPos += spacing.listItem;
      });
      yPos += spacing.listAfter;
    };

    // 🧭 --- Title block (centered) ---
    const title = 'Hyper-Efficient On-Device Small Language Models for Structured Agentic Workflows';
    const titleLines = doc.splitTextToSize(title, maxWidth);
    const totalTitleHeight = titleLines.length * 10 + 50; // rough estimate
    yPos = (pageHeight - totalTitleHeight) / 2; // center vertically

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 102, 204);
    titleLines.forEach((line: string) => {
      const textWidth = doc.getTextWidth(line);
      const x = (pageWidth - textWidth) / 2;
      doc.text(line, x, yPos);
      yPos += 10;
    });

    yPos += 12;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    const authorInfo = ['Pablo Leyva', 'October 1, 2025', 'Undergraduate Researcher – Applied Statistics and Computer Science', 'NJIT R1 HSI University'];
    authorInfo.forEach((line: string) => {
      const textWidth = doc.getTextWidth(line);
      const x = (pageWidth - textWidth) / 2;
      doc.text(line, x, yPos);
      yPos += 6;
    });

    doc.addPage();
    yPos = margin;
    addSection('Abstract');
    addText('Recent advances in language model architecture and quantization have enabled unprecedented efficiency in model deployment without sacrificing quality. This project proposes the design and evaluation of an on-device small language model (SLM) optimized for agentic business process execution, such as customer onboarding, document processing, and procedural task automation.');
    addText('The approach synthesizes four key innovations: (1) Apple Foundation Model (AFM)-style efficient backbones, (2) BitNet b1.58 ternary weight quantization to minimize memory and computation, (3) super weight identification and preservation to maintain critical model behavior, and (4) SLM-first agentic architectures, where specialized on-device models handle deterministic workflows and large models are invoked only as fallback.');
    addText('The research will design, implement, and benchmark such a model (~3B parameters) to demonstrate that hyper-efficient SLMs can reliably execute long chained tasks on edge devices, bridging the gap between research LLMs and practical, economical deployment.');

    addSection('1. Introduction & Background', [128, 0, 128]);
    addText('Large Language Models (LLMs) have demonstrated remarkable versatility across tasks but are expensive to deploy, particularly for repetitive procedural workflows common in business applications. Recent research has shifted attention to smaller, specialized models that can execute narrowly scoped agentic tasks efficiently.');
    addText('Apple\'s AFM family introduced compact, efficient architectures (3B parameters) capable of on-device operation using techniques like grouped-query attention, RMSNorm, and RoPE embeddings, achieving strong performance at low latency. Concurrently, BitNet b1.58 has demonstrated that ternary weight quantization (-1, 0, 1) with 8-bit activations can match FP16 model performance while dramatically reducing cost.');
    addText('Surprisingly, a handful of "super weights" in LLMs govern most of their representational capacity; pruning a single such weight can collapse the model. Preserving these few scalars in high precision enables aggressive quantization elsewhere without quality loss.');
    addText('Finally, agentic AI systems increasingly rely on SLMs to handle structured tasks, with LLMs serving only as reasoning fallbacks.');
    addText('Research Gap: While each component has been demonstrated individually, no integrated, undergraduate-scale research project has systematically implemented and benchmarked this synthesis for procedural task execution on real edge devices.', 11, true);

    addSection('2. Objectives / Research Questions', [0, 153, 0]);
    addNumberedList([
      'Design an AFM-style 3B parameter SLM architecture compatible with BitNet b1.58 ternary weights.',
      'Develop a super weight detection and preservation pipeline to retain critical precision while quantizing the rest.',
      'Integrate lightweight adapter layers (e.g., LoRA) to specialize the model for structured business workflows.',
      'Evaluate agentic reliability vs. larger LLM baselines.',
      'Benchmark on-device performance (latency, memory, energy).'
    ]);

    addSection('3. Significance & Innovation', [0, 102, 204]);
    addText('This research addresses the cost-capability gap between powerful cloud LLMs and practical deployment needs in small businesses and edge devices. Innovations include:');
    addBulletList([
      'Architecture synthesis: combining AFM backbone + BitNet + super weights + SLM routing.',
      'Quantization without degradation: leveraging super weights to preserve critical behavior.',
      'Agentic focus: designing for procedural task reliability.'
    ]);
    addText('Success would demonstrate that undergraduate researchers can prototype state-of-the-art efficient LM systems with real-world applicability in domains like finance, education, or logistics.');
    
    yPos -= spacing.sectionBefore/3; 
    addSection('4. Methodology / Research Design', [128, 0, 128]);
    addSubsection('Model Selection & Distillation');
    addBulletList([
      'Start with a 3B parameter open model (e.g., LLaMA 3B or AFM).',
      'Distill from a larger model on procedural task datasets.'
    ]);

    addSubsection('BitNet b1.58 Quantization');
    addBulletList([
      'Apply absmean ternary quantization to all weights.',
      'Measure perplexity before/after quantization.'
    ]);

    addSubsection('Super Weight Detection');
    addBulletList([
      'Perform a single forward pass to identify super weights (typically <=6 scalars in early MLP layers).',
      'Preserve these weights in fp16, quantize the rest.'
    ]);

    addSubsection('Adapter Integration');
    addBulletList([
      'Train LoRA adapters for specific workflows (e.g., invoice parsing, onboarding procedures).',
      'Use lightweight SFT and preference optimization for procedural correctness.'
    ]);

    addSubsection('Agentic Reliability Harness');
    addBulletList([
      'Implement finite-state scaffolds and self-audit checkpoints every N steps.',
      'Benchmark task completion accuracy, escalation rate to fallback LLM, and error types.'
    ]);

    addSubsection('Deployment & Benchmarking');
    addBulletList([
      'Deploy model on laptop GPU or NPU.',
      'Measure latency, throughput, memory footprint, and energy.',
      'Compare against a cloud-hosted LLM baseline.'
    ]);

    addSection('5. Expected Results / Outcomes', [0, 153, 0]);
    addBulletList([
      'A fully functional on-device SLM with ternary weights and preserved super weights.',
      'Empirical evidence that accuracy degradation is minimal despite radical quantization.',
      'Demonstrated agentic reliability in executing long procedures.',
      'Benchmark results showing >2-3x speed and memory efficiency over FP16 baselines, approaching Apple AFM levels.',
      'A replicable pipeline suitable for further research or hackathon projects.'
    ]);

    addSubsection('Potential Challenges / Limitations');
    addBulletList([
      'Identifying super weights reliably across architectures may require tuning.',
      'Ternary quantization may introduce unexpected degradation on niche tasks.',
      'On-device inference performance may vary by hardware.',
      'Time constraints may limit the breadth of adapters trained.'
    ]);
    addText('Mitigation: Focus on a small number of workflows, use existing quantization libraries, and modularize code for iterative improvement.', 11, true);

    addSection('6. Timeline (Semester)', [0, 102, 204]);
    addBulletList([
      'Weeks 1-3: Literature review, environment setup, model selection.',
      'Weeks 4-6: Quantization + super weight detection pipeline.',
      'Weeks 7-9: Adapter training + procedural harness.',
      'Weeks 10-12: Benchmarking, analysis, writing.'
    ]);

    addSection('References / Bibliography', [128, 0, 128]);

    // Reference 1 with link
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    ensureSpace(12);
    doc.text('1. Apple. (2024). Apple Intelligence Foundation Language Models.', margin, yPos);
    doc.textWithLink('https://arxiv.org/pdf/2407.21075v1', margin + 8, yPos + 5, { url: 'https://arxiv.org/pdf/2407.21075v1' });
    yPos += 12;

    // Reference 2 with link
    ensureSpace(12);
    doc.text('2. Yu, M. et al. (2025). The Super Weight in Large Language Models.', margin, yPos);
    doc.textWithLink('https://arxiv.org/pdf/2411.07191', margin + 8, yPos + 5, { url: 'https://arxiv.org/pdf/2411.07191' });
    yPos += 12;

    // Reference 3 with link
    ensureSpace(12);
    doc.text('3. Ma, S. et al. (2024). The Era of 1-bit LLMs: All Large Language Models are in 1.58 Bits.', margin, yPos);
    doc.textWithLink('https://arxiv.org/pdf/2402.17764', margin + 8, yPos + 5, { url: 'https://arxiv.org/pdf/2402.17764' });
    yPos += 12;

    // Reference 4 with link
    ensureSpace(12);
    doc.text('4. Belcak, P. et al. (2025). Small Language Models are the Future of Agentic AI.', margin, yPos);
    doc.textWithLink('https://arxiv.org/pdf/2506.02153', margin + 8, yPos + 5, { url: 'https://arxiv.org/pdf/2506.02153' });

    doc.save('Research_Proposal_Pablo_Leyva_Spaced.pdf');
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
