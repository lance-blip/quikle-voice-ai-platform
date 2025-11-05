import { INodeHandler } from './node-executor';
import { ExecutionContext, FlowNode } from '../core/execution-context';
import { VariableManager } from '../core/variable-manager';

export class QuestionNode implements INodeHandler {
  private variableManager: VariableManager;
  
  constructor(
    private voiceService: any,
    private llmService: any
  ) {
    this.variableManager = new VariableManager();
  }
  
  async execute(node: FlowNode, context: ExecutionContext): Promise<void> {
    const message = node.data.message;
    const variableName = node.data.variableName;
    const extractionInstructions = node.data.extractionInstructions;
    
    if (!message) {
      console.warn(`[Question Node] No message defined for node ${node.id}`);
      return;
    }
    
    // Add question to conversation history
    context.conversationHistory.push({
      role: 'agent',
      text: message,
      nodeId: node.id,
      timestamp: new Date(),
    });
    
    // Persist to database
    await context.db.addTranscript(context.callId, {
      role: 'agent',
      text: message,
      nodeId: node.id,
      timestamp: new Date(),
    });
    
    // Speak the question
    if (this.voiceService) {
      const voiceId = node.data.voiceId || context.metadata.defaultVoiceId;
      await this.voiceService.speak(context.callId, message, voiceId);
    }
    
    // Wait for caller response
    const response = await this.voiceService.listen(context.callId);
    
    // Add response to conversation history
    context.conversationHistory.push({
      role: 'caller',
      text: response.text,
      nodeId: node.id,
      timestamp: new Date(),
      confidence: response.confidence,
    });
    
    // Persist to database
    await context.db.addTranscript(context.callId, {
      role: 'caller',
      text: response.text,
      nodeId: node.id,
      timestamp: new Date(),
      confidence: response.confidence,
    });
    
    // Extract variable if configured
    if (variableName && extractionInstructions) {
      await this.variableManager.extractVariable(
        context,
        response.text,
        extractionInstructions,
        variableName,
        this.llmService
      );
    } else if (variableName) {
      // Store raw response as variable
      await this.variableManager.setVariable(context, variableName, response.text);
    }
    
    console.log(`[Question Node] Asked: "${message}", Got: "${response.text}"`);
  }
}
