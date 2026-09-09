# ShopSphere Backend Dockerfile
# Multi-stage build for production-ready image

# ========================================
# Build Stage
# ========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

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

# Install production dependencies only
COPY package*.json ./
RUN npm ci --omit=dev

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