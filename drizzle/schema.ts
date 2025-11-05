import { integer, pgEnum, pgTable, text, timestamp, varchar, serial, uuid, jsonb, real } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */

// Define enums first (PostgreSQL requires separate enum definitions)
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const clientStatusEnum = pgEnum("client_status", ["active", "paused", "archived"]);
export const voiceProviderEnum = pgEnum("voice_provider", ["elevenlabs", "cartesia"]);
export const agentStatusEnum = pgEnum("agent_status", ["draft", "active", "paused"]);
export const sourceTypeEnum = pgEnum("source_type", ["text", "pdf", "csv", "audio", "url"]);
export const phoneProviderEnum = pgEnum("phone_provider", ["twilio", "telnyx", "saicom", "wanatel", "avoxi", "switch", "iptelecom", "united", "telkom", "vodacom"]);
export const phoneStatusEnum = pgEnum("phone_status", ["active", "inactive"]);
export const callDirectionEnum = pgEnum("call_direction", ["inbound", "outbound"]);
export const callStatusEnum = pgEnum("call_status", ["completed", "failed", "no-answer", "busy"]);
export const triggerTypeEnum = pgEnum("trigger_type", ["webhook", "call_completed", "schedule"]);
export const automationStatusEnum = pgEnum("automation_status", ["success", "failed", "retrying"]);
export const voiceCloneStatusEnum = pgEnum("voice_clone_status", ["processing", "ready", "failed"]);
export const regionEnum = pgEnum("region", ["south-africa", "international"]);
export const currencyEnum = pgEnum("currency", ["ZAR", "USD"]);

