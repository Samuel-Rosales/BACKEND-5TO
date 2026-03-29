-- Manual migration to align DB with Prisma schema change:
-- Appoinment.start_datetime -> Appoinment.date_time (required)

ALTER TABLE "Appoinment" ADD COLUMN "date_time" TIMESTAMP(3);

UPDATE "Appoinment"
SET "date_time" = "start_datetime"
WHERE "date_time" IS NULL;

ALTER TABLE "Appoinment" ALTER COLUMN "date_time" SET NOT NULL;

ALTER TABLE "Appoinment" DROP COLUMN "start_datetime";
