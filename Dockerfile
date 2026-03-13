# Property-App-AI API — production image (no mock data).
# Build from repo root: docker build -f Dockerfile -t property-api .
# Run: docker run -p 3333:3333 --env-file .env property-api

FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

COPY apps/api apps/api
COPY libs libs
COPY nx.json tsconfig.base.json ./
COPY apps/api/webpack.config.js apps/api/
COPY apps/api/tsconfig.app.json apps/api/
COPY apps/api/jest.config.js apps/api/

ENV NODE_ENV=production
RUN npx nx run api:build --configuration=production

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist/apps/api ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

ENV NODE_ENV=production
EXPOSE 3333

CMD ["node", "main.js"]
