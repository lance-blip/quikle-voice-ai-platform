import { LLMService } from '../../../voice-pipeline/src/services/llm-service';
import { ExecutionContext } from '../core/execution-context';

/**
 * LLM Service Adapter
 * 
 * Bridges the execution engine with the LLM service.
 * Provides conversation and variable extraction capabilities.
 */
export class LLMServiceAdapter {
  constructor(private llmService: LLMService) {}
  
  /**
   * Generate a response based on conversation context
   */
  async generateResponse(
    context: ExecutionContext,
    systemPrompt?: string
  ): Promise<string> {
    const messages = context.conversationHistory.map(msg => ({
      role: msg.role === 'caller' ? 'user' : 'assistant',
      content: msg.text,
    }));
    
    const response = await this.llmService.generateResponse(
      messages,
      systemPrompt || 'You are a helpful AI assistant.'
    );
    
    return response;
  }
  
  /**
   * Extract a variable from text using natural language instructions
   */
  async extractVariable(
    text: string,
    instructions: string
  ): Promise<any> {
    const prompt = `Extract the following information from the text below:\n\n${instructions}\n\nText: "${text}"\n\nProvide only the extracted value, no explanation.`;
    
    const response = await this.llmService.generateResponse(
      [{ role: 'user', content: prompt }],
      'You are a precise data extraction assistant.'
    );
    
    return response.trim();
  }
  
  /**
   * Evaluate an outcome based on conversation context
   */
  async evaluateOutcome(
    context: ExecutionContext,
    outcomePrompt: string
  ): Promise<boolean> {
    const conversationText = context.conversationHistory
      .map(msg => `${msg.role}: ${msg.text}`)
      .join('\n');
    
    const prompt = `Based on the following conversation, determine if this condition is met:\n\n"${outcomePrompt}"\n\nConversation:\n${conversationText}\n\nAnswer with only "true" or "false".`;
    
    const response = await this.llmService.generateResponse(
      [{ role: 'user', content: prompt }],
      'You are a precise evaluation assistant.'
    );
    
    return response.toLowerCase().trim() === 'true';
  }
}
