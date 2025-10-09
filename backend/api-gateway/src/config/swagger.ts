/**
 * Swagger/OpenAPI Configuration
 * Automatic API documentation generation
 */

import { SwaggerOptions } from '@fastify/swagger';
import { FastifySwaggerUiOptions } from '@fastify/swagger-ui';

export const swaggerConfig: SwaggerOptions = {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'NinjaIT API Documentation',
      description: `
# NinjaIT Platform API

Enterprise-grade IT management platform combining RMM, PSA, and AI-powered automation.

## Features

- **Device Management**: Monitor and manage all your devices from a single platform
- **Metrics & Monitoring**: Real-time metrics collection with InfluxDB time-series database
- **Alerts & Notifications**: Intelligent alerting system with multi-channel notifications
- **User Management**: Advanced RBAC with organization-based multi-tenancy
- **Caching & Sessions**: High-performance caching with Dragonfly (Redis-compatible)
- **Analytics**: Powerful analytics engine with ClickHouse
- **Async Processing**: Message queue system with RabbitMQ

## Authentication

All API endpoints require JWT authentication. Include the token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

To obtain a token, use the \`/api/v1/auth/login\` endpoint.

## Rate Limiting

API requests are rate-limited to prevent abuse:
- **Standard**: 100 requests per minute
- **Auth endpoints**: 10 requests per 5 minutes
- **Heavy operations**: 10 requests per minute

Rate limit information is included in response headers:
- \`X-RateLimit-Limit\`: Maximum requests allowed
- \`X-RateLimit-Remaining\`: Remaining requests in current window
- \`X-RateLimit-Reset\`: Time when the rate limit resets

## Response Format

All API responses follow a consistent format:

**Success Response:**
\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
\`\`\`

**Error Response:**
\`\`\`json
{
  "success": false,
  "error": "Error type",
  "message": "Detailed error message"
}
\`\`\`

## Pagination

List endpoints support pagination with the following query parameters:
- \`page\`: Page number (default: 1)
- \`limit\`: Items per page (default: 20, max: 100)
- \`sort\`: Sort field (default: created_at)
- \`order\`: Sort order (asc/desc, default: desc)

## Database Architecture

- **PostgreSQL**: Core relational data (users, devices, organizations)
- **InfluxDB**: Time-series metrics and monitoring data
- **Dragonfly**: High-performance caching and sessions
- **ClickHouse**: Analytics and reporting
- **RabbitMQ**: Async task processing and events

## Support

- **Documentation**: https://github.com/yossibmoha/NinjaIT/docs
- **Issues**: https://github.com/yossibmoha/NinjaIT/issues
- **Email**: support@ninjait.io
      `,
      version: '0.3.0',
      termsOfService: 'https://ninjait.io/terms',
      contact: {
        name: 'NinjaIT Support',
        url: 'https://ninjait.io/support',
        email: 'support@ninjait.io',
      },
      license: {
        name: 'Proprietary',
        url: 'https://ninjait.io/license',
      },
    },
    externalDocs: {
      url: 'https://github.com/yossibmoha/NinjaIT/docs',
      description: 'Complete documentation',
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'Development server',
      },
      {
        url: 'https://api-staging.ninjait.io',
        description: 'Staging server',
      },
      {
        url: 'https://api.ninjait.io',
        description: 'Production server',
      },
    ],
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and authorization endpoints',
      },
      {
        name: 'Users',
        description: 'User management and profile operations',
      },
      {
        name: 'Devices',
        description: 'Device monitoring and management',
      },
      {
        name: 'Metrics',
        description: 'Metrics ingestion and querying (InfluxDB)',
      },
      {
        name: 'Alerts',
        description: 'Alert rules and notifications management',
      },
      {
        name: 'Scripts',
        description: 'Script management and execution',
      },
      {
        name: 'Cache',
        description: 'Cache and session management (Dragonfly)',
      },
      {
        name: 'Analytics',
        description: 'Analytics and reporting (ClickHouse)',
      },
      {
        name: 'System',
        description: 'System health and monitoring',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT authentication token obtained from /api/v1/auth/login',
        },
        refreshToken: {
          type: 'apiKey',
          in: 'header',
          name: 'X-Refresh-Token',
          description: 'Refresh token for obtaining new access tokens',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              example: 'ValidationError',
            },
            message: {
              type: 'string',
              example: 'Invalid input data',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '550e8400-e29b-41d4-a716-446655440000',
            },
            organizationId: {
              type: 'string',
              format: 'uuid',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'user@example.com',
            },
            firstName: {
              type: 'string',
              example: 'John',
            },
            lastName: {
              type: 'string',
              example: 'Doe',
            },
            fullName: {
              type: 'string',
              example: 'John Doe',
            },
            roles: {
              type: 'array',
              items: {
                type: 'string',
              },
              example: ['admin', 'user'],
            },
            isActive: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            lastLogin: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Device: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            name: {
              type: 'string',
              example: 'Server-Prod-001',
            },
            deviceType: {
              type: 'string',
              enum: ['server', 'workstation', 'laptop', 'mobile', 'network'],
              example: 'server',
            },
            osType: {
              type: 'string',
              example: 'Linux',
            },
            osVersion: {
              type: 'string',
              example: 'Ubuntu 22.04 LTS',
            },
            status: {
              type: 'string',
              enum: ['online', 'offline', 'warning', 'critical'],
              example: 'online',
            },
            ipAddress: {
              type: 'string',
              format: 'ipv4',
              example: '192.168.1.100',
            },
            lastSeen: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Metric: {
          type: 'object',
          properties: {
            cpu: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              example: 45.5,
            },
            memory: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              example: 62.3,
            },
            disk: {
              type: 'number',
              minimum: 0,
              maximum: 100,
              example: 75.8,
            },
            network_in: {
              type: 'number',
              minimum: 0,
              example: 1024.5,
            },
            network_out: {
              type: 'number',
              minimum: 0,
              example: 512.3,
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        ValidationError: {
          description: 'Invalid input data',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
        RateLimitError: {
          description: 'Too many requests',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
};

export const swaggerUiConfig: FastifySwaggerUiOptions = {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'list',
    deepLinking: true,
    displayOperationId: true,
    defaultModelsExpandDepth: 3,
    defaultModelExpandDepth: 3,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
  },
  staticCSP: true,
  transformStaticCSP: (header) => header,
  transformSpecification: (swaggerObject) => {
    return swaggerObject;
  },
  transformSpecificationClone: true,
};

/**
 * Redoc configuration for alternative documentation UI
 */
export const redocConfig = {
  routePrefix: '/redoc',
  hideDownloadButton: false,
  theme: {
    colors: {
      primary: {
        main: '#1890ff',
      },
    },
    typography: {
      fontSize: '14px',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    },
  },
  options: {
    disableSearch: false,
    hideHostname: false,
    expandResponses: '200,201',
    requiredPropsFirst: true,
    sortPropsAlphabetically: true,
    showExtensions: true,
    noAutoAuth: false,
    pathInMiddlePanel: false,
    hideDownloadButton: false,
    downloadFileName: 'ninjait-api.json',
    expandSingleSchemaField: true,
  },
};

