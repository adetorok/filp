const express = require('express');
const { body, validationResult } = require('express-validator');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all tasks for user
router.get('/', auth, async (req, res) => {
  try {
    const { propertyId, status, priority } = req.query;
    let whereClause = { userId: req.user.id };

    if (propertyId) whereClause.propertyId = propertyId;
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;

    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        property: {
          select: { id: true, fullAddress: true }
        },
        deal: {
          select: { id: true, title: true }
        }
      },
      orderBy: { dueDate: 'asc' }
    });
    
    res.json(tasks);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Get single task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await prisma.task.findFirst({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      },
      include: {
        property: true,
        deal: true
      }
    });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    res.json(task);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Create task
router.post('/', [
  auth,
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const taskData = {
      ...req.body,
      userId: req.user.id
    };

    const task = await prisma.task.create({
      data: taskData,
      include: {
        property: {
          select: { id: true, fullAddress: true }
        },
        deal: {
          select: { id: true, title: true }
        }
      }
    });
    
    res.json(task);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Update task
router.put('/:id', auth, async (req, res) => {
  try {
    const task = await prisma.task.updateMany({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      },
      data: req.body
    });

    if (task.count === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updatedTask = await prisma.task.findFirst({
      where: { id: req.params.id },
      include: {
        property: true,
        deal: true
      }
    });

    res.json(updatedTask);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await prisma.task.deleteMany({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      }
    });

    if (task.count === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// Mark task as complete
router.patch('/:id/complete', auth, async (req, res) => {
  try {
    const task = await prisma.task.updateMany({
      where: { 
        id: req.params.id, 
        userId: req.user.id 
      },
      data: { 
        status: 'COMPLETED', 
        completedAt: new Date() 
      }
    });

    if (task.count === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const updatedTask = await prisma.task.findFirst({
      where: { id: req.params.id },
      include: {
        property: true,
        deal: true
      }
    });

    res.json(updatedTask);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;