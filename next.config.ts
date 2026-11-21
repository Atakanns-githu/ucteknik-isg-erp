import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== "production";
const isProd = process.env.NODE_ENV === "production";
const configuredAppUrl = (
  process.env.NEXT_PUBLIC_APP_URL ??
  process.env.AUTH_URL ??
  ""
)
  .trim()
  .toLowerCase();
const isHttpsAppUrl = configuredAppUrl.startsWith("https://");
const hstsExplicit = (process.env.ENABLE_HSTS ?? "").trim().toLowerCase();
const enableStaticHsts =
  isProd && (hstsExplicit === "true" || (hstsExplicit !== "false" && isHttpsAppUrl));
const hstsHeader = {
  key: "Strict-Transport-Security",
  value: "max-age=31536000; includeSubDomains",
};

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=()" },
  { key: "X-XSS-Protection", value: "0" },
  ...(enableStaticHsts ? [hstsHeader] : []),
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self' http://127.0.0.1:* https://127.0.0.1:* ws://127.0.0.1:* wss://127.0.0.1:* http://localhost:* https://localhost:* ws://localhost:* wss://localhost:*",
      "frame-src 'self' blob:",
      "object-src 'self' blob:",
      "worker-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  output: "standalone",
  // Drive SDK & embedded PGlite are server-only; keep them external in serverless bundles.
  serverExternalPackages: ["googleapis", "@electric-sql/pglite", "@electric-sql/pglite-socket"],
  outputFileTracingExcludes: {
    "/*": [".env", ".env.*", "storage/**/*", "certs/**/*", ".quality/**/*", ".backups/**/*", "enlap için/**/*", "e2e/**/*", "docs/**/*"],
  },
  outputFileTracingIncludes: {
    "/*": ["src/assets/fonts/*.ttf", "src/assets/*.png", "prisma/migrations/**/*"],
  },
  devIndicators: false,
  logging: { serverFunctions: false },
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
      ...(isProd && !enableStaticHsts && hstsExplicit !== "false"
        ? [
            {
              source: "/(.*)",
              has: [{ type: "header" as const, key: "x-forwarded-proto", value: "https" }],
              headers: [hstsHeader],
            },
          ]
        : []),
    ];
  },
};

export default nextConfig;
