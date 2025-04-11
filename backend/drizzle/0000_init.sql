CREATE TABLE `cards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`color` text NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `card_to_player` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`card_id` integer NOT NULL,
	`player_id` integer NOT NULL,
	FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `communications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`type` text NOT NULL,
	`card_id` integer NOT NULL,
	`game_id` integer NOT NULL,
	FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `drafted_quest` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` integer NOT NULL,
	`quest_id` text NOT NULL,
	`player_id` integer,
	`turn_id` integer,
	`isSuccess` integer,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`quest_id`) REFERENCES `quests`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`player_id`) REFERENCES `players`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`turn_id`) REFERENCES `turns`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `games` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lobby_id` text NOT NULL,
	FOREIGN KEY (`lobby_id`) REFERENCES `lobby`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `lobby` (
	`id` text PRIMARY KEY NOT NULL,
	`questCount` integer DEFAULT 3 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lobby_to_user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lobby_id` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`lobby_id`) REFERENCES `lobby`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lobby_to_user_lobby_id_user_id_unique` ON `lobby_to_user` (`lobby_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `players` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`number` integer NOT NULL,
	`user_id` text NOT NULL,
	`game_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `quests` (
	`id` text PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE `turns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`card_id` integer NOT NULL,
	`game_id` integer NOT NULL,
	FOREIGN KEY (`card_id`) REFERENCES `cards`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
