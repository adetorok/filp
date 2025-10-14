const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const ContractorVerificationService = require('../utils/contractorVerification');
const ContractorScoringService = require('../utils/contractorScoring');

const prisma = new PrismaClient();
const verificationService = new ContractorVerificationService();
const scoringService = new ContractorScoringService();

// Middleware to verify JWT token
const authenticateToken = require('../middleware/auth');

/**
 * @route GET /api/contractors
 * @desc Get all contractors with search and filtering
 * @access Private
 */
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      search,
      state,
      trade,
      experienceLevel,
      minScore,
      page = 1,
      limit = 20,
      sortBy = 'overallScore',
      sortOrder = 'desc'
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build where clause
    const where = {
      verified: true
    };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { trades: { has: search } }
      ];
    }

    if (state) {
      where.state = state;
    }

    if (trade) {
      where.trades = { has: trade };
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    if (minScore) {
      where.overallScore = { gte: parseInt(minScore) };
    }

    // Build orderBy clause
    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [contractors, total] = await Promise.all([
      prisma.contractor.findMany({
        where,
        skip,
        take,
        orderBy,
        include: {
          licenses: true,
          insurance: true,
          legalEvents: true,
          permits: true,
          reviews: true
        }
      }),
      prisma.contractor.count({ where })
    ]);

    res.json({
      contractors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching contractors:', error);
    res.status(500).json({ error: 'Failed to fetch contractors' });
  }
});

/**
 * @route GET /api/contractors/:id
 * @desc Get contractor by ID with full details
 * @access Private
 */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const contractor = await prisma.contractor.findUnique({
      where: { id },
      include: {
        licenses: true,
        insurance: true,
        legalEvents: true,
        permits: {
          include: {
            inspections: true
          }
        },
        reviews: true
      }
    });

    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }

    res.json(contractor);
  } catch (error) {
    console.error('Error fetching contractor:', error);
    res.status(500).json({ error: 'Failed to fetch contractor' });
  }
});

/**
 * @route POST /api/contractors
 * @desc Create new contractor
 * @access Private
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const {
      name,
      company,
      email,
      phone,
      address,
      city,
      state,
      zip,
      trades,
      licenseNumber,
      licenseType,
      hourlyRate,
      serviceAreas
    } = req.body;

    // Create contractor
    const contractor = await prisma.contractor.create({
      data: {
        name,
        company,
        email,
        phone,
        address,
        city,
        state,
        zip,
        trades,
        licenseNumber,
        licenseType,
        hourlyRate: hourlyRate ? parseFloat(hourlyRate) : null,
        serviceAreas,
        verified: false,
        overallScore: 0,
        complianceTier: 'C',
        experienceLevel: 'New',
        yearsExperience: 0,
        availability: 'Unknown',
        createdBy: req.user.id
      }
    });

    res.status(201).json(contractor);
  } catch (error) {
    console.error('Error creating contractor:', error);
    res.status(500).json({ error: 'Failed to create contractor' });
  }
});

/**
 * @route PUT /api/contractors/:id
 * @desc Update contractor
 * @access Private
 */
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const contractor = await prisma.contractor.update({
      where: { id },
      data: updateData
    });

    res.json(contractor);
  } catch (error) {
    console.error('Error updating contractor:', error);
    res.status(500).json({ error: 'Failed to update contractor' });
  }
});

/**
 * @route DELETE /api/contractors/:id
 * @desc Delete contractor
 * @access Private
 */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.contractor.delete({
      where: { id }
    });

    res.json({ message: 'Contractor deleted successfully' });
  } catch (error) {
    console.error('Error deleting contractor:', error);
    res.status(500).json({ error: 'Failed to delete contractor' });
  }
});

/**
 * @route POST /api/contractors/:id/verify
 * @desc Verify contractor with state databases
 * @access Private
 */
