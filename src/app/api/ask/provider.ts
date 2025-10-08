import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';


class ChatOpenAI {
    private client: OpenAI;
    private model: string;
  
    constructor(model: string = "gpt-3.5-turbo") {
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
        provider: new ChatGemini("Gemini 2.5 Flash-Lite") 
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

export { LevrokLabs };

