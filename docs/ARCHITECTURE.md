# Quikle Voice AI Platform - Architecture Documentation

**Version**: 1.0  
**Last Updated**: October 24, 2025  
**Author**: Manus AI

---

## Overview

The Quikle Voice AI Platform is designed as a **multi-tenant SaaS application** that enables agencies to create, manage, and deploy sophisticated AI voice agents for their clients. The architecture prioritizes **scalability**, **security**, **portability**, and **low latency** while maintaining a clean separation of concerns across all layers.

This document provides a comprehensive overview of the system architecture, design decisions, data flow patterns, and integration strategies that power the Quikle platform.

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │   Mobile     │  │   Desktop    │          │
│  │   (React)    │  │   (Future)   │  │   (Future)   │          │
│  └──────┬───────┘  └──────────────┘  └──────────────┘          │
│         │                                                         │
│         │ HTTPS/WSS                                              │
└─────────┼─────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                           │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    tRPC API Gateway                       │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │   Auth     │  │   Agents   │  │  Analytics │         │   │
│  │  │  Router    │  │   Router   │  │   Router   │         │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │              Business Logic Layer                         │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │  Agency    │  │   Agent    │  │    Call    │         │   │
│  │  │  Manager   │  │  Builder   │  │ Orchestrator│        │   │
│  │  └────────────┘  └────────────┘  └────────────┘         │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────────────┬───────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   MySQL/     │  │   S3 Object  │  │   Redis      │          │
│  │   TiDB       │  │   Storage    │  │   Cache      │          │
│  │  (Primary)   │  │  (Files)     │  │  (Future)    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services Layer                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │
│  │  Twilio/   │  │  Gladia/   │  │  OpenAI/   │  │ElevenLabs│ │
│  │  Telnyx    │  │  Deepgram  │  │ Anthropic  │  │ Cartesia │ │
│  │ (Telephony)│  │   (STT)    │  │   (LLM)    │  │  (TTS)   │ │
│  └────────────┘  └────────────┘  └────────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. Frontend Application

**Technology**: React 19 with TypeScript, Tailwind CSS 4, shadcn/ui

The frontend is a **single-page application (SPA)** that provides the user interface for all platform features. It communicates exclusively with the backend through tRPC, ensuring end-to-end type safety and eliminating the need for manual API client code.

**Key Features**:
- **Visual Flow Editor**: Canvas-based drag-and-drop interface for building conversation flows
- **Knowledge Base Manager**: Upload, organize, and search knowledge base content
- **Voice Library**: Browse and select voices from integrated TTS providers
- **Analytics Dashboard**: Real-time call metrics, transcripts, and performance data
- **White-Label Controls**: Agency branding customization interface

**State Management**: React Query (via tRPC) handles all server state, while local UI state is managed with React hooks and context.

### 2. Backend Services

**Technology**: Node.js, Express 4, tRPC 11, Drizzle ORM

The backend is structured as a **monolithic application** with clear module boundaries, designed for future microservices extraction if needed. All API endpoints are defined as tRPC procedures, providing automatic type inference and runtime validation.

**Key Modules**:

#### Authentication & Authorization
- **OAuth Integration**: Manus OAuth for user authentication
- **JWT Sessions**: Secure session management with HTTP-only cookies
- **RBAC**: Role-based access control with admin and user roles
- **Multi-Tenancy**: Row-level security ensuring complete data isolation between agencies and clients

#### Agent Management
- **Flow Builder**: CRUD operations for conversation flow nodes and edges
- **Node Types**: Start, speak, action, and end nodes with configurable properties
- **Validation**: Flow validation ensuring all paths are reachable and properly configured

#### Call Orchestration
- **Real-Time Pipeline**: STT → LLM → TTS streaming pipeline
- **State Management**: Call state tracking across multiple stages
- **Fallback Handling**: Dynamic knowledge base retrieval when users deviate from flow
- **Recording**: Call recording capture and storage

#### Knowledge Base
- **Multi-Format Ingestion**: Support for TXT, PDF, CSV, MP3/WAV, and URL sources
- **Vector Embeddings**: Semantic search using pgvector
- **Chunking Strategy**: Intelligent text chunking for optimal retrieval
- **Update Management**: Real-time updates and versioning

#### Automations
- **Trigger System**: Webhook and event-based triggers
- **Action Execution**: Modular action handlers for various integrations
- **Retry Logic**: Configurable retry with exponential backoff
- **Logging**: Comprehensive execution logs for debugging

### 3. Database Layer

**Technology**: MySQL/TiDB with Drizzle ORM

The database schema is designed to be **Supabase-compatible**, enabling future migration with minimal code changes. All tables use camelCase naming to match TypeScript conventions, and relationships are clearly defined with foreign keys.

