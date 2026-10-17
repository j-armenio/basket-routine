ALTER TABLE `sessions` ADD `paused_at` integer;--> statement-breakpoint
ALTER TABLE `sessions` ADD `paused_ms` integer DEFAULT 0 NOT NULL;