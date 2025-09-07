import os
from openai import OpenAI
from anthropic import Anthropic
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

class ChatOpenAI:
    def __init__(self, model: str = "gpt-4o-mini"):
        self.model = model
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    
    def __call__(self, prompt: str):
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
            temperature=0.7
        )
        return response.choices[0].message.content 
    
class ChatClaude:
    def __init__(self, model: str = "claude-3-haiku-20240307"):
        self.model = model
        self.client = Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    
    def __call__(self, prompt: str):
        response = self.client.messages.create(
            model=self.model,
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}]
        )
        return response.content[0].text


class ChatGemini:
    def __init__(self, model: str = "gemini-1.5-flash"):
        self.model = model
        genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
        self.client = genai.GenerativeModel(model)
    
    def __call__(self, prompt: str):
        response = self.client.generate_content(prompt)
        return response.text


class Ollama:
    def __init__(self, model: str):
        self.model = model
    
    def __call__(self, prompt: str):
        return "Model stilll not implemented"

def _llm():
    # Try providers in order of preference
    if os.getenv("GEMINI_API_KEY"):
        print("Using Gemini")
        return ChatGemini(model="gemini-1.5-flash")

    elif os.getenv("OPENAI_API_KEY"):
        print("Using OpenAI")
        return ChatOpenAI(model="gpt-4o-mini")
    elif os.getenv("ANTHROPIC_API_KEY"):
        print("Using Claude")
        return ChatClaude(model="claude-3-haiku-20240307")
    else:
        print("Using Ollama")
        return Ollama(model="mistral")
    
    # Fallback to local Ollama (pull a model like mistral or llama3)
    print("Using Ollama")
    return Ollama(model="mistral")

if __name__ == "__main__":
    llm = _llm()
    print(llm("What is the capital of France?"))