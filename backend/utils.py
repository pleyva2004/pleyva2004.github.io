import os
from openai import OpenAI
from anthropic import Anthropic
import google.generativeai as genai
from dotenv import load_dotenv
import logging

load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
        return "Levrok Labs Model still down for maintenance"

class LevrokLabs:
    def __init__(self):
        self.providers = []
        
        # Initialize available providers
        if os.getenv("GOOGLE_API_KEY"):
            self.providers.append(("Gemini", ChatGemini(model="gemini-1.5-flash")))
        if os.getenv("ANTHROPIC_API_KEY"):
            self.providers.append(("Claude", ChatClaude(model="claude-3-5-haiku-latest")))
        if os.getenv("OPENAI_API_KEY"):
            self.providers.append(("OpenAI", ChatOpenAI(model="gpt-4o-mini")))
        
        # Always add Ollama as final fallback
        self.providers.append(("Ollama", Ollama(model="mistral")))
        
        if not self.providers:
            raise RuntimeError("No AI providers available")
    
    def __call__(self, prompt: str):
        last_error = None
        
        for provider_name, provider in self.providers:
            try:
                logger.info(f"Trying {provider_name}...")
                result = provider(prompt)
                logger.info(f"Successfully used {provider_name}")
                return result
            except Exception as e:
                logger.warning(f"{provider_name} failed: {str(e)}")
                last_error = e
                continue
        
        # If all providers fail, raise the last error
        raise RuntimeError(f"All AI providers failed. Last error: {str(last_error)}")

def _llm():
    
    return LevrokLabs()

if __name__ == "__main__":
    llm = _llm()
    print(llm("What is the capital of France?"))