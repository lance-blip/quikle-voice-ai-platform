# Execution Engine Architecture: Call Center-Ready Design

**Author:** Manus AI  
**Date:** November 5, 2025  
**Status:** Final

---

## 1. Executive Summary

This document outlines the architecture for the VoiceForge Execution Engine, designed to interpret and execute agent flows in real-time while providing the extensibility required for future call center functionality. The engine is built with a modular, event-driven architecture that supports queue management, call recording, agent groups, and comprehensive call detail reporting (CDR).

---

## 2. Core Architecture Principles

### 2.1 Modularity

The execution engine is composed of independent, loosely-coupled modules that can be extended without modifying core logic:

- **Flow Interpreter**: Executes agent flows node-by-node
- **Variable Manager**: Handles data extraction, storage, and templating
- **Outcomes Evaluator**: Routes calls based on AI or rule-based logic
- **Actions Executor**: Performs integrations (webhooks, APIs, CRM)
- **Call State Manager**: Tracks call lifecycle and metadata
- **Event Bus**: Facilitates communication between modules

### 2.2 Event-Driven Design

All components communicate via an event bus, enabling:

- **Loose coupling**: Modules don't directly depend on each other
- **Extensibility**: New modules can subscribe to events without modifying existing code
- **Observability**: All events are logged for debugging and analytics
- **Call center features**: Queue events, agent status changes, and recording triggers can be handled by dedicated modules

### 2.3 Call Center Extensibility Points

The architecture includes specific extension points for call center features:

| Extension Point | Purpose | Future Use Case |
|---|---|---|
| **Pre-execution hooks** | Run logic before node execution | Queue position announcements, hold music |
| **Post-execution hooks** | Run logic after node execution | Call recording triggers, CDR logging |
| **Call state transitions** | Handle status changes | Agent availability updates, queue management |
| **Custom node types** | Add new node behaviors | Voicemail recording, call parking, transfer to agent group |
| **Event listeners** | React to system events | Real-time dashboard updates, supervisor alerts |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Call Initiated                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Execution Orchestrator                        │
│  • Load agent flow from database                                 │
│  • Initialize call session                                       │
│  • Create execution context                                      │
│  • Start flow interpreter                                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Flow Interpreter                            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Node Execution Pipeline                     │   │
│  │  1. Pre-execution hooks                                  │   │
│  │  2. Load node definition                                 │   │
│  │  3. Render templates (variables)                         │   │
│  │  4. Execute node logic                                   │   │
│  │  5. Post-execution hooks                                 │   │
│  │  6. Evaluate outcomes                                    │   │
│  │  7. Transition to next node                              │   │
│  └─────────────────────────────────────────────────────────┘   │
└────────────────────────────┬────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
  │   Variable   │    │   Outcomes   │    │   Actions    │
  │   Manager    │    │  Evaluator   │    │  Executor    │
  └──────────────┘    └──────────────┘    └──────────────┘
         │                   │                   │
         └───────────────────┴───────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Event Bus                                 │
│  • Flow events (node_started, node_completed)                    │
│  • Call events (call_started, call_ended, call_transferred)      │
│  • Variable events (variable_set, variable_extracted)            │
│  • Action events (action_started, action_completed)              │
│  • Queue events (call_queued, call_dequeued) [Future]            │
│  • Agent events (agent_available, agent_busy) [Future]           │
└────────────────────────────┬────────────────────────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         ▼                   ▼                   ▼
  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐
  │     CDR      │    │  Analytics   │    │  Call Queue  │
  │   Logger     │    │   Service    │    │   Manager    │
  │              │    │              │    │  [Future]    │
  └──────────────┘    └──────────────┘    └──────────────┘
