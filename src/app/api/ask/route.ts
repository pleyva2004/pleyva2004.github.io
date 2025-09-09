import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Pablo's information for the system prompt
const PABLO_INFO = `
You are Pablo Leyva's AI assistant. You answer questions on Pablo's background, experience, skills, projects, education, and contact information. 

Here's information about Pablo:

EXPERIENCE:
- Apple: AI Product & Strategy Intern - Led team of 3 interns to build MVP for Agentic Payment flow, prototyped agentic workflows with LLM-based product recommendations and Apple Pay checkout using TypeScript and Model Context Protocol
- Radical AI: AI Engineer - Integrated modern LLMs into web applications using Python, worked with OpenAI's GPT-4o and Google's Gemini, developed Rex web app that helped students improve Calculus grades to 93%
- Caterpillar: Software Engineer - Retrieved engineer data via Python scripts using Azure DevOps API and GitHub REST API, analyzed software development efficiency using Generative AI, optimized SDLC by visualizing data in PowerBI
- NJIT: Research Assistant - Data analysis and FinTech research

SKILLS: Python, AI/ML, Java, TypeScript, React, R, data analysis, web development, APIs, product strategy

PROJECTS: 
NYU Hackathon (1st Place) - QuSotch , Reduced computational complexity by roughly 75% compared to classical Monte Carlo methods by implementing
Quantum Monte Carlo (QMC) with parallelized stochastic modeling
Princeton Hackathon(1st Place) - Illume, built a Learning and Research Assistant that uses LLM inference for defining challenging terms in research papers and generating reflection questions to test users understanding of the material that they're reading and the terms that highlighted in the paper, built a multi-modal AI architecture using Gemini 2.0 that dynamically controlled the context of RAG queries for
accuracy and relevanc, led deployment using Docker and Kubernetes, ensuring a reproducible and stable environment for multi-service AI
applications, developed a data pipeline using Python and PostgreSQL to store and analyze user feedback for continuous improvement
Live Speech Agent - Agency Prototype, built a low-latency voice agent powered by OpenAI's GPT-4o, designed for rapid spoken Q&A and task execution with
500ms round-trip latency, built this as a prototype to explore how natural conversation could act as a user interface for agentic workflows, finetuning model to optimize for completing niche tasks for each vertical of the business

EDUCATION: Applied Statistics and Computer Science at NJIT as an undergraduate student Graduating in May 2027, currently taking Deep Learning MS/PHD course where I am building custom optimzation algorithms

CONTACT: [pleyva2004@gmail.com](mailto:pleyva2004@gmail.com), [github.com/pleyva2004](https://github.com/pleyva2004), [linkedin.com/in/pablo-leyva](https://www.linkedin.com/in/pablo-leyva/)

RESUME: [pablo-leyva-resume.pdf](https://drive.google.com/file/d/1kPUaXwDiAmiUDHD3AU6cgTRBYn8k87Fu/view?usp=sharing)

Be helpful, professional, and knowledgeable about Pablo's background. You can help with questions about his experience, draft emails to Pablo, suggest meeting times, and provide his contact information.

Format: If it is a simple and quick answer, write the response as a Markdown bullet list, with each item on a new line. Ensure that the bullet points are indented.
If it is a long answer, write 2-3 sentences, and bullet points if more information is needed. Use minimal Markdown. Only for headers and bullet points and italics if needed. When sharing contact information, make sure to include the full URL. as written in the contact section.
`;

// AI Provider classes
class ChatOpenAI {
  private client: OpenAI;
  private model: string;

  constructor(model: string = "gpt-4o-mini") {
    this.model = model;
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async call(prompt: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
      temperature: 0.7
    });
    return response.choices[0].message.content || '';
  }
}

class ChatClaude {
  private client: Anthropic;
  private model: string;

  constructor(model: string = "claude-3-5-haiku-20241022") {
    this.model = model;
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async call(prompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    });
    return response.content[0].type === 'text' ? response.content[0].text : '';
  }
}

class ChatGemini {
  private client: GoogleGenerativeAI;
  private model: string;

  constructor(model: string = "gemini-1.5-flash") {
    this.model = model;
    this.client = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
  }

  async call(prompt: string): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.model });
    const response = await model.generateContent(prompt);
    return response.response.text();
  }
}

class OllamaFallback {
  async call(_prompt: string): Promise<string> {
    console.log("OllamaFallback called");
    console.log("--------------------------------");
    console.log(_prompt);
    console.log("--------------------------------");
    return "Levrok Labs Model still down for maintenance";
  }
}

class LevrokLabs {
  private providers: Array<{ name: string; provider: ChatOpenAI | ChatGemini | ChatClaude | OllamaFallback }> = [];
  private readonly TIMEOUT_MS = 10000; // 10 seconds

  constructor() {
    // Initialize available providers
    if (process.env.GOOGLE_API_KEY) {
      this.providers.push({ 
        name: "Gemini", 
        provider: new ChatGemini("gemini-1.5-flash") 
      });
    }
    if (process.env.ANTHROPIC_API_KEY) {
      this.providers.push({ 
        name: "Claude", 
        provider: new ChatClaude("claude-3-5-haiku-20241022") 
      });
    }
    if (process.env.OPENAI_API_KEY) {
      this.providers.push({ 
        name: "OpenAI", 
        provider: new ChatOpenAI("gpt-4o-mini") 
      });
    }


    // Always add Ollama as final fallback
    this.providers.push({ 
      name: "Ollama", 
      provider: new OllamaFallback() 
    });

    if (this.providers.length === 0) {
      throw new Error("No AI providers available");
    }
  }

  private async callWithTimeout(provider: ChatOpenAI | ChatGemini | ChatClaude | OllamaFallback, prompt: string): Promise<string> {
    return Promise.race([
      provider.call(prompt),
      new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout after 10 seconds')), this.TIMEOUT_MS)
      )
    ]);
  }

  async call(prompt: string): Promise<string> {
    let lastError: Error | null = null;

    for (const { name, provider } of this.providers) {
      try {
        console.log(`Trying ${name}...`);
        const result = await this.callWithTimeout(provider, prompt);
        console.log(`Successfully used ${name}`);
        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (errorMessage.includes('timeout')) {
          console.warn(`${name} timed out after 10 seconds, switching to next provider`);
        } else {
          console.warn(`${name} failed:`, error);
        }
        lastError = error as Error;
        continue;
      }
    }

    // If all providers fail, throw the last error
    throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, history } = body;

    if (!question) {
      return NextResponse.json(
        { answer: "Please provide a question." },
        { status: 400 }
      );
    }

    console.log("/ask called");
    console.log("--------------------------------");
    console.log(question);
    console.log("--------------------------------");

    const prompt = `
    You are Pablo Leyva's AI assistaxnt. Here's information about Pablo:

    ${PABLO_INFO}

    Question: ${question}

    History: ${history}

    Answer:
    `;

    const llmClient = new LevrokLabs();
    const answer = await llmClient.call(prompt);

    console.log("--------------------------------");
    console.log(history);
    console.log("--------------------------------");
    console.log(answer);
    console.log("--------------------------------");

    return NextResponse.json({ answer });
  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json(
      { 
        answer: "Sorry, I'm having trouble connecting to the AI service right now. Please try again later." 
      },
      { status: 500 }
    );
  }
}