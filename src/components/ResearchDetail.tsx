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
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPos = margin;

    // Helper function to add text with automatic page breaks
    const addText = (text: string, fontSize: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
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
        yPos += fontSize * 0.5;
      });
      yPos += 5;
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
    const title = doc.splitTextToSize('Hyper-Efficient On-Device Small Language Models for Structured Agentic Workflows', maxWidth);
    title.forEach((line: string) => {
      doc.text(line, margin, yPos);
      yPos += 10;
    });

    addSpacing(10);

    // Author info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('Pablo Leyva', margin, yPos);
    yPos += 6;
    doc.text('October 1, 2025', margin, yPos);
    yPos += 6;
    doc.text('Undergraduate Researcher - Applied Statistics and Computer Science', margin, yPos);
    yPos += 6;
    doc.text('NJIT R1 University', margin, yPos);

    addSpacing(15);

    // Abstract
    addText('Abstract', 14, true, [0, 102, 204]);
    addText('Recent advances in language model architecture and quantization have enabled unprecedented efficiency in model deployment without sacrificing quality. This project proposes the design and evaluation of an on-device small language model (SLM) optimized for agentic business process execution, such as customer onboarding, document processing, and procedural task automation.', 11);
    addText('The approach synthesizes four key innovations: (1) Apple Foundation Model (AFM)-style efficient backbones, (2) BitNet b1.58 ternary weight quantization to minimize memory and computation, (3) super weight identification and preservation to maintain critical model behavior, and (4) SLM-first agentic architectures, where specialized on-device models handle deterministic workflows and large models are invoked only as fallback.', 11);
    addText('The research will design, implement, and benchmark such a model (~3B parameters) to demonstrate that hyper-efficient SLMs can reliably execute long chained tasks on edge devices, bridging the gap between research LLMs and practical, economical deployment.', 11);

    addSpacing(10);

    // Introduction & Background
    addText('1. Introduction & Background', 14, true, [128, 0, 128]);
    addText('Large Language Models (LLMs) have demonstrated remarkable versatility across tasks but are expensive to deploy, particularly for repetitive procedural workflows common in business applications. Recent research has shifted attention to smaller, specialized models that can execute narrowly scoped agentic tasks efficiently.', 11);
    addText('Apple\'s AFM family introduced compact, efficient architectures (3B parameters) capable of on-device operation using techniques like grouped-query attention, RMSNorm, and RoPE embeddings, achieving strong performance at low latency. Concurrently, BitNet b1.58 has demonstrated that ternary weight quantization (-1, 0, 1) with 8-bit activations can match FP16 model performance while dramatically reducing cost.', 11);
    addText('Surprisingly, a handful of "super weights" in LLMs govern most of their representational capacity; pruning a single such weight can collapse the model. Preserving these few scalars in high precision enables aggressive quantization elsewhere without quality loss.', 11);
    addText('Finally, agentic AI systems increasingly rely on SLMs to handle structured tasks, with LLMs serving only as reasoning fallbacks.', 11);
    addText('Research Gap: While each component has been demonstrated individually, no integrated, undergraduate-scale research project has systematically implemented and benchmarked this synthesis for procedural task execution on real edge devices.', 11, true);

    addSpacing(10);

    // Objectives
    addText('2. Objectives / Research Questions', 14, true, [0, 153, 0]);
    addText('1. Design an AFM-style 3B parameter SLM architecture compatible with BitNet b1.58 ternary weights.', 11);
    addText('2. Develop a super weight detection and preservation pipeline to retain critical precision while quantizing the rest.', 11);
    addText('3. Integrate lightweight adapter layers (e.g., LoRA) to specialize the model for structured business workflows.', 11);
    addText('4. Evaluate the agentic reliability of the model in executing long, deterministic step-by-step tasks vs. larger LLM baselines.', 11);
    addText('5. Benchmark on-device performance (latency, memory, energy) to demonstrate feasibility on consumer hardware.', 11);

    addSpacing(10);

    // Significance
    addText('3. Significance & Innovation', 14, true, [0, 102, 204]);
    addText('This research addresses the cost-capability gap between powerful cloud LLMs and practical deployment needs in small businesses and edge devices. Innovations include:', 11);
    addText('• Architecture synthesis: combining AFM backbone + BitNet ternary weights + super weight preservation + SLM routing into one deployable system.', 11);
    addText('• Quantization without degradation: leveraging super weights to preserve critical behavior under aggressive compression.', 11);
    addText('• Agentic focus: designing for procedural task reliability, not just benchmark accuracy.', 11);
    addText('Success would demonstrate that undergraduate researchers can prototype state-of-the-art efficient LM systems with real-world applicability in domains like finance, education, or logistics.', 11);

    addSpacing(10);

    // Methodology
    addText('4. Methodology / Research Design', 14, true, [128, 0, 128]);

    addText('Model Selection & Distillation', 12, true);
    addText('• Start with a 3B parameter open model (e.g., LLaMA 3B or AFM architecture replica)', 11);
    addText('• Distill from a larger model on procedural task datasets to retain reasoning patterns', 11);

    addText('BitNet b1.58 Quantization', 12, true);
    addText('• Apply absmean ternary quantization to all weights', 11);
    addText('• Measure perplexity before/after quantization', 11);

    addText('Super Weight Detection', 12, true);
    addText('• Perform a single forward pass to identify super weights (typically <=6 scalars in early MLP layers)', 11);
    addText('• Preserve these weights in fp16, quantize the rest', 11);

    addText('Adapter Integration', 12, true);
    addText('• Train LoRA adapters for specific workflows (e.g., invoice parsing, onboarding procedures)', 11);
    addText('• Use lightweight SFT and preference optimization for procedural correctness', 11);

    addText('Agentic Reliability Harness', 12, true);
    addText('• Implement finite-state scaffolds and self-audit checkpoints every N steps', 11);
    addText('• Benchmark task completion accuracy, escalation rate to fallback LLM, and error types', 11);

    addText('Deployment & Benchmarking', 12, true);
    addText('• Deploy model on laptop GPU or NPU', 11);
    addText('• Measure latency, throughput, memory footprint, and energy', 11);
    addText('• Compare against a cloud-hosted LLM baseline', 11);

    addSpacing(10);

    // Expected Results
    addText('5. Expected Results / Outcomes', 14, true, [0, 153, 0]);
    addText('• A fully functional on-device SLM with ternary weights and preserved super weights', 11);
    addText('• Empirical evidence that accuracy degradation is minimal despite radical quantization', 11);
    addText('• Demonstrated agentic reliability in executing long procedures', 11);
    addText('• Benchmark results showing >2-3x speed and memory efficiency over FP16 baselines, approaching Apple AFM levels', 11);
    addText('• A replicable pipeline suitable for further research or hackathon projects', 11);

    addSpacing(5);
    addText('Potential Challenges / Limitations', 12, true);
    addText('• Identifying super weights reliably across architectures may require tuning', 11);
    addText('• Ternary quantization may introduce unexpected degradation on niche tasks', 11);
    addText('• On-device inference performance may vary by hardware', 11);
    addText('• Time constraints may limit the breadth of adapters trained', 11);
    addText('Mitigation: Focus on a small number of workflows, use existing quantization libraries, and modularize code for iterative improvement.', 11, true);

    addSpacing(10);

    // Timeline
    addText('6. Timeline (Semester)', 14, true, [0, 102, 204]);
    addText('Weeks 1-3: Literature review, environment setup, model selection', 11);
    addText('Weeks 4-6: Quantization + super weight detection pipeline', 11);
    addText('Weeks 7-9: Adapter training + procedural harness', 11);
    addText('Weeks 10-12: Benchmarking, analysis, writing', 11);

    addSpacing(10);

    // References
    addText('References / Bibliography', 14, true, [128, 0, 128]);

    // Reference 1 with link
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    if (yPos > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
    doc.text('1. Apple. (2024). Apple Intelligence Foundation Language Models.', margin, yPos);
    doc.textWithLink('https://arxiv.org/pdf/2407.21075v1', margin + 8, yPos + 5, { url: 'https://arxiv.org/pdf/2407.21075v1' });
    yPos += 12;

    // Reference 2 with link
    if (yPos > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
    doc.text('2. Yu, M. et al. (2025). The Super Weight in Large Language Models.', margin, yPos);
    doc.textWithLink('https://arxiv.org/pdf/2411.07191', margin + 8, yPos + 5, { url: 'https://arxiv.org/pdf/2411.07191' });
    yPos += 12;

    // Reference 3 with link
    if (yPos > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
    doc.text('3. Ma, S. et al. (2024). The Era of 1-bit LLMs: All Large Language Models are in 1.58 Bits.', margin, yPos);
    doc.textWithLink('https://arxiv.org/pdf/2402.17764', margin + 8, yPos + 5, { url: 'https://arxiv.org/pdf/2402.17764' });
    yPos += 12;

    // Reference 4 with link
    if (yPos > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
    doc.text('4. Belcak, P. et al. (2025). Small Language Models are the Future of Agentic AI.', margin, yPos);
    doc.textWithLink('https://arxiv.org/pdf/2506.02153', margin + 8, yPos + 5, { url: 'https://arxiv.org/pdf/2506.02153' });

    // Save the PDF
    doc.save('Research_Proposal_Pablo_Leyva.pdf');
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
