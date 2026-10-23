# Web app image. Build from frontend/: docker build -t mergetip-web .
FROM node:24-slim AS build
RUN corepack enable
WORKDIR /src
COPY . .
RUN pnpm install --frozen-lockfile && pnpm --filter @mergetip/web build \
 && pnpm --filter @mergetip/web deploy --prod /app

FROM node:24-slim
WORKDIR /app
COPY --from=build /app .
COPY --from=build /src/apps/web/build ./build
ENV NODE_ENV=production PORT=3000
EXPOSE 3000
USER node
CMD ["node", "build"]