**Core Tables**:

#### Users & Authentication
```typescript
users {
  id: int (PK, auto-increment)
  openId: varchar(64) (unique, OAuth identifier)
  name: text
  email: varchar(320)
  loginMethod: varchar(64)
  role: enum('user', 'admin')
  createdAt: timestamp
  updatedAt: timestamp
  lastSignedIn: timestamp
}
```

#### Multi-Tenancy
```typescript
agencies {
  id: int (PK)
  ownerId: int (FK → users.id)
  name: varchar(255)
  logo: text (S3 URL)
  customDomain: varchar(255)
  createdAt: timestamp
  updatedAt: timestamp
}

clients {
  id: int (PK)
  agencyId: int (FK → agencies.id)
  name: varchar(255)
  contactEmail: varchar(320)
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### Agent Configuration
```typescript
agents {
  id: int (PK)
  clientId: int (FK → clients.id)
  name: varchar(255)
  description: text
  flowData: json (node/edge configuration)
  voiceId: varchar(255)
  status: enum('draft', 'active', 'paused')
  createdAt: timestamp
  updatedAt: timestamp
}

knowledgeBase {
  id: int (PK)
  agentId: int (FK → agents.id)
  sourceType: enum('text', 'pdf', 'csv', 'audio', 'url')
  sourceUrl: text (S3 URL or external URL)
  content: text
  embedding: vector(1536) (pgvector)
  metadata: json
  createdAt: timestamp
  updatedAt: timestamp
}
```

#### Call Logs & Analytics
```typescript
callLogs {
  id: int (PK)
  agentId: int (FK → agents.id)
  phoneNumber: varchar(20)
  direction: enum('inbound', 'outbound')
  duration: int (seconds)
  status: enum('completed', 'failed', 'no-answer')
  transcript: text
  summary: text
  recordingUrl: text (S3 URL)
  metadata: json
  createdAt: timestamp
}
```

#### Automations
```typescript
automations {
  id: int (PK)
  agencyId: int (FK → agencies.id)
  name: varchar(255)
  triggerType: enum('webhook', 'call_completed')
  triggerConfig: json
  actions: json (array of action configurations)
  enabled: boolean
  createdAt: timestamp
  updatedAt: timestamp
}

automationLogs {
  id: int (PK)
  automationId: int (FK → automations.id)
  status: enum('success', 'failed', 'retrying')
  input: json
  output: json
  error: text
  executedAt: timestamp
}
```

**Indexing Strategy**:
- Primary keys on all `id` columns
- Unique index on `users.openId`
- Foreign key indexes on all relationship columns
- Composite index on `(agencyId, clientId)` for multi-tenant queries
- Vector index on `knowledgeBase.embedding` for semantic search

### 4. Storage Layer

**Technology**: S3-compatible object storage

All file assets are stored in S3 with metadata references in the database. This approach ensures scalability, reduces database bloat, and enables efficient CDN integration.

**Storage Buckets**:
- `recordings/` - Call recordings (MP3/WAV)
- `voices/` - Voice cloning samples
- `knowledge-base/` - Uploaded documents and media
- `assets/` - Agency logos and branding assets

**Security**:
- Pre-signed URLs for temporary access
- Random suffixes on file keys to prevent enumeration
- Bucket policies restricting access to authenticated users only

---

## Voice AI Pipeline

The core value proposition of Quikle is the **real-time voice AI pipeline** that orchestrates speech-to-text, language model inference, and text-to-speech in a low-latency streaming architecture.

### Pipeline Flow

```
┌─────────────┐
│  Incoming   │
│    Call     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│                    Call Orchestrator                         │
│                                                              │
│  ┌────────────┐      ┌────────────┐      ┌────────────┐   │
│  │    STT     │ ───▶ │    LLM     │ ───▶ │    TTS     │   │
│  │  (Gladia/  │      │  (OpenAI/  │      │(ElevenLabs/│   │
│  │  Deepgram) │      │ Anthropic) │      │ Cartesia)  │   │
│  └────────────┘      └────────────┘      └────────────┘   │
│         │                   │                   │          │
│         ▼                   ▼                   ▼          │
│  ┌────────────┐      ┌────────────┐      ┌────────────┐   │
│  │  Transcript│      │   Context  │      │   Audio    │   │
│  │   Buffer   │      │  Manager   │      │  Streamer  │   │
│  └────────────┘      └────────────┘      └────────────┘   │
│         │                   │                   │          │
│         └───────────┬───────┴───────────────────┘          │
│                     ▼                                       │
│            ┌────────────────┐                              │
│            │  Flow Engine   │                              │
│            │  (Node Router) │                              │
│            └────────┬───────┘                              │
│                     │                                       │
│         ┌───────────┼───────────┐                          │
│         ▼           ▼           ▼                          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │  Speak   │ │  Action  │ │   End    │                   │
│  │   Node   │ │   Node   │ │   Node   │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
│                     │                                       │
│                     ▼                                       │
│            ┌────────────────┐                              │
│            │   Fallback?    │                              │
│            └────────┬───────┘                              │
│                     │                                       │
│         ┌───────────┴───────────┐                          │
│         ▼                       ▼                          │
│  ┌──────────────┐        ┌──────────────┐                 │
│  │   Continue   │        │  Knowledge   │                 │
│  │     Flow     │        │  Base Search │                 │
│  └──────────────┘        └──────────────┘                 │
└─────────────────────────────────────────────────────────────┘
       │
       ▼
