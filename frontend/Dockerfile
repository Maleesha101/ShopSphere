# ShopSphere Frontend Dockerfile
# Multi-stage build for optimized production image

# ========================================
# Build Stage
# ========================================
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install --no-audit --no-fund

# Copy source code
COPY src ./src/
COPY vite.config.ts ./
COPY tsconfig.json ./
COPY index.html ./

# Build application
RUN npm run build

# ========================================
# Production Stage
# ========================================
FROM node:20-alpine AS production

WORKDIR /app

# Install only runtime dependencies
RUN npm install -g serve

# Copy built files
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5173

CMD ["serve", "-s", "dist", "-l", "5173"]