# Multi-stage build for NinjaIT Agent

# Stage 1: Builder
FROM golang:1.21-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git make

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the agent
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build \
    -ldflags="-w -s" \
    -o ninjait-agent \
    ./cmd/ninjait-agent

# Stage 2: Production
FROM alpine:latest

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates dumb-init

# Create non-root user
RUN addgroup -g 1001 -S ninjait && \
    adduser -S ninjait -u 1001 -G ninjait

# Create config directory
RUN mkdir -p /etc/ninjait && \
    chown -R ninjait:ninjait /etc/ninjait

WORKDIR /app

# Copy binary from builder
COPY --from=builder --chown=ninjait:ninjait /app/ninjait-agent .
COPY --from=builder --chown=ninjait:ninjait /app/agent.yaml.example /etc/ninjait/agent.yaml

# Switch to non-root user
USER ninjait

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Run the agent
CMD ["./ninjait-agent", "-config", "/etc/ninjait/agent.yaml"]

