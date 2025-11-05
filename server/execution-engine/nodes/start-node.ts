import { INodeHandler } from './node-executor';
import { ExecutionContext, FlowNode } from '../core/execution-context';

export class StartNode implements INodeHandler {
  async execute(node: FlowNode, context: ExecutionContext): Promise<void> {
    // Start node just marks the beginning of the flow
    // It can optionally play a greeting message
    
    if (node.data.message) {
      // Add greeting to conversation history
      context.conversationHistory.push({
        role: 'agent',
        text: node.data.message,
        nodeId: node.id,
        timestamp: new Date(),
      });
      
      // Persist to database
      await context.db.addTranscript(context.callId, {
        role: 'agent',
        text: node.data.message,
        nodeId: node.id,
        timestamp: new Date(),
      });
    }
    
    console.log(`[Start Node] Flow started: ${node.data.label}`);
  }
}
