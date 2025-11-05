CREATE TABLE "routing_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"priority" integer DEFAULT 0 NOT NULL,
	"conditions" jsonb NOT NULL,
	"destination_type" varchar(50) NOT NULL,
	"destination_id" integer,
	"is_active" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "routing_rules" ADD CONSTRAINT "routing_rules_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;