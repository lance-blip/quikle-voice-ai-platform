import { ExecutionContext, FlowDefinition, Database, ConversationMessage } from './execution-context';
import { FlowInterpreter } from './flow-interpreter';
import { NodeExecutor } from '../nodes/node-executor';
import { OutcomesEvaluator } from './outcomes-evaluator';
import { VariableManager } from './variable-manager';
import { eventBus } from './event-bus';

export class ExecutionOrchestrator {
  private activeExecutions: Map<string, FlowInterpreter> = new Map();
  
  constructor(
    private db: Database,
    private voiceService: any,
    private llmService: any,
    private actionsService: any
  ) {}
  
  /**
   * Starts execution of an agent flow for a call
   */
  public async startExecution(
    callId: string,
    agentId: number,
    clientId: number,
    flowId: number,
    callerMetadata?: {
      callerId?: string;
      calledNumber?: string;
      [key: string]: any;
    }
  ): Promise<void> {
    // Check if execution is already running
    if (this.activeExecutions.has(callId)) {
      throw new Error(`Execution already running for call ${callId}`);
    }
    
    // Load flow from database
    const flow = await this.db.getFlow(flowId);
    
    if (!flow) {
      throw new Error(`Flow ${flowId} not found`);
    }
    
    // Create call session in database
    await this.db.createCallSession({
      callId,
      agentId,
      clientId,
      callerId: callerMetadata?.callerId,
      calledNumber: callerMetadata?.calledNumber,
      status: 'active',
      startTime: new Date(),
      metadata: callerMetadata || {},
    });
    
    // Create execution context
    const context: ExecutionContext = {
      callId,
      agentId,
      clientId,
      flowId,
      currentNodeId: '',
      variables: {},
      conversationHistory: [],
      eventBus,
      db: this.db,
      startTime: new Date(),
      metadata: {
        defaultVoiceId: flow.settings.defaultVoiceId,
        language: flow.settings.language,
        ...callerMetadata,
      },
    };
    
    // Create components
    const variableManager = new VariableManager();
    const outcomesEvaluator = new OutcomesEvaluator(flow.edges, this.llmService);
    const nodeExecutor = new NodeExecutor(this.voiceService, this.llmService, this.actionsService);
    
    // Create flow interpreter
    const interpreter = new FlowInterpreter(
      context,
      flow,
      nodeExecutor,
      outcomesEvaluator,
      variableManager
    );
    
    // Store active execution
    this.activeExecutions.set(callId, interpreter);
    
    // Emit call started event
    eventBus.emitEvent({
      type: 'call.started',
      callId,
      timestamp: new Date(),
      data: {
        agentId,
        clientId,
        flowId,
        flowName: flow.name,
      },
    });
    
    try {
      // Start execution
      await interpreter.start();
    } catch (error) {
      console.error(`Error executing flow for call ${callId}:`, error);
      throw error;
    } finally {
      // Remove from active executions
      this.activeExecutions.delete(callId);
    }
  }
  
  /**
   * Pauses execution of a call
   */
  public pauseExecution(callId: string): void {
    const interpreter = this.activeExecutions.get(callId);
    
    if (!interpreter) {
      throw new Error(`No active execution found for call ${callId}`);
    }
    
    interpreter.pause();
  }
  
  /**
   * Resumes execution of a call
   */
  public resumeExecution(callId: string): void {
    const interpreter = this.activeExecutions.get(callId);
    
    if (!interpreter) {
      throw new Error(`No active execution found for call ${callId}`);
    }
    
    interpreter.resume();
  }
  
  /**
   * Ends execution of a call
   */
  public async endExecution(callId: string): Promise<void> {
    const interpreter = this.activeExecutions.get(callId);
    
    if (!interpreter) {
      throw new Error(`No active execution found for call ${callId}`);
    }
    
    // Update call session
    await this.db.updateCallSession(callId, {
      status: 'ended',
      endTime: new Date(),
    });
    
    // Remove from active executions
    this.activeExecutions.delete(callId);
    
    // Emit call ended event
    eventBus.emitEvent({
      type: 'call.ended',
      callId,
      timestamp: new Date(),
      data: {},
    });
  }
  
  /**
   * Transfers execution to a different agent flow
   */
  public async transferExecution(callId: string, targetFlowId: number): Promise<void> {
    const interpreter = this.activeExecutions.get(callId);
    
    if (!interpreter) {
      throw new Error(`No active execution found for call ${callId}`);
    }
    
    const context = interpreter.getContext();
    
    // End current execution
    await this.endExecution(callId);
    
    // Start new execution with same call ID
    await this.startExecution(
      callId,
      context.agentId,
      context.clientId,
      targetFlowId,
      context.metadata
    );
  }
  
  /**
   * Gets the execution context for a call
   */
  public getExecutionContext(callId: string): ExecutionContext | null {
    const interpreter = this.activeExecutions.get(callId);
    return interpreter ? interpreter.getContext() : null;
  }
  
  /**
   * Checks if a call has an active execution
   */
  public hasActiveExecution(callId: string): boolean {
    return this.activeExecutions.has(callId);
  }
  
  /**
   * Gets the number of active executions
   */
  public getActiveExecutionCount(): number {
    return this.activeExecutions.size;
  }
}
