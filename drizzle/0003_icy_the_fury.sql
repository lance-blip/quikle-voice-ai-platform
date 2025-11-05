CREATE TABLE "voicemails" (
	"id" serial PRIMARY KEY NOT NULL,
	"call_session_id" uuid,
	"client_id" integer NOT NULL,
	"agent_id" integer,
	"caller_id" varchar(50),
	"recording_url" text NOT NULL,
	"transcription" text,
	"duration_seconds" integer NOT NULL,
	"is_read" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "voicemails" ADD CONSTRAINT "voicemails_call_session_id_call_sessions_id_fk" FOREIGN KEY ("call_session_id") REFERENCES "public"."call_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voicemails" ADD CONSTRAINT "voicemails_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voicemails" ADD CONSTRAINT "voicemails_agent_id_agents_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."agents"("id") ON DELETE set null ON UPDATE no action;