import { promises as fs, constants as fsConstants } from "node:fs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureServerlessPglite, shouldUseEmbeddedPglite } from "@/lib/serverless-pglite";
import { STORAGE_ROOT } from "@/lib/storage";

const NO_STORE_HEADERS = { "Cache-Control": "no-store" } as const;
const HEALTH_CACHE_TTL_MS = 5_000;

let cachedHealth: { dbOk: boolean; storageOk: boolean; checkedAt: number } | null = null;

async function checkDatabase(): Promise<boolean> {
  try {
    if (shouldUseEmbeddedPglite()) {
      await ensureServerlessPglite();
    }
    const timeoutMs = shouldUseEmbeddedPglite() ? 15_000 : 3_000;
    await Promise.race([
      prisma.$queryRaw`SELECT 1`,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("DB timeout")), timeoutMs)
      ),
    ]);
    return true;
  } catch (err) {
    console.error("[health] DB kontrolü başarısız:", err);
    return false;
  }
}

async function checkStorage(): Promise<boolean> {
  try {
    await fs.mkdir(STORAGE_ROOT, { recursive: true });
    await fs.access(STORAGE_ROOT, fsConstants.R_OK | fsConstants.W_OK);
    return true;
  } catch (err) {
    console.error("[health] Depo kontrolü başarısız:", err);
    return false;
  }
}

export async function GET() {
  const now = Date.now();
  let dbOk: boolean;
  let storageOk: boolean;
  if (cachedHealth && now - cachedHealth.checkedAt < HEALTH_CACHE_TTL_MS) {
    dbOk = cachedHealth.dbOk;
    storageOk = cachedHealth.storageOk;
  } else {
    [dbOk, storageOk] = await Promise.all([checkDatabase(), checkStorage()]);
    cachedHealth = { dbOk, storageOk, checkedAt: now };
  }
  const allHealthy = dbOk && storageOk;

  return NextResponse.json(
    {
      status: allHealthy ? "ok" : "degraded",
      checks: {
        database: dbOk ? "ok" : "error",
        storage: storageOk ? "ok" : "error",
      },
      timestamp: new Date().toISOString(),
    },
    { status: allHealthy ? 200 : 503, headers: NO_STORE_HEADERS }
  );
}
