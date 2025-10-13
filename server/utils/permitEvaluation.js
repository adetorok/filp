/**
 * Enhanced Contractor Evaluation with Permit Data
 * 
 * This module provides comprehensive contractor evaluation using:
 * - Permit history and timeline analysis
 * - Work specialization based on permit types
 * - Insurance-permit correlation analysis
 * - Project verification through public records
 */

/**
 * Calculate permit-based contractor score
 * @param {Object} contractor - Contractor with permit data
 * @returns {Object} - Enhanced scoring with permit factors
 */
function calculatePermitBasedScore(contractor) {
  const {
    permits = [],
    workSpecializations = [],
    insurancePermitCorrelations = [],
    projects = []
  } = contractor;

  // Calculate permit-based metrics
  const permitMetrics = calculatePermitMetrics(permits);
  const specializationScore = calculateSpecializationScore(workSpecializations);
  const insuranceCorrelationScore = calculateInsuranceCorrelationScore(insurancePermitCorrelations);
  const projectVerificationScore = calculateProjectVerificationScore(projects, permits);

  // Combine with existing scoring
  const baseScore = contractor.overallScore || 0;
  const experienceScore = contractor.experienceScore || 0;
  const riskScore = contractor.riskScore || 100;
  const insuranceScore = contractor.insuranceScore || 0;

  // Enhanced scoring weights
  const weights = {
    base: 0.20,           // Original score
    experience: 0.15,     // Experience factors
    risk: 0.10,          // Legal history
    insurance: 0.05,     // Insurance coverage
    permits: 0.25,       // Permit history and compliance
    specialization: 0.15, // Work specialization
    correlation: 0.05,   // Insurance-permit correlation
    verification: 0.05   // Project verification
  };

  const enhancedScore = Math.round(
    baseScore * weights.base +
    experienceScore * weights.experience +
    riskScore * weights.risk +
    insuranceScore * weights.insurance +
    permitMetrics.overallScore * weights.permits +
    specializationScore * weights.specialization +
    insuranceCorrelationScore * weights.correlation +
    projectVerificationScore * weights.verification
  );

  return {
    enhancedScore: Math.max(0, Math.min(100, enhancedScore)),
    permitMetrics,
    specializationScore,
    insuranceCorrelationScore,
    projectVerificationScore,
    subscores: {
      base: baseScore,
      experience: experienceScore,
      risk: riskScore,
      insurance: insuranceScore,
      permits: permitMetrics.overallScore,
      specialization: specializationScore,
      correlation: insuranceCorrelationScore,
      verification: projectVerificationScore
    }
  };
}

/**
 * Calculate permit-based metrics
 * @param {Array} permits - Array of permit objects
 * @returns {Object} - Permit metrics
 */
function calculatePermitMetrics(permits) {
  if (!permits || permits.length === 0) {
    return {
      overallScore: 50,
      totalPermits: 0,
      completionRate: 0,
      averageTimeline: 0,
      efficiency: 0,
      complianceRate: 0,
      permitTypes: []
    };
  }

  const completedPermits = permits.filter(p => p.status === 'COMPLETED');
  const totalPermits = permits.length;
  const completionRate = (completedPermits.length / totalPermits) * 100;

  // Calculate timeline metrics
  let totalTimeline = 0;
  let totalEfficiency = 0;
  let violations = 0;

  completedPermits.forEach(permit => {
    if (permit.requestedDate && permit.completedDate) {
      const requested = new Date(permit.requestedDate);
      const completed = new Date(permit.completedDate);
      const days = Math.floor((completed - requested) / (1000 * 60 * 60 * 24));
      totalTimeline += days;
      
      // Efficiency: faster completion = higher score
      const efficiency = Math.max(0, 100 - (days / 30) * 10);
      totalEfficiency += efficiency;
    }

    // Check for violations in inspections
    if (permit.inspections) {
      const failedInspections = permit.inspections.filter(i => i.status === 'Failed');
      violations += failedInspections.length;
    }
  });

  const averageTimeline = completedPermits.length > 0 ? totalTimeline / completedPermits.length : 0;
  const efficiency = completedPermits.length > 0 ? totalEfficiency / completedPermits.length : 0;
  const complianceRate = violations === 0 ? 100 : Math.max(0, 100 - (violations / totalPermits) * 20);

  // Get unique permit types
  const permitTypes = [...new Set(permits.map(p => p.permitType))];

  // Calculate overall permit score
  const overallScore = Math.round(
    (completionRate * 0.4) +
    (efficiency * 0.3) +
    (complianceRate * 0.3)
  );

  return {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    totalPermits,
    completionRate: Math.round(completionRate),
    averageTimeline: Math.round(averageTimeline),
    efficiency: Math.round(efficiency),
    complianceRate: Math.round(complianceRate),
    permitTypes
  };
}

