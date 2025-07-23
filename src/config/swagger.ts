import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AbiliLife Backend API',
      version: '1.0.0',
      description: 'API documentation for AbiliLife Backend application',
      contact: {
        name: 'AbiliLife Team',
        url: 'https://github.com/AbiliLife/AbiliLife-backend',
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-production-url.com' 
          : `http://localhost:${process.env.PORT || 3000}`,
        description: process.env.NODE_ENV === 'production' 
          ? 'Production server' 
          : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
        firebaseAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'Firebase ID Token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            uid: {
              type: 'string',
              description: 'Firebase User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
            },
            phone: {
              type: 'string',
              description: 'User phone number',
            },
            displayName: {
              type: 'string',
              description: 'User display name',
            },
            photoURL: {
              type: 'string',
              format: 'uri',
              description: 'User profile photo URL',
            },
            emailVerified: {
              type: 'boolean',
              description: 'Whether email is verified',
            },
            disabled: {
              type: 'boolean',
              description: 'Whether user account is disabled',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            message: {
              type: 'string',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
            token: {
              type: 'string',
              description: 'Firebase custom token or ID token',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
            },
            message: {
              type: 'string',
            },
            statusCode: {
              type: 'integer',
            },
          },
        },
        OTPRequest: {
          type: 'object',
          required: ['phone'],
          properties: {
            phone: {
              type: 'string',
              description: 'Phone number in international format',
              example: '+1234567890',
            },
          },
        },
        OTPVerification: {
          type: 'object',
          required: ['phone', 'otp'],
          properties: {
            phone: {
              type: 'string',
              description: 'Phone number in international format',
              example: '+1234567890',
            },
            otp: {
              type: 'string',
              description: 'OTP code received via SMS',
              example: '123456',
            },
          },
        },
        SignupRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'User password (minimum 6 characters)',
              example: 'password123',
            },
            displayName: {
              type: 'string',
              description: 'User display name',
              example: 'John Doe',
            },
            phone: {
              type: 'string',
              description: 'Phone number in international format',
              example: '+1234567890',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              description: 'User password',
              example: 'password123',
            },
          },
        },
      },
    },
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './src/models/*.ts',
  ],
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Application): void => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AbiliLife API Documentation',
  }));
};

export { specs };
