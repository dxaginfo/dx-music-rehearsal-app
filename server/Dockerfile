FROM node:16-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Production image
FROM node:16-alpine

WORKDIR /app

# Set node environment
ENV NODE_ENV production

# Copy built app from builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

# Expose the port
EXPOSE 5000

# Run database migrations and start the server
CMD npx prisma migrate deploy && npm start