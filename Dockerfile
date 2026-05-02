# Multi-stage build for NestJS backend

# Stage 1: Build
FROM node:20.19.0-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Copy prisma schema BEFORE npm ci (so postinstall script can find it)
COPY prisma ./prisma

# Install ALL dependencies (postinstall: prisma generate will run now)
RUN npm ci

# Copy source
COPY . .

# Build TypeScript
RUN npm run build

# Stage 2: Runtime
FROM node:20.19.0-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Copy package files
COPY package*.json ./

# Install only production dependencies (skip scripts)
RUN npm ci --only=production --ignore-scripts && npm cache clean --force

# Copy generated Prisma Client from builder
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Create app user for security (don't run as root)
RUN addgroup -g 1001 -S nodejs && adduser -S nestjs -u 1001

USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (res) => { if (res.statusCode !== 200) throw new Error(res.statusCode) })"

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/src/main.js"]
