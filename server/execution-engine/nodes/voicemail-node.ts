import type { ExecutionContext, FlowNode } from '../core/execution-context';
import type { NodeHandler } from './node-executor';

/**
 * Voicemail Node Handler
 * 
 * Records a voicemail message from the caller.
 * Plays a greeting, beeps, records, and saves to database.
 */
export class VoicemailNodeHandler implements NodeHandler {
  async execute(context: ExecutionContext, node: FlowNode): Promise<string | null> {
    const { greeting, maxDurationSeconds } = node.data;
    
    console.log(`[Voicemail Node] Recording voicemail for call ${context.callId}`);
    
    // Emit voicemail event
    context.eventBus.emit('node.voicemail', {
      callId: context.callId,
      nodeId: node.id,
    });
    
    // Log event
    await context.db.logEvent(context.callId, 'node.voicemail', {
      nodeId: node.id,
      greeting,
      maxDurationSeconds: maxDurationSeconds || 120,
    });
    
    // The voicemail service will handle the actual recording
    // This node just marks the call as entering voicemail
    
    // Add system message to conversation history
    context.conversationHistory.push({
      role: 'system',
      text: `Voicemail recording started (max ${maxDurationSeconds || 120}s)`,
      nodeId: node.id,
      timestamp: new Date(),
    });
    
    // Return the default outcome (typically leads to end node)
    const defaultOutcome = node.data.outcomes?.find(o => o.isDefault);
    return defaultOutcome?.targetNodeId || null;
  }
}
