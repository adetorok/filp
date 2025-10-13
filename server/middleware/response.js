const { v4: uuidv4 } = require('uuid');

// Standardized error response
const errorResponse = (res, statusCode, code, message, details = null) => {
  const requestId = res.get('X-Request-ID') || uuidv4();
  
  return res.status(statusCode).json({
    error: {
      code,
      message,
      details,
      requestId
    }
  });
};

// Standardized success response
const successResponse = (res, statusCode, data, meta = null) => {
  const response = { data };
  if (meta) {
    response.meta = meta;
  }
  return res.status(statusCode).json(response);
};

// Pagination helper
const paginate = (data, page, pageSize, total) => {
  const totalPages = Math.ceil(total / pageSize);
  
  return {
    data,
    pagination: {
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  };
};

// Validation error response
const validationError = (res, errors) => {
  return errorResponse(res, 400, 'VALIDATION_ERROR', 'Validation failed', {
    fields: errors
  });
};

// Authentication error response
const authError = (res, message = 'Authentication required') => {
  return errorResponse(res, 401, 'UNAUTHENTICATED', message);
};

// Authorization error response
const forbiddenError = (res, message = 'Insufficient permissions') => {
  return errorResponse(res, 403, 'INSUFFICIENT_PERMISSIONS', message);
};

// Not found error response
const notFoundError = (res, resource = 'Resource') => {
  return errorResponse(res, 404, 'NOT_FOUND', `${resource} not found`);
};

// Conflict error response
const conflictError = (res, message = 'Resource already exists') => {
  return errorResponse(res, 409, 'CONFLICT', message);
};

// Rate limit error response
const rateLimitError = (res, message = 'Too many requests') => {
  return errorResponse(res, 429, 'RATE_LIMIT_EXCEEDED', message);
};

// Server error response
const serverError = (res, message = 'Internal server error') => {
  return errorResponse(res, 500, 'INTERNAL_SERVER_ERROR', message);
};

// Request ID middleware
const requestId = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || uuidv4();
  res.set('X-Request-ID', requestId);
  req.requestId = requestId;
  next();
};

// Response time middleware - disabled to prevent headers sent errors
const responseTime = (req, res, next) => {
  // Just pass through without setting response time headers
  // to avoid ERR_HTTP_HEADERS_SENT errors
  next();
};

module.exports = {
  errorResponse,
  successResponse,
  paginate,
  validationError,
  authError,
  forbiddenError,
  notFoundError,
  conflictError,
  rateLimitError,
  serverError,
  requestId,
  responseTime
};
