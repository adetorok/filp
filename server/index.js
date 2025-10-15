// IMPORTANT: Import Sentry first (exports initialized SDK or shims)
const Sentry = require('./instrument');

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const prisma = require('./prisma');
const { securityHeaders, authLimiter, searchLimiter, writeLimiter } = require('./middleware/security');
const { requestId, responseTime } = require('./middleware/response');
const { idempotency } = require('./middleware/idempotency');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Safe async handler wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Sentry request handler middleware (must be first) - v8 API
app.use(Sentry.expressRequestHandler());

// Middleware
app.use(requestId);
app.use(responseTime);
app.use(securityHeaders);
// Flexible CORS: allow configured origins + common hosting domains
const explicitOrigins = [
  process.env.FRONTEND_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
  'https://houseflipmg.com',
  'https://www.houseflipmg.com',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow server-to-server or curl (no origin)
    if (!origin) return callback(null, true);
    const allowed =
      explicitOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.endsWith('.netlify.app');
    if (allowed) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Idempotency middleware for write operations
app.use(idempotency());

// Database connection
prisma.$connect()
  .then(() => {
    console.log('Connected to PostgreSQL database');
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });

// Health and monitoring routes (no auth required)
app.use('/api/health', require('./routes/health'));

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api/contractor-marketplace', searchLimiter);
app.use('/api/properties', writeLimiter);
app.use('/api/deals', writeLimiter);
app.use('/api/expenses', writeLimiter);
app.use('/api/tasks', writeLimiter);
app.use('/api/contacts', writeLimiter);
app.use('/api/contractors', writeLimiter);
app.use('/api/permits', writeLimiter);

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/deals', require('./routes/deals'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/subscription', require('./routes/subscription'));
app.use('/api/contractors', require('./routes/contractors'));
app.use('/api/contractor-marketplace', require('./routes/contractor-marketplace'));
app.use('/api/contractor-portal', require('./routes/contractor-portal'));
app.use('/api/permits', require('./routes/permits'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/webhooks', require('./routes/webhooks'));

// Do NOT serve the React app from the API unless explicitly enabled.
// On Render we deploy only the API; frontend lives on Vercel.
// Do not serve the React build from this API service. Frontend is hosted separately.

// Simple root route for API base
app.get('/', (req, res) => {
  res.status(200).send('HomeFlip API is running');
});

// Debug endpoint for testing Sentry (must be before error handlers)
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

// Sentry error handler middleware (must be before other error handlers) - v8 API
app.use(Sentry.expressErrorHandler());

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  if (!res.headersSent) {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'API endpoint not found',
        requestId: res.get('X-Request-ID')
      }
    });
  }
});

// Error handler (must be last)
app.use(function onError(err, req, res, next) {
  // Don't send response if headers already sent
  if (res.headersSent) {
    return next(err);
  }
  
  const status = err.status || err.statusCode || 500;
  const requestId = res.get('X-Request-ID');
  
  res.status(status).json({
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Internal server error',
      requestId,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Simple health check
app.get("/health", (req, res) => {
  if (!res.headersSent) {
    res.status(200).json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      requestId: res.get('X-Request-ID')
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
