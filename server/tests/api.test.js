const request = require('supertest');
const app = require('../index');
const prisma = require('../prisma');

describe('HomeFlip API Tests', () => {
  let authToken;
  let testUserId;
  let testPropertyId;
  let testContractorId;

  beforeAll(async () => {
    // Clean up test data
    await prisma.contractorReview.deleteMany();
    await prisma.permit.deleteMany();
    await prisma.project.deleteMany();
    await prisma.contractor.deleteMany();
    await prisma.property.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.contractorReview.deleteMany();
    await prisma.permit.deleteMany();
    await prisma.project.deleteMany();
    await prisma.contractor.deleteMany();
    await prisma.property.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('Health Endpoints', () => {
    test('GET /api/health/health should return healthy status', async () => {
      const response = await request(app)
        .get('/api/health/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.timestamp).toBeDefined();
      expect(response.body.uptime).toBeDefined();
    });

    test('GET /api/health/ready should return ready status', async () => {
      const response = await request(app)
        .get('/api/health/ready')
        .expect(200);

      expect(response.body.status).toBe('ready');
      expect(response.body.checks.database).toBe('ok');
    });

    test('GET /api/health/version should return version info', async () => {
      const response = await request(app)
        .get('/api/health/version')
        .expect(200);

      expect(response.body.version).toBeDefined();
      expect(response.body.nodeVersion).toBeDefined();
    });
  });

  describe('Authentication', () => {
    test('POST /api/auth/register should create new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'TestPassword123',
        company: 'Test Company'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);

      authToken = response.body.token;
      testUserId = response.body.user.id;
    });

    test('POST /api/auth/login should authenticate user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'TestPassword123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe(loginData.email);
    });

    test('GET /api/auth/me should return current user', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.email).toBe('test@example.com');
      expect(response.body.name).toBe('Test User');
    });
  });

  describe('Properties', () => {
    test('POST /api/properties should create property', async () => {
      const propertyData = {
        street: '123 Test St',
        city: 'Test City',
        state: 'TX',
        zipCode: '12345',
        propertyType: 'SINGLE_FAMILY',
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1500,
        purchasePrice: 200000,
        estimatedARV: 250000
      };

      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(propertyData)
        .expect(201);

      expect(response.body.street).toBe(propertyData.street);
      expect(response.body.city).toBe(propertyData.city);
      expect(response.body.propertyType).toBe(propertyData.propertyType);

      testPropertyId = response.body.id;
    });

    test('GET /api/properties should return paginated properties', async () => {
      const response = await request(app)
        .get('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.pageSize).toBe(20);
    });

    test('GET /api/properties/:id should return specific property', async () => {
      const response = await request(app)
        .get(`/api/properties/${testPropertyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(testPropertyId);
      expect(response.body.street).toBe('123 Test St');
    });

    test('PUT /api/properties/:id should update property', async () => {
      const updateData = {
        bedrooms: 4,
        bathrooms: 3,
        estimatedARV: 275000
      };

      const response = await request(app)
        .put(`/api/properties/${testPropertyId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.bedrooms).toBe(4);
      expect(response.body.bathrooms).toBe(3);
      expect(response.body.estimatedARV).toBe(275000);
    });
  });

  describe('Contractors', () => {
    test('POST /api/contractors should create contractor', async () => {
      const contractorData = {
        name: 'Test Contractor',
        companyName: 'Test Construction Co',
        phone: '555-123-4567',
        email: 'contractor@test.com',
        trades: ['GENERAL', 'PLUMBING'],
        yearsInBusiness: 5,
        totalProjects: 50,
        totalValue: 2500000
      };

      const response = await request(app)
        .post('/api/contractors')
        .set('Authorization', `Bearer ${authToken}`)
        .send(contractorData)
        .expect(201);

      expect(response.body.name).toBe(contractorData.name);
      expect(response.body.companyName).toBe(contractorData.companyName);
      expect(response.body.trades).toEqual(contractorData.trades);

      testContractorId = response.body.id;
    });

    test('GET /api/contractors should return paginated contractors', async () => {
      const response = await request(app)
        .get('/api/contractors')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    test('GET /api/contractors/:id should return contractor details', async () => {
      const response = await request(app)
        .get(`/api/contractors/${testContractorId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.id).toBe(testContractorId);
      expect(response.body.name).toBe('Test Contractor');
      expect(response.body.overallScore).toBeDefined();
      expect(response.body.overallGrade).toBeDefined();
    });

    test('POST /api/contractors/:id/licenses should add license', async () => {
      const licenseData = {
        number: 'TEX123456',
        state: 'TX',
        boardName: 'Texas Department of Licensing and Regulation',
        status: 'ACTIVE',
        expiresOn: '2025-12-31T23:59:59Z'
      };

      const response = await request(app)
        .post(`/api/contractors/${testContractorId}/licenses`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(licenseData)
        .expect(201);

      expect(response.body.number).toBe(licenseData.number);
      expect(response.body.state).toBe(licenseData.state);
      expect(response.body.status).toBe(licenseData.status);
    });
  });

  describe('Error Handling', () => {
    test('Should return 401 for unauthenticated requests', async () => {
      const response = await request(app)
        .get('/api/properties')
        .expect(401);

      expect(response.body.error.code).toBe('UNAUTHENTICATED');
      expect(response.body.error.message).toBe('Authentication required');
    });

    test('Should return 404 for non-existent resources', async () => {
      const response = await request(app)
        .get('/api/properties/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    test('Should return 400 for validation errors', async () => {
      const invalidData = {
        street: '', // Required field missing
        city: 'Test City',
        state: 'INVALID_STATE' // Invalid enum value
      };

      const response = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    test('Should enforce rate limits on auth endpoints', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      // Make multiple failed login attempts
      for (let i = 0; i < 6; i++) {
        await request(app)
          .post('/api/auth/login')
          .send(loginData);
      }

      // Should be rate limited
      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(429);

      expect(response.body.error.code).toBe('RATE_LIMIT_EXCEEDED');
    });
  });

  describe('Idempotency', () => {
    test('Should handle idempotency keys for POST requests', async () => {
      const idempotencyKey = 'test-idempotency-key-123';
      const propertyData = {
        street: '456 Idempotent St',
        city: 'Test City',
        state: 'TX',
        zipCode: '12345',
        propertyType: 'SINGLE_FAMILY'
      };

      // First request
      const response1 = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send(propertyData)
        .expect(201);

      // Second request with same key should return same response
      const response2 = await request(app)
        .post('/api/properties')
        .set('Authorization', `Bearer ${authToken}`)
        .set('Idempotency-Key', idempotencyKey)
        .send(propertyData)
        .expect(201);

      expect(response1.body.id).toBe(response2.body.id);
    });
  });

  describe('Pagination', () => {
    test('Should return proper pagination metadata', async () => {
      const response = await request(app)
        .get('/api/properties?page=1&pageSize=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.pagination).toEqual({
        page: 1,
        pageSize: 10,
        total: expect.any(Number),
        totalPages: expect.any(Number),
        hasNext: expect.any(Boolean),
        hasPrev: expect.any(Boolean)
      });
    });
  });
});
