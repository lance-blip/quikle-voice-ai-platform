import { WebSocket } from 'ws';
import { CallSession } from '../../types';
import { logger } from '../utils/logger';
import { v4 as uuidv4 } from 'uuid';

export class SessionManager {
  private sessions: Map<string, CallSession> = new Map();
  private connections: Map<string, WebSocket> = new Map();
  
  public async startCall(callId: string, data: any): Promise<CallSession> {
    logger.info(`Starting call session: ${callId}`);
    
    const session: CallSession = {
      id: callId,
      agentId: data.agentId,
      clientId: data.clientId,
      callerId: data.callerId || 'unknown',
      calledNumber: data.calledNumber || 'unknown',
      status: 'connecting',
      startTime: new Date(),
      currentNodeId: 'start', // Will be updated when flow loads
      variables: {},
      conversationHistory: [],
      incomingAudioBuffer: [],
      outgoingAudioBuffer: [],
      metadata: {
        sttProvider: data.sttProvider || 'deepgram',
        llmProvider: data.llmProvider || 'openai',
        ttsProvider: data.ttsProvider || 'cartesia',
        voiceId: data.voiceId || 'default',
        language: data.language || 'en-US',
      },
    };
    
    this.sessions.set(callId, session);
    
    // Update status to active
    session.status = 'active';
    
    logger.info(`Call session started: ${callId}`, {
      agentId: session.agentId,
      clientId: session.clientId,
    });
    
    return session;
  }
  
  public async endCall(callId: string): Promise<void> {
    const session = this.sessions.get(callId);
    
    if (!session) {
      logger.warn(`Cannot end call ${callId}: session not found`);
      return;
    }
    
    session.status = 'ended';
    session.endTime = new Date();
    
    logger.info(`Call session ended: ${callId}`, {
      duration: session.endTime.getTime() - session.startTime.getTime(),
      messageCount: session.conversationHistory.length,
    });
    
    // Save to database
    // TODO: Implement database persistence
    
    // Clean up after a delay (keep for debugging)
    setTimeout(() => {
      this.sessions.delete(callId);
      this.connections.delete(callId);
    }, 60000); // Keep for 1 minute
  }
  
  public getSession(callId: string): CallSession | undefined {
    return this.sessions.get(callId);
  }
  
  public updateSession(callId: string, updates: Partial<CallSession>): void {
    const session = this.sessions.get(callId);
    
    if (!session) {
      logger.warn(`Cannot update session ${callId}: not found`);
      return;
    }
    
    Object.assign(session, updates);
  }
  
  public addMessage(callId: string, role: 'caller' | 'agent' | 'system', text: string, nodeId?: string): void {
    const session = this.sessions.get(callId);
    
    if (!session) {
      logger.warn(`Cannot add message to session ${callId}: not found`);
      return;
    }
    
    session.conversationHistory.push({
      role,
      text,
      timestamp: new Date(),
      nodeId,
    });
  }
  
  public setVariable(callId: string, name: string, value: any): void {
    const session = this.sessions.get(callId);
    
    if (!session) {
      logger.warn(`Cannot set variable for session ${callId}: not found`);
      return;
    }
    
    session.variables[name] = value;
    logger.debug(`Variable set for call ${callId}: ${name} = ${JSON.stringify(value)}`);
  }
  
  public getVariable(callId: string, name: string): any {
    const session = this.sessions.get(callId);
    return session?.variables[name];
  }
  
  public registerConnection(callId: string, ws: WebSocket): void {
    this.connections.set(callId, ws);
  }
  
  public unregisterConnection(callId: string): void {
    this.connections.delete(callId);
  }
  
  public getConnection(callId: string): WebSocket | undefined {
    return this.connections.get(callId);
  }
  
  public getAllActiveSessions(): CallSession[] {
    return Array.from(this.sessions.values()).filter(s => s.status === 'active');
  }
  
  public getSessionCount(): number {
    return this.sessions.size;
  }
}
