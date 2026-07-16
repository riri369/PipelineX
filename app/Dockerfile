# ==========================================
# STAGE 1: Build & Verification Environment
# ==========================================
FROM node:20.12.2-alpine AS builder

# Install security patches and build prerequisites
RUN apk update && apk add --no-cache tini

WORKDIR /usr/src/app

# Copy dependency manifests first to leverage Docker layer caching
COPY package*.json ./

# Install ALL dependencies (including devDependencies for testing)
RUN npm ci

# Copy remaining source code
COPY . .

# Execute static validation/testing inside the build boundary
RUN npm run test

# Prune development dependencies to keep the production payload minimal
RUN npm prune --production

# ==========================================
# STAGE 2: Secure Production Runtime Environment
# ==========================================
FROM node:20.12.2-alpine

# Set deterministic, optimized environment configurations
ENV NODE_ENV=production \
    PORT=8080

WORKDIR /usr/src/app

# Bring over runtime process management binary from builder
RUN apk update && apk add --no-cache tini

# Copy only production dependencies and runtime application files from Stage 1
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/server.js ./server.js

# Expose port explicitly for documentation and mapping engines
EXPOSE 8080

# Enforce Non-Root Execution Strategy for runtime security hardening
USER node

# Utilize Tini as the init system to correctly forward signals (like SIGTERM) to Node.js
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]