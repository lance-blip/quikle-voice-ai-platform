# Voice Pipeline Integration Guide

This document describes how the execution engine integrates with the voice pipeline to enable real-time AI-powered voice conversations.

## Architecture Overview

The integration consists of three main layers:

1. **Voice Pipeline Layer** (`voice-pipeline/`)
   - WebSocket server for real-time audio streaming
   - STT service (Deepgram) for speech-to-text
   - LLM service (OpenAI/Groq/Gemini) for conversation logic
   - TTS service (Cartesia) for text-to-speech

2. **Execution Engine Layer** (`server/execution-engine/`)
   - Flow interpreter for agent logic
   - Node executors for each node type
   - Variable manager for data extraction
   - Outcomes evaluator for routing decisions
   - Actions framework for integrations

3. **Integration Layer** (`server/execution-engine/adapters/`)
   - Voice service adapter: Bridges execution engine with voice pipeline
   - LLM service adapter: Provides conversation and extraction capabilities

## Data Flow

### Inbound Call Flow

```
1. SIP Server (FreeSWITCH) receives call
2. WebSocket connection established
3. Execution orchestrator starts flow execution
4. Flow interpreter loads agent flow
5. Node executors process each node:
   - Message nodes → TTS → Audio output
   - Question nodes → STT → Variable extraction
   - Condition nodes → Outcomes evaluation → Routing
   - Action nodes → External integrations
   - Transfer nodes → SIP transfer
6. Call ends → CDR logged to database
```

### Audio Streaming Flow

```
Caller → SIP → RTP → WebSocket → STT → Execution Engine
                                              ↓
Execution Engine → TTS → WebSocket → RTP → SIP → Caller
```

## Integration Points

### 1. WebSocket Server Integration

The WebSocket server in `voice-pipeline/src/websocket/server.ts` needs to be updated to:

- Create execution orchestrator instance on server start
- Start flow execution when a new call connects
- Forward audio chunks to STT service
- Receive TTS audio and send to caller
- Handle call termination

**Required Changes:**

```typescript
// In voice-pipeline/src/websocket/server.ts

import { ExecutionOrchestrator } from '../../server/execution-engine/core/execution-orchestrator';
import { DatabaseAdapter } from '../../server/execution-engine/db/database-adapter';
import { VoiceServiceAdapter } from '../../server/execution-engine/adapters/voice-service-adapter';
import { LLMServiceAdapter } from '../../server/execution-engine/adapters/llm-service-adapter';

// Initialize orchestrator
const dbAdapter = new DatabaseAdapter(process.env.DATABASE_URL!);
const voiceAdapter = new VoiceServiceAdapter(sttService, ttsService, sessionManager);
const llmAdapter = new LLMServiceAdapter(llmService);
const orchestrator = new ExecutionOrchestrator(dbAdapter, voiceAdapter, llmAdapter, actionsService);

// On new connection
ws.on('connection', async (socket, request) => {
  const callId = extractCallId(request);
  const agentId = extractAgentId(request);
  const clientId = extractClientId(request);
  const flowId = extractFlowId(request);
  
  // Start execution
  await orchestrator.startExecution(callId, agentId, clientId, flowId);
});
```

### 2. Session Manager Integration

The session manager needs to emit events that the execution engine can listen to:

- `transcript` - When STT produces a final transcript
- `audio` - When audio data is received from caller
- `disconnected` - When caller hangs up

### 3. Node Handler Updates

The node handlers in `server/execution-engine/nodes/` use the voice service adapter:

- **Message Node**: Calls `voiceService.speak()`
- **Question Node**: Calls `voiceService.listen()`
- **Transfer Node**: Calls `voiceService.transfer()`
- **End Node**: Calls `voiceService.hangup()`

## Configuration

### Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Voice Pipeline
DEEPGRAM_API_KEY=your_deepgram_key
OPENAI_API_KEY=your_openai_key
CARTESIA_API_KEY=your_cartesia_key

# SIP
SAICOM_SIP_USERNAME=your_username
SAICOM_SIP_PASSWORD=your_password
SAICOM_SIP_DOMAIN=sip.saicom.co.za
```

### Flow Configuration

Each agent flow includes settings for the voice pipeline:

```typescript
{
  defaultVoiceId: "voice_id_from_cartesia",
  language: "en-US",
  sttProvider: "deepgram",
  llmProvider: "groq",
  ttsProvider: "cartesia",
  systemPrompt: "You are a helpful customer service agent..."
}
```

## Testing

### Text-Based Testing

Use the `execution.testFlow` tRPC procedure to test flows without voice:

```typescript
const result = await trpc.execution.testFlow.mutate({
  flowId: 1,
  flowDefinition: {...},
  testInput: "Hello, I need help with my order"
});
```

### Voice Testing

1. Start the voice pipeline server: `cd voice-pipeline && pnpm start`
2. Connect via WebSocket: `ws://localhost:8080/voice-pipeline?callId=test123&agentId=1&clientId=1&flowId=1`
3. Send audio data and receive responses
4. Check CDR logs in database

## Deployment

### Development

```bash
# Terminal 1: Start main server
pnpm dev

# Terminal 2: Start voice pipeline
cd voice-pipeline && pnpm start
```

### Production

Both servers should be deployed together:

```bash
# Build
pnpm build
cd voice-pipeline && pnpm build

# Start
pm2 start ecosystem.config.js
```

## Monitoring

### Execution Stats

```typescript
const stats = await trpc.execution.getExecutionStats.query();
// { activeExecutions: 5 }
```

### Call Details

```typescript
const session = await trpc.execution.getCallSession.query({ callId: "abc123" });
const transcripts = await trpc.execution.getCallTranscripts.query({ callId: "abc123" });
const variables = await trpc.execution.getCallVariables.query({ callId: "abc123" });
const events = await trpc.execution.getCallEvents.query({ callId: "abc123" });
```

## Future Enhancements

1. **Call Recording**: Implement audio recording to S3/local storage
2. **Queue Management**: Add call queue support for high-volume scenarios
3. **Agent Groups**: Route calls to human agents when needed
4. **Real-time Analytics**: WebSocket-based live call monitoring
5. **Multi-language Support**: Automatic language detection and switching

## Troubleshooting

### Common Issues

1. **WebSocket connection fails**
   - Check that voice pipeline server is running
   - Verify firewall allows WebSocket connections
   - Check logs for port conflicts

2. **No audio output**
   - Verify TTS API key is valid
   - Check voice ID is correct
   - Ensure WebSocket is sending audio chunks

3. **Transcription not working**
   - Verify STT API key is valid
   - Check audio format (must be PCM 16kHz 16-bit)
   - Ensure microphone permissions granted

4. **Flow not executing**
   - Check database connection
   - Verify agent flow exists and is valid
   - Check execution engine logs for errors

## Support

For issues or questions, check:
- Execution engine logs: `server/execution-engine/`
- Voice pipeline logs: `voice-pipeline/src/`
- Database logs: Check Supabase dashboard
- GitHub issues: https://github.com/lance-blip/quikle-voice-ai-platform/issues
