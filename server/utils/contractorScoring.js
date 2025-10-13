/**
 * Contractor Scoring Algorithm with Experience Normalization
 * 
 * This module provides comprehensive scoring for contractors that takes into account:
 * - Years of service
 * - Volume of work completed
 * - Legal history (normalized for experience)
 * - Customer reviews
 * - Insurance coverage
 * - Project performance
 */

/**
 * Calculate the overall contractor score (0-100)
 * @param {Object} contractor - Contractor data with all related information
 * @returns {Object} - Score breakdown and overall grade
 */
function calculateOverallScore(contractor) {
  const {
    reviews = [],
    legalEvents = [],
    policies = [],
    totalProjects = 0,
    yearsInBusiness = 0,
    totalValue = 0,
    projects = []
  } = contractor;

  // Calculate individual component scores
  const reviewScore = calculateReviewScore(reviews);
  const onTimeScore = calculateOnTimeScore(projects);
  const budgetScore = calculateBudgetScore(projects);
  const safetyScore = calculateSafetyScore(projects);
  const communicationScore = calculateCommunicationScore(reviews);
  const riskScore = calculateRiskScore(legalEvents, totalProjects, yearsInBusiness);
  const insuranceScore = calculateInsuranceScore(policies);
  const experienceScore = calculateExperienceScore(totalProjects, yearsInBusiness, totalValue);

  // Weighted scoring (adjustable weights)
  const weights = {
    reviews: 0.25,        // 25% - Customer satisfaction
    onTime: 0.20,         // 20% - Project delivery performance
    budget: 0.10,         // 10% - Cost adherence
    safety: 0.10,         // 10% - Safety record
    communication: 0.10,  // 10% - Communication quality
    risk: 0.10,           // 10% - Legal history (normalized)
    insurance: 0.05,      // 5% - Insurance coverage
    experience: 0.10      // 10% - Years of service and volume
  };

  // Calculate weighted overall score
  const overallScore = Math.round(
    reviewScore * weights.reviews +
    onTimeScore * weights.onTime +
    budgetScore * weights.budget +
    safetyScore * weights.safety +
    communicationScore * weights.communication +
    riskScore * weights.risk +
    insuranceScore * weights.insurance +
    experienceScore * weights.experience
  );

  // Calculate grade
  const grade = calculateGrade(overallScore);

  return {
    overallScore: Math.max(0, Math.min(100, overallScore)),
    grade,
    subscores: {
      reviews: reviewScore,
      onTime: onTimeScore,
      budget: budgetScore,
      safety: safetyScore,
      communication: communicationScore,
      risk: riskScore,
      insurance: insuranceScore,
      experience: experienceScore
    },
    experienceFactor: calculateExperienceFactor(totalProjects, yearsInBusiness),
    sampleSize: reviews.length
  };
}

/**
 * Calculate review score using Bayesian averaging
 * @param {Array} reviews - Array of review objects
 * @returns {number} - Score 0-100
 */
function calculateReviewScore(reviews) {
  if (!reviews || reviews.length === 0) return 50; // Neutral score for no reviews
  
  const totalStars = reviews.reduce((sum, review) => sum + review.stars, 0);
  const reviewCount = reviews.length;
  
  // Bayesian average with prior (prevents new contractors from being perfect)
  const priorMean = 4.2; // Prior average rating
  const priorWeight = 8;  // Prior sample size
  
  const bayesianAverage = (totalStars + priorMean * priorWeight) / (reviewCount + priorWeight);
  
  // Convert 1-5 scale to 0-100 scale
  return Math.round((bayesianAverage / 5) * 100);
}

/**
 * Calculate on-time delivery score
 * @param {Array} projects - Array of completed projects
 * @returns {number} - Score 0-100
 */
function calculateOnTimeScore(projects) {
  if (!projects || projects.length === 0) return 50;
  
  const completedProjects = projects.filter(p => p.status === 'COMPLETED' && p.plannedEnd && p.actualEnd);
  if (completedProjects.length === 0) return 50;
  
  const onTimeProjects = completedProjects.filter(p => {
    const plannedEnd = new Date(p.plannedEnd);
    const actualEnd = new Date(p.actualEnd);
    return actualEnd <= plannedEnd;
  });
  
  const onTimeRate = onTimeProjects.length / completedProjects.length;
  return Math.round(onTimeRate * 100);
}

/**
 * Calculate budget adherence score
 * @param {Array} projects - Array of completed projects
 * @returns {number} - Score 0-100
 */
function calculateBudgetScore(projects) {
  if (!projects || projects.length === 0) return 50;
  
  const budgetedProjects = projects.filter(p => 
    p.status === 'COMPLETED' && 
    p.budgetPlanned && 
    p.budgetActual && 
    p.budgetPlanned > 0
  );
  
  if (budgetedProjects.length === 0) return 50;
  
  const totalVariance = budgetedProjects.reduce((sum, p) => {
    const variance = Math.abs(p.budgetActual - p.budgetPlanned) / p.budgetPlanned;
    return sum + Math.min(1, variance); // Cap at 100% variance
  }, 0);
  
  const averageVariance = totalVariance / budgetedProjects.length;
  return Math.round(Math.max(0, (1 - averageVariance) * 100));
}

/**
 * Calculate safety score based on inspections
 * @param {Array} projects - Array of projects with inspections
 * @returns {number} - Score 0-100
 */
