/**
 * Contractor Verification Service
 * 
 * This service handles verification of contractor licenses, insurance, and legal events
 * by pulling data from various state databases and APIs.
 */

const axios = require('axios');
const crypto = require('crypto');

class ContractorVerificationService {
  constructor() {
    this.stateAPIs = {
      'TX': {
        license: 'https://www.tdlr.texas.gov/api/contractors',
        insurance: 'https://api.texas.gov/insurance/verify',
        legal: 'https://api.texas.gov/legal/contractors'
      },
      'CA': {
        license: 'https://api.cslb.ca.gov/contractors',
        insurance: 'https://api.ca.gov/insurance/verify',
        legal: 'https://api.ca.gov/legal/contractors'
      },
      'FL': {
        license: 'https://api.myfloridalicense.com/contractors',
        insurance: 'https://api.florida.gov/insurance/verify',
        legal: 'https://api.florida.gov/legal/contractors'
      },
      'NY': {
        license: 'https://api.ny.gov/contractors',
        insurance: 'https://api.ny.gov/insurance/verify',
        legal: 'https://api.ny.gov/legal/contractors'
      }
    };
    
    this.rateLimits = new Map();
    this.cache = new Map();
  }

  /**
   * Verify contractor license from state database
   */
  async verifyLicense(licenseNumber, state, licenseType = 'General Contractor') {
    try {
      const cacheKey = `license_${state}_${licenseNumber}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
          return cached.data;
        }
      }

      // Rate limiting
      await this.checkRateLimit(state, 'license');

      const apiConfig = this.stateAPIs[state];
      if (!apiConfig) {
        throw new Error(`State ${state} not supported`);
      }

      const response = await axios.get(`${apiConfig.license}/verify`, {
        params: {
          licenseNumber,
          licenseType,
          includeHistory: true
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'HomeFlip-Pro/1.0',
          'Accept': 'application/json'
        }
      });

      const licenseData = {
        number: licenseNumber,
        type: licenseType,
        state: state,
        status: response.data.status,
        issueDate: response.data.issueDate,
        expirationDate: response.data.expirationDate,
        businessName: response.data.businessName,
        ownerName: response.data.ownerName,
        address: response.data.address,
        phone: response.data.phone,
        email: response.data.email,
        classifications: response.data.classifications,
        bondAmount: response.data.bondAmount,
        workersCompensation: response.data.workersCompensation,
        verified: true,
        verifiedAt: new Date().toISOString(),
        source: `State of ${state} Database`,
        sourceUrl: response.data.sourceUrl,
        lastChecked: new Date().toISOString()
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: licenseData,
        timestamp: Date.now()
      });

      return licenseData;
    } catch (error) {
      console.error(`License verification failed for ${licenseNumber} in ${state}:`, error.message);
      
      // Return partial data if available
      return {
        number: licenseNumber,
        type: licenseType,
        state: state,
        status: 'Unknown',
        verified: false,
        error: error.message,
        source: `State of ${state} Database`,
        lastChecked: new Date().toISOString()
      };
    }
  }

  /**
   * Verify contractor insurance
   */
  async verifyInsurance(contractorId, state) {
    try {
      const cacheKey = `insurance_${state}_${contractorId}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 12 * 60 * 60 * 1000) { // 12 hours
          return cached.data;
        }
      }

      // Rate limiting
      await this.checkRateLimit(state, 'insurance');

      const apiConfig = this.stateAPIs[state];
      const response = await axios.get(`${apiConfig.insurance}/verify`, {
        params: {
          contractorId,
          includeHistory: true
        },
        timeout: 10000
      });

