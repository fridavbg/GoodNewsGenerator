import { config } from './config';
import express, { Application } from 'express';
import cors from 'cors';
import searchRouter from './routes/search';
import { errorHandler } from './middleware/errorMiddleware';

const app: Application = express();
const PORT = config.PORT;

// Logging middleware - log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Middleware
app.use(cors());
app.use(express.json());


// Environment configuration logging
console.log(`
╔════════════════════════════════════════╗
║     GoodNews Backend Starting...        ║
╚════════════════════════════════════════╝
`);
console.log(`MODEL: ${config.CLAUDE_MODEL}`);
console.log(`NODE_ENV: ${config.NODE_ENV}`);
console.log(`MOCK_MODE: ${config.MOCK_MODE}`);
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