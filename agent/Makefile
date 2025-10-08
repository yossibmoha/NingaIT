.PHONY: build install clean run test

# Build variables
BINARY_NAME=ninjait-agent
VERSION=0.1.0
BUILD_DIR=build
GO=go
GOFLAGS=-v

# Platform specific
GOOS=$(shell go env GOOS)
GOARCH=$(shell go env GOARCH)

all: clean build

build:
	@echo "Building $(BINARY_NAME) v$(VERSION) for $(GOOS)/$(GOARCH)..."
	@mkdir -p $(BUILD_DIR)
	$(GO) build $(GOFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME) ./cmd/ninjait-agent

build-linux:
	@echo "Building for Linux..."
	GOOS=linux GOARCH=amd64 $(GO) build $(GOFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-linux-amd64 ./cmd/ninjait-agent

build-windows:
	@echo "Building for Windows..."
	GOOS=windows GOARCH=amd64 $(GO) build $(GOFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-windows-amd64.exe ./cmd/ninjait-agent

build-darwin:
	@echo "Building for macOS..."
	GOOS=darwin GOARCH=amd64 $(GO) build $(GOFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-darwin-amd64 ./cmd/ninjait-agent
	GOOS=darwin GOARCH=arm64 $(GO) build $(GOFLAGS) -o $(BUILD_DIR)/$(BINARY_NAME)-darwin-arm64 ./cmd/ninjait-agent

build-all: build-linux build-windows build-darwin
	@echo "Built for all platforms"

install: build
	@echo "Installing $(BINARY_NAME)..."
	@mkdir -p /etc/ninjait
	@cp agent.yaml.example /etc/ninjait/agent.yaml
	@cp $(BUILD_DIR)/$(BINARY_NAME) /usr/local/bin/
	@echo "Installed to /usr/local/bin/$(BINARY_NAME)"

clean:
	@echo "Cleaning..."
	@rm -rf $(BUILD_DIR)
	$(GO) clean

run: build
	@echo "Running $(BINARY_NAME)..."
	@$(BUILD_DIR)/$(BINARY_NAME) -config agent.yaml.example -verbose

test:
	$(GO) test -v ./...

fmt:
	$(GO) fmt ./...

vet:
	$(GO) vet ./...

deps:
	$(GO) mod download
	$(GO) mod tidy

help:
	@echo "Available targets:"
	@echo "  build        - Build for current platform"
	@echo "  build-all    - Build for all platforms"
	@echo "  build-linux  - Build for Linux"
	@echo "  build-windows- Build for Windows"
	@echo "  build-darwin - Build for macOS"
	@echo "  install      - Install agent system-wide"
	@echo "  clean        - Clean build artifacts"
	@echo "  run          - Build and run agent"
	@echo "  test         - Run tests"
	@echo "  fmt          - Format code"
	@echo "  vet          - Vet code"
	@echo "  deps         - Download dependencies"

