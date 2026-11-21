BEGIN;
SET LOCAL extra_float_digits = 3;

ALTER TABLE "Offer"
  ALTER COLUMN "totalAmount" TYPE DECIMAL(38, 18) USING ("totalAmount"::text::numeric),
  ALTER COLUMN "discountTotal" TYPE DECIMAL(38, 18) USING ("discountTotal"::text::numeric),
  ALTER COLUMN "taxRate" TYPE DECIMAL(38, 18) USING ("taxRate"::text::numeric),
  ALTER COLUMN "grandTotal" TYPE DECIMAL(38, 18) USING ("grandTotal"::text::numeric);

ALTER TABLE "OfferItem"
  ALTER COLUMN "unitPrice" TYPE DECIMAL(38, 18) USING ("unitPrice"::text::numeric),
  ALTER COLUMN "totalPrice" TYPE DECIMAL(38, 18) USING ("totalPrice"::text::numeric);

COMMIT;
