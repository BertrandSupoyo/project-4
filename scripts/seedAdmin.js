const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

async function seedAdminUsers() {
  try {
    console.log('🌱 Seeding admin users...');
    
    // Default admin users
    const adminUsers = [
      {
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      },
      {
        username: 'superadmin',
        password: 'superadmin123',
        role: 'admin'
      }
    ];
    
    for (const userData of adminUsers) {
      try {
        // Hash password
        const passwordHash = crypto.createHash('sha256').update(userData.password).digest('hex');
        
        // Check if user exists
        const existingUser = await prisma.adminUser.findUnique({
          where: { username: userData.username }
        });
        
        if (existingUser) {
          console.log(`⚠️  User ${userData.username} already exists, skipping...`);
          continue;
        }
        
        // Create user
        const user = await prisma.adminUser.create({
          data: {
            username: userData.username,
            password_hash: passwordHash,
            role: userData.role
          }
        });
        
        console.log(`✅ Created admin user: ${user.username}`);
      } catch (error) {
        console.error(`❌ Error creating user ${userData.username}:`, error);
      }
    }
    
    console.log('✅ Admin seeding completed!');
    
    // List all admin users
    const allUsers = await prisma.adminUser.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        created_at: true
      }
    });
    
    console.log('\n📋 All admin users:');
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.role}) - Created: ${user.created_at}`);
    });
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedAdminUsers(); 