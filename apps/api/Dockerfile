# Property-App-AI API — multi-stage production image.
# Build from repo root: docker build -f apps/api/Dockerfile -t property-api .

FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts

FROM deps AS build
COPY . .
RUN NODE_OPTIONS=--max-old-space-size=8192 npx nx run api:build --configuration=production

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist/apps/api ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./
EXPOSE 3333
CMD ["node", "main.js"]
