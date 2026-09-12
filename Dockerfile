# Multi-stage production build for Farm2Market AI
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/prisma ./prisma
RUN cp prisma/schema.postgresql.prisma prisma/schema.prisma && npx prisma generate
COPY backend/ ./
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

COPY backend/package*.json ./
RUN npm install --omit=dev && npm install tsx -g

COPY backend/prisma ./prisma
RUN cp prisma/schema.postgresql.prisma prisma/schema.prisma && npx prisma generate

COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/scripts ./scripts
COPY --from=backend-builder /app/backend/src ./src
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 5000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx tsx prisma/seed.ts && node dist/index.js"]
