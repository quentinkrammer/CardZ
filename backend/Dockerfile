FROM node:alpine3.20 AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS source
RUN apk add --no-cache git
RUN mkdir -p /app
WORKDIR /app
RUN git clone https://github.com/quentinkrammer/CardZ.git


FROM source AS prod-deps
WORKDIR /app/CardZ
RUN pnpm install --frozen-lockfile
RUN pnpm --filter=backend --prod deploy prodNodeModules

FROM source AS build
WORKDIR /app/CardZ/backend
RUN pnpm install --frozen-lockfile
RUN pnpm build
RUN pnpm db:migrate

FROM base
COPY --from=prod-deps /app/CardZ/prodNodeModules/node_modules /app/CardZ/backend/node_modules
COPY --from=build /app/CardZ/backend/dist /app/CardZ/backend/dist
COPY --from=build /app/CardZ/backend/db.production.sqlite /app/CardZ/backend/db.production.sqlite
EXPOSE 3000

ENTRYPOINT ["node", "/app/CardZ/backend/dist/index.js"]