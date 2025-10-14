/**
 * Comprehensive Seed Script for HomeFlip Application
 * 
 * Creates a complete test environment with:
 * - Organization with users
 * - Properties and deals
 * - Contractors with verification data
 * - Permits and work specializations
 * - Sample data for all features
 */

const prisma = require('./prisma');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (in reverse order of dependencies)
  await prisma.auditLog.deleteMany();
  await prisma.webhookDelivery.deleteMany();
  await prisma.webhookEndpoint.deleteMany();
  await prisma.fileAsset.deleteMany();
  await prisma.organizationMember.deleteMany();
  await prisma.organization.deleteMany();
  await prisma.contractorReview.deleteMany();
  await prisma.permitInspection.deleteMany();
  await prisma.permit.deleteMany();
  await prisma.contractorWorkSpecialization.deleteMany();
  await prisma.insurancePermitCorrelation.deleteMany();
  await prisma.contractorAreaScore.deleteMany();
  await prisma.contractorLicense.deleteMany();
  await prisma.insurancePolicy.deleteMany();
  await prisma.legalEvent.deleteMany();
  await prisma.contractorContact.deleteMany();
  await prisma.contractor.deleteMany();
  await prisma.area.deleteMany();
  await prisma.rentalTask.deleteMany();
  await prisma.rentalExpense.deleteMany();
  await prisma.rentalIncome.deleteMany();
  await prisma.tenant.deleteMany();
  await prisma.rentalProperty.deleteMany();
  await prisma.task.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.property.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing data');

  // Create organization
  const organization = await prisma.organization.create({
    data: {
      name: 'HomeFlip Demo Organization',
      slug: 'homeflip-demo',
      domain: 'demo.homeflip.com',
      settings: {
        timezone: 'America/New_York',
        currency: 'USD',
        features: {
          contractorVerification: true,
          permitTracking: true,
          rentalManagement: true
        }
      }
    }
  });

  console.log('🏢 Created organization');

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const adminUser = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@homeflip.com',
      password: hashedPassword,
      role: 'ADMIN',
      company: 'HomeFlip Inc',
      phone: '+1-555-0100'
    }
  });

  const regularUser = await prisma.user.create({
    data: {
      name: 'John Investor',
      email: 'john@homeflip.com',
      password: hashedPassword,
      role: 'USER',
      company: 'Investor LLC',
      phone: '+1-555-0101'
    }
  });

  const contractorUser = await prisma.user.create({
    data: {
      name: 'Mike Contractor',
      email: 'mike@contractor.com',
      password: hashedPassword,
      role: 'CONTRACTOR',
      company: 'Mike\'s Construction',
      phone: '+1-555-0102'
    }
  });

  // Create organization members
  await prisma.organizationMember.createMany({
    data: [
      {
        organizationId: organization.id,
        userId: adminUser.id,
        role: 'OWNER'
      },
      {
        organizationId: organization.id,
        userId: regularUser.id,
        role: 'ADMIN'
      },
      {
        organizationId: organization.id,
        userId: contractorUser.id,
        role: 'MEMBER'
      }
    ]
  });

  console.log('👥 Created users and organization members');

  // Create areas
  const areas = await prisma.area.createMany({
    data: [
      {
        type: 'CITY',
        name: 'Austin',
        state: 'TX',
        code: '78701',
        population: 978908
      },
      {
        type: 'ZIP',
        name: '78701',
        state: 'TX',
        code: '78701',
        population: 5000
      },
      {
        type: 'COUNTY',
        name: 'Travis County',
        state: 'TX',
        code: '48453',
        population: 1290000
      }
    ]
  });

  const austinArea = await prisma.area.findFirst({
    where: { name: 'Austin', type: 'CITY' }
  });

  console.log('📍 Created areas');

  // Create contractors with verification data
  const contractor1 = await prisma.contractor.create({
    data: {
      name: 'Mike Johnson',
      companyName: 'Johnson Construction LLC',
      phone: '+1-555-0200',
      email: 'mike@johnsonconstruction.com',
      website: 'https://johnsonconstruction.com',
      address1: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
      trades: ['GENERAL', 'ROOFING', 'ELECTRICAL'],
      yearsInBusiness: 8,
      totalProjects: 45,
      totalValue: 2500000,
      businessStartDate: new Date('2016-01-15')
    }
  });

  const contractor2 = await prisma.contractor.create({
    data: {
      name: 'Sarah Martinez',
      companyName: 'Martinez Renovations',
      phone: '+1-555-0201',
      email: 'sarah@martinezreno.com',
      website: 'https://martinezreno.com',
      address1: '456 Oak Ave',
      city: 'Austin',
      state: 'TX',
      zip: '78702',
      trades: ['GENERAL', 'PLUMBING', 'HVAC'],
      yearsInBusiness: 12,
      totalProjects: 78,
      totalValue: 4200000,
      businessStartDate: new Date('2012-03-10')
    }
  });

  // Add licenses
  await prisma.contractorLicense.createMany({
    data: [
      {
        contractorId: contractor1.id,
        number: 'TX123456',
        state: 'TX',
        boardName: 'Texas Department of Licensing and Regulation',
        status: 'ACTIVE',
        adminVerified: true,
        verifiedAt: new Date(),
        expiresOn: new Date('2025-12-31'),
        sourceUrl: 'https://www.tdlr.texas.gov/'
      },
      {
        contractorId: contractor2.id,
        number: 'TX789012',
        state: 'TX',
        boardName: 'Texas Department of Licensing and Regulation',
        status: 'ACTIVE',
        adminVerified: true,
        verifiedAt: new Date(),
        expiresOn: new Date('2026-06-30'),
        sourceUrl: 'https://www.tdlr.texas.gov/'
      }
    ]
  });

  // Add insurance policies
  await prisma.insurancePolicy.createMany({
    data: [
      {
        contractorId: contractor1.id,
        type: 'GL',
        insurerName: 'State Farm Insurance',
        policyNumber: 'SF-GL-123456',
        coverageEachOccur: 2000000,
        coverageAggregate: 4000000,
        expiresOn: new Date('2025-03-15'),
        brokerName: 'Austin Insurance Brokers',
        brokerEmail: 'broker@austininsurance.com',
        brokerPhone: '+1-555-0300'
      },
      {
        contractorId: contractor2.id,
        type: 'GL',
        insurerName: 'Allstate Insurance',
        policyNumber: 'ALL-GL-789012',
        coverageEachOccur: 1500000,
        coverageAggregate: 3000000,
        expiresOn: new Date('2025-08-20'),
        brokerName: 'Central Texas Insurance',
        brokerEmail: 'info@centraltexasinsurance.com',
        brokerPhone: '+1-555-0301'
      }
    ]
  });

  console.log('🏗️ Created contractors with verification data');

  // Create properties
  const property1 = await prisma.property.create({
    data: {
      organizationId: organization.id,
      userId: regularUser.id,
      street: '123 Elm Street',
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      fullAddress: '123 Elm Street, Austin, TX 78701',
      propertyType: 'SINGLE_FAMILY',
      bedrooms: 3,
      bathrooms: 2,
      squareFeet: 1800,
      lotSize: 0.25,
      yearBuilt: 1995,
      condition: 'FAIR',
      purchasePrice: 250000,
      estimatedRepairCosts: 45000,
      estimatedARV: 350000,
      estimatedProfit: 55000,
      estimatedROI: 18.3,
      estimatedTimeline: 4,
      status: 'ANALYZING',
      notes: 'Great potential flip property in downtown Austin',
      images: ['property1-exterior.jpg', 'property1-interior.jpg']
    }
  });

  const property2 = await prisma.property.create({
    data: {
      organizationId: organization.id,
      userId: regularUser.id,
      street: '456 Oak Avenue',
      city: 'Austin',
      state: 'TX',
      zipCode: '78702',
      fullAddress: '456 Oak Avenue, Austin, TX 78702',
      propertyType: 'SINGLE_FAMILY',
      bedrooms: 4,
      bathrooms: 3,
      squareFeet: 2200,
      lotSize: 0.3,
      yearBuilt: 1988,
      condition: 'POOR',
      purchasePrice: 180000,
      estimatedRepairCosts: 75000,
      estimatedARV: 320000,
      estimatedProfit: 65000,
      estimatedROI: 25.5,
      estimatedTimeline: 6,
      status: 'IN_PROGRESS',
      notes: 'Needs major renovation but excellent location',
      images: ['property2-exterior.jpg', 'property2-interior.jpg']
    }
  });

  console.log('🏠 Created properties');

  // Create deals
  const deal1 = await prisma.deal.create({
    data: {
      organizationId: organization.id,
      userId: regularUser.id,
      propertyId: property1.id,
      title: 'Elm Street Flip',
      offerPrice: 250000,
      closingCosts: 7500,
      holdingCosts: 3000,
      repairCosts: 45000,
      sellingCosts: 17500,
      totalInvestment: 320000,
      estimatedARV: 350000,
      estimatedProfit: 30000,
      estimatedROI: 9.4,
      status: 'ANALYZING',
      notes: 'Conservative estimates, good neighborhood'
    }
  });

  const deal2 = await prisma.deal.create({
    data: {
      organizationId: organization.id,
      userId: regularUser.id,
      propertyId: property2.id,
      title: 'Oak Avenue Renovation',
      offerPrice: 180000,
      closingCosts: 5400,
      holdingCosts: 4500,
      repairCosts: 75000,
      sellingCosts: 16000,
      totalInvestment: 280900,
      estimatedARV: 320000,
      estimatedProfit: 39100,
      estimatedROI: 13.9,
      status: 'ACTIVE',
      notes: 'Higher risk but higher reward potential'
    }
  });

  console.log('💰 Created deals');

  // Create tasks
  await prisma.task.createMany({
    data: [
      {
        organizationId: organization.id,
        userId: regularUser.id,
        propertyId: property1.id,
        dealId: deal1.id,
        title: 'Kitchen Renovation',
        description: 'Complete kitchen remodel with new cabinets, countertops, and appliances',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: new Date('2024-02-15'),
        estimatedHours: 40
      },
      {
        organizationId: organization.id,
        userId: regularUser.id,
        propertyId: property1.id,
        dealId: deal1.id,
        title: 'Bathroom Update',
        description: 'Update master bathroom with new fixtures and tile',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        dueDate: new Date('2024-02-20'),
        estimatedHours: 24
      },
      {
        organizationId: organization.id,
        userId: regularUser.id,
        propertyId: property2.id,
        dealId: deal2.id,
        title: 'Foundation Repair',
        description: 'Address foundation issues and level the house',
        priority: 'CRITICAL',
        status: 'PENDING',
        dueDate: new Date('2024-01-30'),
        estimatedHours: 60
      }
    ]
  });

  console.log('📋 Created tasks');

  // Create expenses
  await prisma.expense.createMany({
    data: [
      {
        organizationId: organization.id,
        userId: regularUser.id,
        propertyId: property1.id,
        dealId: deal1.id,
        category: 'MATERIALS',
        description: 'Kitchen cabinets and countertops',
        amount: 8500,
        vendor: 'Home Depot',
        date: new Date('2024-01-15')
      },
      {
        organizationId: organization.id,
        userId: regularUser.id,
        propertyId: property1.id,
        dealId: deal1.id,
        category: 'LABOR',
        description: 'Kitchen installation labor',
        amount: 3200,
        vendor: 'Johnson Construction',
        date: new Date('2024-01-20')
      },
      {
        organizationId: organization.id,
        userId: regularUser.id,
        propertyId: property2.id,
        dealId: deal2.id,
        category: 'PERMITS',
        description: 'Building permits for renovation',
        amount: 1200,
        vendor: 'City of Austin',
        date: new Date('2024-01-10')
      }
    ]
  });

  console.log('💸 Created expenses');

  // Create permits
  const permit1 = await prisma.permit.create({
    data: {
      organizationId: organization.id,
      projectId: deal1.id,
      contractorId: contractor1.id,
      permitNumber: 'AUS-2024-001234',
      permitType: 'BUILDING',
      status: 'COMPLETED',
      description: 'Kitchen renovation permit',
      workDescription: 'Complete kitchen remodel including electrical and plumbing',
      propertyAddress: property1.fullAddress,
      city: 'Austin',
      state: 'TX',
      zipCode: '78701',
      requestedDate: new Date('2024-01-05'),
      approvedDate: new Date('2024-01-08'),
      issuedDate: new Date('2024-01-10'),
      completedDate: new Date('2024-02-15'),
      cost: 450,
      inspectorName: 'John Smith',
      publicUrl: 'https://austintexas.gov/permit/AUS-2024-001234'
    }
  });

  const permit2 = await prisma.permit.create({
    data: {
      organizationId: organization.id,
      projectId: deal2.id,
      contractorId: contractor2.id,
      permitNumber: 'AUS-2024-001235',
      permitType: 'BUILDING',
      status: 'IN_PROGRESS',
      description: 'Foundation repair permit',
      workDescription: 'Foundation repair and structural improvements',
      propertyAddress: property2.fullAddress,
      city: 'Austin',
      state: 'TX',
      zipCode: '78702',
      requestedDate: new Date('2024-01-12'),
      approvedDate: new Date('2024-01-15'),
      issuedDate: new Date('2024-01-17'),
      cost: 650,
      inspectorName: 'Jane Doe',
      publicUrl: 'https://austintexas.gov/permit/AUS-2024-001235'
    }
  });

  console.log('📋 Created permits');

  // Create work specializations
  await prisma.contractorWorkSpecialization.createMany({
    data: [
      {
        contractorId: contractor1.id,
        specialization: 'RESIDENTIAL_REMODEL',
        permitCount: 25,
        totalValue: 1500000,
        averageDuration: 45,
        successRate: 95.5,
        lastWorkDate: new Date('2024-01-15')
      },
      {
        contractorId: contractor1.id,
        specialization: 'ROOFING',
        permitCount: 15,
        totalValue: 800000,
        averageDuration: 7,
        successRate: 98.0,
        lastWorkDate: new Date('2024-01-10')
      },
      {
        contractorId: contractor2.id,
        specialization: 'RESIDENTIAL_REMODEL',
        permitCount: 35,
        totalValue: 2200000,
        averageDuration: 42,
        successRate: 97.2,
        lastWorkDate: new Date('2024-01-20')
      },
      {
        contractorId: contractor2.id,
        specialization: 'PLUMBING',
        permitCount: 20,
        totalValue: 600000,
        averageDuration: 12,
        successRate: 96.8,
        lastWorkDate: new Date('2024-01-18')
      }
    ]
  });

  console.log('🎯 Created work specializations');

  // Create contractor area scores
  await prisma.contractorAreaScore.createMany({
    data: [
      {
        contractorId: contractor1.id,
        areaId: austinArea.id,
        score: 87,
        grade: 'B',
        period: '2024-01',
        subscores: {
          reviews: 85,
          onTime: 90,
          budget: 88,
          safety: 92,
          communication: 89,
          risk: 95,
          insurance: 90,
          experience: 85
        }
      },
      {
        contractorId: contractor2.id,
        areaId: austinArea.id,
        score: 92,
        grade: 'A',
        period: '2024-01',
        subscores: {
          reviews: 94,
          onTime: 95,
          budget: 90,
          safety: 96,
          communication: 93,
          risk: 98,
          insurance: 88,
          experience: 92
        }
      }
    ]
  });

  console.log('📊 Created contractor area scores');

  // Create contractor reviews
  await prisma.contractorReview.createMany({
    data: [
      {
        contractorId: contractor1.id,
        projectId: deal1.id,
        customerId: regularUser.id,
        stars: 4,
        quality: 4,
        timeliness: 5,
        communication: 4,
        cleanliness: 4,
        safety: 5,
        comment: 'Great work on the kitchen renovation. Very professional and clean.',
        createdAt: new Date('2024-02-20')
      },
      {
        contractorId: contractor2.id,
        projectId: deal2.id,
        customerId: regularUser.id,
        stars: 5,
        quality: 5,
        timeliness: 5,
        communication: 5,
        cleanliness: 5,
        safety: 5,
        comment: 'Excellent foundation work. Sarah and her team were outstanding.',
        createdAt: new Date('2024-02-18')
      }
    ]
  });

  console.log('⭐ Created contractor reviews');

  // Create subscriptions
  await prisma.subscription.create({
    data: {
      organizationId: organization.id,
      userId: regularUser.id,
      plan: 'PRO',
      status: 'ACTIVE',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      price: 29.99,
      billingCycle: 'MONTHLY',
      autoRenew: true
    }
  });

  console.log('💳 Created subscription');

  // Create sample audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        organizationId: organization.id,
        actorId: regularUser.id,
        action: 'CREATE',
        targetType: 'Property',
        targetId: property1.id,
        meta: { propertyAddress: property1.fullAddress },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        organizationId: organization.id,
        actorId: regularUser.id,
        action: 'CREATE',
        targetType: 'Deal',
        targetId: deal1.id,
        meta: { dealTitle: deal1.title, estimatedProfit: deal1.estimatedProfit },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    ]
  });

  console.log('📝 Created audit logs');

  console.log('✅ Database seed completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Organization: ${organization.name}`);
  console.log(`- Users: 3 (Admin, User, Contractor)`);
  console.log(`- Properties: 2`);
  console.log(`- Deals: 2`);
  console.log(`- Contractors: 2 (with full verification data)`);
  console.log(`- Permits: 2`);
  console.log(`- Tasks: 3`);
  console.log(`- Expenses: 3`);
  console.log(`- Reviews: 2`);
  console.log(`- Work Specializations: 4`);
  console.log(`- Area Scores: 2`);
  console.log(`- Audit Logs: 2`);
  
  console.log('\n🔑 Test Credentials:');
  console.log('Admin: admin@homeflip.com / password123');
  console.log('User: john@homeflip.com / password123');
  console.log('Contractor: mike@contractor.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
