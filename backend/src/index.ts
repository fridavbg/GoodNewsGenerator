import dotenv from 'dotenv';
import express, { Application } from 'express';
import cors from 'cors';
import searchRouter from './routes/search';
import { errorHandler } from './middleware/errorMiddleware';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Logging middleware - log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Middleware
app.use(cors());
app.use(express.json());

/**
 * Environment Validation
 * Check for required environment variables on startup
 */
const requiredEnvVars = ['ANTHROPIC_API_KEY', 'NEWS_API_KEY'];
const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach((key) => {
    console.error(`   - ${key}`);
  });
  console.error('');
  console.error('Please create a .env file with the following:');
  console.error('   ANTHROPIC_API_KEY=sk-ant-...');
  console.error('   NEWS_API_KEY=your-newsapi-key');
  console.error('   MOCK_CLAUDE=true  (optional, for development)');
  console.error('');
  process.exit(1);
}


// Environment configuration logging
console.log(`
╔════════════════════════════════════════╗
║     GoodNews Backend Starting...        ║
╚════════════════════════════════════════╝
`);
console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`MOCK_CLAUDE: ${process.env.MOCK_CLAUDE || 'false'}`);
console.log(`PORT: ${PORT}`);
console.log('');

/**
 * Health Check Endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

/**
 * API Routes
 */
app.use('/api/search', searchRouter);

/**
 * 404 Handler
 */
app.use((req, res) => {
  res.status(404).json({
    error: true,
    status: 404,
    message: 'Endpoint not found',
    path: req.path,
    method: req.method,
  });
});

/**
 * Error Handling Middleware
 * Must be last middleware
 */
app.use(errorHandler);

/**
 * Start Server
 */
app.listen(PORT, () => {
  console.log(`✓ Server running on http://localhost:${PORT}`);
  console.log(`✓ Health check: GET http://localhost:${PORT}/health`);
  console.log(`✓ Search endpoint: POST http://localhost:${PORT}/api/search`);
  console.log('');
});

/**
 * Graceful Shutdown
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

// Unhandled promise rejection handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Uncaught exception handler
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});