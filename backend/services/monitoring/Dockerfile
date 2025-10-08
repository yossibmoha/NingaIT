# Multi-stage build for Monitoring Service

FROM golang:1.21-alpine AS builder

RUN apk add --no-cache git make

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s" \
    -o monitoring-service \
    ./cmd/monitoring-service

FROM alpine:latest

RUN apk --no-cache add ca-certificates dumb-init

RUN addgroup -g 1001 -S ninjait && \
    adduser -S ninjait -u 1001 -G ninjait

WORKDIR /app

COPY --from=builder --chown=ninjait:ninjait /app/monitoring-service .
COPY --from=builder --chown=ninjait:ninjait /app/config.yaml.example /etc/ninjait/config.yaml

USER ninjait

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3002/health || exit 1

ENTRYPOINT ["dumb-init", "--"]

CMD ["./monitoring-service", "-config", "/etc/ninjait/config.yaml"]

