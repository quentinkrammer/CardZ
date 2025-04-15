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

FROM alpine:3.13.2 AS server
# Install thttpd
RUN apk add thttpd
# Create a non-root user to own the files and run our server
RUN adduser -D static
USER static
WORKDIR /home/static

COPY --from=build /app/CardZ/frontend/dist/ .

EXPOSE 5173
# Run thttpd
CMD ["thttpd", "-D", "-h", "0.0.0.0", "-p", "5173", "-d", "/home/static", "-u", "static", "-l", "-", "-M", "60"]