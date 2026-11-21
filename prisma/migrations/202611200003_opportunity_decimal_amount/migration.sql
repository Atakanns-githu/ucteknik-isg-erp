BEGIN;
SET LOCAL extra_float_digits = 3;

ALTER TABLE "Opportunity"
  ALTER COLUMN "estimatedValue" TYPE DECIMAL(650, 330) USING ("estimatedValue"::text::numeric);

COMMIT;
