import { AgentFlow, FlowNode, CallSession, Outcome } from '../../types';
import { createSTTService } from '../services/stt-service';
import { createLLMService } from '../services/llm-service';
import { createTTSService } from '../services/tts-service';
import { SessionManager } from '../websocket/session-manager';
import { logger } from '../utils/logger';

export class FlowExecutor {
  private session: CallSession;
  private flow: AgentFlow;
  private sessionManager: SessionManager;
  
  private sttService = createSTTService('deepgram');
  private llmService = createLLMService('openai');
  private ttsService = createTTSService('cartesia');
  
  private isWaitingForResponse = false;
  private pendingTranscript: string | null = null;
  
  constructor(session: CallSession, flow: AgentFlow, sessionManager: SessionManager) {
    this.session = session;
    this.flow = flow;
    this.sessionManager = sessionManager;
  }
  
  async start(): Promise<void> {
    logger.info(`Starting flow execution for call ${this.session.id}`);
    
    // Find start node
    const startNode = this.flow.nodes.find(n => n.type === 'start');
    
    if (!startNode) {
      throw new Error('No start node found in flow');
    }
    
    await this.executeNode(startNode.id);
  }
  
  async executeNode(nodeId: string): Promise<void> {
    const node = this.flow.nodes.find(n => n.id === nodeId);
    
    if (!node) {
      logger.error(`Node ${nodeId} not found in flow`);
      return;
    }
    
    logger.info(`Executing node ${nodeId} (${node.type}) for call ${this.session.id}`);
    this.session.currentNodeId = nodeId;
    
    switch (node.type) {
      case 'start':
        await this.executeStart(node);
        break;
      case 'message':
        await this.executeMessage(node);
        break;
      case 'question':
        await this.executeQuestion(node);
        break;
      case 'condition':
        await this.executeCondition(node);
        break;
      case 'action':
        await this.executeAction(node);
        break;
      case 'transfer':
        await this.executeTransfer(node);
        break;
      case 'end':
        await this.executeEnd(node);
        break;
      default:
        logger.warn(`Unknown node type: ${node.type}`);
    }
  }
  
  private async executeStart(node: FlowNode): Promise<void> {
    const message = this.renderTemplate(node.data.message || 'Hello!');
    
    await this.speak(message, node.id);
    
    // Move to next node
    const nextNodeId = this.getNextNode(node);
    if (nextNodeId) {
      await this.executeNode(nextNodeId);
    }
  }
  
  private async executeMessage(node: FlowNode): Promise<void> {
    const message = this.renderTemplate(node.data.message || '');
    
    await this.speak(message, node.id);
    
    // Move to next node (no caller input needed)
    const nextNodeId = this.getNextNode(node);
    if (nextNodeId) {
      await this.executeNode(nextNodeId);
    }
  }
  
  private async executeQuestion(node: FlowNode): Promise<void> {
    const message = this.renderTemplate(node.data.message || '');
    
    await this.speak(message, node.id);
    
    // Wait for caller response
    const transcript = await this.waitForCallerResponse();
    
    // Extract variable if configured
    if (node.data.variableName && node.data.extractionInstructions) {
      const value = await this.extractVariable(transcript, node.data.extractionInstructions);
      this.sessionManager.setVariable(this.session.id, node.data.variableName, value);
    }
    
    // Evaluate outcomes
    const nextNodeId = await this.evaluateOutcomes(node, transcript);
    if (nextNodeId) {
      await this.executeNode(nextNodeId);
    }
  }
  
  private async executeCondition(node: FlowNode): Promise<void> {
    // Condition nodes don't speak, they just route based on outcomes
    const nextNodeId = await this.evaluateOutcomes(node, '');
    if (nextNodeId) {
      await this.executeNode(nextNodeId);
    }
  }
  
  private async executeAction(node: FlowNode): Promise<void> {
    logger.info(`Executing action: ${node.data.action?.type}`);
    
    // TODO: Implement action execution (webhooks, CRM lookups, etc.)
    // For now, just move to next node
    
    const nextNodeId = this.getNextNode(node);
    if (nextNodeId) {
      await this.executeNode(nextNodeId);
    }
  }
  
  private async executeTransfer(node: FlowNode): Promise<void> {
    const message = this.renderTemplate(node.data.message || 'Transferring you now.');
    
    await this.speak(message, node.id);
    
    // TODO: Implement actual call transfer via SIP
    logger.info(`Transfer to: ${node.data.transferNumber}`);
    
    // End the session after transfer
    await this.sessionManager.endCall(this.session.id);
  }
  
  private async executeEnd(node: FlowNode): Promise<void> {
    const message = this.renderTemplate(node.data.message || 'Goodbye!');
    
    await this.speak(message, node.id);
    
    // End the session
    await this.sessionManager.endCall(this.session.id);
  }
  
  private async speak(text: string, nodeId: string): Promise<void> {
    logger.info(`Agent speaking: ${text.substring(0, 100)}...`);
    
    // Add to conversation history
    this.sessionManager.addMessage(this.session.id, 'agent', text, nodeId);
    
    // Synthesize speech
    const voiceId = this.flow.settings.defaultVoiceId || 'default';
    
    await this.ttsService.synthesize(text, voiceId, (audioBuffer) => {
      // Send audio to caller via WebSocket
      // This will be implemented when we connect to the WebSocket server
      logger.debug(`Sending ${audioBuffer.length} bytes of audio to caller`);
    });
  }
  