┌──────────────┐
│   Response   │
│   to Caller  │
└──────────────┘
```

### Latency Optimization Strategies

**Target**: < 800ms median voice-to-voice latency

1. **Streaming Architecture**: All components stream data rather than waiting for complete responses
2. **Parallel Processing**: STT transcription and LLM context preparation happen concurrently
3. **Predictive Caching**: Common responses are pre-generated and cached
4. **Edge Deployment**: Services deployed close to telephony providers
5. **Connection Pooling**: Persistent connections to external APIs
6. **Chunked TTS**: Audio generation begins before LLM completes full response

### Fallback Mechanism

When a user's response doesn't match any expected flow path, the system:

1. **Detects Deviation**: Flow engine identifies no matching transition
2. **Queries Knowledge Base**: Semantic search retrieves relevant context
3. **Generates Response**: LLM generates contextual response using KB content
4. **Steers Back**: Response includes guidance to return to the main flow
5. **Logs Deviation**: Analytics track common deviation points for flow optimization

---

## Security Architecture

Security is implemented in **multiple layers** to ensure comprehensive protection of user data, API keys, and call recordings.

### Authentication Flow

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. Redirect to OAuth
       ▼
┌─────────────────┐
│  Manus OAuth    │
│     Portal      │
└──────┬──────────┘
       │ 2. User authenticates
       ▼
┌─────────────────┐
│  OAuth Callback │
│   (/api/oauth/  │
│    callback)    │
└──────┬──────────┘
       │ 3. Exchange code for token
       ▼
┌─────────────────┐
│   JWT Session   │
│   Cookie Set    │
└──────┬──────────┘
       │ 4. Subsequent requests
       ▼
┌─────────────────┐
│  tRPC Context   │
│  (ctx.user)     │
└─────────────────┘
```

### Multi-Tenancy Security

**Row-Level Security (RLS)**: Every database query automatically filters by the authenticated user's agency and client context. This is enforced at the ORM level, making it impossible to accidentally leak data across tenants.

**Example**:
```typescript
// All queries automatically scoped to user's agency
const agents = await db
  .select()
  .from(agentsTable)
  .where(eq(agentsTable.clientId, ctx.user.clientId));
```

### Data Encryption

- **At Rest**: AES-256 encryption for all sensitive database columns
- **In Transit**: TLS 1.3 for all network communication
- **API Keys**: Stored in encrypted vault, never exposed to frontend
- **Call Recordings**: Encrypted before upload to S3

### Zero-Exposure Deployment

Following the **Project Nova** security model, production deployments use Cloudflare Tunnel to avoid exposing any ports directly to the internet:

```
Internet ──▶ Cloudflare ──▶ Tunnel ──▶ Docker Network ──▶ App
                (TLS)        (Encrypted)    (Internal)
```

This architecture provides:
- DDoS protection
- Automatic TLS certificate management
- No open ports on the host machine
- Simplified firewall configuration

---

## Integration Architecture

### External Service Integration Pattern

All external services follow a **consistent integration pattern** to ensure maintainability and testability:

```typescript
// 1. Configuration interface
interface ServiceConfig {
  apiKey: string;
  endpoint: string;
  timeout: number;
}

// 2. Service client class
class ExternalService {
  constructor(private config: ServiceConfig) {}
  
  async call(params: ServiceParams): Promise<ServiceResponse> {
    // Implementation
  }
}

// 3. Factory function
export function createService(config: ServiceConfig): ExternalService {
  return new ExternalService(config);
}

// 4. tRPC procedure wrapper
export const serviceRouter = router({
  invoke: protectedProcedure
    .input(serviceParamsSchema)
    .mutation(async ({ input, ctx }) => {
      const service = createService(getConfig());
      return await service.call(input);
    }),
});
```

### Telephony Integration (Twilio/Telnyx)

**Number Management**:
- Purchase numbers directly through provider APIs
- Store number metadata in database with provider reference
- Support for multiple providers per agency

