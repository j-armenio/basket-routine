-- Right-Hand Layups and Left-Hand Layups became one predefined exercise, Layups (seed key `layups`).
-- The right-hand row is kept and re-keyed (the seed renames it), the left-hand one is folded into
-- it: its template and session entries move over (sessions keep their own name snapshot) and the
-- row is archived. A fresh install has neither row, so every statement is a no-op there.
UPDATE `exercises` SET `seed_key` = 'layups' WHERE `seed_key` = 'right_hand_layups';
--> statement-breakpoint
UPDATE `workout_exercises` SET `exercise_id` = (SELECT `id` FROM `exercises` WHERE `seed_key` = 'layups') WHERE `exercise_id` = (SELECT `id` FROM `exercises` WHERE `seed_key` = 'left_hand_layups') AND EXISTS (SELECT 1 FROM `exercises` WHERE `seed_key` = 'layups');
--> statement-breakpoint
UPDATE `session_exercises` SET `exercise_id` = (SELECT `id` FROM `exercises` WHERE `seed_key` = 'layups') WHERE `exercise_id` = (SELECT `id` FROM `exercises` WHERE `seed_key` = 'left_hand_layups') AND EXISTS (SELECT 1 FROM `exercises` WHERE `seed_key` = 'layups');
--> statement-breakpoint
UPDATE `exercises` SET `archived_at` = unixepoch() * 1000 WHERE `seed_key` = 'left_hand_layups' AND `archived_at` IS NULL AND EXISTS (SELECT 1 FROM `exercises` WHERE `seed_key` = 'layups');
