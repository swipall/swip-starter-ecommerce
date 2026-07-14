
FROM oven/bun:alpine AS base


FROM base AS deps
WORKDIR /app

COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile


FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG SWIPALL_SHOP_API_URL
ENV SWIPALL_SHOP_API_URL=$SWIPALL_SHOP_API_URL

ARG CMS_EDITOR_ORIGIN
ENV CMS_EDITOR_ORIGIN=$CMS_EDITOR_ORIGIN

ARG PREVIEW_ACCESS_SECRET
ENV PREVIEW_ACCESS_SECRET=$PREVIEW_ACCESS_SECRET

RUN bun run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1


COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT=3000

CMD ["bun", "server.js"]