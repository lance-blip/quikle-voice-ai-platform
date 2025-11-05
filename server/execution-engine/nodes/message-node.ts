import { INodeHandler } from './node-executor';
import { ExecutionContext, FlowNode } from '../core/execution-context';

export class MessageNode implements INodeHandler {
  constructor(private voiceService: any) {}
  
  async execute(node: FlowNode, context: ExecutionContext): Promise<void> {
    const message = node.data.message;
    
    if (!message) {
      console.warn(`[Message Node] No message defined for node ${node.id}`);
      return;
    }
    
    // Add message to conversation history
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
    
    // Speak the message (if voice service is available)
    if (this.voiceService) {
      const voiceId = node.data.voiceId || context.metadata.defaultVoiceId;
      await this.voiceService.speak(context.callId, message, voiceId);
    }
    
    console.log(`[Message Node] Spoke: "${message}"`);
  }
}
