const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();

// Get contractors with peer ranking by experience level
router.get('/search', auth, async (req, res) => {
  try {
    const { 
      trade, 
      areaId, 
      experienceLevel, 
      sort = 'score',
      minGrade = 'F',
      hasLicense = 'all',
      hasInsurance = 'all',
      limit = 50,
      offset = 0
    } = req.query;

    // Define experience level ranges
    const experienceRanges = {
      '1-3': { min: 1, max: 3 },
      '3-6': { min: 3, max: 6 },
      '6-10': { min: 6, max: 10 },
      '10+': { min: 10, max: 999 }
    };

    const whereClause = {};
    
    // Filter by trade
    if (trade) {
      whereClause.trades = {
        has: trade
      };
    }

    // Filter by experience level
    if (experienceLevel && experienceRanges[experienceLevel]) {
      const range = experienceRanges[experienceLevel];
      whereClause.yearsInBusiness = {
        gte: range.min,
        lte: range.max
      };
    }

    // Filter by grade
    const gradeOrder = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'F': 1 };
    const minGradeValue = gradeOrder[minGrade] || 1;

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
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Calculate scores and peer rankings
    const contractorsWithRankings = await Promise.all(
      contractors.map(async (contractor) => {
        const latestScore = contractor.areaScores?.[0];
        const hasActiveLicense = contractor.licenses.some(l => l.status === 'ACTIVE');
        const hasActiveInsurance = contractor.policies.length > 0;
        
        // Calculate experience score
        const experienceScore = calculateExperienceScore(
          contractor.totalProjects, 
          contractor.yearsInBusiness, 
          contractor.totalValue
        );

        // Calculate peer ranking within experience level
        const peerRanking = await calculatePeerRanking(contractor, experienceLevel);

        return {
          ...contractor,
          overallScore: latestScore?.score || 0,
          overallGrade: latestScore?.grade || 'F',
          hasActiveLicense,
          hasActiveInsurance,
          experienceScore,
          peerRanking,
          reviewCount: contractor._count.reviews,
          projectCount: contractor._count.projects
        };
      })
    );

    // Apply additional filters
    let filteredContractors = contractorsWithRankings;

    if (hasLicense === 'true') {
      filteredContractors = filteredContractors.filter(c => c.hasActiveLicense);
    } else if (hasLicense === 'false') {
      filteredContractors = filteredContractors.filter(c => !c.hasActiveLicense);
    }

    if (hasInsurance === 'true') {
      filteredContractors = filteredContractors.filter(c => c.hasActiveInsurance);
    } else if (hasInsurance === 'false') {
      filteredContractors = filteredContractors.filter(c => !c.hasActiveInsurance);
    }

    // Filter by minimum grade
    filteredContractors = filteredContractors.filter(c => 
      gradeOrder[c.overallGrade] >= minGradeValue
    );

    // Sort results
    if (sort === 'score') {
      filteredContractors.sort((a, b) => b.overallScore - a.overallScore);
    } else if (sort === 'experience') {
      filteredContractors.sort((a, b) => b.experienceScore - a.experienceScore);
    } else if (sort === 'reviews') {
      filteredContractors.sort((a, b) => b.reviewCount - a.reviewCount);
    } else if (sort === 'projects') {
      filteredContractors.sort((a, b) => b.projectCount - a.projectCount);
    }

    res.json({
      contractors: filteredContractors,
      total: filteredContractors.length,
      experienceLevel,
      filters: {
        trade,
        areaId,
        minGrade,
        hasLicense,
        hasInsurance
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get contractor details with full ranking information
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
        _count: {
          select: {
            reviews: true,
            projects: true
          }
        }
      }
    });

    if (!contractor) {
      return res.status(404).json({ message: 'Contractor not found' });
    }

    // Calculate experience level
    const experienceLevel = getExperienceLevel(contractor.yearsInBusiness);
    
    // Calculate peer ranking
    const peerRanking = await calculatePeerRanking(contractor, experienceLevel);
    
    // Calculate all scores
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
    
    const latestScore = contractor.areaScores?.[0];
    
    res.json({
      ...contractor,
      overallScore: latestScore?.score || 0,
      overallGrade: latestScore?.grade || 'F',
      riskScore,
      insuranceScore,
      experienceScore,
      experienceLevel,
      peerRanking,
      reviewCount: contractor._count.reviews,
      projectCount: contractor._count.projects
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get peer ranking statistics
router.get('/stats/peer-ranking', auth, async (req, res) => {
  try {
    const { experienceLevel } = req.query;
    
    const contractors = await prisma.contractor.findMany({
      where: experienceLevel ? {
        yearsInBusiness: {
          gte: experienceLevel.split('-')[0],
          lte: experienceLevel.split('-')[1] || 999
        }
      } : {},
      include: {
        areaScores: true,
        _count: {
          select: {
            reviews: true,
            projects: true
          }
        }
      }
    });

    const stats = {
      totalContractors: contractors.length,
      averageScore: 0,
      gradeDistribution: { A: 0, B: 0, C: 0, D: 0, F: 0 },
      experienceLevel,
      topPerformers: []
    };

    if (contractors.length > 0) {
      const scores = contractors.map(c => c.areaScores?.[0]?.score || 0);
      stats.averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);

      // Grade distribution
      contractors.forEach(contractor => {
        const grade = contractor.areaScores?.[0]?.grade || 'F';
        stats.gradeDistribution[grade]++;
      });

      // Top performers (top 10%)
      const topCount = Math.max(1, Math.floor(contractors.length * 0.1));
      stats.topPerformers = contractors
        .sort((a, b) => (b.areaScores?.[0]?.score || 0) - (a.areaScores?.[0]?.score || 0))
        .slice(0, topCount)
        .map(c => ({
          id: c.id,
          name: c.name,
          companyName: c.companyName,
          score: c.areaScores?.[0]?.score || 0,
          grade: c.areaScores?.[0]?.grade || 'F'
        }));
    }

    res.json(stats);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Helper functions
function getExperienceLevel(yearsInBusiness) {
  if (!yearsInBusiness) return '1-3';
  if (yearsInBusiness <= 3) return '1-3';
  if (yearsInBusiness <= 6) return '3-6';
  if (yearsInBusiness <= 10) return '6-10';
  return '10+';
}

async function calculatePeerRanking(contractor, experienceLevel) {
  if (!experienceLevel) {
    experienceLevel = getExperienceLevel(contractor.yearsInBusiness);
  }

  const experienceRanges = {
    '1-3': { min: 1, max: 3 },
    '3-6': { min: 3, max: 6 },
    '6-10': { min: 6, max: 10 },
    '10+': { min: 10, max: 999 }
  };

  const range = experienceRanges[experienceLevel];
  if (!range) return { rank: 0, total: 0, percentile: 0 };

  const peers = await prisma.contractor.findMany({
    where: {
      yearsInBusiness: {
        gte: range.min,
        lte: range.max
      },
      trades: {
        hasSome: contractor.trades
      }
    },
    include: {
      areaScores: true
    }
  });

  const contractorScore = contractor.areaScores?.[0]?.score || 0;
  const betterPeers = peers.filter(p => 
    (p.areaScores?.[0]?.score || 0) > contractorScore
  ).length;

  const rank = betterPeers + 1;
  const total = peers.length;
  const percentile = total > 0 ? Math.round(((total - rank + 1) / total) * 100) : 0;

  return { rank, total, percentile };
}

function calculateExperienceScore(totalProjects, yearsInBusiness, totalValue) {
  let score = 0;
  
  if (yearsInBusiness > 0) {
    score += Math.min(40, yearsInBusiness * 2);
  }
  
  if (totalProjects > 0) {
    score += Math.min(30, Math.log10(totalProjects) * 15);
  }
  
  if (totalValue && totalValue > 0) {
    const valueInMillions = Number(totalValue) / 1000000;
    score += Math.min(30, Math.log10(valueInMillions + 1) * 15);
  }
  
  return Math.min(100, score);
}

function calculateRiskScore(legalEvents, totalProjects = 0, yearsInBusiness = 0) {
  if (!legalEvents || legalEvents.length === 0) return 100;
  
  let score = 100;
  const now = new Date();
  
  const experienceFactor = calculateExperienceFactor(totalProjects, yearsInBusiness);
  
  for (const event of legalEvents) {
    const monthsSinceEvent = Math.floor((now - new Date(event.filedOn || event.createdAt)) / (1000 * 60 * 60 * 24 * 30));
    const timeDecay = Math.exp(-monthsSinceEvent / 24);
    
    let penalty = 0;
    switch (event.severity) {
      case 'CRITICAL': penalty = 35; break;
      case 'HIGH': penalty = 20; break;
      case 'MEDIUM': penalty = 10; break;
      case 'LOW': penalty = 5; break;
    }
    
    const normalizedPenalty = penalty * (1 - experienceFactor);
    score -= normalizedPenalty * timeDecay;
  }
  
  return Math.max(0, Math.round(score));
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

function calculateExperienceFactor(totalProjects, yearsInBusiness) {
  let projectFactor = 0;
  if (totalProjects > 0) {
    projectFactor = Math.min(0.3, Math.log10(totalProjects) * 0.1);
  }
  
  let yearsFactor = 0;
  if (yearsInBusiness > 0) {
    yearsFactor = Math.min(0.2, yearsInBusiness * 0.01);
  }
  
  return Math.min(0.5, projectFactor + yearsFactor);
}

module.exports = router;
