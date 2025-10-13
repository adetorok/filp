const Queue = require('bull');
const prisma = require('../prisma');
const { calculatePermitBasedScore } = require('../utils/permitEvaluation');

// Job queue configuration
const jobQueue = new Queue('homeflip-jobs', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD
  },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
});

// Job types
const JOB_TYPES = {
  COMPUTE_SCORES: 'compute-scores',
  ENRICH_CONTRACTOR: 'enrich-contractor',
  SYNC_PERMITS: 'sync-permits',
  SEND_EMAIL: 'send-email',
  CLEANUP_EXPIRED_TOKENS: 'cleanup-expired-tokens',
  BACKUP_DATABASE: 'backup-database'
};

// Job processors
jobQueue.process(JOB_TYPES.COMPUTE_SCORES, async (job) => {
  console.log('Processing compute-scores job:', job.id);
  
  const contractors = await prisma.contractor.findMany({
    include: {
      permits: true,
      workSpecializations: true,
      insurancePermitCorrelations: true,
      projects: true,
      reviews: true,
      legalEvents: true,
      policies: true,
      areaScores: true
    }
  });

  const results = [];
  
  for (const contractor of contractors) {
    try {
      const evaluation = calculatePermitBasedScore(contractor);
      
      // Update area scores
      const areaScores = await prisma.contractorAreaScore.findMany({
        where: { contractorId: contractor.id }
      });

      for (const areaScore of areaScores) {
        await prisma.contractorAreaScore.update({
          where: { id: areaScore.id },
          data: {
            score: evaluation.enhancedScore,
            grade: evaluation.grade,
            subscores: evaluation.subscores,
            period: new Date().toISOString().slice(0, 7)
          }
        });
      }

      results.push({
        contractorId: contractor.id,
        name: contractor.name,
        score: evaluation.enhancedScore,
        grade: evaluation.grade
      });
    } catch (error) {
      console.error(`Error computing score for contractor ${contractor.id}:`, error);
      throw error; // This will trigger retry
    }
  }

  return { processed: results.length, results };
});

jobQueue.process(JOB_TYPES.ENRICH_CONTRACTOR, async (job) => {
  const { contractorId } = job.data;
  console.log('Processing enrich-contractor job:', contractorId);
  
  const contractor = await prisma.contractor.findUnique({
    where: { id: contractorId },
    include: {
      licenses: true,
      policies: true,
      legalEvents: true
    }
  });

  if (!contractor) {
    throw new Error(`Contractor ${contractorId} not found`);
  }

  // Simulate enrichment process
  const enrichmentResults = {
    licensesUpdated: 0,
    policiesUpdated: 0,
    legalEventsFound: 0,
    lastChecked: new Date()
  };

  // Update license verification status
  for (const license of contractor.licenses) {
    if (!license.adminVerified) {
      await prisma.contractorLicense.update({
        where: { id: license.id },
        data: {
          lastCheckedAt: new Date(),
          sourceUrl: `https://example-license-board.com/verify/${license.number}`
        }
      });
      enrichmentResults.licensesUpdated++;
    }
  }

  // Update insurance verification
  for (const policy of contractor.policies) {
    await prisma.insurancePolicy.update({
      where: { id: policy.id },
      data: {
        lastVerifiedAt: new Date()
      }
    });
    enrichmentResults.policiesUpdated++;
  }

  return enrichmentResults;
});

jobQueue.process(JOB_TYPES.SYNC_PERMITS, async (job) => {
  const { contractorId, jurisdiction } = job.data;
  console.log('Processing sync-permits job:', contractorId, jurisdiction);
  
  // Simulate permit sync with city database
  const permits = await mockPermitSync(contractorId, jurisdiction);
  
  for (const permitData of permits) {
    await prisma.permit.upsert({
      where: {
        permitNumber_jurisdiction: {
          permitNumber: permitData.permitNumber,
          jurisdiction: permitData.jurisdiction
        }
      },
      update: permitData,
      create: permitData
    });
  }

  return { synced: permits.length };
});

jobQueue.process(JOB_TYPES.CLEANUP_EXPIRED_TOKENS, async (job) => {
  console.log('Processing cleanup-expired-tokens job');
  
  // Clean up expired password reset tokens
  const expiredTokens = await prisma.user.updateMany({
    where: {
      passwordResetExpires: {
        lt: new Date()
      }
    },
    data: {
      passwordResetToken: null,
      passwordResetExpires: null
    }
  });

  // Clean up expired idempotency keys (if using database storage)
  // This is handled by in-memory cache cleanup in idempotency middleware

  return { cleaned: expiredTokens.count };
});

jobQueue.process(JOB_TYPES.BACKUP_DATABASE, async (job) => {
  console.log('Processing backup-database job');
  
  // In production, this would trigger actual database backup
  const backupInfo = {
    timestamp: new Date().toISOString(),
    type: 'full',
    size: 'simulated',
    location: 's3://backups/homeflip/'
  };

  return backupInfo;
});

// Helper function to mock permit sync
async function mockPermitSync(contractorId, jurisdiction) {
  // In production, this would call actual city permit APIs
  return [
    {
      contractorId,
      permitNumber: `PERM-${Date.now()}`,
      permitType: 'BUILDING',
      status: 'APPROVED',
      description: 'Mock permit for testing',
      propertyAddress: '123 Test St',
      city: 'Test City',
      state: 'TX',
      zipCode: '12345',
      requestedDate: new Date(),
      approvedDate: new Date(),
      jurisdiction
    }
  ];
}

// Job scheduling
function scheduleJobs() {
  // Compute scores every 6 hours
  jobQueue.add(JOB_TYPES.COMPUTE_SCORES, {}, {
    repeat: { cron: '0 */6 * * *' },
    jobId: 'compute-scores-scheduled'
  });

  // Cleanup expired tokens daily
  jobQueue.add(JOB_TYPES.CLEANUP_EXPIRED_TOKENS, {}, {
    repeat: { cron: '0 2 * * *' },
    jobId: 'cleanup-tokens-scheduled'
  });

  // Backup database daily
  jobQueue.add(JOB_TYPES.BACKUP_DATABASE, {}, {
    repeat: { cron: '0 3 * * *' },
    jobId: 'backup-database-scheduled'
  });
}

// Error handling
jobQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
  
  // Send alert to monitoring system
  if (job.attemptsMade >= job.opts.attempts) {
    console.error(`Job ${job.id} permanently failed after ${job.attemptsMade} attempts`);
  }
});

jobQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result);
});

// Start job scheduling
scheduleJobs();

module.exports = {
  jobQueue,
  JOB_TYPES,
  scheduleJobs
};
