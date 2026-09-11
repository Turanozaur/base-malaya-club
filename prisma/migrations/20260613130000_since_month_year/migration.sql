-- Convert year integers to first-of-month timestamps.
ALTER TABLE "User"
  ALTER COLUMN "baseSince" TYPE TIMESTAMP(3)
  USING (
    CASE
      WHEN "baseSince" IS NOT NULL THEN make_timestamp("baseSince"::integer, 1, 1, 0, 0, 0)
      ELSE NULL
    END
  );

ALTER TABLE "User"
  ALTER COLUMN "skydiveSince" TYPE TIMESTAMP(3)
  USING (
    CASE
      WHEN "skydiveSince" IS NOT NULL THEN make_timestamp("skydiveSince"::integer, 1, 1, 0, 0, 0)
      ELSE NULL
    END
  );
