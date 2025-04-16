FROM node:alpine3.20 AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# Install git
RUN apk add --no-cache git
RUN mkdir -p /app
WORKDIR /app
RUN git clone https://github.com/quentinkrammer/CardZ.git

WORKDIR /app/CardZ/frontend
RUN pnpm install
RUN pnpm build

FROM nginx:alpine AS server
COPY --from=build /app/CardZ/frontend/dist/ /usr/share/nginx/html
COPY --from=build /app/CardZ/frontend/nginx.conf /etc/nginx/nginx.conf

EXPOSE 5173
CMD nginx -g 'daemon off;'