# NinjaIT Backend

Backend API services for NinjaIT platform.

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js / NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL, Redis, InfluxDB, MongoDB
- **ORM**: Prisma / TypeORM
- **Testing**: Jest

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run database migrations
npm run migrate

# Start development server
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run lint` - Lint code
- `npm run lint:fix` - Fix linting issues
- `npm run migrate` - Run database migrations
- `npm run migrate:create` - Create new migration

## Project Structure

```
backend/
├── src/
│   ├── api/           # API routes and controllers
│   ├── services/      # Business logic
│   ├── models/        # Database models
│   ├── middleware/    # Express middleware
│   ├── utils/         # Helper functions
│   ├── config/        # Configuration
│   ├── types/         # TypeScript types
│   └── tests/         # Tests
├── prisma/            # Prisma schema and migrations
├── package.json
└── tsconfig.json
```

## API Documentation

API documentation is available at:
- Development: http://localhost:8000/api/docs
- Swagger UI: http://localhost:8000/api/swagger

## Development

See [DEVELOPMENT.md](../docs/DEVELOPMENT.md) for detailed development guide.

