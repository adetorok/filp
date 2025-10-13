const express = require('express');
const crypto = require('crypto');
const prisma = require('../prisma');
const auth = require('../middleware/auth');
const { requireOrganizationAccess } = require('../middleware/security');

const router = express.Router();

// Get webhook endpoints
router.get('/', auth, requireOrganizationAccess(['read']), async (req, res) => {
  try {
    const webhooks = await prisma.webhookEndpoint.findMany({
      where: { organizationId: req.organizationId },
      include: {
        _count: {
          select: { deliveries: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(webhooks);
  } catch (error) {
    console.error('Failed to fetch webhooks:', error);
    res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
});

// Create webhook endpoint
router.post('/', auth, requireOrganizationAccess(['write']), async (req, res) => {
  try {
    const { url, events, isActive = true } = req.body;
    
    if (!url || !events || !Array.isArray(events)) {
      return res.status(400).json({ 
        error: 'URL and events array are required' 
      });
    }

    // Generate webhook secret
    const secret = crypto.randomBytes(32).toString('hex');

    const webhook = await prisma.webhookEndpoint.create({
      data: {
        organizationId: req.organizationId,
        url,
        secret,
        events,
        isActive
      }
    });

    res.json(webhook);
  } catch (error) {
    console.error('Failed to create webhook:', error);
    res.status(500).json({ error: 'Failed to create webhook' });
  }
});

// Update webhook endpoint
router.put('/:id', auth, requireOrganizationAccess(['write']), async (req, res) => {
  try {
    const { id } = req.params;
    const { url, events, isActive } = req.body;

    const webhook = await prisma.webhookEndpoint.updateMany({
      where: { 
        id, 
        organizationId: req.organizationId 
      },
      data: {
        url,
        events,
        isActive
      }
    });

    if (webhook.count === 0) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    const updatedWebhook = await prisma.webhookEndpoint.findUnique({
      where: { id }
    });

    res.json(updatedWebhook);
  } catch (error) {
    console.error('Failed to update webhook:', error);
    res.status(500).json({ error: 'Failed to update webhook' });
  }
});

// Delete webhook endpoint
router.delete('/:id', auth, requireOrganizationAccess(['write']), async (req, res) => {
  try {
    const { id } = req.params;

    const webhook = await prisma.webhookEndpoint.deleteMany({
      where: { 
        id, 
        organizationId: req.organizationId 
      }
    });

    if (webhook.count === 0) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    res.json({ message: 'Webhook deleted successfully' });
  } catch (error) {
    console.error('Failed to delete webhook:', error);
    res.status(500).json({ error: 'Failed to delete webhook' });
  }
});

// Test webhook endpoint
router.post('/:id/test', auth, requireOrganizationAccess(['write']), async (req, res) => {
  try {
    const { id } = req.params;
    const { event = 'TEST_EVENT' } = req.body;

    const webhook = await prisma.webhookEndpoint.findFirst({
      where: { 
        id, 
        organizationId: req.organizationId,
        isActive: true
      }
    });

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found or inactive' });
    }

    // Create test delivery
    const testPayload = {
      event,
      data: {
        test: true,
        timestamp: new Date().toISOString(),
        message: 'This is a test webhook delivery'
      }
    };

    const delivery = await prisma.webhookDelivery.create({
      data: {
        webhookId: webhook.id,
        event,
        payload: testPayload,
        status: 'PENDING'
      }
    });

    // Simulate webhook delivery (in real implementation, this would be queued)
    try {
      // In production, this would be handled by a job queue
      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'SUCCESS',
          attempts: 1,
          lastAttempt: new Date(),
          responseCode: 200,
          responseBody: 'Test delivery successful'
        }
      });

      res.json({ 
        message: 'Test webhook sent successfully',
        deliveryId: delivery.id
      });
    } catch (deliveryError) {
      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'FAILED',
          attempts: 1,
          lastAttempt: new Date(),
          lastError: deliveryError.message
        }
      });

      res.status(500).json({ 
        error: 'Test webhook delivery failed',
        details: deliveryError.message
      });
    }
  } catch (error) {
    console.error('Failed to test webhook:', error);
    res.status(500).json({ error: 'Failed to test webhook' });
  }
});

// Get webhook deliveries
router.get('/:id/deliveries', auth, requireOrganizationAccess(['read']), async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 50, status } = req.query;

    const whereClause = { webhookId: id };
    if (status) whereClause.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [deliveries, total] = await Promise.all([
      prisma.webhookDelivery.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.webhookDelivery.count({ where: whereClause })
    ]);

    res.json({
      deliveries,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Failed to fetch webhook deliveries:', error);
    res.status(500).json({ error: 'Failed to fetch webhook deliveries' });
  }
});

module.exports = router;
