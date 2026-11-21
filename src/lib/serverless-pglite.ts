import { PGlite } from "@electric-sql/pglite";
import { PGLiteSocketServer } from "@electric-sql/pglite-socket";
import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { DEFAULT_COMPANY_PROFILE } from "@/lib/settings/config";
import { STORAGE_ROOT } from "@/lib/storage";
import { ALL_OFFICIAL_TEMPLATES } from "@/lib/template/catalog";

export const EMBEDDED_PGLITE_PORT = 5489;
export const EMBEDDED_PGLITE_URL = `postgresql://postgres:postgres@127.0.0.1:${EMBEDDED_PGLITE_PORT}/postgres?connection_limit=1&pgbouncer=true&statement_cache_size=0`;

export function shouldUseEmbeddedPglite(): boolean {
  if (process.env.E2E_TEST_MODE === "1") return false;
  if (process.env.USE_EMBEDDED_PGLITE === "true") return true;
  if (process.env.USE_EMBEDDED_PGLITE === "false") return false;
  if (process.env.VERCEL === "1") {
    const url = (process.env.DATABASE_URL ?? "").trim();
    if (!url || /localhost|127\.0\.0\.1/i.test(url)) {
      return true;
    }
  }
  return false;
}

const g = globalThis as unknown as {
  __ucteknikEmbeddedPgliteReady?: boolean;
  __ucteknikEmbeddedPglitePromise?: Promise<void>;
  __ucteknikSeedDoneCount?: number;
};

export async function ensureServerlessPglite(): Promise<void> {
  if (!shouldUseEmbeddedPglite()) return;
  if (g.__ucteknikEmbeddedPgliteReady) return;
  if (g.__ucteknikEmbeddedPglitePromise) return g.__ucteknikEmbeddedPglitePromise;

  g.__ucteknikEmbeddedPglitePromise = (async () => {
    const db = await PGlite.create();
    const migrationsDir = path.join(/* turbopackIgnore: true */ process.cwd(), "prisma", "migrations");
    const migrationFolders = (await readdir(migrationsDir))
      .filter((name) => /^\d/.test(name))
      .sort();

    for (const folder of migrationFolders) {
      const sqlPath = path.join(migrationsDir, folder, "migration.sql");
      const sql = await readFile(sqlPath, "utf8");
      await db.exec(sql.replace(/^\uFEFF/, ""));
    }

    await seedEmbeddedPglite(db);

    const server = new PGLiteSocketServer({
      db,
      host: "127.0.0.1",
      port: EMBEDDED_PGLITE_PORT,
      maxConnections: 25,
    });
    await server.start();
    await db.exec("DEALLOCATE ALL");
    g.__ucteknikSeedDoneCount = ALL_OFFICIAL_TEMPLATES.length;
    g.__ucteknikEmbeddedPgliteReady = true;
  })().catch((err) => {
    g.__ucteknikEmbeddedPglitePromise = undefined;
    throw err;
  });

  return g.__ucteknikEmbeddedPglitePromise;
}

