# VoiceForge Voice Pipeline

Real-time voice AI pipeline for VoiceForge agents, enabling bidirectional voice conversations with sub-200ms latency.

## Architecture

```
Caller → Saicom SIP → FreeSWITCH → WebSocket → Voice Pipeline
                                                      ↓
                                            ┌─────────┴─────────┐
                                            │   Orchestrator    │
                                            └─────────┬─────────┘
                                                      ↓
                                    ┌─────────────────┼─────────────────┐
                                    ↓                 ↓                 ↓
                                  STT               LLM               TTS
                              (Deepgram)         (OpenAI)         (Cartesia)
                                    ↓                 ↓                 ↓
                                    └─────────────────┴─────────────────┘
                                                      ↓
                                            Flow Execution Engine
```

## Components

### 1. WebSocket Server
- Handles bidirectional audio streaming
- Manages call sessions
- Provides real-time events

### 2. Session Manager
- Tracks call state and metadata
- Manages conversation history
- Stores extracted variables

### 3. STT Service (Deepgram)
- Real-time speech-to-text transcription
- Voice Activity Detection (VAD)
- Interim and final results

### 4. LLM Service (OpenAI-compatible)
- Response generation
- Outcome evaluation (AI-driven routing)
- Variable extraction

### 5. TTS Service (Cartesia)
- Streaming speech synthesis
- Low-latency audio generation
- Multiple voice options

### 6. Flow Executor
- Interprets agent flows
- Executes nodes (message, question, condition, action, transfer, end)
- Manages conversation flow

### 7. Orchestrator
- Coordinates all components
- Manages call lifecycle
- Handles errors and retries

## Installation

```bash
cd voice-pipeline
pnpm install
```

## Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.tcnlysyacvrocshzzlgh.supabase.co:5432/postgres

# STT Provider
DEEPGRAM_API_KEY=your_deepgram_api_key

# LLM Provider
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1

# TTS Provider
CARTESIA_API_KEY=your_cartesia_api_key

# SIP/FreeSWITCH
FREESWITCH_ESL_HOST=localhost
FREESWITCH_ESL_PORT=8021
FREESWITCH_ESL_PASSWORD=ClueCon

# Saicom SIP Trunk
SAICOM_SIP_DOMAIN=sip.saicom.io
SAICOM_USERNAME=your_username
SAICOM_PASSWORD=your_password
```

## Development

### Run in Development Mode

```bash
pnpm dev
```

This starts the server with hot-reload enabled.

### Build for Production

```bash
pnpm build
```

### Run in Production

```bash
pnpm start
```

## API Endpoints

### WebSocket

```
ws://localhost:8080/voice-pipeline?callId=<call_id>
```

**Message Format:**

```typescript
// Audio data (binary)
Buffer

// Control messages (JSON)
{
  type: 'control',
  callId: string,
  event: 'start_call' | 'end_call' | 'mute' | 'unmute',
  data: any
}

// Event messages (JSON)
{
  type: 'event',
  callId: string,
  event: string,
  data: any
}
```

### HTTP

#### Health Check
```
GET /health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 12345
}
```

#### Stats
```
GET /stats
```

Response:
```json
{
  "activeCalls": 5,
  "totalSessions": 10,
  "sessions": [
    {
      "id": "call-123",
      "agentId": 1,
      "clientId": 1,
      "status": "active",
      "duration": 30000,
      "messageCount": 6
    }
  ]
}
```

## Mock Mode

The voice pipeline can run in **mock mode** when API keys are not configured. This allows development and testing without real provider credentials.

**Mock Features:**
- Simulated STT transcription
- AI-powered mock LLM responses
- Silent audio generation for TTS

To enable mock mode, use placeholder API keys (default in `.env.example`).

## Testing

### Manual Testing

1. Start the server:
   ```bash
   pnpm dev
   ```

2. Connect via WebSocket:
   ```javascript
   const ws = new WebSocket('ws://localhost:8080/voice-pipeline?callId=test-123');
   
   ws.onopen = () => {
     ws.send(JSON.stringify({
       type: 'control',
       callId: 'test-123',
       event: 'start_call',
       data: {
         agentId: 1,
         clientId: 1,
         callerId: '+1234567890'
       }
     }));
   };
   ```

3. Send audio data:
   ```javascript
   // Send PCM audio buffer
   ws.send(audioBuffer);
   ```

## Integration with FreeSWITCH

### FreeSWITCH Configuration

1. Install FreeSWITCH
2. Configure Saicom SIP trunk
3. Create dialplan to route calls to WebSocket

Example dialplan:
```xml
<extension name="voiceforge-agent">
  <condition field="destination_number" expression="^(\d+)$">
    <action application="answer"/>
    <action application="socket" data="localhost:8080 async full"/>
  </condition>
</extension>
```

## Performance

### Latency Targets

| Component | Target | Actual (Mock) |
|-----------|--------|---------------|
| Saicom SIP | 95ms | N/A |
| STT (Deepgram) | 300ms | Instant |
| LLM (Groq) | 100ms | Instant |
| TTS (Cartesia) | 200ms | 100ms |
| WebSocket | 20ms | 5ms |
| **Total** | **715ms** | **105ms** |

### Optimization

- Use streaming for all providers
- Parallel processing (STT + LLM overlap)
- Predictive TTS (pre-synthesize common phrases)
- Endpoint detection (start processing before caller finishes)

## Deployment

### Docker

```bash
docker build -t voiceforge-voice-pipeline .
docker run -p 8080:8080 --env-file .env voiceforge-voice-pipeline
```

### Kubernetes

See `k8s/` directory for deployment manifests.

## Troubleshooting

### No Audio Output

- Check TTS API key
- Verify audio format (16kHz, 16-bit PCM)
- Check WebSocket connection

### Transcription Not Working

- Check STT API key
- Verify audio input format
- Check Deepgram connection logs

### LLM Not Responding

- Check LLM API key
- Verify base URL configuration
- Check rate limits

## License

MIT
