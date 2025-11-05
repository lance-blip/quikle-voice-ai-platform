import type { ExecutionContext, FlowNode } from '../core/execution-context';
import type { NodeHandler } from './node-executor';

/**
 * Announcement Node Handler
 * 
 * Plays an audio announcement during flow execution.
 * Supports pre-recorded files and TTS-generated messages.
 */
export class AnnouncementNodeHandler implements NodeHandler {
  async execute(context: ExecutionContext, node: FlowNode): Promise<string | null> {
    const { announcementId, audioUrl, ttsText, voiceId } = node.data;
    
    console.log(`[Announcement Node] Playing announcement for call ${context.callId}`);
    
    // Emit announcement event
    context.eventBus.emit('node.announcement', {
      callId: context.callId,
      nodeId: node.id,
      announcementId,
      audioUrl,
      ttsText,
    });
    
    // Log event
    await context.db.logEvent(context.callId, 'node.announcement', {
      nodeId: node.id,
      announcementId,
      audioUrl,
      ttsText,
    });
    
    // The announcement service will handle the actual playback
    // This node just emits the event
    
    // Add system message to conversation history
    context.conversationHistory.push({
      role: 'system',
      text: ttsText || `Announcement played: ${announcementId}`,
      nodeId: node.id,
      timestamp: new Date(),
    });
    
    // Return the default outcome
    const defaultOutcome = node.data.outcomes?.find(o => o.isDefault);
    return defaultOutcome?.targetNodeId || null;
  }
}
