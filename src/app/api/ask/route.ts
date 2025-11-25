import { NextRequest, NextResponse } from 'next/server';
import { LevrokLabs } from './provider';

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

RESUME: [pablo-leyva-resume.pdf](https://drive.google.com/file/d/1zAga2AMGiT4DQ2FaZ2P4oiwJUAaTAMR5/view?usp=sharing)

Be helpful, professional, and knowledgeable about Pablo's background. You can help with questions about his experience, draft emails to Pablo, suggest meeting times, and provide his contact information.

Format: If it is a simple and quick answer, write the response as a Markdown bullet list, with each item on a new line. Ensure that the bullet points are indented.
If it is a long answer, write 2-3 sentences, and bullet points if more information is needed. Use minimal Markdown. Only for headers and bullet points and italics if needed. When sharing contact information, make sure to include the full URL as written in the contact section. When sharing resume, make sure to share the url as it is written in the resume section.

`;


const RESEARCH_SYSTEM_PROMPT = `
You are Pablo Leyva's AI assistant. You answer questions on Pablo's research, including his research papers, reading list, and notes.

Be helpful, professional, and knowledgeable about Pablo's research. You can help with questions about his research papers, reading list, and notes.

Do not be redundant, do not repeat the same information. Only say information once.
Format: If it is a simple and quick answer, write the response as a Markdown bullet list, with each item on a new line. Ensure that the bullet points are indented.
If it is a long answer, write 2-3 sentences, and bullet points if more information is needed. Use minimal Markdown. Only for headers and bullet points and italics if needed.
`;

export async function POST(request: NextRequest) {

  try {
    const body = await request.json();

    const { question, message, history, context } = body;

    const userQuestion = message || question;

    if (!userQuestion) {
      return NextResponse.json(
        { answer: "Please provide a question.", message: "Please provide a question." },
        { status: 400 }
      );
    }

    console.log("/ask called");
    console.log("--------------------------------");
    console.log(userQuestion);
    console.log("Context:", context?.type);
    console.log("--------------------------------");

    // Build context-aware system prompt

    let systemPrompt = PABLO_INFO;
    let contextInfo = '';

    if (context) {

      console.log("Research context");
      console.log("--------------------------------");
      console.log(context);
      console.log("--------------------------------");

      systemPrompt = RESEARCH_SYSTEM_PROMPT;
      switch (context.type) {
        case 'research-list':
          contextInfo = `
            The user is viewing Pablo's research page with ${context.data.papers?.length || 0} research papers.
            Current filter: ${context.data.currentFilter}

            Available papers:
            ${context.data.papers?.map((p: { title: string; status: string; abstract: string }) => `- ${p.title} (${p.status}): ${p.abstract}`).join('\n') || ''}

            Reading list:
            ${context.data.readingList?.map((p: { title: string; authors: string; year: string }) => `- ${p.title} by ${p.authors} (${p.year})`).join('\n') || ''}

            Only answer questions about the research content visible on this page.
            `;
          break;

        case 'research-detail':
          const paper = context.data.paper;
          contextInfo = `
              The user is viewing a specific research paper:

              Title: ${paper?.title || ''}
              Status: ${paper?.status || ''}
              Author: ${paper?.author || ''}
              Institution: ${paper?.institution || ''}
              Date: ${paper?.date || ''}
              Abstract: ${paper?.abstract || ''}
              ${paper?.sections?.objectives ? `Objectives:\n${paper.sections.objectives.map((obj: string) => `- ${obj}`).join('\n')}` : ''}
              ${paper?.sections?.significance?.innovations ? `Key Innovations:\n${paper.sections.significance.innovations.map((innovation: string) => `- ${innovation}`).join('\n')}` : ''}

              Only answer questions about this specific research paper. If asked about other topics, politely redirect to the current paper.
              `;
          break;

        case 'reading-page':
          const readingPaper = context.data.paper;
          contextInfo = `
            The user is reading a research paper:

            Title: ${readingPaper?.title || ''}
            Authors: ${readingPaper?.authors || ''}
            Year: ${readingPaper?.year || ''}
            Category: ${readingPaper?.category || ''}

            ${context.data.notes ? `Pablo's Notes:\n${context.data.notes}` : 'No notes available yet.'}

            Only answer questions about this paper and Pablo's notes. Help explain concepts, summarize sections, or discuss the content visible on screen.
            `;
          break;
      }
    }

    const prompt = `
    You are Pablo Leyva's AI assistant. Here's information about Pablo:

    ${systemPrompt}

    ${contextInfo}

    Question: ${userQuestion}

    ${history ? `History: ${history}` : ''}

    Answer:
    `;

    const llmClient = new LevrokLabs();
    const answer = await llmClient.call(prompt);

    console.log("--------------------------------");
    console.log(answer);
    console.log("--------------------------------");

    return NextResponse.json({ answer, message: answer });
  } catch (error) {
    console.error('API Error:', error);

    return NextResponse.json(
      {
        answer: "Sorry, I'm having trouble connecting to the AI service right now. Please try again later.",
        message: "Sorry, I'm having trouble connecting to the AI service right now. Please try again later."
      },
      { status: 500 }
    );
  }
}
