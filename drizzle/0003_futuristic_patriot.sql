PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_assessments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`course_id` integer NOT NULL,
	`title` text NOT NULL,
	`due_date` text NOT NULL,
	`weight` real,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_assessments`("id", "course_id", "title", "due_date", "weight") SELECT "id", "course_id", "title", "due_date", "weight" FROM `assessments`;--> statement-breakpoint
DROP TABLE `assessments`;--> statement-breakpoint
ALTER TABLE `__new_assessments` RENAME TO `assessments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;