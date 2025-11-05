# Call Center Features Architecture

**Date**: November 5, 2025  
**Author**: Manus AI  
**Version**: 1.0

## 1. Overview

This document outlines the architecture for the Core Call Center Feature Set (Group 1) for the VoiceForge platform. These features transform VoiceForge from a conversational AI platform into a complete contact center solution, enabling agencies to manage high-volume inbound and outbound call operations.

## 2. Feature Set Summary

The Group 1 features include:

| Feature                              | Description                                                                                     | Priority |
| ------------------------------------ | ----------------------------------------------------------------------------------------------- | -------- |
| **Queue Management**                 | Call queuing with hold music, position announcements, and overflow handling                     | P0       |
| **Voicemail System**                 | Record and store voicemail messages with transcription                                          | P0       |
| **Enhanced Call Routing**            | Route calls based on caller ID, time of day, and pre-qualification lookups                      | P0       |
| **Call Recording**                   | Record full call audio and link to call logs                                                    | P0       |
| **Agent Groups & Status Management** | Organize agents into groups and track availability status                                       | P1       |
| **ACD Announcements**                | Play audio announcements during calls (e.g., "Your call is important to us")                    | P1       |
| **Comprehensive CDR**                | Enhanced call detail reporting with all necessary data points for analysis                      | P0       |

## 3. System Architecture

The call center features are built on top of the existing execution engine, leveraging the extension points designed in Phase 1.

### 3.1. Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend Layer                            │
│  - Queue Dashboard                                           │
│  - Agent Status Panel                                        │
│  - Call Recording Viewer                                     │
│  - Voicemail Inbox                                           │
│  - CDR Reports                                               │
└─────────────────────────────────────────────────────────────┘
                            ↓ tRPC
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (tRPC)                          │
│  - Queue Management Router                                   │
│  - Voicemail Router                                          │
│  - Recording Router                                          │
│  - Agent Status Router                                       │
│  - CDR Router                                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 Call Center Services Layer                   │
│  - Queue Manager                                             │
│  - Voicemail Service                                         │
│  - Recording Service                                         │
│  - Routing Engine                                            │
│  - Agent Status Manager                                      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Execution Engine Layer                      │
│  - Pre/Post Execution Hooks                                  │
│  - Custom Node Types (Queue, Park, Voicemail)               │
│  - Event Bus (queue.entered, agent.status.changed)          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Database Layer                             │
│  - call_queues, call_queue_entries                          │
│  - voicemails                                                │
│  - call_recordings                                           │
│  - agent_groups, agent_group_members, agent_status          │
└─────────────────────────────────────────────────────────────┘
```

### 3.2. Integration with Execution Engine

The call center features integrate with the execution engine through:

1. **Pre-Execution Hooks**: Check if call should be queued before starting flow
2. **Custom Node Types**: New node types for queue, park, voicemail, etc.
3. **Event Bus**: Broadcast call center events (e.g., `call.queued`, `agent.available`)
4. **Database Events**: Log all call center actions to CDR

## 4. Feature-Specific Architecture

### 4.1. Queue Management

**Purpose**: Manage high call volumes by queuing calls when all agents/flows are busy.

**Components**:

- **Queue Manager**: Manages queue state, position, and overflow
- **Queue Worker**: Processes queued calls and assigns to available agents
- **Hold Music Service**: Streams audio to callers in queue
- **Position Announcer**: Periodically announces queue position

**Database Tables**:

```sql
-- Already exists in schema
call_queues (id, client_id, name, max_wait_time_seconds, overflow_action, hold_music_url)

