import { INodeHandler } from './node-executor';
import { ExecutionContext, FlowNode } from '../core/execution-context';
import { eventBus } from '../core/event-bus';

export class EndNode implements INodeHandler {
  constructor(private voiceService: any) {}
  
  async execute(node: FlowNode, context: ExecutionContext): Promise<void> {
    // Optionally play a goodbye message
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
    
    // End the call
    if (this.voiceService) {
      await this.voiceService.hangup(context.callId);
    }
    
    // Update call session
    await context.db.updateCallSession(context.callId, {
      status: 'ended',
      endTime: new Date(),
      durationSeconds: Math.floor((Date.now() - context.startTime.getTime()) / 1000),
    });
    
    // Emit call ended event
    eventBus.emitEvent({
      type: 'call.ended',
      callId: context.callId,
      timestamp: new Date(),
      data: {
        nodeId: node.id,
        duration: Math.floor((Date.now() - context.startTime.getTime()) / 1000),
      },
    });
    
    console.log(`[End Node] Call ended: ${context.callId}`);
  }
}
