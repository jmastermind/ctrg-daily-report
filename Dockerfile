FROM node:20-alpine AS base

# ── deps: install all node_modules (no scripts) ──────────────────────────────
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

# ── builder: generate prisma client + next build ──────────────────────────────
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
# Placeholder URL so prisma generate doesn't fail without a real DB
ENV DATABASE_URL=postgresql://build:build@localhost:5432/build

RUN npx prisma generate
RUN npm run build

# ── runner: lean production image ─────────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Install production node_modules fresh (no devDeps, no scripts)
COPY package.json package-lock.json* ./
COPY prisma ./prisma/
RUN npm ci --omit=dev --ignore-scripts

# Generate Prisma client in runner (uses DATABASE_URL from runtime env)
# We copy the generated client from builder so we don't need DB at build
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Static assets and logo
COPY --from=builder /app/public ./public

# Next.js standalone bundle
RUN mkdir .next && chown nextjs:nodejs .next
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# prisma migrate deploy (runs as nextjs) needs to extract the schema-engine
# binary into node_modules/@prisma/engines — give that user write access
RUN chown -R nextjs:nodejs node_modules/@prisma node_modules/.prisma node_modules/prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
