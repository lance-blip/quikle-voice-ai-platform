import type { ExecutionContext, FlowNode } from '../core/execution-context';
import type { NodeHandler } from './node-executor';

/**
 * Recording Node Handler
 * 
 * Controls call recording during flow execution.
 * Can start, pause, resume, or stop recording.
 */
export class RecordingNodeHandler implements NodeHandler {
  async execute(context: ExecutionContext, node: FlowNode): Promise<string | null> {
    const { action } = node.data;
    
    console.log(`[Recording Node] ${action} recording for call ${context.callId}`);
    
    // Emit recording event
    context.eventBus.emit('node.recording', {
      callId: context.callId,
      nodeId: node.id,
      action,
    });
    
    // Log event
    await context.db.logEvent(context.callId, `recording.${action}`, {
      nodeId: node.id,
    });
    
    // The recording service will handle the actual recording control
    // This node just emits the event
    
    // Add system message to conversation history
    context.conversationHistory.push({
      role: 'system',
      text: `Recording ${action}`,
      nodeId: node.id,
      timestamp: new Date(),
    });
    
    // Return the default outcome
    const defaultOutcome = node.data.outcomes?.find(o => o.isDefault);
    return defaultOutcome?.targetNodeId || null;
  }
}