router.post('/:id/verify', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get contractor data
    const contractor = await prisma.contractor.findUnique({
      where: { id }
    });

    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }

    // Start verification process
    const verificationResult = await verificationService.verifyContractor({
      id: contractor.id,
      name: contractor.name,
      company: contractor.company,
      state: contractor.state,
      city: contractor.city,
      licenseNumber: contractor.licenseNumber,
      licenseType: contractor.licenseType
    });

    // Calculate new score
    const scoreData = scoringService.calculateOverallScore({
      license: verificationResult.license,
      insurance: verificationResult.insurance,
      legal: verificationResult.legal,
      permits: verificationResult.permits,
      reviews: { reviews: contractor.reviews || [] },
      experience: {
        yearsExperience: contractor.yearsExperience,
        specializations: contractor.trades
      },
      lastUpdated: new Date().toISOString()
    });

    // Update contractor with verification results
    const updatedContractor = await prisma.contractor.update({
      where: { id },
      data: {
        verified: verificationResult.overallVerified,
        overallScore: scoreData.overallScore,
        complianceTier: scoreData.grade.charAt(0).toUpperCase(),
        lastVerified: new Date().toISOString()
      }
    });

    // Store verification details
    if (verificationResult.license && verificationResult.license.verified) {
      await prisma.license.upsert({
        where: {
          contractorId_type_number: {
            contractorId: id,
            type: verificationResult.license.type,
            number: verificationResult.license.number
          }
        },
        update: verificationResult.license,
        create: {
          ...verificationResult.license,
          contractorId: id
        }
      });
    }

    if (verificationResult.insurance && verificationResult.insurance.verified) {
      for (const policy of verificationResult.insurance.policies) {
        await prisma.insurance.upsert({
          where: {
            contractorId_type_policyNumber: {
              contractorId: id,
              type: policy.type,
              policyNumber: policy.policyNumber
            }
          },
          update: policy,
          create: {
            ...policy,
            contractorId: id
          }
        });
      }
    }

    if (verificationResult.legal && verificationResult.legal.events) {
      for (const event of verificationResult.legal.events) {
        await prisma.legalEvent.upsert({
          where: {
            contractorId_type_date: {
              contractorId: id,
              type: event.type,
              date: event.date
            }
          },
          update: event,
          create: {
            ...event,
            contractorId: id
          }
        });
      }
    }

    if (verificationResult.permits && verificationResult.permits.permits) {
      for (const permit of verificationResult.permits.permits) {
        await prisma.permit.upsert({
          where: {
            contractorId_city_number: {
              contractorId: id,
              city: permit.city,
              number: permit.number
            }
          },
          update: permit,
          create: {
            ...permit,
            contractorId: id
          }
        });
      }
    }

    res.json({
      contractor: updatedContractor,
      verification: verificationResult,
      score: scoreData
    });
  } catch (error) {
    console.error('Error verifying contractor:', error);
    res.status(500).json({ error: 'Failed to verify contractor' });
  }
});

/**
 * @route GET /api/contractors/:id/explain-score
 * @desc Get detailed score explanation for contractor
 * @access Private
 */
router.get('/:id/explain-score', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const contractor = await prisma.contractor.findUnique({
      where: { id },
      include: {
        licenses: true,
        insurance: true,
        legalEvents: true,
        permits: {
          include: {
            inspections: true
          }
        },
        reviews: true
      }
    });

    if (!contractor) {
      return res.status(404).json({ error: 'Contractor not found' });
    }

    // Calculate score breakdown
    const scoreData = scoringService.calculateOverallScore({
      license: contractor.licenses[0] || {},
      insurance: { policies: contractor.insurance || [] },
      legal: { events: contractor.legalEvents || [] },
      permits: { permits: contractor.permits || [] },
      reviews: { reviews: contractor.reviews || [] },
      experience: {
        yearsExperience: contractor.yearsExperience,
        specializations: contractor.trades
      },
      lastUpdated: contractor.lastVerified || contractor.createdAt
    });

    const explanation = scoringService.generateScoreExplanation(scoreData);

    res.json(explanation);
  } catch (error) {
    console.error('Error explaining contractor score:', error);
    res.status(500).json({ error: 'Failed to explain contractor score' });
  }
});

/**
 * @route POST /api/contractors/:id/reviews
 * @desc Add review for contractor
 * @access Private
 */
router.post('/:id/reviews', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment, projectId } = req.body;

    const review = await prisma.review.create({
      data: {
        contractorId: id,
        customerId: req.user.id,
        projectId,
        rating: parseInt(rating),
        comment,
        verified: true
      }
    });

    // Recalculate contractor score
    const contractor = await prisma.contractor.findUnique({
      where: { id },
      include: { reviews: true }
    });

    const scoreData = scoringService.calculateOverallScore({
      license: contractor.licenses?.[0] || {},
      insurance: { policies: contractor.insurance || [] },
      legal: { events: contractor.legalEvents || [] },
      permits: { permits: contractor.permits || [] },
      reviews: { reviews: contractor.reviews || [] },
      experience: {
        yearsExperience: contractor.yearsExperience,
        specializations: contractor.trades
      },
      lastUpdated: contractor.lastVerified || contractor.createdAt
    });

    await prisma.contractor.update({
      where: { id },
      data: {
        overallScore: scoreData.overallScore,
        complianceTier: scoreData.grade.charAt(0).toUpperCase()
      }
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
});

/**
 * @route GET /api/contractors/stats/overview
 * @desc Get contractor marketplace statistics
 * @access Private
 */
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const [
      totalContractors,
      verifiedContractors,
      avgScore,
      tierAContractors,
      recentVerifications,
      topTrades
    ] = await Promise.all([
      prisma.contractor.count(),
      prisma.contractor.count({ where: { verified: true } }),
      prisma.contractor.aggregate({
        _avg: { overallScore: true }
      }),
      prisma.contractor.count({ where: { complianceTier: 'A' } }),
      prisma.contractor.count({
        where: {
          lastVerified: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
          }
        }
      }),
      prisma.contractor.groupBy({
        by: ['trades'],
        _count: { trades: true },
        orderBy: { _count: { trades: 'desc' } },
        take: 5
      })
    ]);

    res.json({
      totalContractors,
      verifiedContractors,
      avgScore: Math.round(avgScore._avg.overallScore || 0),
      tierAContractors,
      recentVerifications,
      topTrades: topTrades.map(t => ({
        trade: t.trades[0],
        count: t._count.trades
      }))
    });
  } catch (error) {
    console.error('Error fetching contractor stats:', error);
    res.status(500).json({ error: 'Failed to fetch contractor statistics' });
  }
});

module.exports = router;