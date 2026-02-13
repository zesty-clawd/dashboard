# Build stage
FROM node:20-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# Runtime stage
FROM node:20-slim AS runtime

WORKDIR /app
ENV NODE_ENV=production

RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates curl tar \
  && curl -L "https://github.com/Hyaxia/blogwatcher/releases/download/v0.0.2/blogwatcher_0.0.2_linux_amd64.tar.gz" -o /tmp/blogwatcher.tar.gz \
  && tar -xzf /tmp/blogwatcher.tar.gz -C /tmp \
  && install /tmp/blogwatcher /usr/local/bin/blogwatcher \
  && chmod +x /usr/local/bin/blogwatcher \
  && rm -f /tmp/blogwatcher.tar.gz /tmp/blogwatcher \
  && apt-get purge -y curl \
  && apt-get autoremove -y \
  && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY server.js ./server.js

EXPOSE 3000

CMD ["node", "server.js"]
