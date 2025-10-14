/**
 * Contractor Scoring Algorithm
 * 
 * This service calculates contractor scores based on multiple factors:
 * - License status and history
 * - Insurance coverage and claims
 * - Legal events and violations
 * - Permit performance and inspection results
 * - Customer reviews and ratings
 * - Experience and specialization
 */

class ContractorScoringService {
  constructor() {
    this.weights = {
      license: 0.25,      // 25% - License status and compliance
      insurance: 0.20,    // 20% - Insurance coverage and claims
      legal: 0.15,        // 15% - Legal events and violations
      permits: 0.20,      // 20% - Permit performance and inspections
      reviews: 0.15,      // 15% - Customer reviews and ratings
      experience: 0.05    // 5% - Years of experience
    };

    this.scoringRanges = {
      excellent: { min: 90, max: 100 },
      good: { min: 80, max: 89 },
      fair: { min: 70, max: 79 },
      poor: { min: 60, max: 69 },
      unacceptable: { min: 0, max: 59 }
    };
  }

  /**
   * Calculate overall contractor score
   */
  calculateOverallScore(contractorData) {
    try {
      const scores = {
        license: this.calculateLicenseScore(contractorData.license),
        insurance: this.calculateInsuranceScore(contractorData.insurance),
        legal: this.calculateLegalScore(contractorData.legal),
        permits: this.calculatePermitScore(contractorData.permits),
        reviews: this.calculateReviewScore(contractorData.reviews),
        experience: this.calculateExperienceScore(contractorData.experience)
      };

      // Calculate weighted average
      const overallScore = Object.keys(scores).reduce((total, key) => {
        return total + (scores[key] * this.weights[key]);
      }, 0);

      // Apply time decay for older data
      const timeDecayFactor = this.calculateTimeDecay(contractorData.lastUpdated);
      const finalScore = Math.round(overallScore * timeDecayFactor);

      return {
        overallScore: Math.min(100, Math.max(0, finalScore)),
        componentScores: scores,
        weights: this.weights,
        timeDecayFactor,
        grade: this.getScoreGrade(finalScore),
        calculatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error calculating contractor score:', error);
      return {
        overallScore: 0,
        error: error.message,
        calculatedAt: new Date().toISOString()
      };
    }
  }

  /**
   * Calculate license score (0-100)
   */
  calculateLicenseScore(licenseData) {
    if (!licenseData || !licenseData.verified) {
      return 0;
    }

    let score = 0;

    // Base score for having a valid license
    if (licenseData.status === 'Active') {
      score += 40;
    } else if (licenseData.status === 'Suspended') {
      score += 10;
    } else if (licenseData.status === 'Revoked') {
      score += 0;
    }

    // License age bonus (longer = better)
    if (licenseData.issueDate) {
      const yearsActive = this.getYearsSince(licenseData.issueDate);
      score += Math.min(20, yearsActive * 2); // Max 20 points for 10+ years
    }

    // Expiration check
    if (licenseData.expirationDate) {
      const daysUntilExpiry = this.getDaysUntil(licenseData.expirationDate);
      if (daysUntilExpiry > 90) {
        score += 20; // Good time until expiry
      } else if (daysUntilExpiry > 30) {
        score += 10; // Moderate time until expiry
      } else if (daysUntilExpiry > 0) {
        score += 5; // Close to expiry
      } else {
        score += 0; // Expired
      }
    }

    // Bond amount bonus
    if (licenseData.bondAmount) {
      const bondAmount = parseInt(licenseData.bondAmount.replace(/[^0-9]/g, ''));
      if (bondAmount >= 100000) {
        score += 10;
      } else if (bondAmount >= 50000) {
        score += 5;
      }
    }

    // Workers compensation bonus
    if (licenseData.workersCompensation && licenseData.workersCompensation === 'Yes') {
      score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * Calculate insurance score (0-100)
   */
  calculateInsuranceScore(insuranceData) {
    if (!insuranceData || !insuranceData.verified || !insuranceData.policies) {
      return 0;
    }

    let score = 0;
    const policies = insuranceData.policies;

    // General liability insurance
    const generalLiability = policies.find(p => p.type === 'General Liability');
    if (generalLiability) {
      if (generalLiability.status === 'Active') {
        score += 30;
        
        // Coverage amount bonus
        if (generalLiability.coverageAmount >= 2000000) {
          score += 20;
        } else if (generalLiability.coverageAmount >= 1000000) {
          score += 15;
        } else if (generalLiability.coverageAmount >= 500000) {
          score += 10;
        }

        // Expiration check
        const daysUntilExpiry = this.getDaysUntil(generalLiability.expirationDate);
        if (daysUntilExpiry > 90) {
          score += 10;
        } else if (daysUntilExpiry > 30) {
          score += 5;
        }
      }
    }

    // Workers compensation insurance
    const workersComp = policies.find(p => p.type === 'Workers Compensation');
    if (workersComp && workersComp.status === 'Active') {
      score += 20;
      
      // Coverage amount bonus
      if (workersComp.coverageAmount >= 1000000) {
        score += 10;
      } else if (workersComp.coverageAmount >= 500000) {
        score += 5;
      }
    }

    // Additional coverage types
    const additionalCoverage = policies.filter(p => 
      !['General Liability', 'Workers Compensation'].includes(p.type) && 
      p.status === 'Active'
    );
    score += Math.min(20, additionalCoverage.length * 5);

    return Math.min(100, score);
  }

  /**
   * Calculate legal score (0-100)
   */
  calculateLegalScore(legalData) {
    if (!legalData || !legalData.events) {
      return 100; // No legal events = perfect score
    }

    const events = legalData.events;
    let score = 100; // Start with perfect score

    // Deduct points for legal events
    events.forEach(event => {
      const ageInYears = this.getYearsSince(event.date);
      const timeDecay = Math.max(0.1, 1 - (ageInYears * 0.1)); // Events older than 10 years have minimal impact

      switch (event.severity) {
        case 'Critical':
          score -= 50 * timeDecay;
          break;
        case 'Major':
          score -= 25 * timeDecay;
          break;
        case 'Minor':
          score -= 10 * timeDecay;
          break;
        case 'Info':
          score -= 5 * timeDecay;
          break;
      }

      // Additional penalty for unresolved events
      if (event.status !== 'Resolved' && event.status !== 'Closed') {
        score -= 15;
      }
    });

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Calculate permit performance score (0-100)
   */
  calculatePermitScore(permitData) {
    if (!permitData || !permitData.permits || permitData.permits.length === 0) {
      return 50; // Neutral score for no permit history
    }

    const permits = permitData.permits;
    let score = 0;

    // Completion rate
    const completedPermits = permits.filter(p => p.status === 'Finaled').length;
    const completionRate = completedPermits / permits.length;
    score += completionRate * 30;

    // Average days to completion
    const completedPermitsWithDays = permits.filter(p => p.status === 'Finaled' && p.daysOpen);
    if (completedPermitsWithDays.length > 0) {
      const avgDays = completedPermitsWithDays.reduce((sum, p) => sum + p.daysOpen, 0) / completedPermitsWithDays.length;
      
      // Score based on how quickly permits are completed
      if (avgDays <= 30) {
        score += 25;
      } else if (avgDays <= 60) {
        score += 20;
      } else if (avgDays <= 90) {
        score += 15;
      } else if (avgDays <= 120) {
        score += 10;
      } else {
        score += 5;
      }
    }

    // Inspection pass rate
    const allInspections = permits.flatMap(p => p.inspections || []);
    if (allInspections.length > 0) {
      const passedInspections = allInspections.filter(i => i.outcome === 'Pass').length;
      const passRate = passedInspections / allInspections.length;
      score += passRate * 25;
    }

    // Volume bonus (more permits = more experience)
    const volumeBonus = Math.min(20, permits.length * 2);
    score += volumeBonus;

    return Math.min(100, score);
  }

  /**
   * Calculate review score (0-100)
   */
  calculateReviewScore(reviewData) {
    if (!reviewData || !reviewData.reviews || reviewData.reviews.length === 0) {
      return 50; // Neutral score for no reviews
    }

    const reviews = reviewData.reviews;
    let score = 0;

    // Average rating
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    score += avgRating * 20; // 5 stars = 100 points

    // Review volume bonus
    const volumeBonus = Math.min(30, reviews.length * 3);
    score += volumeBonus;

    // Verified review bonus
    const verifiedReviews = reviews.filter(r => r.verified).length;
    const verificationBonus = (verifiedReviews / reviews.length) * 20;
    score += verificationBonus;

    // Recent review bonus
    const recentReviews = reviews.filter(r => {
      const reviewDate = new Date(r.date);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      return reviewDate > sixMonthsAgo;
    });
    const recencyBonus = Math.min(20, recentReviews.length * 5);
    score += recencyBonus;

    return Math.min(100, score);
  }

  /**
   * Calculate experience score (0-100)
   */
  calculateExperienceScore(experienceData) {
    if (!experienceData || !experienceData.yearsExperience) {
      return 0;
    }

    const years = experienceData.yearsExperience;
    let score = 0;

    // Base score for years of experience
    if (years >= 10) {
      score = 100;
    } else if (years >= 7) {
      score = 80;
    } else if (years >= 5) {
      score = 60;
    } else if (years >= 3) {
      score = 40;
    } else if (years >= 1) {
      score = 20;
    }

    // Specialization bonus
    if (experienceData.specializations && experienceData.specializations.length > 0) {
      score += Math.min(20, experienceData.specializations.length * 5);
    }

    return Math.min(100, score);
  }

  /**
   * Calculate time decay factor for data freshness
   */
  calculateTimeDecay(lastUpdated) {
    if (!lastUpdated) {
      return 0.5; // Heavy penalty for no update date
    }

    const daysSinceUpdate = this.getDaysSince(lastUpdated);
    
    if (daysSinceUpdate <= 7) {
      return 1.0; // No decay for recent data
    } else if (daysSinceUpdate <= 30) {
      return 0.95; // Minimal decay
    } else if (daysSinceUpdate <= 90) {
      return 0.85; // Moderate decay
    } else if (daysSinceUpdate <= 180) {
      return 0.70; // Significant decay
    } else {
      return 0.50; // Heavy decay for old data
    }
  }

  /**
   * Get score grade based on numerical score
   */
  getScoreGrade(score) {
    for (const [grade, range] of Object.entries(this.scoringRanges)) {
      if (score >= range.min && score <= range.max) {
        return grade;
      }
    }
    return 'unacceptable';
  }

  /**
   * Generate score explanation for contractors
   */
  generateScoreExplanation(scoreData) {
    const { overallScore, componentScores, weights, grade } = scoreData;
    
    const explanation = {
      overallScore,
      grade,
      breakdown: Object.keys(componentScores).map(component => ({
        component,
        score: componentScores[component],
        weight: weights[component],
        contribution: Math.round(componentScores[component] * weights[component]),
        description: this.getComponentDescription(component, componentScores[component])
      })),
      recommendations: this.getRecommendations(componentScores),
      lastUpdated: new Date().toISOString()
    };

    return explanation;
  }

  /**
   * Get component description
   */
  getComponentDescription(component, score) {
    const descriptions = {
      license: score >= 80 ? 'Valid license with good standing' : 
               score >= 60 ? 'License needs attention' : 'License issues detected',
      insurance: score >= 80 ? 'Comprehensive insurance coverage' : 
                 score >= 60 ? 'Insurance coverage adequate' : 'Insurance coverage insufficient',
      legal: score >= 80 ? 'Clean legal record' : 
             score >= 60 ? 'Minor legal issues' : 'Significant legal concerns',
      permits: score >= 80 ? 'Excellent permit performance' : 
               score >= 60 ? 'Good permit performance' : 'Permit performance needs improvement',
      reviews: score >= 80 ? 'Excellent customer satisfaction' : 
               score >= 60 ? 'Good customer satisfaction' : 'Customer satisfaction needs improvement',
      experience: score >= 80 ? 'Extensive experience' : 
                  score >= 60 ? 'Good experience level' : 'Limited experience'
    };
    
    return descriptions[component] || 'No data available';
  }

  /**
   * Get improvement recommendations
   */
  getRecommendations(componentScores) {
    const recommendations = [];
    
    if (componentScores.license < 70) {
      recommendations.push('Renew or update contractor license');
    }
    
    if (componentScores.insurance < 70) {
      recommendations.push('Increase insurance coverage or update policies');
    }
    
    if (componentScores.legal < 70) {
      recommendations.push('Address any outstanding legal issues');
    }
    
    if (componentScores.permits < 70) {
      recommendations.push('Improve permit completion times and inspection pass rates');
    }
    
    if (componentScores.reviews < 70) {
      recommendations.push('Focus on customer satisfaction and request more reviews');
    }
    
    if (componentScores.experience < 70) {
      recommendations.push('Gain more experience in specialized areas');
    }
    
    return recommendations;
  }

  /**
   * Utility: Get years since date
   */
  getYearsSince(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    return (now - date) / (365.25 * 24 * 60 * 60 * 1000);
  }

  /**
   * Utility: Get days since date
   */
  getDaysSince(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    return Math.floor((now - date) / (24 * 60 * 60 * 1000));
  }

  /**
   * Utility: Get days until date
   */
  getDaysUntil(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    return Math.floor((date - now) / (24 * 60 * 60 * 1000));
  }
}

module.exports = ContractorScoringService;