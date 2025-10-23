import { PrismaClient } from '../prisma/app/generated/prisma-client/index.js';
import crypto from 'crypto';

// Set DATABASE_URL for PostgreSQL
process.env.DATABASE_URL = 'postgresql://username:password@localhost:5432/substation_monitoring';

const prisma = new PrismaClient();

async function setupPostgreSQL() {
  try {
    console.log('🔧 Setting up PostgreSQL database...');
    console.log('📊 Environment:', process.env.NODE_ENV);
    console.log('🔗 Database URL:', process.env.DATABASE_URL);
    
    // Connect to database
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test query
    const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Test query successful:', testQuery);
    
    // Check if admin_users table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_users'
      ) as exists
    `;
    console.log('📋 Admin users table exists:', tableExists[0]?.exists);
    
    if (tableExists[0]?.exists) {
      // Create admin user
      console.log('👤 Creating admin user...');
      const adminPassword = 'admin123';
      const adminPasswordHash = crypto.createHash('sha256').update(adminPassword).digest('hex');
      
      const admin = await prisma.adminUser.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
          username: 'admin',
          password_hash: adminPasswordHash,
          name: 'Administrator',
          role: 'admin'
        }
      });
      console.log('✅ Admin user created:', admin.username);

      // Create petugas user
      console.log('👤 Creating petugas user...');
      const petugasPassword = 'petugas123';
      const petugasPasswordHash = crypto.createHash('sha256').update(petugasPassword).digest('hex');
      
      const petugas = await prisma.adminUser.upsert({
        where: { username: 'petugas' },
        update: {},
        create: {
          username: 'petugas',
          password_hash: petugasPasswordHash,
          name: 'Petugas Lapangan',
          role: 'petugas'
        }
      });
      console.log('✅ Petugas user created:', petugas.username);

      // Create viewer user
      console.log('👤 Creating viewer user...');
      const viewerPassword = 'viewer123';
      const viewerPasswordHash = crypto.createHash('sha256').update(viewerPassword).digest('hex');
      
      const viewer = await prisma.adminUser.upsert({
        where: { username: 'viewer' },
        update: {},
        create: {
          username: 'viewer',
          password_hash: viewerPasswordHash,
          name: 'Viewer',
          role: 'viewer'
        }
      });
      console.log('✅ Viewer user created:', viewer.username);

      console.log('\n📋 Login credentials:');
      console.log('Admin: username=admin, password=admin123');
      console.log('Petugas: username=petugas, password=petugas123');
      console.log('Viewer: username=viewer, password=viewer123');
    } else {
      console.log('❌ Admin users table does not exist. Please run Prisma migration first.');
      console.log('Run: npx prisma migrate dev');
    }

  } catch (error) {
    console.error('❌ Setup failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    
    if (error.code === 'P1001') {
      console.log('\n💡 Database connection failed. Please check:');
      console.log('1. PostgreSQL is running');
      console.log('2. Database "substation_monitoring" exists');
      console.log('3. Username and password are correct');
      console.log('4. Update DATABASE_URL in the script with correct credentials');
    }
  } finally {
    await prisma.$disconnect();
  }
}

setupPostgreSQL();