function calculateSafetyScore(projects) {
  if (!projects || projects.length === 0) return 50;
  
  const projectsWithInspections = projects.filter(p => p.inspections && p.inspections.length > 0);
  if (projectsWithInspections.length === 0) return 50;
  
  const totalViolations = projectsWithInspections.reduce((sum, p) => {
    return sum + p.inspections.reduce((inspSum, insp) => inspSum + insp.violations, 0);
  }, 0);
  
  const totalInspections = projectsWithInspections.reduce((sum, p) => sum + p.inspections.length, 0);
  const violationRate = totalViolations / totalInspections;
  
  // Convert violation rate to score (lower violations = higher score)
  return Math.round(Math.max(0, (1 - violationRate) * 100));
}

/**
 * Calculate communication score from reviews
 * @param {Array} reviews - Array of review objects
 * @returns {number} - Score 0-100
 */
function calculateCommunicationScore(reviews) {
  if (!reviews || reviews.length === 0) return 50;
  
  const totalCommunication = reviews.reduce((sum, review) => sum + (review.communication || 0), 0);
  const averageCommunication = totalCommunication / reviews.length;
  
  // Convert 1-5 scale to 0-100 scale
  return Math.round((averageCommunication / 5) * 100);
}

/**
 * Calculate risk score with experience normalization
 * @param {Array} legalEvents - Array of legal events
 * @param {number} totalProjects - Total number of projects
 * @param {number} yearsInBusiness - Years in business
 * @returns {number} - Score 0-100
 */
function calculateRiskScore(legalEvents, totalProjects = 0, yearsInBusiness = 0) {
  if (!legalEvents || legalEvents.length === 0) return 100;
  
  let score = 100;
  const now = new Date();
  
  // Calculate experience normalization factor
  const experienceFactor = calculateExperienceFactor(totalProjects, yearsInBusiness);
  
  for (const event of legalEvents) {
    const monthsSinceEvent = Math.floor((now - new Date(event.filedOn || event.createdAt)) / (1000 * 60 * 60 * 24 * 30));
    const timeDecay = Math.exp(-monthsSinceEvent / 24);
    
    let penalty = 0;
    switch (event.severity) {
      case 'CRITICAL':
        penalty = 35;
        break;
      case 'HIGH':
        penalty = 20;
        break;
      case 'MEDIUM':
        penalty = 10;
        break;
      case 'LOW':
        penalty = 5;
        break;
    }
    
    // Apply experience normalization - more experienced contractors get reduced penalties
    const normalizedPenalty = penalty * (1 - experienceFactor);
    score -= normalizedPenalty * timeDecay;
  }
  
  return Math.max(0, Math.round(score));
}

/**
 * Calculate insurance score
 * @param {Array} policies - Array of insurance policies
 * @returns {number} - Score 0-100
 */
function calculateInsuranceScore(policies) {
  if (!policies || policies.length === 0) return 0;
  
  const activePolicies = policies.filter(p => 
    p.expiresOn && new Date(p.expiresOn) > new Date()
  );
  
  if (activePolicies.length === 0) return 30;
  
  const hasGL = activePolicies.some(p => p.type === 'GL');
  const hasWC = activePolicies.some(p => p.type === 'WC');
  
  let score = 0;
  if (hasGL) {
    const glPolicy = activePolicies.find(p => p.type === 'GL');
    const coverage = glPolicy.coverageEachOccur || 0;
    if (coverage >= 2000000) score += 100;
    else if (coverage >= 1000000) score += 80;
    else if (coverage >= 500000) score += 60;
    else score += 40;
  }
  
  if (hasWC) score += 5;
  
  return Math.min(100, score);
}

/**
 * Calculate experience score based on years and volume
 * @param {number} totalProjects - Total projects completed
 * @param {number} yearsInBusiness - Years in business
 * @param {number} totalValue - Total value of projects
 * @returns {number} - Score 0-100
 */
function calculateExperienceScore(totalProjects, yearsInBusiness, totalValue) {
  let score = 0;
  
  // Years in business (0-40 points)
  if (yearsInBusiness > 0) {
    score += Math.min(40, yearsInBusiness * 2);
  }
  
  // Project volume (0-30 points)
  if (totalProjects > 0) {
    // Logarithmic scaling for project count
    score += Math.min(30, Math.log10(totalProjects) * 15);
  }
  
  // Project value (0-30 points)
  if (totalValue && totalValue > 0) {
    // Logarithmic scaling for project value (in millions)
    const valueInMillions = Number(totalValue) / 1000000;
    score += Math.min(30, Math.log10(valueInMillions + 1) * 15);
  }
  
  return Math.min(100, score);
}

/**
 * Calculate experience normalization factor
 * @param {number} totalProjects - Total projects completed
 * @param {number} yearsInBusiness - Years in business
 * @returns {number} - Factor 0-0.5
 */
function calculateExperienceFactor(totalProjects, yearsInBusiness) {
  let projectFactor = 0;
  if (totalProjects > 0) {
    // Logarithmic scaling: more projects = diminishing returns
    projectFactor = Math.min(0.3, Math.log10(totalProjects) * 0.1);
  }
  
  let yearsFactor = 0;
  if (yearsInBusiness > 0) {
    // Linear scaling up to 20 years, then capped
    yearsFactor = Math.min(0.2, yearsInBusiness * 0.01);
  }
  
  return Math.min(0.5, projectFactor + yearsFactor);
}

/**
 * Calculate letter grade from score
 * @param {number} score - Score 0-100
 * @returns {string} - Grade A-F
 */
function calculateGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

module.exports = {
  calculateOverallScore,
  calculateReviewScore,
  calculateOnTimeScore,
  calculateBudgetScore,
  calculateSafetyScore,
  calculateCommunicationScore,
  calculateRiskScore,
  calculateInsuranceScore,
  calculateExperienceScore,
  calculateExperienceFactor,
  calculateGrade
};
