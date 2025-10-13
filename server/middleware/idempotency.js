const crypto = require('crypto');
const prisma = require('../prisma');

// In-memory cache for idempotency keys (in production, use Redis)
const idempotencyCache = new Map();

// Idempotency middleware
const idempotency = (ttlMinutes = 60) => {
  return async (req, res, next) => {
    // Only apply to POST/PATCH/PUT methods
    if (!['POST', 'PATCH', 'PUT'].includes(req.method)) {
      return next();
    }

    const idempotencyKey = req.headers['idempotency-key'] || req.headers['Idempotency-Key'];
    
    if (!idempotencyKey) {
      return next();
    }

    // Validate idempotency key format
    if (!isValidIdempotencyKey(idempotencyKey)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_IDEMPOTENCY_KEY',
          message: 'Idempotency key must be a valid UUID or 32-character string',
          details: { provided: idempotencyKey }
        }
      });
    }

    // Create cache key with user context
    const cacheKey = `${req.user?.id || 'anonymous'}:${idempotencyKey}`;
    
    // Check if we've seen this key before
    const cached = idempotencyCache.get(cacheKey);
    if (cached) {
      // Check if cache entry is still valid
      if (Date.now() - cached.timestamp < ttlMinutes * 60 * 1000) {
        // Return cached response
        return res.status(cached.status).json(cached.data);
      } else {
        // Remove expired entry
        idempotencyCache.delete(cacheKey);
      }
    }

    // Store original response methods
    const originalJson = res.json;
    const originalStatus = res.status;
    
    let responseData = null;
    let responseStatus = 200;

    // Override response methods to capture response
    res.json = function(data) {
      responseData = data;
      return originalJson.call(this, data);
    };

    res.status = function(code) {
      responseStatus = code;
      return originalStatus.call(this, code);
    };

    // Override res.end to capture the final response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
      // Store response in cache
      if (responseData !== null) {
        idempotencyCache.set(cacheKey, {
          data: responseData,
          status: responseStatus,
          timestamp: Date.now()
        });
      }
      
      return originalEnd.call(this, chunk, encoding);
    };

    next();
  };
};

// Validate idempotency key format
function isValidIdempotencyKey(key) {
  // UUID format or 32-character alphanumeric string
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const alphanumericRegex = /^[a-zA-Z0-9]{32}$/;
  
  return uuidRegex.test(key) || alphanumericRegex.test(key);
}

// Generate idempotency key
function generateIdempotencyKey() {
  return crypto.randomUUID();
}

// Clean expired idempotency keys
function cleanExpiredKeys(ttlMinutes = 60) {
  const now = Date.now();
  const ttlMs = ttlMinutes * 60 * 1000;
  
  for (const [key, value] of idempotencyCache.entries()) {
    if (now - value.timestamp > ttlMs) {
      idempotencyCache.delete(key);
    }
  }
}

// Run cleanup every 5 minutes
setInterval(() => cleanExpiredKeys(), 5 * 60 * 1000);

module.exports = {
  idempotency,
  generateIdempotencyKey,
  isValidIdempotencyKey,
  cleanExpiredKeys
};
