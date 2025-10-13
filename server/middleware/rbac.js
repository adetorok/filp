const prisma = require('../prisma');

// RBAC Permission Matrix
const PERMISSIONS = {
  // Property Management
  'properties:read': ['ADMIN', 'USER', 'STAFF'],
  'properties:write': ['ADMIN', 'USER', 'STAFF'],
  'properties:delete': ['ADMIN', 'USER'],
  'properties:admin': ['ADMIN'],

  // Deal Management
  'deals:read': ['ADMIN', 'USER', 'STAFF'],
  'deals:write': ['ADMIN', 'USER', 'STAFF'],
  'deals:delete': ['ADMIN', 'USER'],
  'deals:admin': ['ADMIN'],

  // Expense Management
  'expenses:read': ['ADMIN', 'USER', 'STAFF'],
  'expenses:write': ['ADMIN', 'USER', 'STAFF'],
  'expenses:delete': ['ADMIN', 'USER'],
  'expenses:admin': ['ADMIN'],

  // Task Management
  'tasks:read': ['ADMIN', 'USER', 'STAFF'],
  'tasks:write': ['ADMIN', 'USER', 'STAFF'],
  'tasks:delete': ['ADMIN', 'USER'],
  'tasks:admin': ['ADMIN'],

  // Contact Management
  'contacts:read': ['ADMIN', 'USER', 'STAFF'],
  'contacts:write': ['ADMIN', 'USER', 'STAFF'],
  'contacts:delete': ['ADMIN', 'USER'],
  'contacts:admin': ['ADMIN'],

  // Contractor Management
  'contractors:read': ['ADMIN', 'USER', 'STAFF', 'CONTRACTOR'],
  'contractors:write': ['ADMIN', 'USER', 'STAFF'],
  'contractors:delete': ['ADMIN'],
  'contractors:admin': ['ADMIN'],
  'contractors:verify': ['ADMIN', 'STAFF'],
  'contractors:score': ['ADMIN', 'STAFF'],

  // Contractor Portal
  'contractor-portal:read': ['CONTRACTOR'],
  'contractor-portal:write': ['CONTRACTOR'],
  'contractor-portal:challenge': ['CONTRACTOR'],

  // Reports
  'reports:read': ['ADMIN', 'USER', 'STAFF'],
  'reports:export': ['ADMIN', 'USER', 'STAFF'],
  'reports:admin': ['ADMIN'],

  // Subscription
  'subscription:read': ['ADMIN', 'USER'],
  'subscription:write': ['ADMIN', 'USER'],
  'subscription:admin': ['ADMIN'],

  // Organization Management
  'organizations:read': ['ADMIN', 'USER', 'STAFF'],
  'organizations:write': ['ADMIN'],
  'organizations:delete': ['ADMIN'],
  'organizations:members': ['ADMIN', 'USER'],
  'organizations:admin': ['ADMIN'],

  // Webhooks
  'webhooks:read': ['ADMIN', 'USER'],
  'webhooks:write': ['ADMIN', 'USER'],
  'webhooks:delete': ['ADMIN', 'USER'],
  'webhooks:test': ['ADMIN', 'USER'],

  // Admin Operations
  'admin:audit': ['ADMIN'],
  'admin:metrics': ['ADMIN'],
  'admin:export': ['ADMIN'],
  'admin:compute-scores': ['ADMIN'],
  'admin:enrich': ['ADMIN', 'STAFF'],

  // Health & Monitoring
  'health:read': [], // Public endpoint
  'metrics:read': ['ADMIN', 'STAFF']
};

// Multi-tenant enforcement middleware
const enforceTenancy = (resourceType) => {
  return async (req, res, next) => {
    try {
      // Get organization ID from various sources
      const organizationId = req.params.organizationId || 
                           req.body.organizationId || 
                           req.headers['x-org-id'] ||
                           req.user?.defaultOrganizationId;

      if (!organizationId) {
        return res.status(400).json({
          error: {
            code: 'MISSING_ORGANIZATION',
            message: 'Organization ID is required',
            details: { resourceType }
          }
        });
      }

      // Verify user has access to this organization
      const membership = await prisma.organizationMember.findFirst({
        where: {
          organizationId,
          userId: req.user.id,
          isActive: true
        }
      });

      if (!membership) {
        return res.status(403).json({
          error: {
            code: 'ORGANIZATION_ACCESS_DENIED',
            message: 'Access denied to organization',
            details: { organizationId }
          }
        });
      }

      // Inject organization context
      req.organizationId = organizationId;
      req.organizationRole = membership.role;
      req.organizationPermissions = getRolePermissions(membership.role);

      next();
    } catch (error) {
      console.error('Tenancy enforcement error:', error);
      res.status(500).json({
        error: {
          code: 'TENANCY_ERROR',
          message: 'Failed to enforce tenancy',
          details: { error: error.message }
        }
      });
    }
  };
};

// Permission checking middleware
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHENTICATED',
          message: 'Authentication required'
        }
      });
    }

    const userRole = req.user.role;
    const allowedRoles = PERMISSIONS[permission] || [];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: {
          code: 'INSUFFICIENT_PERMISSIONS',
          message: 'Insufficient permissions',
          details: {
            required: permission,
            userRole,
            allowedRoles
          }
        }
      });
    }

    next();
  };
};

// Combined permission and tenancy middleware
const requirePermissionAndTenancy = (permission, resourceType) => {
  return [requirePermission(permission), enforceTenancy(resourceType)];
};

// Get permissions for a role
function getRolePermissions(role) {
  const permissions = [];
  for (const [permission, allowedRoles] of Object.entries(PERMISSIONS)) {
    if (allowedRoles.includes(role)) {
      permissions.push(permission);
    }
  }
  return permissions;
}

// Check if user has specific permission
function hasPermission(userRole, permission) {
  const allowedRoles = PERMISSIONS[permission] || [];
  return allowedRoles.includes(userRole);
}

// Get user's organization context
async function getUserOrganizationContext(userId) {
  const memberships = await prisma.organizationMember.findMany({
    where: {
      userId,
      isActive: true
    },
    include: {
      organization: true
    }
  });

  return memberships.map(membership => ({
    organizationId: membership.organizationId,
    organizationName: membership.organization.name,
    role: membership.role,
    permissions: getRolePermissions(membership.role)
  }));
}

module.exports = {
  PERMISSIONS,
  enforceTenancy,
  requirePermission,
  requirePermissionAndTenancy,
  getRolePermissions,
  hasPermission,
  getUserOrganizationContext
};
