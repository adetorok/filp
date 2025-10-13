// IMPORTANT: Import Sentry first, before any other imports
require('./instrument');

const express = require('express');
const cors = require('cors');
const path = require('path');
const Sentry = require('@sentry/node');
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

// Sentry request handler middleware (must be first)
// Note: Sentry v10 uses different middleware syntax
// app.use(Sentry.requestHandler());

// Middleware
app.use(requestId);
app.use(responseTime);
app.use(securityHeaders);
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'https://houseflipmg.com', // Your custom domain
    'https://www.houseflipmg.com', // www subdomain
    'https://omo-sena.vercel.app',
    'https://omo-sena.netlify.app',
    'http://localhost:3000'
  ],
  credentials: true
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

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Sentry error handler middleware (must be before other error handlers)
// Note: Sentry v10 uses different middleware syntax
// app.use(Sentry.errorHandler());

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

// Debug endpoint for testing Sentry
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
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
