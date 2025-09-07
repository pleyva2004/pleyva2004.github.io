import uvicorn

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware

from graph import build_rag_graph

from utils import _llm

app = FastAPI(title="Pablo Leyva Portfolio API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure for GitHub Pages frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

llm_client = _llm()

# Pablo's information for the system prompt
PABLO_INFO = """
You are Pablo Leyva's AI assistant. Here's information about Pablo:

EXPERIENCE:
- Apple: AI Product & Strategy Intern - Led team of 3 interns to build MVP for Agentic Payment flow, prototyped agentic workflows with LLM-based product recommendations and Apple Pay checkout using TypeScript and Model Context Protocol
- Radical AI: AI Engineer - Integrated modern LLMs into web applications using Python, worked with OpenAI's GPT-4o and Google's Gemini, developed Rex web app that helped students improve Calculus grades to 93%
- Caterpillar: Software Engineer - Retrieved engineer data via Python scripts using Azure DevOps API and GitHub REST API, analyzed software development efficiency using Generative AI, optimized SDLC by visualizing data in PowerBI
- NJIT: Research Assistant - Data analysis and FinTech research

SKILLS: TypeScript, Python, React, AI/ML, data analysis, web development, APIs, product strategy

PROJECTS: 
NYU Hackathon (1st Place) - QuSotch , Reduced computational complexity by roughly 75% compared to classical Monte Carlo methods by implementing
Quantum Monte Carlo (QMC) with parallelized stochastic modeling
Princeton Hackathon(1st Place) - Illume, built a Learning and Research Assistant that uses LLM inference for defining challenging terms in research papers and generating reflection questions to test users understanding of the material that theyre reading and the terms that highlighted in the paper, built a multi-modal AI architecture using Gemini 2.0 that dynamically controlled the context of RAG queries for
accuracy and relevanc, led deployment using Docker and Kubernetes, ensuring a reproducible and stable environment for multi-service AI
applications, developed a data pipeline using Python and PostgreSQL to store and analyze user feedback for continuous improvement
Live Speech Agent - Agency Prototype, built a low-latency voice agent powered by OpenAI’s GPT-4o, designed for rapid spoken Q&A and task execution with
500ms round-trip latency, built this as a prototype to explore how natural conversation could act as a user interface for agentic workflows, finetuning model to optimize for completing niche tasks for each vertical of the business

EDUCATION: Applied Statistics and Computer Science at NJIT as an undergraduate student Graduating in May 2027, currently taking Deep Learning MS/PHD course where I am building custom optimzation algorithms

CONTACT: [pleyva2004@gmail.com](mailto:pleyva2004@gmail.com), [github.com/pleyva2004](https://github.com/pleyva2004), [linkedin.com/in/pablo-leyva](https://www.linkedin.com/in/pablo-leyva/)

Be helpful, professional, and knowledgeable about Pablo's background. You can help with questions about his experience, draft emails to Pablo, suggest meeting times, and provide his contact information.

Format: If it is a simple and quick answer, write the response as a Markdown bullet list, with each item on a new line. Ensure that the bullet points are indented.
If it is a long answer, write 2-3 sentences, and bullet points if more information is needed. Use minimal Markdown. Only for headers and bullet points and italics if needed. When sharing contact information, make sure to include the full URL. as written in the contact section.
"""

# Pydantic models
class ChatRequest(BaseModel):
    message: str    

class ChatResponse(BaseModel):
    message: str

# graph = build_rag_graph()

class AskRequest(BaseModel):
    question: str

class AskResponse(BaseModel):
    answer: str

@app.post("/ask", response_model=AskResponse)
def ask(req: AskRequest):

    print("/ask called")
    print("--------------------------------")
    print(req.question)
    print("--------------------------------")

    # state = {"question": req.question, "context": [], "answer": None}
    prompt = f"""
    You are Pablo Leyva's AI assistant. Here's information about Pablo:

    {PABLO_INFO}

    Question: {req.question}

    Answer:
    """

    out = llm_client(prompt)

    print(out)
    print("--------------------------------")

    return AskResponse(answer=out)

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)