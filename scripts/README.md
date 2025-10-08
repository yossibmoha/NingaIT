# Scripts

Utility scripts for development, deployment, and maintenance.

## Available Scripts

### Development

- `setup-dev.sh` - Set up local development environment
- `reset-db.sh` - Reset database to clean state
- `seed-data.sh` - Seed database with sample data

### Testing

- `run-tests.sh` - Run all tests
- `run-integration-tests.sh` - Run integration tests
- `check-coverage.sh` - Check test coverage

### Deployment

- `deploy-staging.sh` - Deploy to staging environment
- `deploy-production.sh` - Deploy to production environment
- `rollback.sh` - Rollback to previous version

### Database

- `backup-db.sh` - Backup database
- `restore-db.sh` - Restore database from backup
- `migrate-db.sh` - Run database migrations

### Utilities

- `generate-api-docs.sh` - Generate API documentation
- `check-dependencies.sh` - Check for outdated dependencies
- `cleanup.sh` - Clean up temporary files

## Usage

```bash
# Make script executable
chmod +x scripts/script-name.sh

# Run script
./scripts/script-name.sh
```

## Directory Structure

```
scripts/
├── dev/           # Development scripts
├── deploy/        # Deployment scripts
├── database/      # Database scripts
├── test/          # Testing scripts
└── utils/         # Utility scripts
```