export async function seedEmbeddedPglite(db: PGlite): Promise<void> {
  const passwordHash = await bcrypt.hash("UcteknikAdmin2026!", 8);
  const nowIso = new Date().toISOString();
  const nextYearIso = new Date(Date.now() + 365 * 86_400_000).toISOString();
  const in15DaysIso = new Date(Date.now() + 15 * 86_400_000).toISOString();

  await db.query(
    `INSERT INTO "User" ("id", "email", "name", "passwordHash", "role", "title", "ekipnetNo", "active", "createdAt", "updatedAt")
     VALUES
       ('usr-admin', 'admin@ucteknik.com', 'Sistem Yöneticisi', $1, 'ADMIN', 'Sistem Yöneticisi', 'K14000001', true, $2, $2),
       ('usr-mustafa', 'mustafa.evmez@ucteknik.com', 'MUSTAFA EVMEZ', $1, 'TECH_MANAGER', 'Periyodik Kontrol Mühendisi / Teknik Müdür', 'K14023896', true, $2, $2),
       ('usr-ahmet', 'ahmet.evmez@ucteknik.com', 'AHMET EVMEZ', $1, 'ENGINEER', 'BK Kİ Muayene Teknik Müdürü', 'K14023897', true, $2, $2)
     ON CONFLICT ("email") DO NOTHING`,
    [passwordHash, nowIso]
  );

  await db.query(
    `INSERT INTO "SystemSetting" ("key", "value", "updatedAt")
     VALUES ($1, $2::jsonb, $3), ($4, $5::jsonb, $3)
     ON CONFLICT ("key") DO NOTHING`,
    [
      "company_profile",
      JSON.stringify({ ...DEFAULT_COMPANY_PROFILE, defaultApproverName: "MUSTAFA EVMEZ" }),
      nowIso,
      "automation_config",
      JSON.stringify({
        reminderDaysBefore: [60, 30, 7],
        calibrationWarningDays: 30,
        katipWarningDays: 2,
        channels: ["EMAIL", "SMS"],
        autoSendCustomerReminders: true,
        autoCreateSalesTasks: true,
        attachSignedPdfOnPublish: true,
      }),
    ]
  );

  for (let i = 0; i < ALL_OFFICIAL_TEMPLATES.length; i++) {
    const tpl = ALL_OFFICIAL_TEMPLATES[i];
    const tplId = `tpl-official-${i + 1}`;
    const verId = `tplv-official-${i + 1}`;
    await db.query(
      `INSERT INTO "FormTemplate" ("id", "code", "name", "category", "serviceCode", "officialRef", "description", "active", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $8)
       ON CONFLICT ("code") DO NOTHING`,
      [
        tplId,
        tpl.code,
        tpl.name,
        tpl.category,
        tpl.serviceCode,
        tpl.standards,
        `${tpl.equipmentName} için resmî periyodik muayene ve ölçüm rapor şablonu (${tpl.footerCode})`,
        nowIso,
      ]
    );
    await db.query(
      `INSERT INTO "FormTemplateVersion" ("id", "templateId", "version", "status", "definition", "changeNote", "createdById", "approvedById", "approvedAt", "publishedAt", "createdAt", "updatedAt")
       VALUES ($1, $2, 1, 'PUBLISHED', $3::jsonb, 'Resmî katalog şablonu', 'usr-admin', 'usr-mustafa', $4, $4, $4, $4)
       ON CONFLICT ("templateId", "version") DO NOTHING`,
      [verId, tplId, JSON.stringify(tpl.definition), nowIso]
    );
  }

  await db.query(
    `INSERT INTO "Customer" ("id", "name", "taxNumber", "taxOffice", "city", "address", "phone", "email", "status", "active", "createdAt", "updatedAt")
     VALUES ('cust-ucteknik', 'ÜçTeknik Endüstriyel A.Ş.', '9040551234', 'Selçuk Vergi Dairesi', 'Konya', '1. Organize Sanayi Bölgesi Büyükkeçeciler Sk. No:22/D Selçuklu/KONYA', '+90 332 248 22 72', 'info@ucteknik.com', 'ACTIVE', true, $1, $1)
     ON CONFLICT ("id") DO NOTHING`,
    [nowIso]
  );

  await db.query(
    `INSERT INTO "Site" ("id", "customerId", "name", "city", "district", "address", "createdAt", "updatedAt")
     VALUES ('site-konya-osb', 'cust-ucteknik', '1. Organize Sanayi Fabrika Tesisi', 'Konya', 'Selçuklu', 'Konya 1. OSB 4. Cadde No:18', $1, $1)
     ON CONFLICT ("id") DO NOTHING`,
    [nowIso]
  );

  const firstTpl = ALL_OFFICIAL_TEMPLATES[0];
  await db.query(
    `INSERT INTO "SiteAsset" ("id", "siteId", "category", "equipmentCode", "name", "manufacturer", "model", "serialNumber", "locationDetail", "preferredTemplateCode", "lastInspectionDate", "nextInspectionDate", "createdAt", "updatedAt")
     VALUES ('asset-fl-01', 'site-konya-osb', $1, 'FL-KNY-01', 'Akülü Forklift 3 Ton', 'Still', 'RX 20-30', 'SN-2024-8841', 'Ana Üretim Holü A-1', $2, $3, $4, $3, $3)
     ON CONFLICT ("id") DO NOTHING`,
    [firstTpl.category, firstTpl.code, nowIso, nextYearIso]
  );

  await db.query(
    `INSERT INTO "WorkOrder" ("id", "workOrderNumber", "customerId", "siteId", "status", "katipStatus", "katipContractId", "plannedDate", "createdAt", "updatedAt")
     VALUES ('wo-2026-0001', 'IE-2026-11-0001', 'cust-ucteknik', 'site-konya-osb', 'COMPLETED', 'APPROVED', 'KTP-2026-42881', $1, $1, $1)
     ON CONFLICT ("id") DO NOTHING`,
    [nowIso]
  );

  await db.query(
    `INSERT INTO "FormSubmission" ("id", "workOrderId", "assetId", "versionId", "status", "data", "filledById", "createdAt", "updatedAt")
     VALUES ('sub-2026-0001', 'wo-2026-0001', 'asset-fl-01', 'tplv-official-1', 'REVIEWED', $1::jsonb, 'usr-ahmet', $2, $2)
     ON CONFLICT ("id") DO NOTHING`,
    [JSON.stringify({ genel_bilgiler: { ekipman_adi: "Akülü Forklift 3 Ton", seri_no: "SN-2024-8841" } }), nowIso]
  );

  const pdfKey = "reports/bk-2026-11-0001.pdf";
  const pdfBytes = Buffer.from("%PDF-1.7\n% Ucteknik ISG-ERP Signed Official Inspection Report\n%%EOF\n", "ascii");
  const pdfHash = createHash("sha256").update(pdfBytes).digest("hex");
  await mkdir(path.dirname(path.join(STORAGE_ROOT, pdfKey)), { recursive: true }).catch(() => {});
  await writeFile(path.join(STORAGE_ROOT, pdfKey), pdfBytes).catch(() => {});

  await db.query(
    `INSERT INTO "Report" ("id", "reportNumber", "customerId", "siteId", "workOrderId", "submissionId", "assetId", "authorId", "reviewerId", "signerId", "serviceCode", "status", "inspectionDate", "reportDate", "nextInspectionDate", "qrToken", "frozenPdfKey", "signedPdfKey", "signedFileHash", "signatureValid", "signedAt", "publishedAt", "createdAt", "updatedAt")
     VALUES ('799f79ee-0871-4ab4-ba34-ea3caccede28', 'BK-2026-11-0001', 'cust-ucteknik', 'site-konya-osb', 'wo-2026-0001', 'sub-2026-0001', 'asset-fl-01', 'usr-ahmet', 'usr-mustafa', 'usr-mustafa', $1, 'PUBLISHED', $2, $2, $3, 'ucteknik2026verifiedqrtoken0000000000000000000001', $4, $4, $5, true, $2, $2, $2, $2)
     ON CONFLICT ("id") DO NOTHING`,
    [firstTpl.serviceCode, nowIso, nextYearIso, pdfKey, pdfHash]
  );

  await db.query(
    `INSERT INTO "Nonconformity" ("id", "reportId", "customerId", "siteId", "assetId", "workOrderId", "itemKey", "code", "description", "severity", "status", "dueDate", "createdAt", "updatedAt")
     VALUES ('dof-2026-0001', '799f79ee-0871-4ab4-ba34-ea3caccede28', 'cust-ucteknik', 'site-konya-osb', 'asset-fl-01', 'wo-2026-0001', 'GENEL_SONUC', 'DOF-2026-0001', 'Forklift geri vites sesli ikaz kornası temas temassızlığı giderilmeli ve bir sonraki kontrole kadar kanıt yüklenmelidir.', 'MAJOR', 'OPEN', $1, $2, $2)
     ON CONFLICT ("reportId", "itemKey") DO NOTHING`,
    [in15DaysIso, nowIso]
  );
}
