const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();

// Get permits for a contractor
router.get('/contractor/:contractorId', auth, async (req, res) => {
  try {
    const { contractorId } = req.params;
    const { status, permitType, startDate, endDate, limit = 50, offset = 0 } = req.query;

    const whereClause = { contractorId };

    if (status) whereClause.status = status;
    if (permitType) whereClause.permitType = permitType;
    if (startDate || endDate) {
      whereClause.requestedDate = {};
      if (startDate) whereClause.requestedDate.gte = new Date(startDate);
      if (endDate) whereClause.requestedDate.lte = new Date(endDate);
    }

    const permits = await prisma.permit.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            id: true,
            trade: true,
            status: true,
            budgetPlanned: true,
            budgetActual: true
          }
        },
        inspections: {
          orderBy: { scheduledDate: 'desc' }
        },
        _count: {
          select: {
            inspections: true
          }
        }
      },
      orderBy: { requestedDate: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    res.json(permits);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get permit details with full timeline
router.get('/:id', auth, async (req, res) => {
  try {
    const permit = await prisma.permit.findUnique({
      where: { id: req.params.id },
      include: {
        project: true,
        contractor: {
          select: {
            id: true,
            name: true,
            companyName: true,
            trades: true
          }
        },
        inspections: {
          orderBy: { scheduledDate: 'asc' }
        }
      }
    });

    if (!permit) {
      return res.status(404).json({ message: 'Permit not found' });
    }

    // Calculate permit timeline metrics
    const timeline = calculatePermitTimeline(permit);
    const workSpecialization = await calculateWorkSpecialization(permit.contractorId, permit.permitType);

    res.json({
      ...permit,
      timeline,
      workSpecialization
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Add permit to project
router.post('/', [
  auth,
  body('projectId').notEmpty().withMessage('Project ID is required'),
  body('contractorId').notEmpty().withMessage('Contractor ID is required'),
  body('permitNumber').notEmpty().withMessage('Permit number is required'),
  body('permitType').notEmpty().withMessage('Permit type is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('propertyAddress').notEmpty().withMessage('Property address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('zipCode').notEmpty().withMessage('ZIP code is required'),
  body('requestedDate').isISO8601().withMessage('Valid requested date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const permitData = req.body;

    // Check if permit already exists
    const existingPermit = await prisma.permit.findUnique({
      where: {
        permitNumber_city_state: {
          permitNumber: permitData.permitNumber,
          city: permitData.city,
          state: permitData.state
        }
      }
    });

    if (existingPermit) {
      return res.status(400).json({ message: 'Permit already exists' });
    }

    const permit = await prisma.permit.create({
      data: permitData,
      include: {
        project: true,
        contractor: {
          select: {
            id: true,
            name: true,
            companyName: true
          }
        }
      }
    });

    // Update work specialization
    await updateWorkSpecialization(permit.contractorId, permit.permitType);

    // Check for insurance correlation
    await checkInsurancePermitCorrelation(permit);

    res.json(permit);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Update permit status
router.put('/:id/status', [
  auth,
  body('status').notEmpty().withMessage('Status is required'),
  body('inspectorName').optional(),
  body('inspectionNotes').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, inspectorName, inspectionNotes } = req.body;
    const updateData = { status };

    // Set completion date if status is COMPLETED
    if (status === 'COMPLETED') {
      updateData.completedDate = new Date();
    }

    if (inspectorName) updateData.inspectorName = inspectorName;
    if (inspectionNotes) updateData.inspectionNotes = inspectionNotes;

    const permit = await prisma.permit.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        project: true,
        contractor: true
      }
    });

    // Update work specialization on completion
    if (status === 'COMPLETED') {
      await updateWorkSpecialization(permit.contractorId, permit.permitType);
    }

    res.json(permit);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Add permit inspection
router.post('/:id/inspections', [
  auth,
  body('inspectionType').notEmpty().withMessage('Inspection type is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('inspectorName').notEmpty().withMessage('Inspector name is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const inspectionData = {
      ...req.body,
      permitId: req.params.id
    };

    const inspection = await prisma.permitInspection.create({
      data: inspectionData
    });

    res.json(inspection);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get contractor work specializations
router.get('/contractor/:contractorId/specializations', auth, async (req, res) => {
  try {
    const { contractorId } = req.params;

    const specializations = await prisma.contractorWorkSpecialization.findMany({
      where: { contractorId },
      orderBy: { permitCount: 'desc' }
    });

    res.json(specializations);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get insurance-permit correlations
router.get('/contractor/:contractorId/insurance-correlations', auth, async (req, res) => {
  try {
    const { contractorId } = req.params;

    const correlations = await prisma.insurancePermitCorrelation.findMany({
      where: { contractorId },
      include: {
        project: {
          select: {
            id: true,
            trade: true,
            status: true
          }
        },
        permit: {
          select: {
            id: true,
            permitNumber: true,
            permitType: true,
            requestedDate: true
          }
        },
        insurancePolicy: {
          select: {
            id: true,
            type: true,
            insurerName: true,
            policyNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(correlations);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Helper functions
function calculatePermitTimeline(permit) {
  const timeline = {
    totalDays: 0,
    approvalDays: 0,
    workDays: 0,
    completionDays: 0,
    efficiency: 0
  };

  if (permit.requestedDate) {
    const now = new Date();
    const requested = new Date(permit.requestedDate);
    
    timeline.totalDays = Math.floor((now - requested) / (1000 * 60 * 60 * 24));

    if (permit.approvedDate) {
      const approved = new Date(permit.approvedDate);
      timeline.approvalDays = Math.floor((approved - requested) / (1000 * 60 * 60 * 24));
    }

    if (permit.issuedDate && permit.completedDate) {
      const issued = new Date(permit.issuedDate);
      const completed = new Date(permit.completedDate);
      timeline.workDays = Math.floor((completed - issued) / (1000 * 60 * 60 * 24));
    }

    if (permit.completedDate) {
      const completed = new Date(permit.completedDate);
      timeline.completionDays = Math.floor((completed - requested) / (1000 * 60 * 60 * 24));
    }

    // Calculate efficiency (lower is better)
    if (timeline.completionDays > 0) {
      timeline.efficiency = Math.min(100, Math.max(0, 100 - (timeline.completionDays / 30) * 10));
    }
  }

  return timeline;
}

async function calculateWorkSpecialization(contractorId, permitType) {
  const permits = await prisma.permit.findMany({
    where: {
      contractorId,
      permitType,
      status: 'COMPLETED'
    }
  });

  if (permits.length === 0) return null;

  const totalValue = permits.reduce((sum, permit) => sum + (Number(permit.cost) || 0), 0);
  const totalDays = permits.reduce((sum, permit) => {
    if (permit.requestedDate && permit.completedDate) {
      const requested = new Date(permit.requestedDate);
      const completed = new Date(permit.completedDate);
      return sum + Math.floor((completed - requested) / (1000 * 60 * 60 * 24));
    }
    return sum;
  }, 0);

  const averageDuration = permits.length > 0 ? Math.floor(totalDays / permits.length) : 0;
  const successRate = 100; // All completed permits are successful

  return {
    permitCount: permits.length,
    totalValue,
    averageDuration,
    successRate,
    lastWorkDate: permits[0]?.completedDate
  };
}

async function updateWorkSpecialization(contractorId, permitType) {
  const specialization = mapPermitTypeToSpecialization(permitType);
  if (!specialization) return;

  const stats = await calculateWorkSpecialization(contractorId, permitType);
  if (!stats) return;

  await prisma.contractorWorkSpecialization.upsert({
    where: {
      contractorId_specialization: {
        contractorId,
        specialization
      }
    },
    update: {
      permitCount: stats.permitCount,
      totalValue: stats.totalValue,
      averageDuration: stats.averageDuration,
      successRate: stats.successRate,
      lastWorkDate: stats.lastWorkDate
    },
    create: {
      contractorId,
      specialization,
      permitCount: stats.permitCount,
      totalValue: stats.totalValue,
      averageDuration: stats.averageDuration,
      successRate: stats.successRate,
      lastWorkDate: stats.lastWorkDate
    }
  });
}

function mapPermitTypeToSpecialization(permitType) {
  const mapping = {
    'BUILDING': 'RESIDENTIAL_REMODEL',
    'ELECTRICAL': 'ELECTRICAL',
    'PLUMBING': 'PLUMBING',
    'HVAC': 'HVAC',
    'ROOFING': 'ROOFING',
    'DEMOLITION': 'RESIDENTIAL_REMODEL',
    'FENCE': 'LANDSCAPING',
    'POOL': 'POOL_SPA',
    'DRIVEWAY': 'LANDSCAPING',
    'SIDEWALK': 'LANDSCAPING'
  };

  return mapping[permitType] || 'OTHER';
}

async function checkInsurancePermitCorrelation(permit) {
  // Find insurance policies added around the time of permit request
  const permitDate = new Date(permit.requestedDate);
  const thirtyDaysBefore = new Date(permitDate.getTime() - (30 * 24 * 60 * 60 * 1000));
  const thirtyDaysAfter = new Date(permitDate.getTime() + (30 * 24 * 60 * 60 * 1000));

  const policies = await prisma.insurancePolicy.findMany({
    where: {
      contractorId: permit.contractorId,
      lastVerifiedAt: {
        gte: thirtyDaysBefore,
        lte: thirtyDaysAfter
      }
    }
  });

  for (const policy of policies) {
    const policyDate = new Date(policy.lastVerifiedAt);
    const daysDifference = Math.floor((permitDate - policyDate) / (1000 * 60 * 60 * 24));
    
    let correlationType = 'ADDED_DURING_WORK';
    let riskLevel = 'MEDIUM';

    if (daysDifference < -7) {
      correlationType = 'ADDED_BEFORE_PERMIT';
      riskLevel = 'LOW';
    } else if (daysDifference > 7) {
      correlationType = 'ADDED_AFTER_PERMIT';
      riskLevel = 'HIGH';
    }

    await prisma.insurancePermitCorrelation.create({
      data: {
        contractorId: permit.contractorId,
        projectId: permit.projectId,
        insurancePolicyId: policy.id,
        permitId: permit.id,
        correlationType,
        daysDifference: Math.abs(daysDifference),
        riskLevel
      }
    });
  }
}

module.exports = router;
