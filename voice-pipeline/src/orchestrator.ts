import { CallSession, AgentFlow } from '../types';
import { SessionManager } from './websocket/session-manager';
import { FlowExecutor } from './flow-executor/executor';
import { logger } from './utils/logger';

export class VoicePipelineOrchestrator {
  private sessionManager: SessionManager;
  private activeExecutors: Map<string, FlowExecutor> = new Map();
  
  constructor(sessionManager: SessionManager) {
    this.sessionManager = sessionManager;
  }
  
  async startCall(callId: string, agentId: number, clientId: number, callData: any): Promise<void> {
    logger.info(`Orchestrator: Starting call ${callId} with agent ${agentId}`);
    
    try {
      // Create session
      const session = await this.sessionManager.startCall(callId, {
        agentId,
        clientId,
        ...callData,
      });
      
      // Load agent flow from database
      const flow = await this.loadAgentFlow(agentId);
      
      if (!flow) {
        throw new Error(`Agent flow not found for agent ${agentId}`);
      }
      
      // Create flow executor
      const executor = new FlowExecutor(session, flow, this.sessionManager);
      this.activeExecutors.set(callId, executor);
      
      // Start execution
      await executor.start();
      
      logger.info(`Orchestrator: Call ${callId} started successfully`);
    } catch (error) {
      logger.error(`Orchestrator: Error starting call ${callId}:`, error);
      await this.sessionManager.endCall(callId);
      throw error;
    }
  }
  
  async endCall(callId: string): Promise<void> {
    logger.info(`Orchestrator: Ending call ${callId}`);
    
    // Remove executor
    this.activeExecutors.delete(callId);
    
    // End session
    await this.sessionManager.endCall(callId);
  }
  
  async handleIncomingAudio(callId: string, audioBuffer: Buffer): Promise<void> {
    const executor = this.activeExecutors.get(callId);
    
    if (!executor) {
      logger.warn(`Orchestrator: No executor found for call ${callId}`);
      return;
    }
    
    // Forward audio to STT service via executor
    // The executor manages the STT connection
    logger.debug(`Orchestrator: Received ${audioBuffer.length} bytes for call ${callId}`);
  }
  
  private async loadAgentFlow(agentId: number): Promise<AgentFlow | null> {
    // TODO: Load from database
    // For now, return a mock flow for testing
    
    logger.info(`Loading agent flow for agent ${agentId}`);
    
    return {
      id: agentId,
      name: 'Test Agent',
      clientId: 1,
      nodes: [
        {
          id: 'start',
          type: 'start',
          position: { x: 0, y: 0 },
          data: {
            label: 'Start',
            message: 'Hello! Thank you for calling. How can I help you today?',
          },
        },
        {
          id: 'question1',
          type: 'question',
          position: { x: 200, y: 0 },
          data: {
            label: 'Ask Name',
            message: 'May I have your name please?',
            variableName: 'caller_name',
            extractionInstructions: 'Extract the caller\'s first name from their response.',
            outcomes: [
              {
                id: 'outcome1',
                label: 'Name provided',
                type: 'prompt',
                targetNodeId: 'message1',
              },
            ],
          },
        },
        {
          id: 'message1',
          type: 'message',
          position: { x: 400, y: 0 },
          data: {
            label: 'Greet by Name',
            message: 'Nice to meet you, {{caller_name}}! Is there anything else I can help you with?',
          },
        },
        {
          id: 'end',
          type: 'end',
          position: { x: 600, y: 0 },
          data: {
            label: 'End',
            message: 'Thank you for calling. Have a great day!',
          },
        },
      ],
      edges: [
        { id: 'e1', source: 'start', target: 'question1' },
        { id: 'e2', source: 'question1', target: 'message1' },
        { id: 'e3', source: 'message1', target: 'end' },
      ],
      settings: {
        defaultVoiceId: 'default',
        language: 'en-US',
        sttProvider: 'deepgram',
        llmProvider: 'openai',
        ttsProvider: 'cartesia',
        systemPrompt: 'You are a helpful and friendly customer service agent.',
      },
    };
  }
  
  getActiveCallCount(): number {
    return this.activeExecutors.size;
  }
  
  getActiveCalls(): string[] {
    return Array.from(this.activeExecutors.keys());
  }
}
