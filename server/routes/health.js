const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

// Health check endpoint
router.get('/health', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Readiness check endpoint
router.get('/ready', async (req, res) => {
  try {
    // Check database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Check if we can perform basic operations
    const userCount = await prisma.user.count();
    
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        database: 'ok',
        basicOperations: 'ok'
      },
      metrics: {
        totalUsers: userCount
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Version endpoint
router.get('/version', (req, res) => {
  res.json({
    version: '1.0.0',
    buildTime: process.env.BUILD_TIME || new Date().toISOString(),
    gitSha: process.env.GIT_SHA || 'unknown',
    nodeVersion: process.version,
    environment: process.env.NODE_ENV || 'development'
  });
});

// Metrics endpoint (basic)
router.get('/metrics', async (req, res) => {
  try {
    const [
      userCount,
      propertyCount,
      contractorCount,
      dealCount,
      permitCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.contractor.count(),
      prisma.deal.count(),
      prisma.permit.count()
    ]);

    res.json({
      timestamp: new Date().toISOString(),
      metrics: {
        users: userCount,
        properties: propertyCount,
        contractors: contractorCount,
        deals: dealCount,
        permits: permitCount
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
      }
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch metrics',
      message: error.message
    });
  }
});

module.exports = router;
