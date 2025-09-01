import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeFirebase, isFirebaseReady } from './config/firebase';
import { setupSwagger } from './config/swagger';
import authRoutes from './routes/auth';
import { errorHandler } from './middleware/errorHandler';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Firebase
initializeFirebase();

// Setup Swagger documentation
setupSwagger(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', authRoutes);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint with Firebase status
 *     tags: [System]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 *                 message:
 *                   type: string
 *                   example: "AbiliLife Backend is running"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 environment:
 *                   type: string
 *                   example: "development"
 *                 firebase:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "connected"
 *                     projectId:
 *                       type: string
 *                       example: "your-project-id"
 */
// Health check endpoint
app.get('/health', (req, res) => {
  const firebaseStatus = isFirebaseReady();
  
  res.status(200).json({
    status: firebaseStatus ? 'OK' : 'DEGRADED',
    message: 'AbiliLife Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    firebase: {
      status: firebaseStatus ? 'connected' : 'disconnected',
      projectId: process.env.FIREBASE_PROJECT_ID || 'not-configured'
    }
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The endpoint ${req.originalUrl} does not exist`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 AbiliLife Backend server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
});

export default app;
