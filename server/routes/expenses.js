const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all expenses for user
router.get('/', auth, async (req, res) => {
  try {
    const { propertyId, category, startDate, endDate } = req.query;
    let whereClause = { userId: req.user.id };

    if (propertyId) whereClause.propertyId = propertyId;
    if (category) whereClause.category = category;
    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        property: {
          select: { id: true, fullAddress: true }
        },
        deal: {
          select: { id: true, title: true }
        }
      },
      orderBy: { date: 'desc' }
    });
    
    res.json(expenses);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get single expense
router.get('/:id', auth, async (req, res) => {
  try {
    const expense = await prisma.expense.findFirst({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      },
      include: {
        property: true,
        deal: true
      }
    });
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    res.json(expense);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Create expense
router.post('/', [
  auth,
  body('propertyId').notEmpty().withMessage('Property ID is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('amount').isNumeric().withMessage('Amount must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const expenseData = {
      ...req.body,
      userId: req.user.id
    };

    const expense = await prisma.expense.create({
      data: expenseData,
      include: {
        property: {
          select: { id: true, fullAddress: true }
        },
        deal: {
          select: { id: true, title: true }
        }
      }
    });
    
    res.json(expense);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Update expense
router.put('/:id', auth, async (req, res) => {
  try {
    const expense = await prisma.expense.updateMany({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      },
      data: req.body
    });

    if (expense.count === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Get updated expense
    const updatedExpense = await prisma.expense.findFirst({
      where: { id: req.params.id },
      include: {
        property: true,
        deal: true
      }
    });

    res.json(updatedExpense);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await prisma.expense.deleteMany({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (expense.count === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get expense summary
router.get('/summary/:propertyId', auth, async (req, res) => {
  try {
    const { propertyId } = req.params;
    
    const expenses = await prisma.expense.findMany({
      where: { 
        userId: req.user.id, 
        propertyId 
      }
    });

    const summary = expenses.reduce((acc, expense) => {
      if (!acc[expense.category]) {
        acc[expense.category] = 0;
      }
      acc[expense.category] += Number(expense.amount);
      acc.total += Number(expense.amount);
      return acc;
    }, { total: 0 });

    res.json(summary);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;