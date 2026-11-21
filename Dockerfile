FROM node:22-bookworm-slim AS base
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/* \
  && openssl version | grep -q "^OpenSSL 3\."
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@10.6.5 --activate

FROM base AS dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --no-frozen-lockfile

FROM dependencies AS build
COPY . .
RUN DATABASE_URL=postgresql://build:build@127.0.0.1:1/build pnpm prisma:generate
RUN DATABASE_URL=postgresql://build:build@127.0.0.1:1/build NEXT_TELEMETRY_DISABLED=1 pnpm build

FROM build AS tools
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 AUTOMATION_RUNNER_MODE=worker
RUN mkdir -p /app/storage /app/certs && chown -R node:node /app/storage /app/certs
USER node
CMD ["pnpm", "worker"]

FROM base AS runner
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 HOSTNAME=0.0.0.0 PORT=3000
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
RUN mkdir -p /app/storage /app/certs && chown -R node:node /app/storage /app/certs
USER node
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
CMD ["node", "server.js"]
