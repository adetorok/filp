const express = require('express');
const prisma = require('../prisma');
const auth = require('../middleware/auth');

const router = express.Router();

// Get user subscription
router.get('/', auth, async (req, res) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!subscription) {
      return res.json({
        plan: 'FREE',
        status: 'ACTIVE',
        features: getPlanFeatures('FREE')
      });
    }

    res.json({
      ...subscription,
      features: getPlanFeatures(subscription.plan)
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Failed to get subscription' });
  }
});

// Update subscription
router.put('/', auth, async (req, res) => {
  try {
    const { plan, billingCycle, autoRenew } = req.body;

    if (!plan || !['FREE', 'PRO', 'RENTAL_BASIC', 'RENTAL_PREMIUM'].includes(plan)) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    const pricing = getPlanPricing(plan);
    
    const subscription = await prisma.subscription.upsert({
      where: { userId: req.user.id },
      update: {
        plan,
        billingCycle: billingCycle || 'MONTHLY',
        autoRenew: autoRenew !== undefined ? autoRenew : true,
        price: pricing.price,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: billingCycle === 'YEARLY' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      create: {
        userId: req.user.id,
        plan,
        billingCycle: billingCycle || 'MONTHLY',
        autoRenew: autoRenew !== undefined ? autoRenew : true,
        price: pricing.price,
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: billingCycle === 'YEARLY' 
          ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    });

    res.json({
      ...subscription,
      features: getPlanFeatures(subscription.plan)
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Cancel subscription
router.delete('/', auth, async (req, res) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: req.user.id }
    });

    if (!subscription) {
      return res.status(404).json({ error: 'No subscription found' });
    }

    await prisma.subscription.update({
      where: { userId: req.user.id },
      data: {
        status: 'CANCELLED',
        autoRenew: false
      }
    });

    res.json({ message: 'Subscription cancelled successfully' });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
});

// Get pricing plans
router.get('/plans', (req, res) => {
  const plans = [
    {
      id: 'FREE',
      name: 'Free',
      price: 0,
      billingCycle: 'MONTHLY',
      description: 'Perfect for getting started with your first project',
      features: getPlanFeatures('FREE'),
      limitations: [
        '1 project maximum',
        '6 months free trial',
        'Basic features only'
      ]
    },
    {
      id: 'PRO',
      name: 'Pro',
      price: 29.99,
      billingCycle: 'MONTHLY',
      description: 'Full-featured plan for serious house flippers',
      features: getPlanFeatures('PRO'),
      additionalProjects: 4.99
    },
    {
      id: 'RENTAL_BASIC',
      name: 'Rental Basic',
      price: 19.99,
      billingCycle: 'MONTHLY',
      description: 'Perfect for managing 1-2 rental properties',
      features: getPlanFeatures('RENTAL_BASIC'),
      limitations: [
        '1-2 properties maximum',
        'Basic rental management features'
      ]
    },
    {
      id: 'RENTAL_PREMIUM',
      name: 'Rental Premium',
      price: 39.99,
      billingCycle: 'MONTHLY',
      description: 'Advanced rental management for 3-10 properties',
      features: getPlanFeatures('RENTAL_PREMIUM'),
      limitations: [
        '3-10 properties maximum',
        'All rental management features'
      ]
    }
  ];

  res.json(plans);
});

// Helper functions
function getPlanFeatures(plan) {
  const features = {
    FREE: [
      'Property Management',
      'Deal Analysis',
      'Expense Tracking',
      'Task Management',
      'Contact Management',
      'Basic Reports',
      '1 Project Maximum',
      '6 Months Free'
    ],
    PRO: [
      'Everything in Free',
      'Unlimited Projects',
      'Advanced Analytics',
      'Contractor Verification',
      'Permit Tracking',
      'Advanced Reports',
      'Priority Support',
      'API Access'
    ],
    RENTAL_BASIC: [
      'Rental Property Management',
      'Tenant Management',
      'Income Tracking',
      'Expense Tracking',
      'Maintenance Scheduling',
      'Basic Financial Reports',
      '1-2 Properties Maximum'
    ],
    RENTAL_PREMIUM: [
      'Everything in Rental Basic',
      'Advanced Financial Analytics',
      'Automated Rent Collection',
      'Tenant Screening',
      'Maintenance Coordination',
      'Tax Report Generation',
      '3-10 Properties Maximum',
      'Priority Support'
    ]
  };

  return features[plan] || [];
}

function getPlanPricing(plan) {
  const pricing = {
    FREE: { price: 0 },
    PRO: { price: 29.99 },
    RENTAL_BASIC: { price: 19.99 },
    RENTAL_PREMIUM: { price: 39.99 }
  };

  return pricing[plan] || { price: 0 };
}

module.exports = router;