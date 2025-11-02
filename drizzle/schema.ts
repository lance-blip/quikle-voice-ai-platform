import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Agencies table for multi-tenant architecture
export const agencies = mysqlTable("agencies", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: int("ownerId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  logo: text("logo"),
  customDomain: varchar("customDomain", { length: 255 }),
  settings: text("settings"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agency = typeof agencies.$inferSelect;
export type InsertAgency = typeof agencies.$inferInsert;

// Clients table - sub-accounts under agencies
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  agencyId: int("agencyId").notNull().references(() => agencies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 20 }),
  status: mysqlEnum("status", ["active", "paused", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// Agents table - AI voice agents
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().references(() => clients.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  flowData: text("flowData"),
  voiceId: varchar("voiceId", { length: 255 }),
  voiceProvider: mysqlEnum("voiceProvider", ["elevenlabs", "cartesia"]),
  status: mysqlEnum("status", ["draft", "active", "paused"]).default("draft").notNull(),
  systemPrompt: text("systemPrompt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

// Knowledge base table
export const knowledgeBase = mysqlTable("knowledgeBase", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull().references(() => agents.id, { onDelete: "cascade" }),
  sourceType: mysqlEnum("sourceType", ["text", "pdf", "csv", "audio", "url"]).notNull(),
  sourceUrl: text("sourceUrl"),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBase = typeof knowledgeBase.$inferInsert;

// Knowledge base sources table - stores content added to knowledge bases
export const knowledgeBaseSources = mysqlTable("knowledgeBaseSources", {
  id: int("id").autoincrement().primaryKey(),
  knowledgeBaseId: int("knowledgeBaseId").notNull().references(() => knowledgeBase.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  embedding: text("embedding"), // Stored as JSON string of 384-dimensional vector
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type KnowledgeBaseSource = typeof knowledgeBaseSources.$inferSelect;
export type InsertKnowledgeBaseSource = typeof knowledgeBaseSources.$inferInsert;

// Phone numbers table
export const phoneNumbers = mysqlTable("phoneNumbers", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull().references(() => clients.id, { onDelete: "cascade" }),
  agentId: int("agentId").references(() => agents.id, { onDelete: "set null" }),
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  provider: mysqlEnum("provider", ["twilio", "telnyx", "saicom", "wanatel", "avoxi", "switch", "iptelecom", "united", "telkom", "vodacom"]).notNull(),
  providerSid: varchar("providerSid", { length: 255 }),
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PhoneNumber = typeof phoneNumbers.$inferSelect;
export type InsertPhoneNumber = typeof phoneNumbers.$inferInsert;

// Call logs table
export const callLogs = mysqlTable("callLogs", {
  id: int("id").autoincrement().primaryKey(),
  agentId: int("agentId").notNull().references(() => agents.id, { onDelete: "cascade" }),
  phoneNumberId: int("phoneNumberId").references(() => phoneNumbers.id, { onDelete: "set null" }),
  callerNumber: varchar("callerNumber", { length: 20 }),
  direction: mysqlEnum("direction", ["inbound", "outbound"]).notNull(),
  duration: int("duration"),
  status: mysqlEnum("status", ["completed", "failed", "no-answer", "busy"]).notNull(),
  transcript: text("transcript"),
  summary: text("summary"),
  recordingUrl: text("recordingUrl"),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CallLog = typeof callLogs.$inferSelect;
export type InsertCallLog = typeof callLogs.$inferInsert;

// Automations table
export const automations = mysqlTable("automations", {
  id: int("id").autoincrement().primaryKey(),
  agencyId: int("agencyId").notNull().references(() => agencies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  triggerType: mysqlEnum("triggerType", ["webhook", "call_completed", "schedule"]).notNull(),
  triggerConfig: text("triggerConfig"),
  actions: text("actions"),
  enabled: int("enabled").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Automation = typeof automations.$inferSelect;
export type InsertAutomation = typeof automations.$inferInsert;

// Automation logs table
export const automationLogs = mysqlTable("automationLogs", {
  id: int("id").autoincrement().primaryKey(),
  automationId: int("automationId").notNull().references(() => automations.id, { onDelete: "cascade" }),
  status: mysqlEnum("status", ["success", "failed", "retrying"]).notNull(),
  input: text("input"),
  output: text("output"),
  error: text("error"),
  executedAt: timestamp("executedAt").defaultNow().notNull(),
});

export type AutomationLog = typeof automationLogs.$inferSelect;
export type InsertAutomationLog = typeof automationLogs.$inferInsert;

// Voice clones table
export const voiceClones = mysqlTable("voiceClones", {
  id: int("id").autoincrement().primaryKey(),
  agencyId: int("agencyId").notNull().references(() => agencies.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  provider: mysqlEnum("provider", ["elevenlabs", "cartesia"]).notNull(),
  providerVoiceId: varchar("providerVoiceId", { length: 255 }).notNull(),
  sampleUrl: text("sampleUrl"),
  status: mysqlEnum("status", ["processing", "ready", "failed"]).default("processing").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VoiceClone = typeof voiceClones.$inferSelect;
export type InsertVoiceClone = typeof voiceClones.$inferInsert;

// Carrier registry table for telephony providers
export const carrierRegistry = mysqlTable("carrierRegistry", {
  id: int("id").autoincrement().primaryKey(),
  carrierName: varchar("carrierName", { length: 100 }).notNull(),
  region: mysqlEnum("region", ["south-africa", "international"]).notNull(),
  priority: int("priority").default(10).notNull(),
  isActive: int("isActive").default(1).notNull(),
  sipEndpoint: text("sipEndpoint"),
  apiBaseUrl: text("apiBaseUrl"),
  apiCredentials: text("apiCredentials"), // JSON string
  supportedCodecs: text("supportedCodecs"), // JSON array as string
  maxConcurrentCalls: int("maxConcurrentCalls"),
  latencyBenchmarkMs: int("latencyBenchmarkMs"),
  costPerMinuteZar: varchar("costPerMinuteZar", { length: 10 }),
  currency: mysqlEnum("currency", ["ZAR", "USD"]).default("ZAR").notNull(),
  setupFee: varchar("setupFee", { length: 10 }),
  monthlyBase: varchar("monthlyBase", { length: 10 }),
  capabilities: text("capabilities"), // JSON string
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CarrierRegistry = typeof carrierRegistry.$inferSelect;
export type InsertCarrierRegistry = typeof carrierRegistry.$inferInsert;