  private async waitForCallerResponse(): Promise<string> {
    logger.info('Waiting for caller response...');
    
    this.isWaitingForResponse = true;
    this.pendingTranscript = null;
    
    // Start STT stream
    const sttConnection = await this.sttService.startStream(
      this.session.id,
      (transcript, isFinal) => {
        if (isFinal && this.isWaitingForResponse) {
          this.pendingTranscript = transcript;
          this.isWaitingForResponse = false;
        }
      }
    );
    
    // Wait for transcript (with timeout)
    const timeout = 30000; // 30 seconds
    const startTime = Date.now();
    
    while (this.isWaitingForResponse && Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Stop STT stream
    this.sttService.stopStream(sttConnection);
    
    const transcript = this.pendingTranscript || '';
    
    if (transcript) {
      logger.info(`Caller said: ${transcript}`);
      this.sessionManager.addMessage(this.session.id, 'caller', transcript);
    } else {
      logger.warn('No response from caller (timeout)');
    }
    
    return transcript;
  }
  
  private async extractVariable(transcript: string, extractionInstructions: string): Promise<any> {
    logger.debug(`Extracting variable from: "${transcript}"`);
    
    const value = await this.llmService.extractVariable(transcript, extractionInstructions);
    
    logger.debug(`Extracted value: ${JSON.stringify(value)}`);
    return value;
  }
  
  private async evaluateOutcomes(node: FlowNode, transcript: string): Promise<string | null> {
    const outcomes = node.data.outcomes || [];
    
    if (outcomes.length === 0) {
      // No outcomes, follow default edge
      return this.getNextNode(node);
    }
    
    logger.debug(`Evaluating ${outcomes.length} outcomes`);
    
    // Check if outcomes are prompt-based or rule-based
    const firstOutcome = outcomes[0];
    
    if (firstOutcome.type === 'prompt') {
      // AI-driven outcome evaluation
      const outcomeLabels = outcomes.map(o => o.label);
      const selectedLabel = await this.llmService.evaluateOutcome(transcript, outcomeLabels);
      
      const outcome = outcomes.find(o => o.label === selectedLabel);
      logger.info(`Selected outcome: ${selectedLabel}`);
      
      return outcome?.targetNodeId || null;
    } else {
      // Rule-based outcome evaluation
      for (const outcome of outcomes) {
        if (this.evaluateRule(outcome.rule || '', this.session.variables)) {
          logger.info(`Matched rule outcome: ${outcome.label}`);
          return outcome.targetNodeId;
        }
      }
      
      // No rule matched, use default
      const defaultOutcome = outcomes.find(o => o.isDefault);
      if (defaultOutcome) {
        logger.info('Using default outcome');
        return defaultOutcome.targetNodeId;
      }
      
      logger.warn('No outcome matched and no default found');
      return null;
    }
  }
  
  private evaluateRule(rule: string, variables: Record<string, any>): boolean {
    if (!rule) return false;
    
    try {
      // Simple rule evaluation
      // Format: "variable_name == value" or "variable_name > value"
      
      const operators = ['==', '!=', '>', '<', '>=', '<='];
      let operator = '';
      let parts: string[] = [];
      
      for (const op of operators) {
        if (rule.includes(op)) {
          operator = op;
          parts = rule.split(op).map(p => p.trim());
          break;
        }
      }
      
      if (parts.length !== 2) {
        logger.warn(`Invalid rule format: ${rule}`);
        return false;
      }
      
      const [varName, expectedValue] = parts;
      const actualValue = variables[varName];
      
      // Convert values for comparison
      const expected = this.parseValue(expectedValue);
      
      switch (operator) {
        case '==':
          return actualValue == expected;
        case '!=':
          return actualValue != expected;
        case '>':
          return Number(actualValue) > Number(expected);
        case '<':
          return Number(actualValue) < Number(expected);
        case '>=':
          return Number(actualValue) >= Number(expected);
        case '<=':
          return Number(actualValue) <= Number(expected);
        default:
          return false;
      }
    } catch (error) {
      logger.error(`Error evaluating rule: ${rule}`, error);
      return false;
    }
  }
  
  private parseValue(value: string): any {
    // Try to parse as number
    if (!isNaN(Number(value))) {
      return Number(value);
    }
    
    // Try to parse as boolean
    if (value === 'true') return true;
    if (value === 'false') return false;
    
    // Remove quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      return value.slice(1, -1);
    }
    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1);
    }
    
    return value;
  }
  
  private getNextNode(node: FlowNode): string | null {
    // Find the edge that starts from this node
    const edge = this.flow.edges.find(e => e.source === node.id);
    return edge?.target || null;
  }
  
  private renderTemplate(template: string): string {
    // Replace {{variable_name}} with actual values
    return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      const value = this.session.variables[varName];
      return value !== undefined ? String(value) : match;
    });
  }
}
