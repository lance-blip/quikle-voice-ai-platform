CREATE TABLE "announcements" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"audio_url" text,
	"tts_text" text,
	"voice_id" varchar(255),
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;