# Voice Pipeline Architecture Design

## Overview

This document outlines the architecture for the VoiceForge real-time voice pipeline, designed to handle bidirectional voice conversations with sub-200ms latency using Saicom as the primary carrier.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CALLER (PSTN/Mobile)                     │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ SIP/RTP
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SAICOM SIP TRUNK                            │
│  • 95ms latency                                                  │
│  • R0.35/min cost                                                │
│  • 99.9% uptime                                                  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ SIP/RTP
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SIP SERVER (FreeSWITCH/Asterisk)              │
│  • Call routing                                                  │
│  • Media handling                                                │
│  • DTMF detection                                                │
│  • Call recording                                                │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ WebSocket (Audio Streams)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VOICE PIPELINE ORCHESTRATOR                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              WebSocket Server (Node.js)                  │   │
│  │  • Bidirectional audio streaming                         │   │
│  │  • Session management                                    │   │
│  │  • State tracking                                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                    │
│         ┌───────────────────┼───────────────────┐               │
│         ▼                   ▼                   ▼               │
│  ┌──────────┐        ┌──────────┐        ┌──────────┐          │
│  │   STT    │        │   LLM    │        │   TTS    │          │
│  │ Provider │        │ Provider │        │ Provider │          │
│  └──────────┘        └──────────┘        └──────────┘          │
│         │                   │                   │               │
│         └───────────────────┴───────────────────┘               │
│                             │                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Flow Execution Engine                       │   │
│  │  • Agent flow interpreter                                │   │
│  │  • Variable management                                   │   │
│  │  • Outcome evaluation                                    │   │
│  │  • Action execution                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             │ tRPC/HTTP
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VOICEFORGE BACKEND                            │
│  • Agent configuration                                           │
│  • Call logs                                                     │
│  • Transcripts                                                   │
│  • Analytics                                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. SIP Server Layer

**Technology Options:**
- **FreeSWITCH** (Recommended) - Production-grade, WebRTC support, extensive SIP features
- **Asterisk** - Alternative, mature, large community
- **Kamailio** - Lightweight, high-performance SIP proxy

**Responsibilities:**
- Accept incoming SIP calls from Saicom trunk
- Initiate outbound SIP calls to Saicom trunk
- Handle SIP signaling (INVITE, ACK, BYE, CANCEL)
- Manage RTP audio streams
- Detect DTMF tones (for IVR fallback)
- Record calls (optional, for compliance/training)
- Provide call metrics (duration, quality, codec)

**Configuration:**
```xml
<!-- FreeSWITCH SIP Profile for Saicom -->
<profile name="saicom">
  <gateways>
    <gateway name="saicom_trunk">
      <param name="realm" value="sip.saicom.io"/>
      <param name="username" value="${SAICOM_USERNAME}"/>
      <param name="password" value="${SAICOM_PASSWORD}"/>
      <param name="register" value="true"/>
      <param name="register-transport" value="udp"/>
      <param name="retry-seconds" value="30"/>
    </gateway>
  </gateways>
</profile>
```

**Integration with Pipeline:**
- Forward audio to WebSocket server in real-time
- Receive audio from WebSocket server for playback
- Use Event Socket Layer (ESL) for call control

---

### 2. WebSocket Server (Voice Pipeline Orchestrator)

**Technology Stack:**
- **Runtime:** Node.js (TypeScript)
- **Framework:** Express + ws (WebSocket library)
- **Audio Processing:** node-opus (Opus codec), pcm-convert (format conversion)

**Responsibilities:**
- Accept WebSocket connections from SIP server
- Manage call sessions (create, update, terminate)
- Stream audio to STT provider
- Receive text from STT provider
- Send text to LLM provider
- Receive response from LLM provider
- Send text to TTS provider
- Receive audio from TTS provider
- Stream audio back to SIP server
- Track conversation state (current node, variables, history)
- Execute agent flow logic
- Log all events for debugging and analytics

**Session State:**
```typescript
interface CallSession {
  id: string;                    // Unique call ID
  agentId: number;               // Agent being used
  clientId: number;              // Client (tenant) ID
  callerId: string;              // Caller's phone number
  status: 'connecting' | 'active' | 'ended';
  startTime: Date;
  endTime?: Date;
  
  // Flow execution state
  currentNodeId: string;         // Current node in flow
  variables: Record<string, any>; // Extracted variables
  conversationHistory: Message[]; // Full transcript
  
  // Provider connections
  sttStream?: any;               // STT streaming session
  ttsStream?: any;               // TTS streaming session
  
  // Audio buffers
  incomingAudioBuffer: Buffer[]; // From caller
  outgoingAudioBuffer: Buffer[]; // To caller
}

interface Message {
  role: 'caller' | 'agent';
  text: string;
  timestamp: Date;
  nodeId?: string;               // Which node generated this
}
```

