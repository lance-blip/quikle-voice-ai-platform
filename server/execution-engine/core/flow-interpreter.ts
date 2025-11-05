import { ExecutionContext, FlowNode, FlowDefinition, PreExecutionHook, PostExecutionHook } from './execution-context';
import { eventBus } from './event-bus';
import { NodeExecutor } from '../nodes/node-executor';
import { OutcomesEvaluator } from './outcomes-evaluator';
import { VariableManager } from './variable-manager';

export class FlowInterpreter {
  private context: ExecutionContext;
  private flow: FlowDefinition;
  private nodeExecutor: NodeExecutor;
  private outcomesEvaluator: OutcomesEvaluator;
  private variableManager: VariableManager;
  
  private preExecutionHooks: PreExecutionHook[] = [];
  private postExecutionHooks: PostExecutionHook[] = [];
  
  private isExecuting: boolean = false;
  private isPaused: boolean = false;
  
  constructor(
    context: ExecutionContext,
    flow: FlowDefinition,
    nodeExecutor: NodeExecutor,
    outcomesEvaluator: OutcomesEvaluator,
    variableManager: VariableManager
  ) {
    this.context = context;
    this.flow = flow;
    this.nodeExecutor = nodeExecutor;
    this.outcomesEvaluator = outcomesEvaluator;
    this.variableManager = variableManager;
  }
  
  public addPreExecutionHook(hook: PreExecutionHook): void {
    this.preExecutionHooks.push(hook);
  }
  
  public addPostExecutionHook(hook: PostExecutionHook): void {
    this.postExecutionHooks.push(hook);
  }
  
  public async start(): Promise<void> {
    if (this.isExecuting) {
      throw new Error('Flow is already executing');
    }
    
    this.isExecuting = true;
    
    // Emit flow started event
    eventBus.emitEvent({
      type: 'flow.started',
      callId: this.context.callId,
      timestamp: new Date(),
      data: {
        flowId: this.flow.id,
        flowName: this.flow.name,
      },
    });
    
    try {
      // Find start node
      const startNode = this.flow.nodes.find(n => n.type === 'start');
      
      if (!startNode) {
        throw new Error('No start node found in flow');
      }
      
      // Execute from start node
      await this.executeNode(startNode.id);
      
      // Emit flow completed event
      eventBus.emitEvent({
        type: 'flow.completed',
        callId: this.context.callId,
        timestamp: new Date(),
        data: {
          flowId: this.flow.id,
          duration: Date.now() - this.context.startTime.getTime(),
        },
      });
    } catch (error) {
      // Emit flow error event
      eventBus.emitEvent({
        type: 'flow.error',
        callId: this.context.callId,
        timestamp: new Date(),
        data: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
      
      throw error;
    } finally {
      this.isExecuting = false;
    }
  }
  
  public async executeNode(nodeId: string): Promise<void> {
    // Check if paused
    while (this.isPaused) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    const node = this.flow.nodes.find(n => n.id === nodeId);
    
    if (!node) {
      throw new Error(`Node ${nodeId} not found in flow`);
    }
    
    // Update current node
    this.context.currentNodeId = nodeId;
    
    // Emit node started event
    eventBus.emitEvent({
      type: 'node.started',
      callId: this.context.callId,
      timestamp: new Date(),
      data: {
        nodeId,
        nodeType: node.type,
        nodeLabel: node.data.label,
      },
    });
    
    try {
      // 1. Run pre-execution hooks
      for (const hook of this.preExecutionHooks) {
        await hook(this.context, node);
      }
      
      // 2. Render templates in node data
      const renderedData = this.variableManager.renderTemplates(node.data, this.context.variables);
      const renderedNode = { ...node, data: renderedData };
      
      // 3. Execute node logic
      await this.nodeExecutor.execute(renderedNode, this.context);
      
      // 4. Run post-execution hooks
      for (const hook of this.postExecutionHooks) {
        await hook(this.context, node);
      }
      
      // Emit node completed event
      eventBus.emitEvent({
        type: 'node.completed',
        callId: this.context.callId,
        timestamp: new Date(),
        data: {
          nodeId,
          nodeType: node.type,
        },
      });
      
      // 5. Evaluate outcomes and transition to next node
      const nextNodeId = await this.outcomesEvaluator.evaluate(node, this.context);
      
      if (nextNodeId) {
        await this.executeNode(nextNodeId);
      }
    } catch (error) {
      // Emit node error event
      eventBus.emitEvent({
        type: 'node.error',
        callId: this.context.callId,
        timestamp: new Date(),
        data: {
          nodeId,
          nodeType: node.type,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      
      throw error;
    }
  }
  
  public pause(): void {
    this.isPaused = true;
  }
  
  public resume(): void {
    this.isPaused = false;
  }
  
  public getContext(): ExecutionContext {
    return this.context;
  }
  
  public getFlow(): FlowDefinition {
    return this.flow;
  }
}
