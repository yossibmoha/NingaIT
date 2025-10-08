.PHONY: build run test clean deps docker

BINARY_NAME=monitoring-service
VERSION=0.1.0
GO=go

all: clean build

build:
	@echo "Building $(BINARY_NAME)..."
	$(GO) build -v -o $(BINARY_NAME) ./cmd/monitoring-service

run: build
	@echo "Running $(BINARY_NAME)..."
	./$(BINARY_NAME) -config config.yaml.example -verbose

test:
	$(GO) test -v ./...

clean:
	@echo "Cleaning..."
	@rm -f $(BINARY_NAME)
	$(GO) clean

deps:
	$(GO) mod download
	$(GO) mod tidy

fmt:
	$(GO) fmt ./...

vet:
	$(GO) vet ./...

docker:
	docker build -t ninjait/monitoring-service:$(VERSION) .
	docker build -t ninjait/monitoring-service:latest .

help:
	@echo "Available targets:"
	@echo "  build   - Build the binary"
	@echo "  run     - Build and run the service"
	@echo "  test    - Run tests"
	@echo "  clean   - Clean build artifacts"
	@echo "  deps    - Download dependencies"
	@echo "  fmt     - Format code"
	@echo "  vet     - Vet code"
	@echo "  docker  - Build Docker image"