**WebSocket Protocol:**
```typescript
// Client → Server (SIP server sends audio)
{
  type: 'audio',
  callId: string,
  data: Buffer,        // Raw PCM audio
  format: {
    sampleRate: 16000,
    channels: 1,
    bitDepth: 16
  }
}

// Server → Client (Pipeline sends audio)
{
  type: 'audio',
  callId: string,
  data: Buffer,        // Raw PCM audio
  format: {
    sampleRate: 16000,
    channels: 1,
    bitDepth: 16
  }
}

// Server → Client (Events)
{
  type: 'event',
  callId: string,
  event: 'transcription' | 'response' | 'node_change' | 'variable_update',
  data: any
}
```

---

### 3. STT Provider Integration

**Provider Options:**
- **Deepgram** (Recommended) - 300ms latency, 95% accuracy, WebSocket streaming, $0.0043/min
- **AssemblyAI** - 400ms latency, 94% accuracy, WebSocket streaming, $0.00025/sec
- **Azure Speech** - 500ms latency, 94% accuracy, WebSocket streaming, $1/hour
- **Google Speech-to-Text** - 600ms latency, 95% accuracy, gRPC streaming, $0.006/15sec

**Recommendation:** Deepgram for lowest latency and best real-time performance.

**Integration:**
```typescript
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

class STTService {
  private deepgram = createClient(process.env.DEEPGRAM_API_KEY!);
  
  async startStream(callId: string, onTranscript: (text: string, isFinal: boolean) => void) {
    const connection = this.deepgram.listen.live({
      model: 'nova-2',
      language: 'en-US',
      smart_format: true,
      interim_results: true,
      endpointing: 300,  // ms of silence before finalizing
      vad_events: true,   // Voice Activity Detection
    });
    
    connection.on(LiveTranscriptionEvents.Transcript, (data) => {
      const transcript = data.channel.alternatives[0].transcript;
      const isFinal = data.is_final;
      
      if (transcript && transcript.trim().length > 0) {
        onTranscript(transcript, isFinal);
      }
    });
    
    return connection;
  }
  
  sendAudio(connection: any, audioBuffer: Buffer) {
    connection.send(audioBuffer);
  }
}
```

**Features:**
- Real-time streaming transcription
- Interim results (show partial transcripts)
- Voice Activity Detection (VAD) - detect when caller stops speaking
- Endpointing - automatically finalize transcript after silence
- Punctuation and formatting
- Multi-language support

---

### 4. LLM Provider Integration

**Provider Options:**
- **OpenAI GPT-4o-mini** - 200ms latency, best reasoning, $0.15/1M input tokens
- **Anthropic Claude 3.5 Haiku** - 180ms latency, fast, $0.25/1M input tokens
- **Gemini 2.0 Flash** - 150ms latency, fastest, $0.075/1M input tokens
- **Groq (Llama 3.1)** - 100ms latency, ultra-fast, $0.05/1M input tokens

**Recommendation:** Groq for lowest latency, fallback to Gemini 2.0 Flash for complex reasoning.

**Integration:**
```typescript
import OpenAI from 'openai';

class LLMService {
  private client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL, // Can point to Groq, Gemini, etc.
  });
  
  async generateResponse(
    systemPrompt: string,
    conversationHistory: Message[],
    currentNodePrompt: string
  ): Promise<string> {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'caller' ? 'user' : 'assistant',
        content: msg.text
      })),
      { role: 'system', content: currentNodePrompt }
    ];
    
    const response = await this.client.chat.completions.create({
      model: 'gpt-4.1-mini', // or 'gemini-2.5-flash'
      messages,
      temperature: 0.7,
      max_tokens: 150,
      stream: false, // Use streaming for lower perceived latency
    });
    
    return response.choices[0].message.content || '';
  }
  
  async evaluateOutcome(
    transcript: string,
    outcomes: string[]
  ): Promise<string> {
    const prompt = `Based on the caller's response: "${transcript}"
    
Which of these outcomes best matches their intent?
${outcomes.map((o, i) => `${i + 1}. ${o}`).join('\n')}

