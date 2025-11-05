CREATE TABLE "call_queue_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"queue_id" integer NOT NULL,
	"call_session_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"entered_at" timestamp DEFAULT now() NOT NULL,
	"exited_at" timestamp,
	"wait_time_seconds" integer,
	"exit_reason" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "call_queue_entries" ADD CONSTRAINT "call_queue_entries_queue_id_call_queues_id_fk" FOREIGN KEY ("queue_id") REFERENCES "public"."call_queues"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "call_queue_entries" ADD CONSTRAINT "call_queue_entries_call_session_id_call_sessions_id_fk" FOREIGN KEY ("call_session_id") REFERENCES "public"."call_sessions"("id") ON DELETE cascade ON UPDATE no action;