export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Agencies table for multi-tenant architecture
export const agencies = pgTable("agencies", {
  id: serial("id").primaryKey(),
  ownerId: integer("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  logo: text("logo"),
  customDomain: varchar("customDomain", { length: 255 }),
  settings: text("settings"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Agency = typeof agencies.$inferSelect;
export type InsertAgency = typeof agencies.$inferInsert;

// Clients table - sub-accounts under agencies
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  agencyId: integer("agencyId").notNull().references(() => agencies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 20 }),
  status: clientStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// Agents table - AI voice agents
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  clientId: integer("clientId").notNull().references(() => clients.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  flowData: text("flowData"),
  voiceId: varchar("voiceId", { length: 255 }),
  voiceProvider: voiceProviderEnum("voiceProvider"),
  status: agentStatusEnum("status").default("draft").notNull(),
  systemPrompt: text("systemPrompt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

// Knowledge base table
export const knowledgeBase = pgTable("knowledgeBase", {
  id: serial("id").primaryKey(),
  agentId: integer("agentId").notNull().references(() => agents.id, { onDelete: "cascade" }),
  sourceType: sourceTypeEnum("sourceType").notNull(),
  sourceUrl: text("sourceUrl"),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBase = typeof knowledgeBase.$inferInsert;

// Knowledge base sources table - stores content added to knowledge bases
export const knowledgeBaseSources = pgTable("knowledgeBaseSources", {
  id: serial("id").primaryKey(),
  knowledgeBaseId: integer("knowledgeBaseId").notNull().references(() => knowledgeBase.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type KnowledgeBaseSource = typeof knowledgeBaseSources.$inferSelect;
export type InsertKnowledgeBaseSource = typeof knowledgeBaseSources.$inferInsert;

// Phone numbers table
export const phoneNumbers = pgTable("phoneNumbers", {
  id: serial("id").primaryKey(),
  clientId: integer("clientId").notNull().references(() => clients.id, { onDelete: "cascade" }),
  agentId: integer("agentId").references(() => agents.id, { onDelete: "set null" }),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  provider: phoneProviderEnum("provider").notNull(),
  providerSid: varchar("providerSid", { length: 255 }),
  status: phoneStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type PhoneNumber = typeof phoneNumbers.$inferSelect;
export type InsertPhoneNumber = typeof phoneNumbers.$inferInsert;

// Call logs table
export const callLogs = pgTable("callLogs", {
  id: serial("id").primaryKey(),
  agentId: integer("agentId").notNull().references(() => agents.id, { onDelete: "cascade" }),
  phoneNumberId: integer("phoneNumberId").references(() => phoneNumbers.id, { onDelete: "set null" }),
  callerNumber: varchar("callerNumber", { length: 20 }),
  direction: callDirectionEnum("direction").notNull(),
  duration: integer("duration"),
  status: callStatusEnum("status").notNull(),
  transcript: text("transcript"),
  summary: text("summary"),
  recordingUrl: text("recordingUrl"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CallLog = typeof callLogs.$inferSelect;
export type InsertCallLog = typeof callLogs.$inferInsert;

// Automations table
export const automations = pgTable("automations", {
  id: serial("id").primaryKey(),
  agencyId: integer("agencyId").notNull().references(() => agencies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  triggerType: triggerTypeEnum("triggerType").notNull(),
  triggerConfig: text("triggerConfig"),
  actions: text("actions"),
  enabled: integer("enabled").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Automation = typeof automations.$inferSelect;
export type InsertAutomation = typeof automations.$inferInsert;

// Automation logs table
export const automationLogs = pgTable("automationLogs", {
  id: serial("id").primaryKey(),
  automationId: integer("automationId").notNull().references(() => automations.id, { onDelete: "cascade" }),
  status: automationStatusEnum("status").notNull(),
  input: text("input"),
  output: text("output"),
  error: text("error"),
  executedAt: timestamp("executedAt").defaultNow().notNull(),
});

export type AutomationLog = typeof automationLogs.$inferSelect;
export type InsertAutomationLog = typeof automationLogs.$inferInsert;

// Voice clones table
export const voiceClones = pgTable("voiceClones", {
  id: serial("id").primaryKey(),
  agencyId: integer("agencyId").notNull().references(() => agencies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  provider: voiceProviderEnum("provider").notNull(),
  providerVoiceId: varchar("providerVoiceId", { length: 255 }).notNull(),
  sampleUrl: text("sampleUrl"),
  status: voiceCloneStatusEnum("status").default("processing").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type VoiceClone = typeof voiceClones.$inferSelect;
export type InsertVoiceClone = typeof voiceClones.$inferInsert;

// Carrier registry table for telephony providers
export const carrierRegistry = pgTable("carrierRegistry", {
  id: serial("id").primaryKey(),
  carrierName: varchar("carrierName", { length: 100 }).notNull(),
  region: regionEnum("region").notNull(),
  priority: integer("priority").default(10).notNull(),
  isActive: integer("isActive").default(1).notNull(),
  sipEndpoint: text("sipEndpoint"),
  apiBaseUrl: text("apiBaseUrl"),
  apiCredentials: text("apiCredentials"), // JSON string
  supportedCodecs: text("supportedCodecs"), // JSON array as string
  maxConcurrentCalls: integer("maxConcurrentCalls"),
  latencyBenchmarkMs: integer("latencyBenchmarkMs"),
  costPerMinuteZar: varchar("costPerMinuteZar", { length: 10 }),
  currency: currencyEnum("currency").default("ZAR").notNull(),
  setupFee: varchar("setupFee", { length: 10 }),
  monthlyBase: varchar("monthlyBase", { length: 10 }),
  capabilities: text("capabilities"), // JSON string
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CarrierRegistry = typeof carrierRegistry.$inferSelect;
export type InsertCarrierRegistry = typeof carrierRegistry.$inferInsert;

// ============================================================================
// EXECUTION ENGINE & CDR SCHEMA
// ============================================================================

// Call session status enum
export const callSessionStatusEnum = pgEnum("call_session_status", [
  "connecting",
  "active",
  "queued",
  "parked",
  "ended"
]);

// Call sessions table - stores metadata for each call
export const callSessions = pgTable("call_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  callId: varchar("call_id", { length: 255 }).notNull().unique(),
  agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  clientId: integer("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  callerId: varchar("caller_id", { length: 50 }),
  calledNumber: varchar("called_number", { length: 50 }),
  status: callSessionStatusEnum("status").notNull().default("connecting"),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  durationSeconds: integer("duration_seconds"),
  
  // Call center fields (for future use)
  queueId: integer("queue_id"),
  agentGroupId: integer("agent_group_id"),
  assignedAgentId: integer("assigned_agent_id").references(() => users.id),
  recordingUrl: text("recording_url"),
  
  // Metadata
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type CallSession = typeof callSessions.$inferSelect;
export type InsertCallSession = typeof callSessions.$inferInsert;

// Call transcripts table - stores conversation history
export const callTranscripts = pgTable("call_transcripts", {
  id: serial("id").primaryKey(),
  callSessionId: uuid("call_session_id").notNull().references(() => callSessions.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(), // 'caller', 'agent', 'system'
  text: text("text").notNull(),
  nodeId: varchar("node_id", { length: 255 }),
  confidence: real("confidence"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export type CallTranscript = typeof callTranscripts.$inferSelect;
export type InsertCallTranscript = typeof callTranscripts.$inferInsert;

// Call variables table - stores extracted variables
export const callVariables = pgTable("call_variables", {
  id: serial("id").primaryKey(),
  callSessionId: uuid("call_session_id").notNull().references(() => callSessions.id, { onDelete: "cascade" }),
  variableName: varchar("variable_name", { length: 255 }).notNull(),
  variableValue: jsonb("variable_value").notNull(),
  extractedAt: timestamp("extracted_at").notNull().defaultNow(),
});

export type CallVariable = typeof callVariables.$inferSelect;
export type InsertCallVariable = typeof callVariables.$inferInsert;

// Call events table - stores all events for comprehensive CDR
export const callEvents = pgTable("call_events", {
  id: serial("id").primaryKey(),
  callSessionId: uuid("call_session_id").notNull().references(() => callSessions.id, { onDelete: "cascade" }),
  eventType: varchar("event_type", { length: 50 }).notNull(),
  eventData: jsonb("event_data"),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export type CallEvent = typeof callEvents.$inferSelect;
export type InsertCallEvent = typeof callEvents.$inferInsert;

// ============================================================================
// FUTURE CALL CENTER TABLES (Prepared but not migrated yet)
// ============================================================================

// Call queues table - manages call queues
export const callQueues = pgTable("call_queues", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  maxWaitTimeSeconds: integer("max_wait_time_seconds").default(300),
  overflowAction: varchar("overflow_action", { length: 50 }), // 'voicemail', 'transfer', 'hangup'
  overflowDestination: varchar("overflow_destination", { length: 255 }),
  holdMusicUrl: text("hold_music_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type CallQueue = typeof callQueues.$inferSelect;
export type InsertCallQueue = typeof callQueues.$inferInsert;

// Agent groups table - manages agent groups for routing
export const agentGroups = pgTable("agent_groups", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  routingStrategy: varchar("routing_strategy", { length: 50 }), // 'round_robin', 'skills_based', 'least_busy'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AgentGroup = typeof agentGroups.$inferSelect;
export type InsertAgentGroup = typeof agentGroups.$inferInsert;

// Agent group members table - associates agents with groups
export const agentGroupMembers = pgTable("agent_group_members", {
  id: serial("id").primaryKey(),
  agentGroupId: integer("agent_group_id").notNull().references(() => agentGroups.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  priority: integer("priority").default(0),
  skills: jsonb("skills"),
});

export type AgentGroupMember = typeof agentGroupMembers.$inferSelect;
export type InsertAgentGroupMember = typeof agentGroupMembers.$inferInsert;

// Agent status table - tracks real-time agent availability
export const agentStatus = pgTable("agent_status", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  status: varchar("status", { length: 20 }).notNull(), // 'available', 'busy', 'away', 'offline'
  currentCallId: uuid("current_call_id").references(() => callSessions.id),
  lastStatusChange: timestamp("last_status_change").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AgentStatus = typeof agentStatus.$inferSelect;
export type InsertAgentStatus = typeof agentStatus.$inferInsert;

// Call Queue Entries (for queue management)
export const callQueueEntries = pgTable("call_queue_entries", {
  id: serial("id").primaryKey(),
  queueId: integer("queue_id").notNull().references(() => callQueues.id, { onDelete: "cascade" }),
  callSessionId: uuid("call_session_id").notNull().references(() => callSessions.id, { onDelete: "cascade" }),
  position: integer("position").notNull(),
  enteredAt: timestamp("entered_at").notNull().defaultNow(),
  exitedAt: timestamp("exited_at"),
  waitTimeSeconds: integer("wait_time_seconds"),
  exitReason: varchar("exit_reason", { length: 50 }), // 'answered', 'timeout', 'abandoned'
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export type CallQueueEntry = typeof callQueueEntries.$inferSelect;
export type InsertCallQueueEntry = typeof callQueueEntries.$inferInsert;
