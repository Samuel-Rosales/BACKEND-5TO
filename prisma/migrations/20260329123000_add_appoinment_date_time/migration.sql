-- NOTE (2026-03-29): No-op migration.
--
-- Context:
-- - Early migrations created the scheduling table with a typo: "Appoinment".
-- - Migration 20260329022443_remove_total_bs DROPS "Appoinment" and CREATES "Appointment"
--   with "date_time" TIMESTAMP(3) NOT NULL.
--
-- Therefore, this migration became obsolete and must not reference the dropped table.

SELECT 1;
