const express = require('express');
const prisma = require('../prisma');
const auth = require('../middleware/auth');
const { requireRole } = require('../middleware/security');
const { auditCreate, auditUpdate, auditExport } = require('../middleware/audit');
const { calculatePermitBasedScore } = require('../utils/permitEvaluation');

const router = express.Router();

// Admin-only routes
router.use(auth);
router.use(requireRole(['ADMIN']));

// Compute all contractor scores
router.post('/compute-scores', auditUpdate('ContractorScores'), async (req, res) => {
  try {
    const contractors = await prisma.contractor.findMany({
      include: {
        permits: true,
        workSpecializations: true,
        insurancePermitCorrelations: true,
        projects: true,
        reviews: true,
        legalEvents: true,
        policies: true,
        areaScores: true
      }
    });

    const results = [];
    
    for (const contractor of contractors) {
      const evaluation = calculatePermitBasedScore(contractor);
      
      // Update or create area score
      const areaScores = await prisma.contractorAreaScore.findMany({
        where: { contractorId: contractor.id }
      });

      for (const areaScore of areaScores) {
        await prisma.contractorAreaScore.update({
          where: { id: areaScore.id },
          data: {
            score: evaluation.enhancedScore,
            grade: evaluation.grade,
            subscores: evaluation.subscores,
            period: new Date().toISOString().slice(0, 7) // YYYY-MM format
          }
        });
      }

      results.push({
        contractorId: contractor.id,
        name: contractor.name,
        score: evaluation.enhancedScore,
        grade: evaluation.grade
      });
    }

    res.json({
      message: 'Scores computed successfully',
      results,
      totalProcessed: results.length
    });
  } catch (error) {
    console.error('Score computation failed:', error);
    res.status(500).json({ error: 'Failed to compute scores' });
  }
});

// Force contractor data enrichment
router.post('/enrich/:contractorId', auditUpdate('ContractorEnrichment'), async (req, res) => {
  try {
    const { contractorId } = req.params;
    
    const contractor = await prisma.contractor.findUnique({
      where: { id: contractorId },
      include: {
        licenses: true,
        policies: true,
        legalEvents: true
      }
    });

    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }

    // Simulate enrichment process
    const enrichmentResults = {
      licensesUpdated: 0,
      policiesUpdated: 0,
      legalEventsFound: 0,
      lastChecked: new Date()
    };

    // Update license verification status
    for (const license of contractor.licenses) {
      if (!license.adminVerified) {
        await prisma.contractorLicense.update({
          where: { id: license.id },
          data: {
            lastCheckedAt: new Date(),
            sourceUrl: `https://example-license-board.com/verify/${license.number}`
          }
        });
        enrichmentResults.licensesUpdated++;
      }
    }

    // Update insurance verification
    for (const policy of contractor.policies) {
      await prisma.insurancePolicy.update({
        where: { id: policy.id },
        data: {
          lastVerifiedAt: new Date()
        }
      });
      enrichmentResults.policiesUpdated++;
    }

    res.json({
      message: 'Contractor enrichment completed',
      contractorId,
      results: enrichmentResults
    });
  } catch (error) {
    console.error('Contractor enrichment failed:', error);
    res.status(500).json({ error: 'Failed to enrich contractor data' });
  }
});

// Get audit logs
router.get('/audit', async (req, res) => {
  try {
    const { 
      object, 
      id, 
      action, 
      actorId, 
      startDate, 
      endDate,
      page = 1,
      limit = 50 
    } = req.query;

    const whereClause = {};
    
    if (object) whereClause.targetType = object;
    if (id) whereClause.targetId = id;
    if (action) whereClause.action = action;
    if (actorId) whereClause.actorId = actorId;
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [auditLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where: whereClause,
        include: {
          actor: {
            select: { id: true, name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.auditLog.count({ where: whereClause })
    ]);

    res.json({
      auditLogs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

// Get system metrics
router.get('/metrics', async (req, res) => {
  try {
    const [
      userCount,
      propertyCount,
      contractorCount,
      dealCount,
      permitCount,
      organizationCount,
      recentActivity
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.contractor.count(),
      prisma.deal.count(),
      prisma.permit.count(),
      prisma.organization.count(),
      prisma.auditLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
          }
        }
      })
    ]);

    res.json({
      timestamp: new Date().toISOString(),
      metrics: {
        users: userCount,
        properties: propertyCount,
        contractors: contractorCount,
        deals: dealCount,
        permits: permitCount,
        organizations: organizationCount,
        recentActivity
      },
      system: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        nodeVersion: process.version
      }
    });
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Export data (GDPR compliance)
router.post('/export/:userId', auditExport('UserData'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        properties: true,
        deals: true,
        expenses: true,
        tasks: true,
        contacts: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove sensitive data
    const exportData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
        phone: user.phone,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      },
      data: {
        properties: user.properties,
        deals: user.deals,
        expenses: user.expenses,
        tasks: user.tasks,
        contacts: user.contacts
      },
      exportedAt: new Date().toISOString()
    };

    res.json(exportData);
  } catch (error) {
    console.error('Data export failed:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

module.exports = router;
