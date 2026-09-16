# ShopSphere Backend Dockerfile
# Multi-stage build for production-ready image

# ========================================
# Build Stage
# ========================================
FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache openssl

# Install dependencies
COPY package*.json ./
RUN npm install --no-audit --no-fund \
    --fetch-retries=5 \
    --fetch-retry-mintimeout=20000 \
    --fetch-retry-maxtimeout=120000 \
    --fetch-timeout=300000 \
    --maxsockets=1

# Copy source code
COPY prisma ./prisma/
COPY src ./src/
COPY tsconfig.json ./

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# ========================================
# Production Stage
# ========================================
FROM node:20-alpine AS production

WORKDIR /app

RUN apk add --no-cache openssl

# Install production dependencies only
COPY package*.json ./
RUN npm install --omit=dev --no-audit --no-fund \
    --fetch-retries=5 \
    --fetch-retry-mintimeout=20000 \
    --fetch-retry-maxtimeout=120000 \
    --fetch-timeout=300000 \
    --maxsockets=1

# Copy built files and Prisma
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma/

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3000

# Start the application
CMD ["node", "dist/server.js"]