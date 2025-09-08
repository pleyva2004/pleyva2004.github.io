export type NodeType = 'people' | 'skills' | 'projects' | 'jobs' | 'education' | 'activities';

export interface NetworkNode {
  id: string;
  label: string;
  type: NodeType;
  description?: string;
  skills?: string[];
}

export interface NetworkEdge {
  id: string;
  source: string;
  target: string;
  relationship: string;
}

export const nodeColors: Record<NodeType, string> = {
  people: '#3B82F6',      // Blue
  skills: '#10B981',      // Green  
  projects: '#8B5CF6',    // Purple
  jobs: '#F59E0B',        // Orange
  education: '#EF4444',   // Red
  activities: '#EAB308'   // Yellow
};

export const networkNodes: NetworkNode[] = [
  // Jobs
  { id: 'apple', label: 'Apple', type: 'jobs', description: 'AI Product & Strategy Intern', skills: ['TypeScript', 'AI', 'Product Strategy'] },
  { id: 'radical-ai', label: 'Radical AI', type: 'jobs', description: 'AI Engineer Intern', skills: ['Python', 'LLMs', 'Web Development'] },
  { id: 'caterpillar', label: 'Caterpillar', type: 'jobs', description: 'Software Engineering Intern', skills: ['Python', 'APIs', 'Data Analysis'] },
  { id: 'njit-research', label: 'NJIT Research', type: 'jobs', description: 'Research Assistant', skills: ['Python', 'Data Analysis', 'FinTech'] },

  // Skills
  { id: 'typescript', label: 'TypeScript', type: 'skills' },
  { id: 'python', label: 'Python', type: 'skills' },
  { id: 'react', label: 'React', type: 'skills' },
  { id: 'ai-ml', label: 'AI/ML', type: 'skills' },
  { id: 'data-analysis', label: 'Data Analysis', type: 'skills' },
  { id: 'web-dev', label: 'Web Development', type: 'skills' },
  { id: 'apis', label: 'APIs', type: 'skills' },
  { id: 'product-strategy', label: 'Product Strategy', type: 'skills' },

  // Projects
  { id: 'portfolio', label: 'Portfolio Website', type: 'projects', skills: ['TypeScript', 'React', 'Web Development'] },
  { id: 'rex-app', label: 'Rex Learning App', type: 'projects', skills: ['Python', 'AI/ML', 'Web Development'] },
  { id: 'apple-mvp', label: 'Apple Pay MVP', type: 'projects', skills: ['TypeScript', 'AI', 'Product Strategy'] },

  // Education  
  { id: 'njit', label: 'NJIT', type: 'education', description: 'Computer Science' },
  { id: 'calculus', label: 'Calculus', type: 'education' },
  { id: 'data-structures', label: 'Data Structures', type: 'education' },
  { id: 'algorithms', label: 'Algorithms', type: 'education' },

  // People (sample - you can add real connections)
  { id: 'apple-team', label: 'Apple Team', type: 'people', description: 'Intern Team Lead' },
  { id: 'radical-mentor', label: 'Radical AI Mentor', type: 'people' },
  { id: 'njit-advisor', label: 'Research Advisor', type: 'people' },

  // Activities
  { id: 'hackathons', label: 'Hackathons', type: 'activities' },
  { id: 'tech-meetups', label: 'Tech Meetups', type: 'activities' },
  { id: 'open-source', label: 'Open Source', type: 'activities' }
];

export const networkEdges: NetworkEdge[] = [
  // Job-Skill connections
  { id: 'e1', source: 'apple', target: 'typescript', relationship: 'uses' },
  { id: 'e2', source: 'apple', target: 'ai-ml', relationship: 'uses' },
  { id: 'e3', source: 'apple', target: 'product-strategy', relationship: 'uses' },
  { id: 'e4', source: 'radical-ai', target: 'python', relationship: 'uses' },
  { id: 'e5', source: 'radical-ai', target: 'ai-ml', relationship: 'uses' },
  { id: 'e6', source: 'caterpillar', target: 'python', relationship: 'uses' },
  { id: 'e7', source: 'caterpillar', target: 'apis', relationship: 'uses' },
  { id: 'e8', source: 'njit-research', target: 'data-analysis', relationship: 'uses' },

  // Project-Skill connections
  { id: 'e9', source: 'portfolio', target: 'typescript', relationship: 'built-with' },
  { id: 'e10', source: 'portfolio', target: 'react', relationship: 'built-with' },
  { id: 'e11', source: 'rex-app', target: 'python', relationship: 'built-with' },
  { id: 'e12', source: 'rex-app', target: 'ai-ml', relationship: 'built-with' },
  { id: 'e13', source: 'apple-mvp', target: 'typescript', relationship: 'built-with' },

  // Job-Project connections  
  { id: 'e14', source: 'apple', target: 'apple-mvp', relationship: 'created' },
  { id: 'e15', source: 'radical-ai', target: 'rex-app', relationship: 'created' },

  // Job-People connections
  { id: 'e16', source: 'apple', target: 'apple-team', relationship: 'worked-with' },
  { id: 'e17', source: 'radical-ai', target: 'radical-mentor', relationship: 'mentored-by' },
  { id: 'e18', source: 'njit-research', target: 'njit-advisor', relationship: 'advised-by' },

  // Education connections
  { id: 'e19', source: 'njit', target: 'calculus', relationship: 'studied' },
  { id: 'e20', source: 'njit', target: 'data-structures', relationship: 'studied' },
  { id: 'e21', source: 'njit', target: 'algorithms', relationship: 'studied' },

  // Skill overlaps for communities
  { id: 'e22', source: 'python', target: 'data-analysis', relationship: 'enables' },
  { id: 'e23', source: 'typescript', target: 'web-dev', relationship: 'enables' },
  { id: 'e24', source: 'react', target: 'web-dev', relationship: 'enables' }
];

export const communities = {
  'ai-community': {
    name: 'AI & Machine Learning',
    color: nodeColors.skills,
    nodes: ['apple', 'radical-ai', 'ai-ml', 'rex-app', 'apple-mvp']
  },
  'web-dev-community': {
    name: 'Web Development',
    color: nodeColors.projects,
    nodes: ['portfolio', 'typescript', 'react', 'web-dev']
  },
  'data-community': {
    name: 'Data & Analytics',
    color: nodeColors.education,
    nodes: ['caterpillar', 'njit-research', 'python', 'data-analysis', 'apis']
  },
  'professional-community': {
    name: 'Professional Network',
    color: nodeColors.people,
    nodes: ['apple-team', 'radical-mentor', 'njit-advisor', 'apple', 'radical-ai']
  }
};