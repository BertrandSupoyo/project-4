import { PrismaClient } from '../prisma/app/generated/prisma-client/index.js';
import { withAccelerate } from '@prisma/extension-accelerate';

const prisma = new PrismaClient().$extends(withAccelerate());

async function testDatabase() {
  try {
    console.log('🔧 Testing database connection...');
    console.log('📊 Environment:', process.env.NODE_ENV);
    console.log('🔗 Database URL exists:', !!process.env.DATABASE_URL);
    
    // Test connection
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
      // Try to query admin_users table
      const users = await prisma.adminUser.findMany();
      console.log('👥 Found users:', users.length);
      console.log('👥 Users:', users);
    } else {
      console.log('❌ Admin users table does not exist');
    }
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code,
      stack: error.stack
    });
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
