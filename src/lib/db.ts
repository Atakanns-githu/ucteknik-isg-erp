import { PrismaClient } from "@prisma/client";
import {
  EMBEDDED_PGLITE_URL,
  ensureServerlessPglite,
  shouldUseEmbeddedPglite,
} from "@/lib/serverless-pglite";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const READ_OPERATIONS = new Set([
  "findMany",
  "findFirst",
  "findFirstOrThrow",
  "findUnique",
  "findUniqueOrThrow",
  "count",
  "aggregate",
  "groupBy",
]);

function isTransientConnectionError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const code = (err as { code?: string }).code;
  if (code === "P1001" || code === "P1008" || code === "P1017") return true;
  const msg = String((err as { message?: string }).message || "");
  return /Can't reach database server|Server has closed the connection|ECONNRESET|ETIMEDOUT|10054/i.test(
    msg
  );
}

function createPrismaClient(): PrismaClient {
  const useEmbedded = shouldUseEmbeddedPglite();
  const base = new PrismaClient({
    ...(useEmbedded ? { datasourceUrl: EMBEDDED_PGLITE_URL } : {}),
    log:
      process.env.PRISMA_LOG_QUERIES === "true"
        ? ["query", "error", "warn"]
        : ["error", "warn"],
  });

  // Uyku/ağ dalgalanması sonrası kopan TCP soketlerinde salt okunur sorguları kısa beklemeyle yeniden dene
  const extended = base.$extends({
    query: {
      $allModels: {
        async $allOperations({ operation, args, query }) {
          if (useEmbedded) {
            await ensureServerlessPglite();
          }
          try {
            return await query(args);
          } catch (err) {
            if (!READ_OPERATIONS.has(operation) || !isTransientConnectionError(err)) {
              throw err;
            }
            for (let attempt = 1; attempt <= 2; attempt++) {
              await new Promise((r) => setTimeout(r, 120 * attempt));
              await base.$connect().catch(() => {});
              try {
                return await query(args);
              } catch (retryErr) {
                if (attempt === 2 || !isTransientConnectionError(retryErr)) {
                  throw retryErr;
                }
              }
            }
            throw err;
          }
        },
      },
    },
  });

  return extended as unknown as PrismaClient;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
