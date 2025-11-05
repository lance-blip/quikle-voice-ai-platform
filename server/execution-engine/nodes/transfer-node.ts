import { INodeHandler } from './node-executor';
import { ExecutionContext, FlowNode } from '../core/execution-context';
import { eventBus } from '../core/event-bus';

export class TransferNode implements INodeHandler {
  constructor(private voiceService: any) {}
  
  async execute(node: FlowNode, context: ExecutionContext): Promise<void> {
    const transferNumber = node.data.transferNumber;
    
    if (!transferNumber) {
      console.warn(`[Transfer Node] No transfer number defined for node ${node.id}`);
      return;
    }
    
    // Optionally play a message before transferring
    if (node.data.message) {
      context.conversationHistory.push({
        role: 'agent',
        text: node.data.message,
        nodeId: node.id,
        timestamp: new Date(),
      });
      
      await context.db.addTranscript(context.callId, {
        role: 'agent',
        text: node.data.message,
        nodeId: node.id,
        timestamp: new Date(),
      });
      
      if (this.voiceService) {
        const voiceId = node.data.voiceId || context.metadata.defaultVoiceId;
        await this.voiceService.speak(context.callId, node.data.message, voiceId);
      }
    }
    
    // Transfer the call
    if (this.voiceService) {
      await this.voiceService.transfer(context.callId, transferNumber);
    }
    
    // Emit transfer event
    eventBus.emitEvent({
      type: 'call.transferred',
      callId: context.callId,
      timestamp: new Date(),
      data: {
        nodeId: node.id,
        transferNumber,
      },
    });
    
    console.log(`[Transfer Node] Transferred call to: ${transferNumber}`);
  }
}
