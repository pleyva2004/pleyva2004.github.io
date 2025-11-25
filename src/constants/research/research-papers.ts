export interface ResearchPaper {
  id: string;
  title: string;
  author: string;
  date: string;
  institution: string;
  status: 'ongoing' | 'completed';
  pdfFileName?: string; // For completed projects
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

export const researchPapers: ResearchPaper[] = [
  {
    id: 'slm-agentic-workflows',
    title: 'Hyper-Efficient On-Device Small Language Models for Structured Agentic Workflows',
    author: 'Pablo Leyva',
    date: 'October 1, 2025',
    institution: 'NJIT R1 University',
    status: 'ongoing',
    abstract: 'Recent advances in language model architecture and quantization have enabled unprecedented efficiency in model deployment without sacrificing quality. This project proposes the design and evaluation of an on-device small language model (SLM) optimized for agentic business process execution, such as customer onboarding, document processing, and procedural task automation.',
    sections: {
      introduction: `Large Language Models (LLMs) have demonstrated remarkable versatility across tasks but are expensive to deploy, particularly for repetitive procedural workflows common in business applications. Recent research has shifted attention to smaller, specialized models that can execute narrowly scoped agentic tasks efficiently.

Apple's AFM family introduced compact, efficient architectures (3B parameters) capable of on-device operation using techniques like grouped-query attention, RMSNorm, and RoPE embeddings, achieving strong performance at low latency. Concurrently, BitNet b1.58 has demonstrated that ternary weight quantization (-1, 0, 1) with 8-bit activations can match FP16 model performance while dramatically reducing cost.

Surprisingly, a handful of "super weights" in LLMs govern most of their representational capacity; pruning a single such weight can collapse the model. Preserving these few scalars in high precision enables aggressive quantization elsewhere without quality loss.

Finally, agentic AI systems increasingly rely on SLMs to handle structured tasks, with LLMs serving only as reasoning fallbacks.

**Research Gap:** While each component has been demonstrated individually, no integrated, undergraduate-scale research project has systematically implemented and benchmarked this synthesis for procedural task execution on real edge devices.`,
      objectives: [
        'Design an AFM-style 3B parameter SLM architecture compatible with BitNet b1.58 ternary weights.',
        'Develop a super weight detection and preservation pipeline to retain critical precision while quantizing the rest.',
        'Integrate lightweight adapter layers (e.g., LoRA) to specialize the model for structured business workflows.',
        'Evaluate the agentic reliability of the model in executing long, deterministic step-by-step tasks vs. larger LLM baselines.',
        'Benchmark on-device performance (latency, memory, energy) to demonstrate feasibility on consumer hardware.'
      ],
      significance: {
        content: 'This research addresses the cost–capability gap between powerful cloud LLMs and practical deployment needs in small businesses and edge devices. Innovations include:',
        innovations: [
          '**Architecture synthesis:** combining AFM backbone + BitNet ternary weights + super weight preservation + SLM routing into one deployable system.',
          '**Quantization without degradation:** leveraging super weights to preserve critical behavior under aggressive compression.',
          '**Agentic focus:** designing for procedural task reliability, not just benchmark accuracy.'
        ]
      },
      methodology: {
        'Model Selection & Distillation': [
          'Start with a 3B parameter open model (e.g., LLaMA 3B or AFM architecture replica)',
          'Distill from a larger model on procedural task datasets to retain reasoning patterns'
        ],
        'BitNet b1.58 Quantization': [
          'Apply absmean ternary quantization to all weights',
          'Measure perplexity before/after quantization'
        ],
        'Super Weight Detection': [
          'Perform a single forward pass to identify super weights (typically ≤6 scalars in early MLP layers)',
          'Preserve these weights in fp16, quantize the rest'
        ],
        'Adapter Integration': [
          'Train LoRA adapters for specific workflows (e.g., invoice parsing, onboarding procedures)',
          'Use lightweight SFT and preference optimization for procedural correctness'
        ],
        'Agentic Reliability Harness': [
          'Implement finite-state scaffolds and self-audit checkpoints every N steps',
          'Benchmark task completion accuracy, escalation rate to fallback LLM, and error types'
        ],
        'Deployment & Benchmarking': [
          'Deploy model on laptop GPU or NPU',
          'Measure latency, throughput, memory footprint, and energy',
          'Compare against a cloud-hosted LLM baseline'
        ]
      },
      expectedResults: {
        outcomes: [
          'A fully functional on-device SLM with ternary weights and preserved super weights',
          'Empirical evidence that accuracy degradation is minimal despite radical quantization',
          'Demonstrated agentic reliability in executing long procedures',
          'Benchmark results showing >2–3× speed and memory efficiency over FP16 baselines, approaching Apple AFM levels',
          'A replicable pipeline suitable for further research or hackathon projects'
        ],
        challenges: [
          'Identifying super weights reliably across architectures may require tuning',
          'Ternary quantization may introduce unexpected degradation on niche tasks',
          'On-device inference performance may vary by hardware',
          'Time constraints may limit the breadth of adapters trained'
        ],
        mitigation: 'Focus on a small number of workflows, use existing quantization libraries, and modularize code for iterative improvement.'
      },
      timeline: [
        { phase: 'Weeks 1–3', description: 'Literature review, environment setup, model selection' },
        { phase: 'Weeks 4–6', description: 'Quantization + super weight detection pipeline' },
        { phase: 'Weeks 7–9', description: 'Adapter training + procedural harness' },
        { phase: 'Weeks 10–12', description: 'Benchmarking, analysis, writing' }
      ],
      references: [
        {
          title: 'Apple. (2024). Apple Intelligence Foundation Language Models.',
          url: 'https://arxiv.org/pdf/2407.21075v1'
        },
        {
          title: 'Yu, M. et al. (2025). The Super Weight in Large Language Models.',
          url: 'https://arxiv.org/pdf/2411.07191'
        },
        {
          title: 'Ma, S. et al. (2024). The Era of 1-bit LLMs: All Large Language Models are in 1.58 Bits.',
          url: 'https://arxiv.org/pdf/2402.17764'
        },
        {
          title: 'Belcak, P. et al. (2025). Small Language Models are the Future of Agentic AI.',
          url: 'https://arxiv.org/pdf/2506.02153'
        }
      ]
    }
  },
  {
    id: 'insurance-analysis',
    title: 'Statistical Analysis of Insurance Charges: A Predictive Modeling Study',
    author: 'Pablo Leyva',
    date: 'October 3, 2024',
    institution: 'NJIT R1 University',
    status: 'completed',
    pdfFileName: 'insurance_analysis_report.pdf',
    abstract: 'This study presents a comprehensive statistical analysis of insurance charges using demographic and health-related predictors. We employed linear regression and Ridge regression techniques to identify key factors influencing insurance costs and develop predictive models. Our analysis reveals that smoking status is the most significant predictor of insurance charges, followed by the number of children, BMI, age, region, and sex. The final linear regression model achieved an R-squared value of 0.769, explaining approximately 77% of the variance in insurance charges.',
    sections: {
      introduction: 'Healthcare costs and insurance premiums have become increasingly important topics in modern society. Understanding the factors that influence insurance charges is crucial for both insurance companies in risk assessment and for individuals in making informed healthcare decisions. This study analyzes a comprehensive dataset of insurance charges to identify the key demographic and health-related factors that drive insurance costs.',
      objectives: [
        'Conduct comprehensive exploratory data analysis to understand the distribution of insurance charges and identify patterns',
        'Evaluate the relative importance of demographic and health-related factors (age, sex, BMI, number of children, smoking status, and geographical region) in predicting insurance charges',
        'Develop and evaluate linear regression models for predicting insurance charges, including regularized models',
        'Assess model performance using appropriate statistical metrics and diagnostic tests',
        'Provide actionable insights that can inform insurance pricing strategies'
      ],
      significance: {
        content: 'This research demonstrates the application of statistical learning techniques to understand insurance charge determination. Key findings include:',
        innovations: [
          '**Smoking status dominance:** Identified as the most critical factor with smokers paying approximately $23,644 more than non-smokers',
          '**Feature hierarchy:** Established clear ranking of importance: smoking status ≫ children > BMI > age > region ≈ sex',
          '**Model performance:** Achieved 77% variance explanation (R² = 0.769) with linear regression',
          '**Practical implications:** Provided actionable insights for both insurance companies and policyholders'
        ]
      },
      methodology: {
        'Data Preprocessing': [
          'Dataset comprised 1,338 observations with seven variables',
          'Encoded categorical variables using dummy variables and numerical mapping',
          'Optimized data types for 25% memory reduction'
        ],
        'Exploratory Data Analysis': [
          'Analyzed distribution patterns and identified right-skewed charge distribution',
          'Examined correlations to assess multicollinearity',
          'Investigated feature-target relationships through violin plots and scatter plots'
        ],
        'Model Development': [
          'Multiple linear regression using all available predictors',
          'Ridge regression with L2 regularization for coefficient stability',
          'Analyzed regularization paths across different alpha values'
        ],
        'Model Diagnostics': [
          'Linearity assessment through actual vs predicted plots',
          'Residual normality evaluation using Q-Q plots',
          'Variance Inflation Factor calculation to assess multicollinearity'
        ]
      },
      expectedResults: {
        outcomes: [
          'R-squared: 0.7694 (76.94% of variance explained)',
          'Mean Squared Error: 33,806,944',
          'Variance Inflation Factor: 4.33',
          'Smoking coefficient: 23,644.44 (dominant predictor)',
          'Validated model assumptions through diagnostic tests',
          'Identified significant interaction effects between BMI and smoking status'
        ],
        challenges: [
          'Interaction effects not fully captured in simple additive model',
          'Dataset may not include all relevant predictors (e.g., pre-existing conditions, lifestyle factors)',
          'Ridge regression was deemed unnecessary for this dataset size',
          'Model selection could be improved by removing low-impact features (sex, region)'
        ],
        mitigation: 'Future research directions include investigation of non-linear models and interaction terms, incorporation of additional health and lifestyle variables, time-series analysis for temporal trends, and advanced machine learning approaches for improved prediction accuracy.'
      },
      timeline: [
        { phase: 'Data Collection', description: 'Acquired dataset with 1,338 observations and 7 variables' },
        { phase: 'Data Preprocessing', description: 'Encoded categorical variables and optimized data types' },
        { phase: 'Exploratory Analysis', description: 'Comprehensive EDA with visualizations and correlation analysis' },
        { phase: 'Model Development', description: 'Linear regression and Ridge regression implementation' },
        { phase: 'Model Validation', description: 'Diagnostic tests and performance evaluation' },
        { phase: 'Presentation', description: '33-slide presentation delivered on October 3rd, 2024' }
      ],
      references: [
        {
          title: 'Project Repository: Statistical Learning Capstone',
          url: 'https://github.com/pleyva2004/Statistical-Learning-Capstone'
        }
      ]
    }
  }
];
