const prisma = require('../prisma');

// Audit logging middleware
const auditLog = (action, targetType) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Log the action after response is sent
      setImmediate(async () => {
        try {
          if (req.user && req.organizationId) {
            await prisma.auditLog.create({
              data: {
                organizationId: req.organizationId,
                actorId: req.user.id,
                action: action,
                targetType: targetType,
                targetId: req.params.id || req.body.id || 'unknown',
                meta: {
                  method: req.method,
                  url: req.originalUrl,
                  body: req.method !== 'GET' ? req.body : undefined,
                  query: req.query,
                  statusCode: res.statusCode
                },
                ipAddress: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent')
              }
            });
          }
        } catch (error) {
          console.error('Audit logging failed:', error);
          // Don't fail the request if audit logging fails
        }
      });
      
      originalSend.call(this, data);
    };
    
    next();
  };
};

// Specific audit actions
const auditActions = {
  CREATE: 'CREATE',
  READ: 'VIEW',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  EXPORT: 'EXPORT',
  IMPORT: 'IMPORT'
};

// Audit middleware for different operations
const auditCreate = (targetType) => auditLog(auditActions.CREATE, targetType);
const auditRead = (targetType) => auditLog(auditActions.READ, targetType);
const auditUpdate = (targetType) => auditLog(auditActions.UPDATE, targetType);
const auditDelete = (targetType) => auditLog(auditActions.DELETE, targetType);
const auditLogin = () => auditLog(auditActions.LOGIN, 'User');
const auditLogout = () => auditLog(auditActions.LOGOUT, 'User');
const auditExport = (targetType) => auditLog(auditActions.EXPORT, targetType);
const auditImport = (targetType) => auditLog(auditActions.IMPORT, targetType);

module.exports = {
  auditLog,
  auditActions,
  auditCreate,
  auditRead,
  auditUpdate,
  auditDelete,
  auditLogin,
  auditLogout,
  auditExport,
  auditImport
};
