import OpenAI from 'openai';
import { LLMProvider, Message } from '../../types';
import { config } from '../../config';
import { logger } from '../utils/logger';

export class OpenAILLMService implements LLMProvider {
  private client: OpenAI;
  private isMock: boolean;
  
  constructor() {
    this.isMock = config.openaiApiKey.includes('placeholder');
    
    if (!this.isMock) {
      this.client = new OpenAI({
        apiKey: config.openaiApiKey,
        baseURL: config.openaiBaseUrl,
      });
      logger.info(`LLM service initialized with base URL: ${config.openaiBaseUrl}`);
    } else {
      logger.warn('LLM service running in mock mode (no API key)');
      // Create a mock client
      this.client = {} as OpenAI;
    }
  }
  
  async generateResponse(
    systemPrompt: string,
    conversationHistory: Message[],
    currentNodePrompt: string
  ): Promise<string> {
    if (this.isMock) {
      return this.mockGenerateResponse(systemPrompt, conversationHistory, currentNodePrompt);
    }
    
    try {
      const messages: any[] = [
        { role: 'system', content: systemPrompt },
        ...conversationHistory.map(msg => ({
          role: msg.role === 'caller' ? 'user' : 'assistant',
          content: msg.text
        })),
      ];
      
      // Add current node prompt if provided
      if (currentNodePrompt) {
        messages.push({ role: 'system', content: currentNodePrompt });
      }
      
      logger.debug('Generating LLM response with messages:', messages.length);
      
      const response = await this.client.chat.completions.create({
        model: 'gpt-4.1-mini', // or 'gemini-2.5-flash' depending on base URL
        messages,
        temperature: 0.7,
        max_tokens: 150,
        stream: false,
      });
      
      const content = response.choices[0].message.content || '';
      logger.debug(`LLM response generated: ${content.substring(0, 100)}...`);
      
      return content;
    } catch (error) {
      logger.error('Error generating LLM response:', error);
      throw error;
    }
  }
  
  async evaluateOutcome(
    transcript: string,
    outcomes: string[]
  ): Promise<string> {
    if (this.isMock) {
      return this.mockEvaluateOutcome(transcript, outcomes);
    }
    
    try {
      const prompt = `Based on the caller's response: "${transcript}"

Which of these outcomes best matches their intent?
${outcomes.map((o, i) => `${i + 1}. ${o}`).join('\n')}

Respond with only the number (1-${outcomes.length}).`;
      
      logger.debug('Evaluating outcome with prompt:', prompt);
      
      const response = await this.client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 5,
      });
      
      const content = response.choices[0].message.content || '1';
      const choice = parseInt(content.trim());
      
      if (isNaN(choice) || choice < 1 || choice > outcomes.length) {
        logger.warn(`Invalid outcome choice: ${content}, defaulting to first outcome`);
        return outcomes[0];
      }
      
      const selectedOutcome = outcomes[choice - 1];
      logger.debug(`Outcome selected: ${selectedOutcome}`);
      
      return selectedOutcome;
    } catch (error) {
      logger.error('Error evaluating outcome:', error);
      // Default to first outcome on error
      return outcomes[0];
    }
  }
  
  async extractVariable(
    transcript: string,
    extractionInstructions: string
  ): Promise<any> {
    if (this.isMock) {
      return this.mockExtractVariable(transcript, extractionInstructions);
    }
    
    try {
      const prompt = `${extractionInstructions}

Caller's response: "${transcript}"

Extract the requested information. If not found, respond with "null".`;
      
      logger.debug('Extracting variable with instructions:', extractionInstructions);
      
      const response = await this.client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 100,
      });
      
      const content = response.choices[0].message.content?.trim() || 'null';
      
      // Try to parse as JSON if it looks like JSON
      if (content.startsWith('{') || content.startsWith('[')) {
        try {
          return JSON.parse(content);
        } catch {
          return content;
        }
      }
      
      // Return null if explicitly stated
      if (content.toLowerCase() === 'null' || content.toLowerCase() === 'none') {
        return null;
      }
      
      logger.debug(`Variable extracted: ${content}`);
      return content;
    } catch (error) {
      logger.error('Error extracting variable:', error);
      return null;
    }
  }
  
  // Mock implementations for development
  private mockGenerateResponse(
    systemPrompt: string,
    conversationHistory: Message[],
    currentNodePrompt: string
  ): Promise<string> {
    logger.debug('Mock LLM: Generating response');
    
    const lastMessage = conversationHistory[conversationHistory.length - 1];
    const responses = [
      "I understand. How can I help you further?",
      "That's interesting. Can you tell me more?",
      "Thank you for that information. What would you like to do next?",
      "I see. Let me help you with that.",
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    return Promise.resolve(response);
  }
  
  private mockEvaluateOutcome(transcript: string, outcomes: string[]): Promise<string> {
    logger.debug('Mock LLM: Evaluating outcome');
    
    // Simple keyword matching
    const lowerTranscript = transcript.toLowerCase();
    
    for (const outcome of outcomes) {
      const keywords = outcome.toLowerCase().split(' ');
      if (keywords.some(kw => lowerTranscript.includes(kw))) {
        return Promise.resolve(outcome);
      }
    }
    
    // Default to first outcome
    return Promise.resolve(outcomes[0]);
  }
  
  private mockExtractVariable(transcript: string, extractionInstructions: string): Promise<any> {
    logger.debug('Mock LLM: Extracting variable');
    
    // Simple extraction based on common patterns
    const lowerInstructions = extractionInstructions.toLowerCase();
    const lowerTranscript = transcript.toLowerCase();
    
    // Email extraction
    if (lowerInstructions.includes('email')) {
      const emailMatch = transcript.match(/[\w.-]+@[\w.-]+\.\w+/);
      return Promise.resolve(emailMatch ? emailMatch[0] : null);
    }
    
    // Phone number extraction
    if (lowerInstructions.includes('phone')) {
      const phoneMatch = transcript.match(/\d{3}[-.]?\d{3}[-.]?\d{4}/);
      return Promise.resolve(phoneMatch ? phoneMatch[0] : null);
    }
    
    // Number extraction
    if (lowerInstructions.includes('number') || lowerInstructions.includes('budget')) {
      const numberMatch = transcript.match(/\d+/);
      return Promise.resolve(numberMatch ? parseInt(numberMatch[0]) : null);
    }
    
    // Boolean extraction (yes/no)
    if (lowerInstructions.includes('yes') || lowerInstructions.includes('confirm')) {
      if (lowerTranscript.includes('yes') || lowerTranscript.includes('sure') || lowerTranscript.includes('okay')) {
        return Promise.resolve(true);
      }
      if (lowerTranscript.includes('no') || lowerTranscript.includes('not')) {
        return Promise.resolve(false);
      }
    }
    
    // Default: return the transcript itself
    return Promise.resolve(transcript);
  }
}

// Factory function
export function createLLMService(provider: 'openai' | 'groq' | 'gemini' = 'openai'): LLMProvider {
  // All providers use OpenAI-compatible API, just different base URLs
  // The base URL is configured via environment variable
  return new OpenAILLMService();
}
