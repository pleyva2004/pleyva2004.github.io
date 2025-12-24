export interface TimelineItem {
    id: string;
    role: string;
    company: string;
    companyUrl?: string;
    description: string;
    period: string;
    position: 'left' | 'right';
  }

  export const timelineData: TimelineItem[] = [
    {
      id: '1',
      role: 'Research Fellow - Agentic Reasoning SLM',
      company: 'Undergrad Research and Innovation (URI)',
      description: 'Building the specialized reasoning brain of an agentic system while letting conversational models handle user interaction. Training a 3B parameter SLM architecture for one-step reasoning and tool selection. Constructing mathematical logic and proofs dataset as well as logic puzzles dataset. Integrating lightweight adapter layers (LoRA) and Reinforcement Learning to specialize the model for structured business workflows.',
      period: 'Sep 2025 - Present',
      position: 'left'
    },
    {
      id: '2',
      role: 'AI/ML Product Engineering Intern',
      company: 'Apple',
      description: 'Architected multi-agent orchestration system integrating the Apple Foundation Model (AFM) with Model Context Protocol (MCP), implementing GraphRAG and Source of Truth algorithm. Designed tool selection, execution, and deployment with Basemind (LangGraph) using TouchID as Human in the Loop validation for deterministic agent behavior in Apple Pay Agentic Payment flow. Presented prototype to higher leadership demonstrating the Agentic Shopping experience and potential of AFM for Apple Pay.',
      period: 'May 2025 - Aug 2025',
      position: 'right'
    },
    {
      id: '3',
      role: 'AI Engineer Intern',
      company: 'Radical AI',
      description: 'Integrated modern large language models (LLMs) into web applications using Python, interfacing with OpenAI\'s GPT-4o and Google\'s Gemini. Developed Rex web app that helped students improve their Calculus and Pre-Calculus grades to upwards of 93%.',
      period: 'Aug 2024 - Oct 2024',
      position: 'left'
    },
    {
      id: '4',
      role: 'Software Engineering Intern',
      company: 'Caterpillar Inc.',
      companyUrl: 'https://www.caterpillar.com',
      description: 'Architected end-to-end data pipeline ingesting 500K+ daily records from Slack, Jira, and Confluence APIs, building ETL workflows with Python and Apache Airflow. Fine-tuned transformer-based NLP models (BERT, GPT-3.5) achieving 89% accuracy in classifying collaboration patterns. Engineered RESTful microservices with FastAPI handling 10K+ daily inference requests with sub-100ms latency. Built interactive React dashboard with D3.js for predictive analytics on team velocity.',
      period: 'May 2024 - Aug 2024',
      position: 'right'
    }
  ];