**Call Handling**:
- Webhook endpoints for incoming calls
- WebSocket connections for real-time audio streaming
- Call state management with Redis (future)

### TTS Integration (ElevenLabs/Cartesia)

**Voice Library**:
- Periodic sync of available voices from providers
- Local caching with metadata (gender, accent, language)
- Searchable and filterable interface

**Voice Cloning**:
- In-app recording with browser MediaRecorder API
- Upload to S3, then submit to provider for cloning
- Secure storage of voice IDs and samples

### LLM Integration (OpenAI/Anthropic)

**Streaming Responses**:
- Server-sent events (SSE) for real-time streaming
- Token-by-token processing for minimal latency
- Context window management for long conversations

**Structured Outputs**:
- JSON schema validation for action nodes
- Automatic retry on invalid responses
- Fallback to text parsing if structured output fails

---

## Scalability Considerations

### Horizontal Scaling

The application is designed to scale horizontally by adding more instances behind a load balancer:

```
                    ┌─────────────┐
                    │Load Balancer│
                    └──────┬──────┘
                           │
           ┌───────────────┼───────────────┐
           ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │  App      │   │  App      │   │  App      │
    │ Instance 1│   │ Instance 2│   │ Instance 3│
    └───────────┘   └───────────┘   └───────────┘
           │               │               │
           └───────────────┼───────────────┘
                           ▼
                    ┌─────────────┐
                    │  Database   │
                    │  (Primary)  │
                    └─────────────┘
```

**Stateless Design**: All application state is stored in the database or external services, allowing any instance to handle any request.

### Database Scaling

**Read Replicas**: For read-heavy workloads, add read replicas and route analytics queries to them.

**Sharding**: Future consideration for multi-region deployments, sharding by agency ID.

**Connection Pooling**: Drizzle ORM with connection pooling to handle high concurrency.

### Caching Strategy (Future)

**Redis Integration**:
- Session cache for faster authentication
- Voice library cache to reduce provider API calls
- Rate limiting counters
- Real-time call state for distributed orchestration

---

## Monitoring & Observability

### Logging Strategy

**Structured Logging**: All logs use JSON format for easy parsing and analysis.

**Log Levels**:
- `ERROR`: Application errors requiring immediate attention
- `WARN`: Potential issues or degraded performance
- `INFO`: Significant application events (user actions, API calls)
- `DEBUG`: Detailed information for troubleshooting

**Log Aggregation**: Logs are written to stdout and collected by container orchestration platform.

### Metrics

**Application Metrics**:
- Request rate and latency per endpoint
- Error rate and types
- Database query performance
- External API call latency

**Business Metrics**:
- Active agencies and clients
- Call volume and duration
- Agent creation and usage
- Voice cloning requests

### Alerting

**Critical Alerts**:
- Application downtime
- Database connection failures
- External API failures
- High error rates (> 5%)

**Warning Alerts**:
- Elevated latency (> 1000ms)
- Low disk space
- High memory usage
- Rate limit approaching

---

## Migration Path to Supabase

The platform is architected to enable **seamless migration to Supabase** with minimal code changes. This is achieved through:

### Database Compatibility

- **Schema Design**: All tables use Supabase-compatible types and naming conventions
- **Drizzle ORM**: Abstracts database operations, making provider swaps straightforward
- **Migration Scripts**: Database migrations are version-controlled and portable

### Authentication Migration

Current Manus OAuth can be replaced with Supabase Auth:

```typescript
// Current: Manus OAuth
const user = await authenticateWithManus(token);

// Future: Supabase Auth
const user = await supabase.auth.getUser(token);
```

### Edge Functions

Backend logic can be migrated to Supabase Edge Functions:

```typescript
// Current: Express endpoint
app.post('/api/agents/create', async (req, res) => {
  // Logic
});

// Future: Supabase Edge Function
Deno.serve(async (req) => {
  // Same logic
});
```

### Storage Migration

S3-compatible storage can be replaced with Supabase Storage with minimal changes:

```typescript
// Current: S3
await storagePut(key, data, contentType);

// Future: Supabase Storage
await supabase.storage.from('bucket').upload(key, data);
```

---

## Conclusion

The Quikle Voice AI Platform architecture is designed with **flexibility**, **security**, and **scalability** as core principles. The modular design, clear separation of concerns, and consistent integration patterns ensure that the platform can evolve to meet future requirements while maintaining high performance and reliability.

By following Supabase-compatible patterns from the start, the platform is positioned for easy migration when the time comes, without sacrificing the benefits of the current Manus-based implementation.

---

## References

- [Quikle Master PRD](./quikle-master-prd-manus.md)
- [Project Nova Security Model](./mission-overview.txt)
- [tRPC Documentation](https://trpc.io/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Supabase Documentation](https://supabase.com/docs)