```

---

## 4. Core Components

### 4.1 Execution Orchestrator

**Responsibility**: Manages the lifecycle of a call execution.

**Key Methods**:
```typescript
class ExecutionOrchestrator {
  async startExecution(callId: string, agentId: number): Promise<void>
  async pauseExecution(callId: string): Promise<void>
  async resumeExecution(callId: string): Promise<void>
  async endExecution(callId: string): Promise<void>
  async transferExecution(callId: string, targetAgentId: number): Promise<void>
}
```

**Call Center Extensions**:
- `queueExecution(callId, queueId)`: Place call in queue
- `parkExecution(callId, parkingLot)`: Park call for later retrieval
- `recordExecution(callId, recordingOptions)`: Start/stop call recording

### 4.2 Flow Interpreter

**Responsibility**: Executes agent flows node-by-node.

**Execution Pipeline**:
```typescript
class FlowInterpreter {
  async executeNode(nodeId: string): Promise<void> {
    // 1. Pre-execution hooks
    await this.runPreExecutionHooks(nodeId);
    
    // 2. Load node definition
    const node = this.flow.nodes.find(n => n.id === nodeId);
    
    // 3. Render templates
    const renderedData = this.renderTemplates(node.data);
    
    // 4. Execute node logic
    await this.executeNodeLogic(node, renderedData);
    
    // 5. Post-execution hooks
    await this.runPostExecutionHooks(nodeId);
    
    // 6. Evaluate outcomes
    const nextNodeId = await this.evaluateOutcomes(node);
    
    // 7. Transition to next node
    if (nextNodeId) {
      await this.executeNode(nextNodeId);
    }
  }
}
```

**Call Center Extensions**:
- Pre-execution hooks can trigger queue announcements ("You are caller number 3")
- Post-execution hooks can log node transitions to CDR
- Custom node types can be registered for voicemail, call parking, etc.

### 4.3 Variable Manager

**Responsibility**: Manages variable extraction, storage, and templating.

**Key Features**:
- **Extraction**: Uses LLM to extract structured data from transcripts
- **Storage**: Stores variables in session context and database
- **Templating**: Renders `{{variable_name}}` placeholders in messages
- **Validation**: Validates extracted data against schemas

**Call Center Extensions**:
- Store caller ID, ANI, DNIS for routing decisions
- Extract pre-qualification data (account number, reason for call)
- Store agent ID and group for CDR logging

### 4.4 Outcomes Evaluator

**Responsibility**: Determines the next node based on AI or rule-based logic.

**Dual-Mode Evaluation**:
```typescript
class OutcomesEvaluator {
  async evaluate(node: FlowNode, transcript: string): Promise<string | null> {
    const outcomes = node.data.outcomes || [];
    
    if (outcomes[0]?.type === 'prompt') {
      // AI-driven evaluation
      return await this.evaluateWithAI(transcript, outcomes);
    } else {
      // Rule-based evaluation
      return await this.evaluateWithRules(outcomes);
    }
  }
}
```

**Call Center Extensions**:
- Route based on caller ID (VIP customers to priority queue)
- Route based on time of day (after-hours to voicemail)
- Route based on agent availability (if no agents, queue or voicemail)

### 4.5 Actions Executor

**Responsibility**: Executes integrations and side effects.

**Supported Actions**:
- **Webhook**: POST data to external URL
- **API Call**: GET/POST to REST API
- **CRM Lookup**: Query CRM for contact information
- **Calendar**: Book appointments
- **SMS**: Send text messages
- **Email**: Send emails

**Call Center Extensions**:
- **Transfer to Agent**: Transfer call to specific agent
- **Transfer to Group**: Transfer call to agent group (round-robin, skills-based)
- **Start Recording**: Begin call recording
- **Stop Recording**: End call recording
- **Play Announcement**: Play pre-recorded audio (hold music, queue position)

### 4.6 Event Bus

**Responsibility**: Facilitates communication between modules.

**Event Types**:
```typescript
type EventType =
  | 'flow.started'
  | 'flow.completed'
  | 'node.started'
  | 'node.completed'
  | 'variable.set'
  | 'variable.extracted'
  | 'action.started'
  | 'action.completed'
  | 'call.started'
  | 'call.ended'
  | 'call.transferred'
  | 'call.queued'        // Future
  | 'call.dequeued'      // Future
  | 'call.parked'        // Future
  | 'agent.available'    // Future
  | 'agent.busy'         // Future
  | 'recording.started'  // Future
  | 'recording.stopped'; // Future
