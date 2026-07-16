# ==========================================
# STAGE 1: Build & Verification Environment
# ==========================================
FROM node:20.12.2-alpine AS builder

RUN apk update && apk add --no-cache tini

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run test
RUN npm prune --production

# ==========================================
# STAGE 2: Secure Production Runtime Environment
# ==========================================
FROM node:20.12.2-alpine

ENV NODE_ENV=production \
    PORT=8080

WORKDIR /usr/src/app
RUN apk update && apk add --no-cache tini

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/server.js ./server.js

EXPOSE 8080
USER node

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server.js"]