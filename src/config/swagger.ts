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
        name: 'Apache-2.0',
        url: 'https://www.apache.org/licenses/LICENSE-2.0',
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and registration endpoints',
      },
      {
        name: 'Health',
        description: 'API health check endpoints',
      },
    ],
    servers: [
      {
        url: 'https://abililife-backend-api.onrender.com',
        description: 'Production server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Development server',
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
              example: 'firebase-uid-123',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'user@example.com',
            },
            phone: {
              type: 'string',
              description: 'User phone number',
              example: '+1234567890',
            },
            fullName: {
              type: 'string',
              description: 'User full name',
              example: 'John Doe',
            },
            isPhoneVerified: {
              type: 'boolean',
              description: 'Whether phone number is verified',
              example: false,
            },
            isEmailVerified: {
              type: 'boolean',
              description: 'Whether email is verified',
              example: false,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account creation timestamp',
              example: '2025-09-01T12:00:00.000Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Account last update timestamp',
              example: '2025-09-01T12:00:00.000Z',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'User created successfully',
            },
            user: {
              type: 'object',
              properties: {
                uid: {
                  type: 'string',
                  example: 'firebase-uid-123',
                },
                email: {
                  type: 'string',
                  example: 'user@example.com',
                },
                fullName: {
                  type: 'string',
                  example: 'John Doe',
                },
                phone: {
                  type: 'string',
                  example: '+1234567890',
                },
              },
            },
            token: {
              type: 'string',
              description: 'Firebase custom token for authentication',
              example: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Error message description',
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
        OTPResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'OTP sent successfully',
            },
            otp: {
              type: 'string',
              description: 'OTP code sent to the user (for testing purposes)',
              example: '123456',
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
          required: ['email', 'password', 'fullName', 'phone'],
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
            fullName: {
              type: 'string',
              description: 'User full name',
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

export const setupSwagger = (app: Application): void => {
  const specs = swaggerJSDoc(options);
  
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'AbiliLife API Documentation',
  }));
};
