import { defineConfig, devices } from "@playwright/test";
import { randomUUID } from "node:crypto";

const postgresSchema = process.env.E2E_POSTGRES_URL?.trim()
  ? `ucteknik_e2e_${randomUUID().replaceAll("-", "")}`
  : undefined;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 15_000 },
  use: { baseURL: "http://127.0.0.1:3127", trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  ...(postgresSchema ? {
    metadata: { testPostgresSchema: postgresSchema },
    globalTeardown: "./scripts/test-postgres-teardown.ts",
  } : {}),
  webServer: {
    command: "pnpm exec tsx scripts/test-server.ts",
    url: "http://127.0.0.1:3127/login",
    timeout: 180_000,
    reuseExistingServer: process.env.E2E_REUSE_SERVER === "true",
    ...(postgresSchema ? { env: { E2E_POSTGRES_SCHEMA: postgresSchema } } : {}),
  },
});
