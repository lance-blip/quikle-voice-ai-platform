import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../../drizzle/schema';
import { Database, FlowDefinition, ConversationMessage } from '../core/execution-context';
import { eq } from 'drizzle-orm';

export class DatabaseAdapter implements Database {
  private db: ReturnType<typeof drizzle>;
  
  constructor(connectionString: string) {
    const client = postgres(connectionString);
    this.db = drizzle(client, { schema });
  }
  
  async getFlow(flowId: number): Promise<FlowDefinition | null> {
    // TODO: Implement flow storage in database
    // For now, return null (flows will be passed directly to execution)
    return null;
  }
  
  async createCallSession(data: any): Promise<string> {
    const [session] = await this.db
      .insert(schema.callSessions)
      .values({
        callId: data.callId,
        agentId: data.agentId,
        clientId: data.clientId,
        callerId: data.callerId,
        calledNumber: data.calledNumber,
        status: data.status || 'connecting',
        startTime: data.startTime || new Date(),
        metadata: data.metadata || {},
      })
      .returning();
    
    return session.callId;
  }
  
  async updateCallSession(callId: string, data: any): Promise<void> {
    await this.db
      .update(schema.callSessions)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schema.callSessions.callId, callId));
  }
  
  async addTranscript(callId: string, message: ConversationMessage): Promise<void> {
    // Get call session ID
    const [session] = await this.db
      .select({ id: schema.callSessions.id })
      .from(schema.callSessions)
      .where(eq(schema.callSessions.callId, callId))
      .limit(1);
    
    if (!session) {
      throw new Error(`Call session not found: ${callId}`);
    }
    
    await this.db.insert(schema.callTranscripts).values({
      callSessionId: session.id,
      role: message.role,
      text: message.text,
      nodeId: message.nodeId,
      confidence: message.confidence,
      timestamp: message.timestamp,
    });
  }
  
  async setVariable(callId: string, name: string, value: any): Promise<void> {
    // Get call session ID
    const [session] = await this.db
      .select({ id: schema.callSessions.id })
      .from(schema.callSessions)
      .where(eq(schema.callSessions.callId, callId))
      .limit(1);
    
    if (!session) {
      throw new Error(`Call session not found: ${callId}`);
    }
    
    await this.db.insert(schema.callVariables).values({
      callSessionId: session.id,
      variableName: name,
      variableValue: value,
      extractedAt: new Date(),
    });
  }
  
  async logEvent(callId: string, eventType: string, eventData: any): Promise<void> {
    // Get call session ID
    const [session] = await this.db
      .select({ id: schema.callSessions.id })
      .from(schema.callSessions)
      .where(eq(schema.callSessions.callId, callId))
      .limit(1);
    
    if (!session) {
      throw new Error(`Call session not found: ${callId}`);
    }
    
    await this.db.insert(schema.callEvents).values({
      callSessionId: session.id,
      eventType,
      eventData,
      timestamp: new Date(),
    });
  }
  
  // Additional helper methods
  
  async getCallSession(callId: string) {
    const [session] = await this.db
      .select()
      .from(schema.callSessions)
      .where(eq(schema.callSessions.callId, callId))
      .limit(1);
    
    return session || null;
  }
  
  async getCallTranscripts(callId: string) {
    const [session] = await this.db
      .select({ id: schema.callSessions.id })
      .from(schema.callSessions)
      .where(eq(schema.callSessions.callId, callId))
      .limit(1);
    
    if (!session) {
      return [];
    }
    
    return await this.db
      .select()
      .from(schema.callTranscripts)
      .where(eq(schema.callTranscripts.callSessionId, session.id))
      .orderBy(schema.callTranscripts.timestamp);
  }
  
  async getCallVariables(callId: string) {
    const [session] = await this.db
      .select({ id: schema.callSessions.id })
      .from(schema.callSessions)
      .where(eq(schema.callSessions.callId, callId))
      .limit(1);
    
    if (!session) {
      return [];
    }
    
    return await this.db
      .select()
      .from(schema.callVariables)
      .where(eq(schema.callVariables.callSessionId, session.id))
      .orderBy(schema.callVariables.extractedAt);
  }
  
  async getCallEvents(callId: string) {
    const [session] = await this.db
      .select({ id: schema.callSessions.id })
      .from(schema.callSessions)
      .where(eq(schema.callSessions.callId, callId))
      .limit(1);
    
    if (!session) {
      return [];
    }
    
    return await this.db
      .select()
      .from(schema.callEvents)
      .where(eq(schema.callEvents.callSessionId, session.id))
      .orderBy(schema.callEvents.timestamp);
  }
}
