BEGIN;

CREATE TABLE "FieldVisitTemplateScope" (
    "visitId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    CONSTRAINT "FieldVisitTemplateScope_pkey" PRIMARY KEY ("visitId", "templateId"),
    CONSTRAINT "FieldVisitTemplateScope_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "FieldVisit"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FieldVisitTemplateScope_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE "InspectorQualification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "ekipnetNo" TEXT NOT NULL,
    "diplomaNo" TEXT NOT NULL,
    "authorizationReference" TEXT NOT NULL,
    "trainingReference" TEXT NOT NULL,
    "validFrom" DATE NOT NULL,
    "validUntil" DATE,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InspectorQualification_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "InspectorQualification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InspectorQualification_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "FormTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "InspectorQualification_valid_dates_check" CHECK ("validUntil" IS NULL OR "validUntil" >= "validFrom"),
    CONSTRAINT "InspectorQualification_evidence_check" CHECK (
      btrim("ekipnetNo") <> '' AND btrim("diplomaNo") <> '' AND
      btrim("authorizationReference") <> '' AND btrim("trainingReference") <> ''
    )
);

CREATE INDEX "FieldVisitTemplateScope_templateId_idx" ON "FieldVisitTemplateScope"("templateId");
CREATE INDEX "InspectorQualification_userId_templateId_validFrom_idx" ON "InspectorQualification"("userId", "templateId", "validFrom");
CREATE INDEX "InspectorQualification_templateId_idx" ON "InspectorQualification"("templateId");

COMMIT;