```

**Usage**:
```typescript
// Emit event
eventBus.emit('node.completed', {
  callId,
  nodeId,
  nodeType,
  duration,
  timestamp: new Date()
});

// Subscribe to event
eventBus.on('node.completed', (event) => {
  cdrLogger.log(event);
});
```

---

## 5. Database Schema

### 5.1 Core Tables

#### `call_sessions`
Stores metadata for each call session.

```sql
CREATE TABLE call_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id VARCHAR(255) UNIQUE NOT NULL,
  agent_id INTEGER NOT NULL REFERENCES agents(id),
  client_id INTEGER NOT NULL REFERENCES clients(id),
  caller_id VARCHAR(50),
  called_number VARCHAR(50),
  status VARCHAR(20) NOT NULL, -- 'connecting', 'active', 'queued', 'parked', 'ended'
  start_time TIMESTAMP NOT NULL DEFAULT NOW(),
  end_time TIMESTAMP,
  duration_seconds INTEGER,
  
  -- Call center fields
  queue_id INTEGER REFERENCES call_queues(id),
  agent_group_id INTEGER REFERENCES agent_groups(id),
  assigned_agent_id INTEGER REFERENCES users(id),
  recording_url TEXT,
  
  -- Metadata
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_call_sessions_call_id ON call_sessions(call_id);
CREATE INDEX idx_call_sessions_agent_id ON call_sessions(agent_id);
CREATE INDEX idx_call_sessions_status ON call_sessions(status);
CREATE INDEX idx_call_sessions_queue_id ON call_sessions(queue_id);
```

#### `call_transcripts`
Stores conversation history for each call.

```sql
CREATE TABLE call_transcripts (
  id SERIAL PRIMARY KEY,
  call_session_id UUID NOT NULL REFERENCES call_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL, -- 'caller', 'agent', 'system'
  text TEXT NOT NULL,
  node_id VARCHAR(255),
  confidence FLOAT,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_call_transcripts_session ON call_transcripts(call_session_id);
```

#### `call_variables`
Stores extracted variables for each call.

```sql
CREATE TABLE call_variables (
  id SERIAL PRIMARY KEY,
  call_session_id UUID NOT NULL REFERENCES call_sessions(id) ON DELETE CASCADE,
  variable_name VARCHAR(255) NOT NULL,
  variable_value JSONB NOT NULL,
  extracted_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_call_variables_session ON call_variables(call_session_id);
CREATE INDEX idx_call_variables_name ON call_variables(variable_name);
```

#### `call_events`
Stores all events for comprehensive CDR.

```sql
CREATE TABLE call_events (
  id SERIAL PRIMARY KEY,
  call_session_id UUID NOT NULL REFERENCES call_sessions(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  timestamp TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_call_events_session ON call_events(call_session_id);
CREATE INDEX idx_call_events_type ON call_events(event_type);
CREATE INDEX idx_call_events_timestamp ON call_events(timestamp);
```

### 5.2 Call Center Tables (Future)

#### `call_queues`
Manages call queues.

```sql
CREATE TABLE call_queues (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  max_wait_time_seconds INTEGER DEFAULT 300,
  overflow_action VARCHAR(50), -- 'voicemail', 'transfer', 'hangup'
  overflow_destination VARCHAR(255),
  hold_music_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `agent_groups`
Manages agent groups for routing.

```sql
CREATE TABLE agent_groups (
  id SERIAL PRIMARY KEY,
  client_id INTEGER NOT NULL REFERENCES clients(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  routing_strategy VARCHAR(50), -- 'round_robin', 'skills_based', 'least_busy'
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `agent_group_members`
Associates agents with groups.

```sql
CREATE TABLE agent_group_members (
  id SERIAL PRIMARY KEY,
  agent_group_id INTEGER NOT NULL REFERENCES agent_groups(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  priority INTEGER DEFAULT 0,
  skills JSONB,
  UNIQUE(agent_group_id, user_id)
);
```

#### `agent_status`
Tracks real-time agent availability.

```sql
CREATE TABLE agent_status (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) UNIQUE,
  status VARCHAR(20) NOT NULL, -- 'available', 'busy', 'away', 'offline'
  current_call_id UUID REFERENCES call_sessions(id),
  last_status_change TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 6. Execution Flow Example

### Scenario: Inbound Call with Queue Management

```
1. Call arrives at VoiceForge
   ↓
2. Execution Orchestrator creates call session
   ↓
3. Flow Interpreter loads agent flow
   ↓
4. Execute "Start" node: "Thank you for calling. Please hold while we connect you."
   ↓
5. Execute "Condition" node: Check if agents are available
   ↓
6. Outcomes Evaluator: No agents available
   ↓
7. Execute "Queue" node (custom): Place call in queue
   ↓
8. Event Bus emits: 'call.queued'
   ↓
9. Queue Manager subscribes to event, adds call to queue
   ↓
10. Pre-execution hook on "Queue" node: Play hold music
    ↓
11. Execute "Announcement" node: "You are caller number 3 in the queue."
    ↓
12. Wait for agent availability
    ↓
13. Event Bus emits: 'agent.available'
    ↓
14. Queue Manager dequeues call
    ↓
15. Execute "Transfer to Agent" action
    ↓
16. Event Bus emits: 'call.transferred'
    ↓
17. CDR Logger logs all events
    ↓
18. Call ends
    ↓
19. Execution Orchestrator finalizes call session
    ↓
20. CDR Logger writes comprehensive call detail record
```

---

## 7. Implementation Phases

### Phase 1: Core Execution Engine (Current)
- Flow Interpreter
- Variable Manager
- Outcomes Evaluator
- Actions Executor
- Event Bus
- Basic CDR logging

### Phase 2: Call Center Foundation (Next)
- Queue Manager
- Agent Status Tracker
- Call Recording integration
- Enhanced CDR with queue metrics

### Phase 3: Advanced Call Center Features
- Agent Groups & Skills-based routing
- Voicemail system
- Call parking
- Supervisor dashboard

---

## 8. Extensibility Examples

### Example 1: Adding Queue Management

```typescript
// 1. Register custom node type
nodeRegistry.register('queue', QueueNode);

// 2. Implement QueueNode
class QueueNode extends BaseNode {
  async execute(context: ExecutionContext): Promise<void> {
    const queueId = this.data.queueId;
    
    // Emit event
    context.eventBus.emit('call.queued', {
      callId: context.callId,
      queueId,
      timestamp: new Date()
    });
    
    // Update call session
    await context.db.updateCallSession(context.callId, {
      status: 'queued',
      queueId
    });
    
    // Wait for dequeue event
    await context.eventBus.waitFor('call.dequeued', {
      filter: (event) => event.callId === context.callId
    });
  }
}

// 3. Subscribe to queue events
eventBus.on('call.queued', async (event) => {
  await queueManager.enqueue(event.callId, event.queueId);
});
```

### Example 2: Adding Call Recording

```typescript
// 1. Add pre-execution hook
flowInterpreter.addPreExecutionHook(async (context, node) => {
  if (node.data.recordCall) {
    await recordingService.startRecording(context.callId);
    
    context.eventBus.emit('recording.started', {
      callId: context.callId,
      timestamp: new Date()
    });
  }
});

// 2. Add post-execution hook
flowInterpreter.addPostExecutionHook(async (context, node) => {
  if (node.type === 'end' && context.isRecording) {
    const recordingUrl = await recordingService.stopRecording(context.callId);
    
    await context.db.updateCallSession(context.callId, {
      recordingUrl
    });
    
    context.eventBus.emit('recording.stopped', {
      callId: context.callId,
      recordingUrl,
      timestamp: new Date()
    });
  }
});
```

---

## 9. Conclusion

This execution engine architecture provides a solid foundation for both the current agent builder functionality and future call center features. The modular, event-driven design ensures that new features can be added without disrupting existing functionality, and the comprehensive CDR logging provides the data needed for analytics and reporting.

The architecture is production-ready and can be implemented incrementally, with each phase building upon the last. I am ready to proceed with implementation.

