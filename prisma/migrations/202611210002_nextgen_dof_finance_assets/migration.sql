ALTER TABLE "SiteAsset" ADD COLUMN IF NOT EXISTS "preferredTemplateCode" TEXT;

CREATE TABLE IF NOT EXISTS "Nonconformity" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "siteId" TEXT NOT NULL,
    "assetId" TEXT,
    "workOrderId" TEXT,
    "itemKey" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT NOT NULL,
    "standardRef" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'MAJOR',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "dueDate" TIMESTAMP(3),
    "customerNote" TEXT,
    "evidenceFileKey" TEXT,
    "evidenceFileName" TEXT,
    "evidenceSha256" TEXT,
    "evidenceSubmittedAt" TIMESTAMP(3),
    "evidenceSubmittedById" TEXT,
    "followUpReportId" TEXT,
    "resolutionNote" TEXT,
    "closedAt" TIMESTAMP(3),
    "closedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Nonconformity_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Nonconformity_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "Report"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Nonconformity_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Nonconformity_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Nonconformity_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "SiteAsset"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Nonconformity_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Nonconformity_evidenceSubmittedById_fkey" FOREIGN KEY ("evidenceSubmittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Nonconformity_followUpReportId_fkey" FOREIGN KEY ("followUpReportId") REFERENCES "Report"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Nonconformity_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Nonconformity_reportId_itemKey_key" ON "Nonconformity"("reportId", "itemKey");
CREATE INDEX IF NOT EXISTS "Nonconformity_customerId_status_idx" ON "Nonconformity"("customerId", "status");
CREATE INDEX IF NOT EXISTS "Nonconformity_status_dueDate_idx" ON "Nonconformity"("status", "dueDate");
CREATE INDEX IF NOT EXISTS "Nonconformity_assetId_status_idx" ON "Nonconformity"("assetId", "status");
CREATE INDEX IF NOT EXISTS "Nonconformity_workOrderId_idx" ON "Nonconformity"("workOrderId");
CREATE INDEX IF NOT EXISTS "Nonconformity_followUpReportId_idx" ON "Nonconformity"("followUpReportId");

CREATE TABLE IF NOT EXISTS "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "eInvoiceUuid" TEXT,
    "customerId" TEXT NOT NULL,
    "offerId" TEXT,
    "workOrderId" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "subTotal" DECIMAL(38,18) NOT NULL,
    "vatRate" INTEGER NOT NULL DEFAULT 20,
    "vatTotal" DECIMAL(38,18) NOT NULL,
    "grandTotal" DECIMAL(38,18) NOT NULL,
    "paidTotal" DECIMAL(38,18) NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ISSUED',
    "notes" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Invoice_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Invoice_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Invoice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");
CREATE INDEX IF NOT EXISTS "Invoice_customerId_status_idx" ON "Invoice"("customerId", "status");
CREATE INDEX IF NOT EXISTS "Invoice_status_dueDate_idx" ON "Invoice"("status", "dueDate");
CREATE INDEX IF NOT EXISTS "Invoice_offerId_idx" ON "Invoice"("offerId");
CREATE INDEX IF NOT EXISTS "Invoice_workOrderId_idx" ON "Invoice"("workOrderId");

CREATE TABLE IF NOT EXISTS "InvoicePayment" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(38,18) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL DEFAULT 'EFT_HAVALE',
    "referenceNo" TEXT,
    "note" TEXT,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InvoicePayment_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InvoicePayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InvoicePayment_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "InvoicePayment_invoiceId_paymentDate_idx" ON "InvoicePayment"("invoiceId", "paymentDate");
