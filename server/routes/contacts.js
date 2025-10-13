const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all contacts for user
router.get('/', auth, async (req, res) => {
  try {
    const { type, search } = req.query;
    let whereClause = { userId: req.user.id };

    if (type) whereClause.type = type;
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const contacts = await prisma.contact.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    });
    
    res.json(contacts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get single contact
router.get('/:id', auth, async (req, res) => {
  try {
    const contact = await prisma.contact.findFirst({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });
    
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    
    res.json(contact);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Create contact
router.post('/', [
  auth,
  body('name').notEmpty().withMessage('Name is required'),
  body('type').notEmpty().withMessage('Type is required'),
  body('email').optional().isEmail().withMessage('Valid email required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const contactData = {
      ...req.body,
      userId: req.user.id
    };

    const contact = await prisma.contact.create({
      data: contactData
    });
    
    res.json(contact);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Update contact
router.put('/:id', auth, async (req, res) => {
  try {
    const contact = await prisma.contact.updateMany({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      },
      data: req.body
    });

    if (contact.count === 0) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    const updatedContact = await prisma.contact.findFirst({
      where: { id: req.params.id }
    });

    res.json(updatedContact);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Delete contact
router.delete('/:id', auth, async (req, res) => {
  try {
    const contact = await prisma.contact.deleteMany({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (contact.count === 0) {
      return res.status(404).json({ message: 'Contact not found' });
    }

    res.json({ message: 'Contact deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;