      const insuranceData = {
        contractorId,
        policies: response.data.policies.map(policy => ({
          type: policy.type,
          carrier: policy.carrier,
          policyNumber: policy.policyNumber,
          coverageAmount: policy.coverageAmount,
          effectiveDate: policy.effectiveDate,
          expirationDate: policy.expirationDate,
          status: policy.status,
          verified: true,
          source: `State of ${state} Insurance Database`,
          lastChecked: new Date().toISOString()
        })),
        verified: true,
        verifiedAt: new Date().toISOString()
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: insuranceData,
        timestamp: Date.now()
      });

      return insuranceData;
    } catch (error) {
      console.error(`Insurance verification failed for contractor ${contractorId} in ${state}:`, error.message);
      
      return {
        contractorId,
        policies: [],
        verified: false,
        error: error.message,
        source: `State of ${state} Insurance Database`,
        lastChecked: new Date().toISOString()
      };
    }
  }

  /**
   * Check for legal events (lawsuits, violations, etc.)
   */
  async checkLegalEvents(contractorId, state) {
    try {
      const cacheKey = `legal_${state}_${contractorId}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 7 * 24 * 60 * 60 * 1000) { // 7 days
          return cached.data;
        }
      }

      // Rate limiting
      await this.checkRateLimit(state, 'legal');

      const apiConfig = this.stateAPIs[state];
      const response = await axios.get(`${apiConfig.legal}/search`, {
        params: {
          contractorId,
          includeResolved: true,
          dateRange: '5years'
        },
        timeout: 10000
      });

      const legalEvents = response.data.events.map(event => ({
        type: event.type,
        severity: this.categorizeSeverity(event.type, event.description),
        date: event.date,
        status: event.status,
        description: event.description,
        caseNumber: event.caseNumber,
        court: event.court,
        outcome: event.outcome,
        source: `State of ${state} Legal Database`,
        sourceUrl: event.sourceUrl,
        lastChecked: new Date().toISOString()
      }));

      const legalData = {
        contractorId,
        events: legalEvents,
        totalEvents: legalEvents.length,
        criticalEvents: legalEvents.filter(e => e.severity === 'Critical').length,
        majorEvents: legalEvents.filter(e => e.severity === 'Major').length,
        minorEvents: legalEvents.filter(e => e.severity === 'Minor').length,
        lastChecked: new Date().toISOString()
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: legalData,
        timestamp: Date.now()
      });

      return legalData;
    } catch (error) {
      console.error(`Legal events check failed for contractor ${contractorId} in ${state}:`, error.message);
      
      return {
        contractorId,
        events: [],
        totalEvents: 0,
        criticalEvents: 0,
        majorEvents: 0,
        minorEvents: 0,
        error: error.message,
        source: `State of ${state} Legal Database`,
        lastChecked: new Date().toISOString()
      };
    }
  }

  /**
   * Get permit history for contractor
   */
  async getPermitHistory(contractorId, state, city) {
    try {
      const cacheKey = `permits_${state}_${city}_${contractorId}`;
      
      // Check cache first
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) { // 24 hours
          return cached.data;
        }
      }

      // Rate limiting
      await this.checkRateLimit(state, 'permits');

      // City-specific permit APIs
      const cityAPIs = {
        'Austin': 'https://api.austintexas.gov/permits',
        'Dallas': 'https://api.dallas.gov/permits',
        'Houston': 'https://api.houstontx.gov/permits',
        'San Antonio': 'https://api.sanantonio.gov/permits',
        'Los Angeles': 'https://api.lacity.org/permits',
        'San Francisco': 'https://api.sfgov.org/permits',
        'Miami': 'https://api.miamigov.com/permits',
        'New York': 'https://api.nyc.gov/permits'
      };

      const cityAPI = cityAPIs[city];
      if (!cityAPI) {
        throw new Error(`City ${city} not supported`);
      }

      const response = await axios.get(`${cityAPI}/contractor`, {
        params: {
          contractorId,
          dateRange: '2years',
          includeInspections: true
        },
        timeout: 15000
      });

      const permits = response.data.permits.map(permit => ({
        id: permit.id,
        number: permit.number,
        type: permit.type,
        status: permit.status,
        filedDate: permit.filedDate,
        issuedDate: permit.issuedDate,
        finaledDate: permit.finaledDate,
        daysOpen: permit.daysOpen,
        projectAddress: permit.projectAddress,
        projectValue: permit.projectValue,
        inspections: permit.inspections.map(inspection => ({
          type: inspection.type,
          date: inspection.date,
          outcome: inspection.outcome,
          inspector: inspection.inspector,
          notes: inspection.notes
        })),
        source: `${city} Building Department`,
        sourceUrl: permit.sourceUrl,
        lastChecked: new Date().toISOString()
      }));

      const permitData = {
        contractorId,
        city,
        state,
        permits,
        totalPermits: permits.length,
        completedPermits: permits.filter(p => p.status === 'Finaled').length,
        avgDaysOpen: permits.reduce((sum, p) => sum + p.daysOpen, 0) / permits.length || 0,
        passRate: permits.reduce((sum, p) => {
          const inspections = p.inspections || [];
          const passed = inspections.filter(i => i.outcome === 'Pass').length;
          return sum + (inspections.length > 0 ? passed / inspections.length : 1);
        }, 0) / permits.length || 0,
        lastChecked: new Date().toISOString()
      };

      // Cache the result
      this.cache.set(cacheKey, {
        data: permitData,
        timestamp: Date.now()
      });

      return permitData;
    } catch (error) {
      console.error(`Permit history check failed for contractor ${contractorId} in ${city}, ${state}:`, error.message);
      
      return {
        contractorId,
        city,
        state,
        permits: [],
        totalPermits: 0,
        completedPermits: 0,
        avgDaysOpen: 0,
        passRate: 0,
        error: error.message,
        source: `${city} Building Department`,
        lastChecked: new Date().toISOString()
      };
    }
  }

  /**
   * Comprehensive contractor verification
   */
  async verifyContractor(contractorData) {
    const { id, name, company, state, city, licenseNumber, licenseType } = contractorData;
    
    try {
      console.log(`Starting comprehensive verification for contractor ${name} (${id})`);
      
      // Run all verification checks in parallel
      const [licenseResult, insuranceResult, legalResult, permitResult] = await Promise.allSettled([
        this.verifyLicense(licenseNumber, state, licenseType),
        this.verifyInsurance(id, state),
        this.checkLegalEvents(id, state),
        this.getPermitHistory(id, state, city)
      ]);

      const verification = {
        contractorId: id,
        verifiedAt: new Date().toISOString(),
        license: licenseResult.status === 'fulfilled' ? licenseResult.value : { error: licenseResult.reason?.message },
        insurance: insuranceResult.status === 'fulfilled' ? insuranceResult.value : { error: insuranceResult.reason?.message },
        legal: legalResult.status === 'fulfilled' ? legalResult.value : { error: legalResult.reason?.message },
        permits: permitResult.status === 'fulfilled' ? permitResult.value : { error: permitResult.reason?.message },
        overallVerified: licenseResult.status === 'fulfilled' && 
                        insuranceResult.status === 'fulfilled' && 
                        legalResult.status === 'fulfilled' && 
                        permitResult.status === 'fulfilled'
      };

      console.log(`Verification completed for contractor ${name}: ${verification.overallVerified ? 'SUCCESS' : 'PARTIAL'}`);
      
      return verification;
    } catch (error) {
      console.error(`Comprehensive verification failed for contractor ${id}:`, error.message);
      throw error;
    }
  }

  /**
   * Categorize legal event severity
   */
  categorizeSeverity(type, description) {
    const criticalKeywords = ['felony', 'fraud', 'theft', 'embezzlement', 'criminal'];
    const majorKeywords = ['lawsuit', 'breach', 'negligence', 'violation', 'penalty'];
    const minorKeywords = ['warning', 'citation', 'notice', 'minor'];

    const text = `${type} ${description}`.toLowerCase();
    
    if (criticalKeywords.some(keyword => text.includes(keyword))) {
      return 'Critical';
    } else if (majorKeywords.some(keyword => text.includes(keyword))) {
      return 'Major';
    } else if (minorKeywords.some(keyword => text.includes(keyword))) {
      return 'Minor';
    } else {
      return 'Info';
    }
  }

  /**
   * Rate limiting to respect API limits
   */
  async checkRateLimit(state, apiType) {
    const key = `${state}_${apiType}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const maxRequests = 60; // 60 requests per minute

    if (!this.rateLimits.has(key)) {
      this.rateLimits.set(key, []);
    }

    const requests = this.rateLimits.get(key);
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs);
    this.rateLimits.set(key, validRequests);

    if (validRequests.length >= maxRequests) {
      const oldestRequest = Math.min(...validRequests);
      const waitTime = windowMs - (now - oldestRequest);
      console.log(`Rate limit reached for ${state} ${apiType}. Waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Add current request
    validRequests.push(now);
    this.rateLimits.set(key, validRequests);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    console.log('Contractor verification cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      oldestEntry: Math.min(...Array.from(this.cache.values()).map(v => v.timestamp)),
      newestEntry: Math.max(...Array.from(this.cache.values()).map(v => v.timestamp))
    };
  }
}

module.exports = ContractorVerificationService;
