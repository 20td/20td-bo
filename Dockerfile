# Multi-stage build for the chat application
FROM node:18-alpine AS backend-build
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app

# Copy backend
COPY --from=backend-build /app/server/node_modules ./server/node_modules
COPY server/ ./server/

# Copy frontend build
COPY --from=frontend-build /app/build ./build

# Install serve to serve the frontend
RUN npm install -g serve

EXPOSE 5000 3000

# Start both backend and frontend
CMD ["sh", "-c", "cd server && npm start & serve -s build -l 3000"]
