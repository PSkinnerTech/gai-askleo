# 1. Builder stage: Install all dependencies, copy source, and build the app
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2. Runner stage: Create a lean production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 askleo

# Copy production dependencies and package.json
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built app and start script from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

USER askleo

EXPOSE 8080

ENV PORT 8080
ENV HOST 0.0.0.0

CMD ["npm", "start"]
