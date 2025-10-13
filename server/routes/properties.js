const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all properties for user
router.get('/', auth, async (req, res) => {
  try {
    const properties = await prisma.property.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(properties);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get single property
router.get('/:id', auth, async (req, res) => {
  try {
    const property = await prisma.property.findFirst({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });
    
    if (!property) {
      return res.status(404).json({ message: 'Property not found' });
    }
    
    res.json(property);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Create property
router.post('/', [
  auth,
  body('address.street').notEmpty().withMessage('Street address is required'),
  body('address.city').notEmpty().withMessage('City is required'),
  body('address.state').notEmpty().withMessage('State is required'),
  body('purchasePrice').isNumeric().withMessage('Purchase price must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const propertyData = {
      ...req.body,
      userId: req.user.id,
      street: req.body.address.street,
      city: req.body.address.city,
      state: req.body.address.state,
      zipCode: req.body.address.zipCode,
      fullAddress: `${req.body.address.street}, ${req.body.address.city}, ${req.body.address.state} ${req.body.address.zipCode}`
    };

    const property = await prisma.property.create({
      data: propertyData
    });
    
    res.json(property);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Update property
router.put('/:id', auth, async (req, res) => {
  try {
    const updateData = {
      ...req.body,
      street: req.body.address?.street,
      city: req.body.address?.city,
      state: req.body.address?.state,
      zipCode: req.body.address?.zipCode,
      fullAddress: req.body.address ? 
        `${req.body.address.street}, ${req.body.address.city}, ${req.body.address.state} ${req.body.address.zipCode}` : 
        undefined
    };

    const property = await prisma.property.updateMany({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      },
      data: updateData
    });

    if (property.count === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    const updatedProperty = await prisma.property.findUnique({
      where: { id: req.params.id }
    });

    res.json(updatedProperty);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Delete property
router.delete('/:id', auth, async (req, res) => {
  try {
    const property = await prisma.property.deleteMany({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (property.count === 0) {
      return res.status(404).json({ message: 'Property not found' });
    }

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
