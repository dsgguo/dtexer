# Stage 1: Build the Frontend (Vite/React)
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
# Remove electron deps for web build to save space/time
RUN npm ci --omit=dev && npm install vite @vitejs/plugin-react typescript

# Copy source
COPY . .

# Build for web (using tsc && vite build)
# Note: standard build script runs electron-builder, so we use npx vite build explicitly
RUN npx tsc && npx vite build

# Stage 2: Production Server (Node/Express)
FROM node:20-alpine

WORKDIR /app

# Copy server dependencies
COPY package.json package-lock.json ./
RUN npm install express cors dotenv axios

# Copy server code
COPY server.js ./

# Copy built frontend from Stage 1
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Environment variables should be passed at runtime
# ENV HIDDEN_API_BASE=...
# ENV HIDDEN_API_KEY=...
# ENV APP_ACCESS_SECRET=...

CMD ["node", "server.js"]
