import { ExecutionContext, FlowNode, NodeType } from '../core/execution-context';
import { StartNode } from './start-node';
import { MessageNode } from './message-node';
import { QuestionNode } from './question-node';
import { ConditionNode } from './condition-node';
import { ActionNode } from './action-node';
import { TransferNode } from './transfer-node';
import { EndNode } from './end-node';

export interface INodeHandler {
  execute(node: FlowNode, context: ExecutionContext): Promise<void>;
}

export class NodeExecutor {
  private handlers: Map<NodeType, INodeHandler>;
  
  constructor(
    private voiceService: any, // TODO: Type properly
    private llmService: any,
    private actionsService: any
  ) {
    this.handlers = new Map();
    this.registerDefaultHandlers();
  }
  
  private registerDefaultHandlers(): void {
    this.handlers.set('start', new StartNode());
    this.handlers.set('message', new MessageNode(this.voiceService));
    this.handlers.set('question', new QuestionNode(this.voiceService, this.llmService));
    this.handlers.set('condition', new ConditionNode());
    this.handlers.set('action', new ActionNode(this.actionsService));
    this.handlers.set('transfer', new TransferNode(this.voiceService));
    this.handlers.set('end', new EndNode(this.voiceService));
  }
  
  public registerHandler(nodeType: NodeType, handler: INodeHandler): void {
    this.handlers.set(nodeType, handler);
  }
  
  public async execute(node: FlowNode, context: ExecutionContext): Promise<void> {
    const handler = this.handlers.get(node.type);
    
    if (!handler) {
      throw new Error(`No handler registered for node type: ${node.type}`);
    }
    
    await handler.execute(node, context);
  }
}
