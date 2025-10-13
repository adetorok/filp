const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all deals for user
router.get('/', auth, async (req, res) => {
  try {
    const deals = await prisma.deal.findMany({
      where: { userId: req.user.id },
      include: {
        property: {
          select: {
            id: true,
            fullAddress: true,
            propertyType: true,
            bedrooms: true,
            bathrooms: true,
            squareFeet: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(deals);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get single deal
router.get('/:id', auth, async (req, res) => {
  try {
    const deal = await prisma.deal.findFirst({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      },
      include: {
        property: true
      }
    });
    
    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }
    
    res.json(deal);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Create deal
router.post('/', [
  auth,
  body('propertyId').notEmpty().withMessage('Valid property ID is required'),
  body('offerPrice').isNumeric().withMessage('Offer price must be a number'),
  body('estimatedARV').isNumeric().withMessage('Estimated ARV must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify property belongs to user
    const property = await prisma.property.findFirst({
      where: { 
        id: req.body.propertyId, 
        userId: req.user.id 
      }
    });
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const dealData = {
      ...req.body,
      userId: req.user.id
    };

    const deal = await prisma.deal.create({
      data: dealData
    });
    
    res.json(deal);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Update deal
router.put('/:id', auth, async (req, res) => {
  try {
    const deal = await prisma.deal.updateMany({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      },
      data: req.body
    });

    if (deal.count === 0) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    const updatedDeal = await prisma.deal.findUnique({
      where: { id: req.params.id },
      include: {
        property: true
      }
    });

    res.json(updatedDeal);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Delete deal
router.delete('/:id', auth, async (req, res) => {
  try {
    const deal = await prisma.deal.deleteMany({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (deal.count === 0) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    res.json({ message: 'Deal deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Calculate deal metrics
router.post('/:id/calculate', auth, async (req, res) => {
  try {
    const deal = await prisma.deal.findFirst({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (!deal) {
      return res.status(404).json({ message: 'Deal not found' });
    }

    const {
      offerPrice = 0,
      closingCosts = 0,
      holdingCosts = 0,
      repairCosts = 0,
      sellingCosts = 0,
      estimatedARV = 0
    } = req.body;

    const totalInvestment = offerPrice + closingCosts + holdingCosts + repairCosts + sellingCosts;
    const estimatedProfit = estimatedARV - totalInvestment;
    const estimatedROI = totalInvestment > 0 ? (estimatedProfit / totalInvestment) * 100 : 0;

    const updatedDeal = await prisma.deal.update({
      where: { id: req.params.id },
      data: {
        offerPrice,
        closingCosts,
        holdingCosts,
        repairCosts,
        sellingCosts,
        totalInvestment,
        estimatedARV,
        estimatedProfit,
        estimatedROI
      },
      include: {
        property: true
      }
    });

    res.json(updatedDeal);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
