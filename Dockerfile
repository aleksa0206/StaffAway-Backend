# Build stage: needs devDependencies (prisma CLI, typescript).
FROM node:24-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# prisma.config.ts requires DATABASE_URL even though generate never connects.
RUN DATABASE_URL=mysql://build:build@localhost:3306/build npx prisma generate \
 && npm run build \
 && npm prune --omit=dev

# Runtime stage: compiled code + production deps only.
# Migrations: run from the build stage, which still has the prisma CLI:
#   docker build --target build -t staffaway-migrate . && docker run --env-file .env staffaway-migrate npx prisma migrate deploy
FROM node:24-alpine
ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

USER node
EXPOSE 4000
CMD ["node", "dist/index.js"]
