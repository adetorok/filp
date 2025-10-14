const prisma = require('./prisma');
const bcrypt = require('bcryptjs');

async function main() {
  console.log('🌱 Starting simple database seed...');

  try {
    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    // Create admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@homeflip.com' },
      update: {},
      create: {
        name: 'Admin User',
        email: 'admin@homeflip.com',
        password: hashedPassword,
        role: 'ADMIN',
        company: 'HomeFlip Inc',
        phone: '+1-555-0100'
      }
    });

    // Create regular user
    const regularUser = await prisma.user.upsert({
      where: { email: 'john@homeflip.com' },
      update: {},
      create: {
        name: 'John Smith',
        email: 'john@homeflip.com',
        password: hashedPassword,
        role: 'USER',
        company: 'Smith Investments',
        phone: '+1-555-0101'
      }
    });

    // Create contractor user
    const contractorUser = await prisma.user.upsert({
      where: { email: 'mike@contractor.com' },
      update: {},
      create: {
        name: 'Mike Johnson',
        email: 'mike@contractor.com',
        password: hashedPassword,
        role: 'CONTRACTOR',
        company: 'Johnson Construction',
        phone: '+1-555-0102'
      }
    });

    console.log('\n🔑 Test Credentials:');
    console.log('Admin: admin@homeflip.com / password123');
    console.log('User: john@homeflip.com / password123');
    console.log('Contractor: mike@contractor.com / password123');
    console.log('\n✅ Seed completed successfully!');

  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