Respond with only the number (1-${outcomes.length}).`;
    
    const response = await this.client.chat.completions.create({
      model: 'gpt-4.1-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 5,
    });
    
    const choice = parseInt(response.choices[0].message.content || '1');
    return outcomes[choice - 1] || outcomes[0];
  }
}
```

**Features:**
- Streaming responses (lower perceived latency)
- Conversation context management
- Outcome evaluation (AI-driven routing)
- Variable extraction (AI-powered)
- Prompt templating

---

### 5. TTS Provider Integration

**Provider Options:**
- **ElevenLabs** - 250ms latency, most natural, $0.30/1K chars, WebSocket streaming
- **Cartesia** - 200ms latency, very natural, $0.05/1K chars, WebSocket streaming
- **PlayHT** - 300ms latency, natural, $0.10/1K chars, WebSocket streaming
- **Azure Speech** - 400ms latency, good, $4/1M chars, WebSocket streaming
- **Google TTS** - 500ms latency, good, $4/1M chars, HTTP only

**Recommendation:** Cartesia for best latency/cost balance, ElevenLabs for premium quality.

**Integration:**
```typescript
import Cartesia from '@cartesia/cartesia-js';

class TTSService {
  private client = new Cartesia({
    apiKey: process.env.CARTESIA_API_KEY!
  });
  
  async synthesize(
    text: string,
    voiceId: string,
    onAudio: (audioBuffer: Buffer) => void
  ) {
    const response = await this.client.tts.bytes({
      model_id: 'sonic-english',
      voice: { id: voiceId },
      transcript: text,
      output_format: {
        container: 'raw',
        encoding: 'pcm_s16le',
        sample_rate: 16000,
      },
    });
    
    // Stream audio chunks as they arrive
    for await (const chunk of response) {
      onAudio(Buffer.from(chunk));
    }
  }
  
  async synthesizeStream(
    text: string,
    voiceId: string
  ): Promise<ReadableStream> {
    // For WebSocket streaming
    const ws = await this.client.tts.websocket({
      model_id: 'sonic-english',
      voice: { id: voiceId },
      output_format: {
        container: 'raw',
        encoding: 'pcm_s16le',
        sample_rate: 16000,
      },
    });
    
    ws.send({ text });
    return ws.stream();
  }
}
```

**Features:**
- Streaming synthesis (start playing before full text is synthesized)
- Voice cloning (custom voices)
- Emotion control (happy, sad, neutral)
- Speed control
- SSML support (pronunciation, pauses)

---

### 6. Flow Execution Engine

**Responsibilities:**
- Load agent flow from database
- Interpret flow structure (nodes, edges, outcomes)
- Track current position in flow
- Evaluate outcomes (AI-driven or rule-based)
- Extract variables from conversation
- Execute actions (API calls, webhooks)
- Handle errors and retries
- Log execution trace

**Core Logic:**
```typescript
class FlowExecutor {
  private session: CallSession;
  private flow: AgentFlow;
  
  async executeNode(nodeId: string) {
    const node = this.flow.nodes.find(n => n.id === nodeId);
    if (!node) throw new Error(`Node ${nodeId} not found`);
    
    this.session.currentNodeId = nodeId;
    
    switch (node.type) {
      case 'start':
        return this.executeStart(node);
      case 'message':
        return this.executeMessage(node);
      case 'question':
        return this.executeQuestion(node);
      case 'condition':
        return this.executeCondition(node);
      case 'action':
        return this.executeAction(node);
      case 'end':
        return this.executeEnd(node);
    }
  }
  
  async executeMessage(node: MessageNode) {
    // Render message with variables
    const text = this.renderTemplate(node.data.message, this.session.variables);
    
    // Synthesize and play
    await this.ttsService.synthesize(text, node.data.voiceId, (audio) => {
      this.sendAudioToCaller(audio);
    });
    
    // Move to next node (no caller input needed)
    const nextNodeId = this.getNextNode(node);
    if (nextNodeId) {
      await this.executeNode(nextNodeId);
    }
  }
  
  async executeQuestion(node: QuestionNode) {
    // Ask question
    const text = this.renderTemplate(node.data.message, this.session.variables);
    await this.ttsService.synthesize(text, node.data.voiceId, (audio) => {
      this.sendAudioToCaller(audio);
    });
    
    // Wait for caller response
    const transcript = await this.waitForCallerResponse();
    
    // Extract variable if configured
    if (node.data.variableName) {
      const value = await this.extractVariable(transcript, node.data.extractionInstructions);
      this.session.variables[node.data.variableName] = value;
    }
    
    // Evaluate outcomes
    const nextNodeId = await this.evaluateOutcomes(node, transcript);
    if (nextNodeId) {
      await this.executeNode(nextNodeId);
    }
  }
  
  async evaluateOutcomes(node: Node, transcript: string): Promise<string | null> {
    const outcomes = this.getOutcomes(node);
    
    if (outcomes.length === 0) {
      // No outcomes, follow default edge
      return this.getNextNode(node);
    }
    
    if (outcomes[0].type === 'prompt') {
      // AI-driven outcome evaluation
      const selectedOutcome = await this.llmService.evaluateOutcome(
        transcript,
        outcomes.map(o => o.label)
      );
      
      const outcome = outcomes.find(o => o.label === selectedOutcome);
      return outcome?.targetNodeId || null;
    } else {
      // Rule-based outcome evaluation
      for (const outcome of outcomes) {
        if (this.evaluateRule(outcome.rule, this.session.variables)) {
          return outcome.targetNodeId;
        }
      }
      
      // No rule matched, use else/default
      const defaultOutcome = outcomes.find(o => o.isDefault);
      return defaultOutcome?.targetNodeId || null;
    }
  }
  
  renderTemplate(template: string, variables: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
      return variables[varName] || match;
    });
  }
}
```

