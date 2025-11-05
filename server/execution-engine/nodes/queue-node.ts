import type { ExecutionContext, FlowNode } from '../core/execution-context';
import type { NodeHandler } from './node-executor';

/**
 * Queue Node Handler
 * 
 * Adds a call to a queue when all agents are busy.
 * Plays hold music and position announcements while waiting.
 */
export class QueueNodeHandler implements NodeHandler {
  async execute(context: ExecutionContext, node: FlowNode): Promise<string | null> {
    const { queueId, holdMusicUrl, announcePosition } = node.data;
    
    if (!queueId) {
      console.error('[Queue Node] No queue ID specified');
      return null;
    }
    
    console.log(`[Queue Node] Adding call ${context.callId} to queue ${queueId}`);
    
    // Emit queue event
    context.eventBus.emit('node.queue', {
      callId: context.callId,
      nodeId: node.id,
      queueId,
    });
    
    // Update call session status
    await context.db.updateCallSession(context.callId, {
      status: 'queued',
      queueId,
    });
    
    // Log event
    await context.db.logEvent(context.callId, 'node.queue', {
      nodeId: node.id,
      queueId,
    });
    
    // The queue manager will handle the actual queueing logic
    // This node just marks the call as queued and waits for assignment
    
    // Return null to indicate the flow should pause here
    // The execution will resume when the call is dequeued
    return null;
  }
}
