const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../prisma');
const auth = require('../middleware/auth');
const { calculatePermitBasedScore, getContractorSpecializations, analyzePermitPatterns } = require('../utils/permitEvaluation');

const router = express.Router();

// Get all contractors with scores
router.get('/', auth, async (req, res) => {
  try {
    const { trade, areaId, sort = 'score' } = req.query;
    
    const whereClause = {};
    if (trade) {
      whereClause.trades = {
        has: trade
      };
    }

    const contractors = await prisma.contractor.findMany({
      where: whereClause,
      include: {
        licenses: {
          where: { adminVerified: true },
          orderBy: { verifiedAt: 'desc' }
        },
        policies: {
          where: {
            expiresOn: {
              gte: new Date()
            }
          },
          orderBy: { expiresOn: 'asc' }
        },
        areaScores: areaId ? {
          where: { areaId }
        } : true,
        _count: {
          select: {
            reviews: true,
            projects: true
          }
        }
      },
      orderBy: sort === 'score' ? {
        areaScores: {
          _count: 'desc'
        }
      } : {
        name: 'asc'
      }
    });

    // Calculate overall scores and grades with experience factors
    const contractorsWithScores = contractors.map(contractor => {
      const latestScore = contractor.areaScores?.[0];
      const hasActiveLicense = contractor.licenses.some(l => l.status === 'ACTIVE');
      const hasActiveInsurance = contractor.policies.length > 0;
      
      // Calculate experience score
      const experienceScore = calculateExperienceScore(
        contractor.totalProjects, 
        contractor.yearsInBusiness, 
        contractor.totalValue
      );
      
      return {
        ...contractor,
        overallScore: latestScore?.score || 0,
        overallGrade: latestScore?.grade || 'F',
        hasActiveLicense,
        hasActiveInsurance,
        experienceScore,
        reviewCount: contractor._count.reviews,
        projectCount: contractor._count.projects
      };
    });

    res.json(contractorsWithScores);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get single contractor with detailed info
router.get('/:id', auth, async (req, res) => {
  try {
    const contractor = await prisma.contractor.findUnique({
      where: { id: req.params.id },
      include: {
        licenses: {
          orderBy: { verifiedAt: 'desc' }
        },
        policies: {
          orderBy: { expiresOn: 'asc' }
        },
        legalEvents: {
          orderBy: { filedOn: 'desc' }
        },
        contacts: true,
        areaScores: {
          include: {
            area: true
          },
          orderBy: { updatedAt: 'desc' }
        },
        reviews: {
          include: {
            project: true
          },
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        permits: {
          include: {
            inspections: {
              orderBy: { scheduledDate: 'desc' }
            }
          },
          orderBy: { requestedDate: 'desc' },
          take: 20
        },
        workSpecializations: {
          orderBy: { permitCount: 'desc' }
        },
        insurancePermitCorrelations: {
          include: {
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
          orderBy: { createdAt: 'desc' },
          take: 10
        },
        projects: {
          select: {
            id: true,
            trade: true,
            status: true,
            budgetPlanned: true,
            budgetActual: true,
            plannedStart: true,
            plannedEnd: true,
            actualStart: true,
            actualEnd: true
          }
        },
        _count: {
          select: {
            reviews: true,
            projects: true,
            permits: true
          }
        }
      }
    });

    if (!contractor) {
      return res.status(404).json({ message: 'Contractor not found' });
    }

    // Calculate enhanced scores with experience factors
    const riskScore = calculateRiskScore(
      contractor.legalEvents, 
      contractor.totalProjects, 
      contractor.yearsInBusiness
    );
    const insuranceScore = calculateInsuranceScore(contractor.policies);
    const experienceScore = calculateExperienceScore(
      contractor.totalProjects, 
      contractor.yearsInBusiness, 
      contractor.totalValue
    );
    
    // Calculate enhanced permit-based scoring
    const permitEvaluation = calculatePermitBasedScore(contractor);
    
    // Get work specializations with rankings
    const specializations = await getContractorSpecializations(contractor.id);
    
    // Analyze permit patterns
    const permitPatterns = analyzePermitPatterns(contractor.permits);
    
    const latestScore = contractor.areaScores?.[0];
    
    res.json({
      ...contractor,
      overallScore: permitEvaluation.enhancedScore,
      overallGrade: calculateGrade(permitEvaluation.enhancedScore),
      riskScore,
      insuranceScore,
      experienceScore,
      reviewCount: contractor._count.reviews,
      projectCount: contractor._count.projects,
      permitCount: contractor._count.permits,
      // Enhanced permit-based data
      permitEvaluation,
      specializations,
      permitPatterns,
      // Legacy scores for backward compatibility
      legacyScore: latestScore?.score || 0,
      legacyGrade: latestScore?.grade || 'F'
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Create contractor
router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Name is required'),
  body('companyName').optional(),
  body('phone').optional(),
  body('email').optional().isEmail().withMessage('Valid email required'),
  body('trades').isArray().withMessage('Trades must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contractor = await prisma.contractor.create({
      data: req.body
    });

    res.json(contractor);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Add license to contractor
router.post('/:id/licenses', [
  auth,
  body('number').notEmpty().withMessage('License number is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('boardName').optional(),
  body('expiresOn').optional().isISO8601().withMessage('Valid date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const license = await prisma.contractorLicense.create({
      data: {
        ...req.body,
        contractorId: req.params.id
      }
    });

    res.json(license);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Add insurance policy to contractor
router.post('/:id/policies', [
  auth,
  body('type').notEmpty().withMessage('Insurance type is required'),
  body('insurerName').notEmpty().withMessage('Insurer name is required'),
  body('policyNumber').optional(),
  body('coverageEachOccur').optional().isNumeric().withMessage('Coverage must be numeric'),
  body('coverageAggregate').optional().isNumeric().withMessage('Coverage must be numeric'),
  body('expiresOn').optional().isISO8601().withMessage('Valid date required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const policy = await prisma.insurancePolicy.create({
      data: {
        ...req.body,
        contractorId: req.params.id
      }
    });

    res.json(policy);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Add legal event to contractor
router.post('/:id/legal-events', [
  auth,
  body('type').notEmpty().withMessage('Legal type is required'),
  body('severity').notEmpty().withMessage('Severity is required'),
  body('title').notEmpty().withMessage('Title is required'),
  body('courtOrAgency').optional(),
  body('caseNumber').optional(),
  body('filedOn').optional().isISO8601().withMessage('Valid date required'),
  body('amount').optional().isNumeric().withMessage('Amount must be numeric')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const legalEvent = await prisma.legalEvent.create({
      data: {
        ...req.body,
        contractorId: req.params.id
      }
    });

    res.json(legalEvent);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Trigger contractor enrichment
router.post('/:id/enrich', auth, async (req, res) => {
  try {
    // This would trigger the enrichment process
    // For now, just return success
    res.json({ message: 'Enrichment triggered', contractorId: req.params.id });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Helper functions
function calculateRiskScore(legalEvents, totalProjects = 0, yearsInBusiness = 0) {
  if (!legalEvents || legalEvents.length === 0) return 100;
  
  let score = 100;
  const now = new Date();
  
  // Calculate experience normalization factor
  const experienceFactor = calculateExperienceFactor(totalProjects, yearsInBusiness);
  
  for (const event of legalEvents) {
    const monthsSinceEvent = Math.floor((now - new Date(event.filedOn || event.createdAt)) / (1000 * 60 * 60 * 24 * 30));
    const timeDecay = Math.exp(-monthsSinceEvent / 24);
    
    let penalty = 0;
    switch (event.severity) {
      case 'CRITICAL':
        penalty = 35;
        break;
      case 'HIGH':
        penalty = 20;
        break;
      case 'MEDIUM':
        penalty = 10;
        break;
      case 'LOW':
        penalty = 5;
        break;
    }
    
    // Apply experience normalization - more experienced contractors get reduced penalties
    const normalizedPenalty = penalty * (1 - experienceFactor);
    score -= normalizedPenalty * timeDecay;
  }
  
  return Math.max(0, Math.round(score));
}

function calculateExperienceFactor(totalProjects, yearsInBusiness) {
  // Experience factor ranges from 0 (no experience) to 0.5 (very experienced)
  // This reduces penalties for contractors with more experience
  
  let projectFactor = 0;
  if (totalProjects > 0) {
    // Logarithmic scaling: more projects = diminishing returns
    projectFactor = Math.min(0.3, Math.log10(totalProjects) * 0.1);
  }
  
  let yearsFactor = 0;
  if (yearsInBusiness > 0) {
    // Linear scaling up to 20 years, then capped
    yearsFactor = Math.min(0.2, yearsInBusiness * 0.01);
  }
  
  return Math.min(0.5, projectFactor + yearsFactor);
}

function calculateExperienceScore(totalProjects, yearsInBusiness, totalValue) {
  let score = 0;
  
  // Years in business (0-40 points)
  if (yearsInBusiness > 0) {
    score += Math.min(40, yearsInBusiness * 2);
  }
  
  // Project volume (0-30 points)
  if (totalProjects > 0) {
    // Logarithmic scaling for project count
    score += Math.min(30, Math.log10(totalProjects) * 15);
  }
  
  // Project value (0-30 points)
  if (totalValue && totalValue > 0) {
    // Logarithmic scaling for project value (in millions)
    const valueInMillions = Number(totalValue) / 1000000;
    score += Math.min(30, Math.log10(valueInMillions + 1) * 15);
  }
  
  return Math.min(100, score);
}

function calculateInsuranceScore(policies) {
  if (!policies || policies.length === 0) return 0;
  
  const activePolicies = policies.filter(p => 
    p.expiresOn && new Date(p.expiresOn) > new Date()
  );
  
  if (activePolicies.length === 0) return 30;
  
  const hasGL = activePolicies.some(p => p.type === 'GL');
  const hasWC = activePolicies.some(p => p.type === 'WC');
  
  let score = 0;
  if (hasGL) {
    const glPolicy = activePolicies.find(p => p.type === 'GL');
    const coverage = glPolicy.coverageEachOccur || 0;
    if (coverage >= 2000000) score += 100;
    else if (coverage >= 1000000) score += 80;
    else if (coverage >= 500000) score += 60;
    else score += 40;
  }
  
  if (hasWC) score += 5;
  
  return Math.min(100, score);
}

module.exports = router;
