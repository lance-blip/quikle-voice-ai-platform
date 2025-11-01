CREATE TABLE `knowledgeBaseSources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`knowledgeBaseId` int NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledgeBaseSources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `knowledgeBaseSources` ADD CONSTRAINT `knowledgeBaseSources_knowledgeBaseId_knowledgeBase_id_fk` FOREIGN KEY (`knowledgeBaseId`) REFERENCES `knowledgeBase`(`id`) ON DELETE cascade ON UPDATE no action;