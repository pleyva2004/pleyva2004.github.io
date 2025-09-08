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
      role: 'AI Product & Strategy Intern',
      company: 'Apple',
      description: 'Led a team of 3 interns to build MVP for Agentic Payment flow experience for Apple Pay leadership. Prototyped agentic workflows combining LLM-based product recommendations with Apple Pay checkout experiences using TypeScript and Model Context Protocol (MCP). Designed Graph-RAG architecture and developed strategy for optimizing AI context windows.',
      period: 'May 2025 - Aug 2025',
      position: 'left'
    },
    {
      id: '2',
      role: 'AI Engineer Intern',
      company: 'Radical AI',
      description: 'Integrated modern large language models (LLMs) into web applications using Python, interfacing with OpenAI\'s GPT-4o and Google\'s Gemini. Developed Rex web app that helped students improve their Calculus and Pre-Calculus grades to upwards of 93%.',
      period: 'Aug 2024 - Oct 2024',
      position: 'right'
    },
    {
      id: '3',
      role: 'Software Engineering Intern',
      company: 'Caterpillar Inc.',
      companyUrl: 'https://www.caterpillar.com',
      description: 'Retrieved engineer data via Python scripts implementing Azure DevOps API and GitHub REST API. Analyzed software development efficiency using Generative AI to assess code commit impact and usability. Optimized SDLC by visualizing data from GitHub and Azure DevOps in PowerBI.',
      period: 'May 2024 - Aug 2024',
      position: 'left'
    },
    {
      id: '4',
      role: 'Research Assistant - Data Analysis and FinTech',
      company: 'New Jersey Institute of Technology',
      companyUrl: 'https://www.njit.edu',
      description: 'Collected data from 300 real estate properties from peer-to-peer lending and crowdfunding sources. Implemented Python web scraping across 100 diverse datasets and utilized A/B testing to fine-tune accuracy of data retrieval and pipeline optimization.',
      period: 'Oct 2023 - Apr 2024',
      position: 'right'
    }
  ];