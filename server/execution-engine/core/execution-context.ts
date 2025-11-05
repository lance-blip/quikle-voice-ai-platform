import { ExecutionEventBus } from './event-bus';
import type { Database } from '../db';

export interface ExecutionContext {
  // Identifiers
  callId: string;
  agentId: number;
  clientId: number;
  flowId: number;
  
  // State
  currentNodeId: string;
  variables: Record<string, any>;
  conversationHistory: ConversationMessage[];
  
  // Services
  eventBus: ExecutionEventBus;
  db: Database;
  
  // Metadata
  startTime: Date;
  metadata: Record<string, any>;
  
  // Call center fields (for future use)
  queueId?: number;
  agentGroupId?: number;
  assignedAgentId?: number;
  isRecording?: boolean;
  recordingUrl?: string;
}

export interface ConversationMessage {
  role: 'caller' | 'agent' | 'system';
  text: string;
  nodeId?: string;
  timestamp: Date;
  confidence?: number;
}

export interface FlowDefinition {
  id: number;
  name: string;
  clientId: number;
  nodes: FlowNode[];
  edges: FlowEdge[];
  settings: FlowSettings;
}

export interface FlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: NodeData;
}

export type NodeType =
  | 'start'
  | 'message'
  | 'question'
  | 'condition'
  | 'action'
  | 'transfer'
  | 'end'
  // Future call center node types
  | 'queue'
  | 'park'
  | 'voicemail'
  | 'transfer_to_group'
  | 'announcement';

export interface NodeData {
  label: string;
  message?: string;
  variableName?: string;
  extractionInstructions?: string;
  voiceId?: string;
  outcomes?: Outcome[];
  action?: ActionConfig;
  transferNumber?: string;
  recordCall?: boolean;
  [key: string]: any;
}

export interface Outcome {
  id: string;
  label: string;
  type: 'prompt' | 'rule';
  rule?: string;
  targetNodeId: string;
  isDefault?: boolean;
}

export interface ActionConfig {
  type: ActionType;
  config: Record<string, any>;
}

export type ActionType =
  | 'webhook'
  | 'api_call'
  | 'crm_lookup'
  | 'calendar'
  | 'sms'
  | 'email'
  // Future call center actions
  | 'transfer_to_agent'
  | 'transfer_to_group'
  | 'start_recording'
  | 'stop_recording'
  | 'play_announcement';

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
}

export interface FlowSettings {
  defaultVoiceId: string;
  language: string;
  sttProvider: 'deepgram' | 'assemblyai';
  llmProvider: 'openai' | 'groq' | 'gemini';
  ttsProvider: 'cartesia' | 'elevenlabs';
  systemPrompt?: string;
}

// Hook types
export type PreExecutionHook = (context: ExecutionContext, node: FlowNode) => Promise<void>;
export type PostExecutionHook = (context: ExecutionContext, node: FlowNode) => Promise<void>;

// Database interface (to be implemented)
export interface Database {
  getFlow(flowId: number): Promise<FlowDefinition | null>;
  createCallSession(data: any): Promise<string>;
  updateCallSession(callId: string, data: any): Promise<void>;
  addTranscript(callId: string, message: ConversationMessage): Promise<void>;
  setVariable(callId: string, name: string, value: any): Promise<void>;
  logEvent(callId: string, eventType: string, eventData: any): Promise<void>;
}
