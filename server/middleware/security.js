const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { body, validationResult } = require('express-validator');

// Rate limiting configurations
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute
  message: {
    error: 'Too many search requests, please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

const writeLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 write requests per minute
  message: {
    error: 'Too many write requests, please slow down.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Security headers middleware
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false
});

// RBAC middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: roles,
        current: req.user.role
      });
    }

    next();
  };
};

// Organization access middleware
const requireOrganizationAccess = (permissions = ['read']) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const organizationId = req.params.organizationId || req.body.organizationId;
      
      if (!organizationId) {
        return res.status(400).json({ error: 'Organization ID required' });
      }

      // Check if user has access to this organization
      const membership = await prisma.organizationMember.findFirst({
        where: {
          organizationId,
          userId: req.user.id,
          isActive: true
        }
      });

      if (!membership) {
        return res.status(403).json({ error: 'Access denied to organization' });
      }

      // Check permissions based on role
      const rolePermissions = {
        OWNER: ['read', 'write', 'delete', 'admin'],
        ADMIN: ['read', 'write', 'delete'],
        MEMBER: ['read', 'write'],
        VIEWER: ['read']
      };

      const userPermissions = rolePermissions[membership.role] || [];
      const hasPermission = permissions.every(permission => 
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res.status(403).json({ 
          error: 'Insufficient permissions for this organization',
          required: permissions,
          current: userPermissions
        });
      }

      req.organizationId = organizationId;
      req.organizationRole = membership.role;
      next();
    } catch (error) {
      console.error('Organization access check failed:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Input validation middleware
const validateInput = (rules) => {
  return [
    ...rules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }
      next();
    }
  ];
};

// Password strength validation
const passwordValidation = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters')
  .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
  .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number');

// Email validation
const emailValidation = body('email')
  .isEmail()
  .withMessage('Valid email address required')
  .normalizeEmail();

// Sanitize input middleware
const sanitizeInput = (req, res, next) => {
  // Basic XSS protection
  const sanitize = (obj) => {
    if (typeof obj === 'string') {
      return obj.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (typeof obj === 'object' && obj !== null) {
      for (let key in obj) {
        obj[key] = sanitize(obj[key]);
      }
    }
    return obj;
  };

  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
};

module.exports = {
  authLimiter,
  searchLimiter,
  writeLimiter,
  securityHeaders,
  requireRole,
  requireOrganizationAccess,
  validateInput,
  passwordValidation,
  emailValidation,
  sanitizeInput
};
