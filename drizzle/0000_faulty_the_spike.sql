CREATE TYPE "public"."agent_status" AS ENUM('draft', 'active', 'paused');--> statement-breakpoint
CREATE TYPE "public"."automation_status" AS ENUM('success', 'failed', 'retrying');--> statement-breakpoint
CREATE TYPE "public"."call_direction" AS ENUM('inbound', 'outbound');--> statement-breakpoint
CREATE TYPE "public"."call_status" AS ENUM('completed', 'failed', 'no-answer', 'busy');--> statement-breakpoint
CREATE TYPE "public"."client_status" AS ENUM('active', 'paused', 'archived');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('ZAR', 'USD');--> statement-breakpoint
CREATE TYPE "public"."phone_provider" AS ENUM('twilio', 'telnyx', 'saicom', 'wanatel', 'avoxi', 'switch', 'iptelecom', 'united', 'telkom', 'vodacom');--> statement-breakpoint
CREATE TYPE "public"."phone_status" AS ENUM('active', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."region" AS ENUM('south-africa', 'international');--> statement-breakpoint
CREATE TYPE "public"."source_type" AS ENUM('text', 'pdf', 'csv', 'audio', 'url');--> statement-breakpoint
CREATE TYPE "public"."trigger_type" AS ENUM('webhook', 'call_completed', 'schedule');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TYPE "public"."voice_clone_status" AS ENUM('processing', 'ready', 'failed');--> statement-breakpoint
CREATE TYPE "public"."voice_provider" AS ENUM('elevenlabs', 'cartesia');--> statement-breakpoint
CREATE TABLE "agencies" (
	"id" serial PRIMARY KEY NOT NULL,
	"ownerId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"logo" text,
	"customDomain" varchar(255),
	"settings" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agents" (
	"id" serial PRIMARY KEY NOT NULL,
	"clientId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"flowData" text,
	"voiceId" varchar(255),
	"voiceProvider" "voice_provider",
	"status" "agent_status" DEFAULT 'draft' NOT NULL,
	"systemPrompt" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automationLogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"automationId" integer NOT NULL,
	"status" "automation_status" NOT NULL,
	"input" text,
	"output" text,
	"error" text,
	"executedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automations" (
	"id" serial PRIMARY KEY NOT NULL,
	"agencyId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"triggerType" "trigger_type" NOT NULL,
	"triggerConfig" text,
	"actions" text,
	"enabled" integer DEFAULT 1 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "callLogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"agentId" integer NOT NULL,
	"phoneNumberId" integer,
	"callerNumber" varchar(20),
	"direction" "call_direction" NOT NULL,
	"duration" integer,
	"status" "call_status" NOT NULL,
	"transcript" text,
	"summary" text,
	"recordingUrl" text,
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "carrierRegistry" (
	"id" serial PRIMARY KEY NOT NULL,
	"carrierName" varchar(100) NOT NULL,
	"region" "region" NOT NULL,
	"priority" integer DEFAULT 10 NOT NULL,
	"isActive" integer DEFAULT 1 NOT NULL,
	"sipEndpoint" text,
	"apiBaseUrl" text,
	"apiCredentials" text,
	"supportedCodecs" text,
	"maxConcurrentCalls" integer,
	"latencyBenchmarkMs" integer,
	"costPerMinuteZar" varchar(10),
	"currency" "currency" DEFAULT 'ZAR' NOT NULL,
	"setupFee" varchar(10),
	"monthlyBase" varchar(10),
	"capabilities" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "clients" (
	"id" serial PRIMARY KEY NOT NULL,
	"agencyId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"contactEmail" varchar(320),
	"contactPhone" varchar(20),
	"status" "client_status" DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledgeBase" (
	"id" serial PRIMARY KEY NOT NULL,
	"agentId" integer NOT NULL,
	"sourceType" "source_type" NOT NULL,
	"sourceUrl" text,
	"title" varchar(255) NOT NULL,
	"content" text,
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "knowledgeBaseSources" (
	"id" serial PRIMARY KEY NOT NULL,
	"knowledgeBaseId" integer NOT NULL,
	"content" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "phoneNumbers" (
	"id" serial PRIMARY KEY NOT NULL,
	"clientId" integer NOT NULL,
	"agentId" integer,
	"phoneNumber" varchar(20) NOT NULL,
	"provider" "phone_provider" NOT NULL,
	"providerSid" varchar(255),
	"status" "phone_status" DEFAULT 'active' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"openId" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"loginMethod" varchar(64),
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"lastSignedIn" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_openId_unique" UNIQUE("openId")
);
--> statement-breakpoint
CREATE TABLE "voiceClones" (
	"id" serial PRIMARY KEY NOT NULL,
	"agencyId" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"provider" "voice_provider" NOT NULL,
	"providerVoiceId" varchar(255) NOT NULL,
	"sampleUrl" text,
	"status" "voice_clone_status" DEFAULT 'processing' NOT NULL,
	"metadata" text,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "agencies" ADD CONSTRAINT "agencies_ownerId_users_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agents" ADD CONSTRAINT "agents_clientId_clients_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automationLogs" ADD CONSTRAINT "automationLogs_automationId_automations_id_fk" FOREIGN KEY ("automationId") REFERENCES "public"."automations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "automations" ADD CONSTRAINT "automations_agencyId_agencies_id_fk" FOREIGN KEY ("agencyId") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "callLogs" ADD CONSTRAINT "callLogs_agentId_agents_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "callLogs" ADD CONSTRAINT "callLogs_phoneNumberId_phoneNumbers_id_fk" FOREIGN KEY ("phoneNumberId") REFERENCES "public"."phoneNumbers"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_agencyId_agencies_id_fk" FOREIGN KEY ("agencyId") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledgeBase" ADD CONSTRAINT "knowledgeBase_agentId_agents_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."agents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "knowledgeBaseSources" ADD CONSTRAINT "knowledgeBaseSources_knowledgeBaseId_knowledgeBase_id_fk" FOREIGN KEY ("knowledgeBaseId") REFERENCES "public"."knowledgeBase"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phoneNumbers" ADD CONSTRAINT "phoneNumbers_clientId_clients_id_fk" FOREIGN KEY ("clientId") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "phoneNumbers" ADD CONSTRAINT "phoneNumbers_agentId_agents_id_fk" FOREIGN KEY ("agentId") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voiceClones" ADD CONSTRAINT "voiceClones_agencyId_agencies_id_fk" FOREIGN KEY ("agencyId") REFERENCES "public"."agencies"("id") ON DELETE cascade ON UPDATE no action;