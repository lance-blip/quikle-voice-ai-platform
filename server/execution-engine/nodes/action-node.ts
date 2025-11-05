import { INodeHandler } from './node-executor';
import { ExecutionContext, FlowNode } from '../core/execution-context';
import { eventBus } from '../core/event-bus';

export class ActionNode implements INodeHandler {
  constructor(private actionsService: any) {}
  
  async execute(node: FlowNode, context: ExecutionContext): Promise<void> {
    const action = node.data.action;
    
    if (!action) {
      console.warn(`[Action Node] No action defined for node ${node.id}`);
      return;
    }
    
    // Emit action started event
    eventBus.emitEvent({
      type: 'action.started',
      callId: context.callId,
      timestamp: new Date(),
      data: {
        nodeId: node.id,
        actionType: action.type,
      },
    });
    
    try {
      // Execute the action
      const result = await this.actionsService.execute(action.type, action.config, context);
      
      // Store result in variables if specified
      if (node.data.resultVariableName) {
        context.variables[node.data.resultVariableName] = result;
        await context.db.setVariable(context.callId, node.data.resultVariableName, result);
      }
      
      // Emit action completed event
      eventBus.emitEvent({
        type: 'action.completed',
        callId: context.callId,
        timestamp: new Date(),
        data: {
          nodeId: node.id,
          actionType: action.type,
          result,
        },
      });
      
      console.log(`[Action Node] Executed action: ${action.type}`);
    } catch (error) {
      // Emit action error event
      eventBus.emitEvent({
        type: 'action.error',
        callId: context.callId,
        timestamp: new Date(),
        data: {
          nodeId: node.id,
          actionType: action.type,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      
      throw error;
    }
  }
}
