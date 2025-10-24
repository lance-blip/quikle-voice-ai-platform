CREATE TABLE `carrierRegistry` (
	`id` int AUTO_INCREMENT NOT NULL,
	`carrierName` varchar(100) NOT NULL,
	`region` enum('south-africa','international') NOT NULL,
	`priority` int NOT NULL DEFAULT 10,
	`isActive` int NOT NULL DEFAULT 1,
	`sipEndpoint` text,
	`apiBaseUrl` text,
	`apiCredentials` text,
	`supportedCodecs` text,
	`maxConcurrentCalls` int,
	`latencyBenchmarkMs` int,
	`costPerMinuteZar` varchar(10),
	`currency` enum('ZAR','USD') NOT NULL DEFAULT 'ZAR',
	`setupFee` varchar(10),
	`monthlyBase` varchar(10),
	`capabilities` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `carrierRegistry_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `phoneNumbers` MODIFY COLUMN `provider` enum('twilio','telnyx','saicom','wanatel','avoxi','switch','iptelecom','united','telkom','vodacom') NOT NULL;