-- New table
call_queue_entries (
  id, 
  queue_id, 
  call_session_id, 
  position, 
  entered_at, 
  exited_at, 
  wait_time_seconds,
  exit_reason -- 'answered', 'timeout', 'abandoned'
)
```

**Flow**:

1. Call arrives → Check if agent/flow available
2. If busy → Add to queue → Play hold music
3. Periodically announce position
4. When agent available → Remove from queue → Start flow execution
5. If timeout → Execute overflow action (voicemail, transfer, hangup)

### 4.2. Voicemail System

**Purpose**: Record and store messages when agents are unavailable.

**Components**:

- **Voicemail Service**: Records audio, stores to S3, transcribes
- **Voicemail Inbox**: Frontend for listening to messages
- **Notification Service**: Sends alerts when new voicemail arrives

**Database Tables**:

```sql
voicemails (
  id,
  call_session_id,
  client_id,
  agent_id,
  caller_id,
  recording_url,
  transcription,
  duration_seconds,
  is_read,
  created_at
)
```

**Flow**:

1. Call enters voicemail node → Play greeting
2. Beep → Start recording
3. Caller speaks → Record audio
4. Caller hangs up or timeout → Stop recording
5. Upload to S3 → Transcribe with STT
6. Store metadata in database → Send notification

### 4.3. Enhanced Call Routing

**Purpose**: Route calls intelligently based on caller data and business rules.

**Components**:

- **Routing Engine**: Evaluates routing rules and selects destination
- **CRM Lookup Service**: Fetches caller data from external systems
- **Time-Based Router**: Routes based on time of day, day of week
- **Skills-Based Router**: Routes to agents with specific skills

**Database Tables**:

```sql
routing_rules (
  id,
  client_id,
  name,
  priority,
  conditions, -- JSONB: { "caller_id": "+1234567890", "time_of_day": "9-17" }
  destination_type, -- 'agent', 'queue', 'flow', 'voicemail'
  destination_id,
  is_active
)
```

**Flow**:

1. Call arrives → Extract caller ID
2. Lookup caller in CRM → Get customer data
3. Evaluate routing rules in priority order
4. First matching rule → Route to destination
5. If no match → Default routing

### 4.4. Call Recording

**Purpose**: Record full call audio for compliance, training, and quality assurance.

**Components**:

- **Recording Service**: Captures audio streams, merges, stores to S3
- **Recording Player**: Frontend for playback
- **Retention Manager**: Automatically deletes recordings after retention period

**Database Tables**:

```sql
call_recordings (
  id,
  call_session_id,
  recording_url,
  duration_seconds,
  file_size_bytes,
  format, -- 'wav', 'mp3'
  started_at,
  ended_at,
  retention_until
)
```

**Flow**:

1. Call starts → Check if recording enabled
2. If enabled → Start recording both sides
3. During call → Continuously capture audio
4. Call ends → Stop recording → Merge streams
5. Upload to S3 → Store metadata
6. Retention period expires → Delete recording

### 4.5. Agent Groups & Status Management

**Purpose**: Organize agents and track real-time availability for routing.

**Components**:

- **Agent Status Manager**: Tracks agent availability in real-time
- **Group Manager**: Manages group membership and routing strategies
- **Presence Service**: Heartbeat monitoring for agent connectivity

**Database Tables**:

```sql
-- Already exists in schema
agent_groups (id, client_id, name, routing_strategy)
agent_group_members (id, agent_group_id, user_id, priority, skills)
agent_status (id, user_id, status, current_call_id, last_status_change)
```

**Flow**:

1. Agent logs in → Set status to 'available'
2. Call assigned → Set status to 'busy', link call ID
3. Call ends → Set status to 'available'
4. Agent manually changes status → Update database
5. Routing engine queries available agents → Assigns call

### 4.6. ACD Announcements

**Purpose**: Play audio messages during calls (e.g., "Your call is important to us").

**Components**:

- **Announcement Service**: Manages audio files and playback
- **Scheduler**: Triggers announcements at specified intervals
- **Audio Library**: Stores pre-recorded announcements

**Database Tables**:

```sql
announcements (
  id,
  client_id,
  name,
  audio_url,
  duration_seconds,
  trigger_type, -- 'on_queue_entry', 'periodic', 'manual'
  trigger_config -- JSONB: { "interval_seconds": 30 }
)
```

**Flow**:

1. Call enters queue → Play welcome announcement
2. Every 30 seconds → Play "still waiting" announcement
3. Custom trigger → Play specific announcement
4. Announcement ends → Resume hold music

### 4.7. Comprehensive CDR

**Purpose**: Provide detailed call analytics and reporting.

**Components**:

- **CDR Aggregator**: Collects events from execution engine
- **Report Generator**: Creates reports from CDR data
- **Analytics Dashboard**: Visualizes key metrics

**Database Tables**:

```sql
-- Already exists in schema
call_sessions (all call metadata)
call_events (all events during call)
call_transcripts (conversation history)
call_variables (extracted data)

-- Enhanced queries for reporting
```

**Metrics**:

- Total calls, answered calls, abandoned calls
- Average wait time, max wait time
- Average call duration
- Calls by hour/day/week
- Agent performance (calls handled, average handle time)
- Queue performance (average wait time, abandonment rate)

## 5. Implementation Strategy

The features will be implemented in the following order:

1. **Queue Management** (P0) - Foundation for call center operations
2. **Agent Groups & Status** (P1) - Required for queue assignment
3. **Enhanced Call Routing** (P0) - Intelligent call distribution
4. **Call Recording** (P0) - Compliance and quality assurance
5. **Voicemail System** (P0) - Overflow handling
6. **ACD Announcements** (P1) - Enhanced caller experience
7. **Comprehensive CDR** (P0) - Analytics and reporting

## 6. Performance Considerations

- **Queue Processing**: Use Redis for real-time queue state
- **Recording Storage**: Use S3 with lifecycle policies for cost optimization
- **Agent Status**: WebSocket for real-time updates
- **CDR Queries**: Use database indexes on frequently queried fields

## 7. Security & Compliance

- **Call Recordings**: Encrypt at rest and in transit
- **PCI Compliance**: Pause recording during payment card capture
- **GDPR**: Implement data retention policies and right-to-deletion
- **Access Control**: Role-based permissions for recordings and voicemails

## 8. Future Enhancements

- **Callback Queue**: Allow callers to request callback instead of waiting
- **Predictive Dialer**: Outbound campaign management
- **IVR Builder**: Visual IVR flow designer
- **Real-time Monitoring**: Live dashboard for supervisors
- **Speech Analytics**: Sentiment analysis and keyword detection

---

This architecture provides a solid foundation for building a production-ready call center solution on top of the VoiceForge platform.
