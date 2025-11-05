export interface CallSession {
    id: string;
    agentId: number;
    clientId: number;
    callerId: string;
    calledNumber: string;
    status: 'connecting' | 'active' | 'ended';
    startTime: Date;
    endTime?: Date;
    currentNodeId: string;
    variables: Record<string, any>;
    conversationHistory: Message[];
    sttConnection?: any;
    ttsConnection?: any;
    incomingAudioBuffer: Buffer[];
    outgoingAudioBuffer: Buffer[];
    metadata: {
        sttProvider: string;
        llmProvider: string;
        ttsProvider: string;
        voiceId: string;
        language: string;
    };
}
export interface Message {
    role: 'caller' | 'agent' | 'system';
    text: string;
    timestamp: Date;
    nodeId?: string;
    confidence?: number;
}
export interface AudioFormat {
    sampleRate: number;
    channels: number;
    bitDepth: number;
    encoding: 'pcm_s16le' | 'pcm_f32le' | 'opus' | 'mulaw';
}
export interface WebSocketMessage {
    type: 'audio' | 'event' | 'control';
    callId: string;
    data?: any;
    format?: AudioFormat;
    event?: string;
}
export interface AgentFlow {
    id: number;
    name: string;
    clientId: number;
    nodes: FlowNode[];
    edges: FlowEdge[];
    settings: FlowSettings;
}
export interface FlowNode {
    id: string;
    type: 'start' | 'message' | 'question' | 'condition' | 'action' | 'transfer' | 'end';
    position: {
        x: number;
        y: number;
    };
    data: NodeData;
}
export interface NodeData {
    label: string;
    message?: string;
    variableName?: string;
    extractionInstructions?: string;
    voiceId?: string;
    outcomes?: Outcome[];
    action?: ActionConfig;
    transferNumber?: string;
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
    type: 'webhook' | 'crm_lookup' | 'calendar' | 'sms' | 'email';
    config: Record<string, any>;
}
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
export interface STTProvider {
    startStream(callId: string, onTranscript: TranscriptCallback): Promise<any>;
    sendAudio(connection: any, audioBuffer: Buffer): void;
    stopStream(connection: any): void;
}
export interface LLMProvider {
    generateResponse(systemPrompt: string, conversationHistory: Message[], currentNodePrompt: string): Promise<string>;
    evaluateOutcome(transcript: string, outcomes: string[]): Promise<string>;
    extractVariable(transcript: string, extractionInstructions: string): Promise<any>;
}
export interface TTSProvider {
    synthesize(text: string, voiceId: string, onAudio: AudioCallback): Promise<void>;
    synthesizeStream(text: string, voiceId: string): Promise<ReadableStream>;
}
export type TranscriptCallback = (text: string, isFinal: boolean) => void;
export type AudioCallback = (audioBuffer: Buffer) => void;
export interface VoicePipelineConfig {
    port: number;
    databaseUrl: string;
    deepgramApiKey: string;
    openaiApiKey: string;
    openaiBaseUrl: string;
    cartesiaApiKey: string;
    freeswitchEslHost: string;
    freeswitchEslPort: number;
    freeswitchEslPassword: string;
    saicomSipDomain: string;
    saicomUsername: string;
    saicomPassword: string;
    logLevel: string;
}
//# sourceMappingURL=index.d.ts.map