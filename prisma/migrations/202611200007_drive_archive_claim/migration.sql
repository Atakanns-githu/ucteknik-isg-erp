ALTER TABLE "Report"
  ADD COLUMN "drivePendingFileId" TEXT,
  ADD COLUMN "driveSyncAttemptId" TEXT,
  ADD COLUMN "driveSyncLeaseUntil" TIMESTAMP(3);