/**
 * Calculate work specialization score
 * @param {Array} specializations - Array of work specialization objects
 * @returns {number} - Specialization score 0-100
 */
function calculateSpecializationScore(specializations) {
  if (!specializations || specializations.length === 0) return 50;

  let totalScore = 0;
  let totalWeight = 0;

  specializations.forEach(spec => {
    const weight = Math.log10(spec.permitCount + 1); // More permits = higher weight
    const score = (
      (spec.successRate || 0) * 0.4 +           // Success rate
      Math.min(100, (spec.permitCount * 5)) * 0.3 + // Volume
      Math.min(100, (spec.averageDuration || 0) * -0.5 + 100) * 0.3 // Speed (faster = better)
    );
    
    totalScore += score * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
}

/**
 * Calculate insurance-permit correlation score
 * @param {Array} correlations - Array of insurance-permit correlation objects
 * @returns {number} - Correlation score 0-100
 */
function calculateInsuranceCorrelationScore(correlations) {
  if (!correlations || correlations.length === 0) return 50;

  let totalScore = 0;
  let totalWeight = 0;

  correlations.forEach(corr => {
    const weight = 1; // Equal weight for now
    let score = 50; // Base score

    switch (corr.correlationType) {
      case 'ADDED_BEFORE_PERMIT':
        score = 90; // Good practice
        break;
      case 'ADDED_DURING_WORK':
        score = 60; // Acceptable
        break;
      case 'ADDED_AFTER_PERMIT':
        score = 30; // Poor practice
        break;
    }

    // Adjust based on risk level
    switch (corr.riskLevel) {
      case 'LOW':
        score += 10;
        break;
      case 'HIGH':
        score -= 20;
        break;
    }

    totalScore += Math.max(0, Math.min(100, score)) * weight;
    totalWeight += weight;
  });

  return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
}

/**
 * Calculate project verification score
 * @param {Array} projects - Array of project objects
 * @param {Array} permits - Array of permit objects
 * @returns {number} - Verification score 0-100
 */
function calculateProjectVerificationScore(projects, permits) {
  if (!projects || projects.length === 0) return 50;

  const projectsWithPermits = projects.filter(project => 
    permits.some(permit => permit.projectId === project.id)
  );

  const verificationRate = (projectsWithPermits.length / projects.length) * 100;
  
  // Bonus for projects with multiple permit types (complex work)
  const complexProjects = projectsWithPermits.filter(project => {
    const projectPermits = permits.filter(p => p.projectId === project.id);
    return projectPermits.length > 1;
  });

  const complexityBonus = (complexProjects.length / projectsWithPermits.length) * 20;

  return Math.min(100, Math.round(verificationRate + complexityBonus));
}

/**
 * Get contractor work specializations with rankings
 * @param {string} contractorId - Contractor ID
 * @returns {Array} - Specializations with rankings
 */
async function getContractorSpecializations(contractorId) {
  const specializations = await prisma.contractorWorkSpecialization.findMany({
    where: { contractorId },
    orderBy: { permitCount: 'desc' }
  });

  // Calculate rankings within each specialization
  const rankings = await Promise.all(
    specializations.map(async (spec) => {
      const betterContractors = await prisma.contractorWorkSpecialization.count({
        where: {
          specialization: spec.specialization,
          permitCount: { gt: spec.permitCount }
        }
      });

      const totalContractors = await prisma.contractorWorkSpecialization.count({
        where: { specialization: spec.specialization }
      });

      return {
        ...spec,
        rank: betterContractors + 1,
        total: totalContractors,
        percentile: totalContractors > 0 ? Math.round(((totalContractors - betterContractors) / totalContractors) * 100) : 0
      };
    })
  );

  return rankings;
}

/**
 * Analyze permit patterns for contractor insights
 * @param {Array} permits - Array of permit objects
 * @returns {Object} - Pattern analysis
 */
function analyzePermitPatterns(permits) {
  if (!permits || permits.length === 0) {
    return {
      patterns: [],
      insights: [],
      recommendations: []
    };
  }

  const patterns = [];
  const insights = [];
  const recommendations = [];

  // Analyze permit types
  const permitTypeCounts = permits.reduce((acc, permit) => {
    acc[permit.permitType] = (acc[permit.permitType] || 0) + 1;
    return acc;
  }, {});

  const topPermitType = Object.entries(permitTypeCounts)
    .sort(([,a], [,b]) => b - a)[0];

  if (topPermitType) {
    patterns.push({
      type: 'PERMIT_TYPE_DOMINANCE',
      description: `Primary specialization in ${topPermitType[0]} permits (${topPermitType[1]} permits)`,
      strength: topPermitType[1] / permits.length
    });
  }

  // Analyze timeline patterns
  const completedPermits = permits.filter(p => p.status === 'COMPLETED');
  if (completedPermits.length > 0) {
    const timelines = completedPermits.map(permit => {
      if (permit.requestedDate && permit.completedDate) {
        const requested = new Date(permit.requestedDate);
        const completed = new Date(permit.completedDate);
        return Math.floor((completed - requested) / (1000 * 60 * 60 * 24));
      }
      return 0;
    }).filter(t => t > 0);

    if (timelines.length > 0) {
      const avgTimeline = timelines.reduce((a, b) => a + b, 0) / timelines.length;
      const timelineConsistency = 100 - (Math.std(timelines) / avgTimeline) * 100;

      patterns.push({
        type: 'TIMELINE_CONSISTENCY',
        description: `Average completion time: ${Math.round(avgTimeline)} days`,
        strength: Math.max(0, timelineConsistency) / 100
      });

      if (avgTimeline < 30) {
        insights.push('Fast permit completion indicates efficient project management');
      } else if (avgTimeline > 90) {
        insights.push('Long permit timelines may indicate complex projects or delays');
      }
    }
  }

  // Analyze seasonal patterns
  const monthlyCounts = permits.reduce((acc, permit) => {
    const month = new Date(permit.requestedDate).getMonth();
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const peakMonth = Object.entries(monthlyCounts)
    .sort(([,a], [,b]) => b - a)[0];

  if (peakMonth) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    patterns.push({
      type: 'SEASONAL_PATTERN',
      description: `Peak activity in ${monthNames[parseInt(peakMonth[0])]} (${peakMonth[1]} permits)`,
      strength: peakMonth[1] / permits.length
    });
  }

  // Generate recommendations
  if (patterns.length > 0) {
    recommendations.push('Consider highlighting primary specializations in contractor profile');
  }

  if (completedPermits.length / permits.length < 0.8) {
    recommendations.push('Focus on improving permit completion rates');
  }

  return {
    patterns,
    insights,
    recommendations
  };
}

module.exports = {
  calculatePermitBasedScore,
  calculatePermitMetrics,
  calculateSpecializationScore,
  calculateInsuranceCorrelationScore,
  calculateProjectVerificationScore,
  getContractorSpecializations,
  analyzePermitPatterns
};
