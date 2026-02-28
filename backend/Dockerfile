# ── Backend Dockerfile ─────────────────────────────────────────
FROM node:20-alpine

WORKDIR /app

# Install dependencies first (Docker layer caching)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source code
COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads

EXPOSE 4000

CMD ["node", "server.js"]