---

## Latency Budget

Target: **Sub-200ms** end-to-end latency

| Component | Latency | Notes |
|-----------|---------|-------|
| Saicom SIP Trunk | 95ms | Network latency (SA carriers) |
| STT (Deepgram) | 300ms | Real-time transcription |
| LLM (Groq) | 100ms | Response generation |
| TTS (Cartesia) | 200ms | Speech synthesis |
| WebSocket Overhead | 20ms | Local network |
| **Total** | **715ms** | First response |

**Optimization Strategies:**
1. **Parallel Processing:** Start TTS while LLM is still generating (streaming)
2. **Predictive TTS:** Pre-synthesize common phrases
3. **Caching:** Cache frequent responses
4. **Endpoint Detection:** Start processing before caller finishes speaking
5. **Streaming:** Use streaming for all providers

**Optimized Latency:**
- **Parallel STT + LLM:** 300ms (overlapped)
- **Streaming TTS:** 100ms (first audio chunk)
- **Network:** 115ms (Saicom + WebSocket)
- **Total:** **515ms** (first audio playback)

---

## Deployment Architecture

### Development Environment
```
Docker Compose:
- FreeSWITCH container
- Voice Pipeline container (Node.js)
- PostgreSQL container (existing)
- Redis container (session cache)
```

### Production Environment
```
Kubernetes Cluster:
- FreeSWITCH pods (2+ replicas)
- Voice Pipeline pods (4+ replicas)
- PostgreSQL (managed service)
- Redis (managed service)

Load Balancer:
- SIP load balancing (Kamailio)
- WebSocket load balancing (NGINX)
```

---

## Security Considerations

1. **SIP Authentication:** Username/password for Saicom trunk
2. **API Keys:** Secure storage for STT/LLM/TTS providers
3. **Call Recording:** Encryption at rest, compliance with POPIA
4. **PII Protection:** Redact sensitive data from logs
5. **Rate Limiting:** Prevent abuse of voice pipeline
6. **DDoS Protection:** SIP flood detection

---

## Monitoring & Observability

**Metrics:**
- Call volume (per hour, per day)
- Average call duration
- Latency per component (STT, LLM, TTS)
- Error rates (failed calls, timeouts)
- Cost per call (provider usage)
- Concurrent calls (capacity planning)

**Logging:**
- Call events (start, end, transfer)
- Transcripts (full conversation)
- Execution trace (node transitions)
- Provider responses (debugging)

**Alerting:**
- High error rate (> 5%)
- High latency (> 1000ms)
- Provider outages
- SIP trunk issues

---

## Next Steps

1. **Set up FreeSWITCH** with Saicom trunk configuration
2. **Build WebSocket server** with session management
3. **Integrate STT provider** (Deepgram)
4. **Integrate LLM provider** (Groq/Gemini)
5. **Integrate TTS provider** (Cartesia)
6. **Implement flow executor** (basic node types)
7. **Test end-to-end** with live call
8. **Optimize latency** (streaming, caching)
9. **Deploy to production** (Kubernetes)

