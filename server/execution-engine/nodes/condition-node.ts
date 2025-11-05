import { INodeHandler } from './node-executor';
import { ExecutionContext, FlowNode } from '../core/execution-context';

export class ConditionNode implements INodeHandler {
  async execute(node: FlowNode, context: ExecutionContext): Promise<void> {
    // Condition node doesn't do anything itself
    // The outcomes evaluator handles the branching logic
    console.log(`[Condition Node] Evaluating condition: ${node.data.label}`);
  }
}
