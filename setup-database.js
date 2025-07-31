const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupDatabase() {
  try {
    console.log('🔧 Setting up database...');

    // Test connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');

    // Create admin user if not exists
    const existingAdmin = await prisma.adminUser.findUnique({
      where: { username: 'admin' }
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await prisma.adminUser.create({
        data: {
          username: 'admin',
          password_hash: hashedPassword,
          role: 'admin'
        }
      });
      console.log('✅ Admin user created (username: admin, password: admin123)');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Create viewer user if not exists
    const existingViewer = await prisma.adminUser.findUnique({
      where: { username: 'viewer' }
    });

    if (!existingViewer) {
      const hashedPassword = await bcrypt.hash('viewer123', 10);
      await prisma.adminUser.create({
        data: {
          username: 'viewer',
          password_hash: hashedPassword,
          role: 'viewer'
        }
      });
      console.log('✅ Viewer user created (username: viewer, password: viewer123)');
    } else {
      console.log('ℹ️ Viewer user already exists');
    }

    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('Setup completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase }; 