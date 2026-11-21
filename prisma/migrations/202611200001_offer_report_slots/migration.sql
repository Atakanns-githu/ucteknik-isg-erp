CREATE TABLE "OfferReportSlot" (
    "offerItemId" TEXT NOT NULL,
    "slotIndex" INTEGER NOT NULL,
    "workOrderId" TEXT NOT NULL,
    CONSTRAINT "OfferReportSlot_pkey" PRIMARY KEY ("offerItemId", "slotIndex"),
    CONSTRAINT "OfferReportSlot_slotIndex_check" CHECK ("slotIndex" >= 1),
    CONSTRAINT "OfferReportSlot_offerItemId_fkey" FOREIGN KEY ("offerItemId") REFERENCES "OfferItem"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OfferReportSlot_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "OfferReportSlot_workOrderId_idx" ON "OfferReportSlot"("workOrderId");
