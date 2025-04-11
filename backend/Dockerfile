FROM node:alpine3.20

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN apk add --no-cache git
RUN mkdir -p /app
WORKDIR /app

RUN git clone https://github.com/quentinkrammer/CardZ.git
WORKDIR /app/CardZ/backend

RUN pnpm install

ENTRYPOINT ["sleep", "infinity"]