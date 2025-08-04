// gemini-client.js
import { GoogleGenerativeAI } from '@google/generative-ai';

class GeminiClient {
  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  // Replace your OpenAI research function
  async aiResearch(query, options = {}) {
    try {
      const prompt = `Research the following topic and provide detailed information: ${query}`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return {
        success: true,
        data: text,
        usage: {
          promptTokens: result.response.usageMetadata?.promptTokenCount || 0,
          completionTokens: result.response.usageMetadata?.candidatesTokenCount || 0,
          totalTokens: result.response.usageMetadata?.totalTokenCount || 0
        }
      };
    } catch (error) {
      console.error('Gemini Research Error:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Replace your OpenAI ordering function
  async aiOrdering(items, criteria = 'relevance') {
    try {
      const prompt = `
        Please analyze and order the following items based on ${criteria}:
        ${JSON.stringify(items, null, 2)}
        
        Provide the result as a JSON array with each item having an 'order' field (1 being highest priority).
        Include reasoning for the ordering.
      `;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON response
      let orderedItems;
      try {
        // Extract JSON from response if it's wrapped in markdown
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\[[\s\S]*\]/);
        orderedItems = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : text);
      } catch (parseError) {
        // Fallback: return original items with basic ordering
        orderedItems = items.map((item, index) => ({
          ...item,
          order: index + 1,
          reasoning: 'Auto-generated ordering due to parsing error'
        }));
      }
      
      return {
        success: true,
        data: orderedItems,
        reasoning: text
      };
    } catch (error) {
      console.error('Gemini Ordering Error:', error);
      return {
        success: false,
        error: error.message,
        data: items.map((item, index) => ({ ...item, order: index + 1 }))
      };
    }
  }

  // General chat completion (replaces OpenAI chat)
  async chatCompletion(messages, options = {}) {
    try {
      // Convert OpenAI message format to Gemini format
      const prompt = this.convertMessagesToPrompt(messages);
      
      const generationConfig = {
        temperature: options.temperature || 0.7,
        topP: options.top_p || 0.9,
        topK: options.top_k || 40,
        maxOutputTokens: options.max_tokens || 1000,
      };

      const model = this.genAI.getGenerativeModel({ 
        model: options.model || "gemini-1.5-flash",
        generationConfig
      });
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      
      return {
        success: true,
        data: {
          choices: [{
            message: {
              role: 'assistant',
              content: response.text()
            },
            finish_reason: 'stop',
            index: 0
          }],
          usage: {
            prompt_tokens: result.response.usageMetadata?.promptTokenCount || 0,
            completion_tokens: result.response.usageMetadata?.candidatesTokenCount || 0,
            total_tokens: result.response.usageMetadata?.totalTokenCount || 0
          }
        }
      };
    } catch (error) {
      console.error('Gemini Chat Error:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Helper function to convert OpenAI messages to Gemini prompt
  convertMessagesToPrompt(messages) {
    return messages.map(msg => {
      const role = msg.role === 'assistant' ? 'Model' : 'Human';
      return `${role}: ${msg.content}`;
    }).join('\n\n');
  }

  // Streaming support (if needed)
  async streamCompletion(messages, onChunk) {
    try {
      const prompt = this.convertMessagesToPrompt(messages);
      const result = await this.model.generateContentStream(prompt);
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        if (chunkText && onChunk) {
          onChunk({
            choices: [{
              delta: { content: chunkText },
              index: 0
            }]
          });
        }
      }
      
      return { success: true };
    } catch (error) {
      console.error('Gemini Streaming Error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Usage example
const gemini = new GeminiClient();

// Replace your existing functions with these:
export async function aiResearch(query) {
  return await gemini.aiResearch(query);
}

export async function aiOrdering(items, criteria) {
  return await gemini.aiOrdering(items, criteria);
}

export async function chatCompletion(messages, options) {
  return await gemini.chatCompletion(messages, options);
}

export default GeminiClient;