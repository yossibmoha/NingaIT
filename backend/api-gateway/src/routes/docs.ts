/**
 * Documentation Routes
 * Alternative documentation views including Redoc
 */

import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export async function docsRoutes(fastify: FastifyInstance) {
  
  /**
   * GET /api-docs/redoc
   * Redoc documentation page
   */
  fastify.get('/redoc', async (request: FastifyRequest, reply: FastifyReply) => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>NinjaIT API Documentation - Redoc</title>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🥷</text></svg>">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    }
  </style>
</head>
<body>
  <div id="redoc-container"></div>
  <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
  <script>
    Redoc.init(
      '/docs/json',
      {
        scrollYOffset: 0,
        hideDownloadButton: false,
        disableSearch: false,
        hideHostname: false,
        expandResponses: '200,201',
        requiredPropsFirst: true,
        sortPropsAlphabetically: true,
        showExtensions: true,
        noAutoAuth: false,
        pathInMiddlePanel: false,
        expandSingleSchemaField: true,
        theme: {
          colors: {
            primary: {
              main: '#1890ff'
            },
            success: {
              main: '#52c41a'
            },
            warning: {
              main: '#faad14'
            },
            error: {
              main: '#f5222d'
            },
          },
          typography: {
            fontSize: '14px',
            fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            headings: {
              fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontWeight: '600',
            },
            code: {
              fontSize: '13px',
              fontFamily: '"Fira Code", "Monaco", "Courier New", monospace',
            },
          },
          sidebar: {
            width: '280px',
            backgroundColor: '#fafafa',
          },
          rightPanel: {
            backgroundColor: '#263238',
            width: '40%',
          },
        },
        options: {
          downloadFileName: 'ninjait-api-spec.json',
          expandDefaultServerVariables: true,
        }
      },
      document.getElementById('redoc-container')
    );
  </script>
</body>
</html>
    `;

    reply.type('text/html').send(html);
  });

  /**
   * GET /api-docs/postman
   * Generate Postman collection
   */
  fastify.get('/postman', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      // Get the OpenAPI spec
      const spec = await fastify.swagger();
      
      // Convert to Postman collection format
      const postmanCollection = {
        info: {
          name: 'NinjaIT API',
          description: spec.info?.description || 'NinjaIT Platform API',
          version: spec.info?.version || '1.0.0',
          schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
        },
        auth: {
          type: 'bearer',
          bearer: [
            {
              key: 'token',
              value: '{{access_token}}',
              type: 'string',
            },
          ],
        },
        variable: [
          {
            key: 'base_url',
            value: 'http://localhost:8000',
            type: 'string',
          },
          {
            key: 'access_token',
            value: '',
            type: 'string',
          },
        ],
      };

      reply.type('application/json').send(postmanCollection);
    } catch (error) {
      reply.code(500).send({ error: 'Failed to generate Postman collection' });
    }
  });

  /**
   * GET /api-docs/changelog
   * API changelog
   */
  fastify.get('/changelog', async (request: FastifyRequest, reply: FastifyReply) => {
    const changelog = {
      version: '0.3.0',
      changes: [
        {
          version: '0.3.0',
          date: '2025-10-09',
          changes: [
            'Added comprehensive dashboard with health scoring',
            'Integrated 5 databases (PostgreSQL, InfluxDB, Dragonfly, ClickHouse, RabbitMQ)',
            'Added metrics API with 8 endpoints',
            'Added cache management API with 11 endpoints',
            'Implemented rate limiting and session management',
            'Added comprehensive API documentation with Swagger and Redoc',
          ],
        },
        {
          version: '0.2.0',
          date: '2025-10-08',
          changes: [
            'Added device management endpoints',
            'Implemented WebSocket support for real-time updates',
            'Added alert system with multi-channel notifications',
            'Added script execution engine',
            'Enhanced dashboard with real-time charts',
          ],
        },
        {
          version: '0.1.0',
          date: '2025-10-07',
          changes: [
            'Initial API release',
            'User authentication and RBAC',
            'Basic device monitoring',
            'Organization management',
          ],
        },
      ],
    };

    reply.send(changelog);
  });
}

