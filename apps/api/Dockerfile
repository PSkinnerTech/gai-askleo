# 1. Builder stage: Install all dependencies, copy source, and build the app
FROM oven/bun:1 as builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install
COPY . .
RUN bun run build

# 2. Runner stage: Create a lean production image
FROM oven/bun:1 as runner
WORKDIR /app
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/bun.lockb ./bun.lockb

# Install production dependencies only
RUN bun install --production

COPY --from=builder /app/dist ./dist

ENV NODE_ENV production
ENV PORT 8080
ENV HOST 0.0.0.0

EXPOSE 8080

CMD ["bun", "run", "dist/index.js"]
