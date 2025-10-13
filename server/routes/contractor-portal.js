const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();

// Contractor registration
router.post('/register', [
  body('contractorId').notEmpty().withMessage('Contractor ID is required'),
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('email').isEmail().withMessage('Valid email required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { contractorId, username, password, email } = req.body;

    // Check if contractor exists
    const contractor = await prisma.contractor.findUnique({
      where: { id: contractorId }
    });

    if (!contractor) {
      return res.status(404).json({ message: 'Contractor not found' });
    }

    // Check if portal already exists
    const existingPortal = await prisma.contractorPortal.findUnique({
      where: { contractorId }
    });

    if (existingPortal) {
      return res.status(400).json({ message: 'Portal already exists for this contractor' });
    }

    // Check if username is taken
    const existingUsername = await prisma.contractorPortal.findUnique({
      where: { username }
    });

    if (existingUsername) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create portal
    const portal = await prisma.contractorPortal.create({
      data: {
        contractorId,
        username,
        passwordHash,
        contractor: {
          update: {
            email: email
          }
        }
      },
      include: {
        contractor: true
      }
    });

    // Create JWT token
    const payload = {
      user: {
        id: contractorId,
        role: 'CONTRACTOR',
        portalId: portal.id
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      contractor: portal.contractor,
      portal: {
        id: portal.id,
        username: portal.username,
        isActive: portal.isActive
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Contractor login
router.post('/login', [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, password } = req.body;

    // Find portal
    const portal = await prisma.contractorPortal.findUnique({
      where: { username },
      include: {
        contractor: {
          include: {
            areaScores: true,
            _count: {
              select: {
                reviews: true,
                projects: true
              }
            }
          }
        }
      }
    });

    if (!portal || !portal.isActive) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, portal.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Update last login
    await prisma.contractorPortal.update({
      where: { id: portal.id },
      data: { lastLoginAt: new Date() }
    });

    // Create JWT token
    const payload = {
      user: {
        id: portal.contractorId,
        role: 'CONTRACTOR',
        portalId: portal.id
      }
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      contractor: portal.contractor,
      portal: {
        id: portal.id,
        username: portal.username,
        isActive: portal.isActive,
        lastLoginAt: portal.lastLoginAt
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get contractor dashboard data
router.get('/dashboard', auth, async (req, res) => {
  try {
    if (req.user.role !== 'CONTRACTOR') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const contractor = await prisma.contractor.findUnique({
      where: { id: req.user.id },
      include: {
        licenses: {
          orderBy: { verifiedAt: 'desc' }
        },
        policies: {
          orderBy: { expiresOn: 'asc' }
        },
        legalEvents: {
          orderBy: { filedOn: 'desc' },
          take: 5
        },
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
        challenges: {
          orderBy: { createdAt: 'desc' },
          take: 5
        },
        membership: true,
        _count: {
          select: {
            reviews: true,
            projects: true,
            challenges: true
          }
        }
      }
    });

    if (!contractor) {
      return res.status(404).json({ message: 'Contractor not found' });
    }

    // Calculate current rankings
    const experienceLevel = getExperienceLevel(contractor.yearsInBusiness);
    const peerRanking = await calculatePeerRanking(contractor, experienceLevel);

    res.json({
      contractor,
      experienceLevel,
      peerRanking,
      stats: {
        totalReviews: contractor._count.reviews,
        totalProjects: contractor._count.projects,
        activeChallenges: contractor._count.challenges,
        averageRating: contractor.reviews.length > 0 
          ? contractor.reviews.reduce((sum, r) => sum + r.stars, 0) / contractor.reviews.length 
          : 0
      }
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Submit ranking challenge
router.post('/challenges', [
  auth,
  body('challengeType').notEmpty().withMessage('Challenge type is required'),
  body('description').notEmpty().withMessage('Description is required')
], async (req, res) => {
  try {
    if (req.user.role !== 'CONTRACTOR') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { challengeType, description, evidence } = req.body;

    const challenge = await prisma.rankingChallenge.create({
      data: {
        contractorId: req.user.id,
        portalId: req.user.portalId,
        challengeType,
        description,
        evidence
      }
    });

    res.json(challenge);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get contractor challenges
router.get('/challenges', auth, async (req, res) => {
  try {
    if (req.user.role !== 'CONTRACTOR') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const challenges = await prisma.rankingChallenge.findMany({
      where: { contractorId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json(challenges);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Update contractor profile
router.put('/profile', [
  auth,
  body('name').optional().notEmpty(),
  body('companyName').optional(),
  body('phone').optional(),
  body('website').optional(),
  body('yearsInBusiness').optional().isInt({ min: 0 }),
  body('businessStartDate').optional().isISO8601()
], async (req, res) => {
  try {
    if (req.user.role !== 'CONTRACTOR') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contractor = await prisma.contractor.update({
      where: { id: req.user.id },
      data: req.body
    });

    res.json(contractor);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Helper functions (same as marketplace)
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

module.exports = router;
