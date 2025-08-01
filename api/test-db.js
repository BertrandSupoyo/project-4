import { PrismaClient } from '../prisma/app/generated/prisma-client/index.js'
import { withAccelerate } from '@prisma/extension-accelerate'

let prisma;

async function initPrisma() {
  if (!prisma) {
    console.log('🔧 Initializing Prisma Client...');
    console.log('📊 Environment:', process.env.NODE_ENV);
    console.log('🔗 Database URL exists:', !!process.env.DATABASE_URL);
    
    try {
      prisma = new PrismaClient().$extends(withAccelerate());
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }
  return prisma;
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log('🔍 Testing database connection...');
    
    const db = await initPrisma();
    
    // Test basic query
    const testQuery = await db.$queryRaw`SELECT 1 as test`;
    console.log('✅ Basic query successful:', testQuery);
    
    // Check tables
    const tables = await db.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📋 Available tables:', tables);
    
    // Check admin_users table specifically
    const adminUsersExists = await db.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_users'
      ) as exists
    `;
    console.log('👥 Admin users table exists:', adminUsersExists[0]?.exists);
    
    // If admin_users exists, try to query it
    if (adminUsersExists[0]?.exists) {
      try {
        const adminUsers = await db.$queryRaw`SELECT COUNT(*) as count FROM admin_users`;
        console.log('👥 Admin users count:', adminUsers[0]?.count);
        
        const sampleUsers = await db.$queryRaw`SELECT id, username, role FROM admin_users LIMIT 5`;
        console.log('👥 Sample users:', sampleUsers);
      } catch (queryError) {
        console.error('❌ Error querying admin_users:', queryError);
      }
    }
    
    res.json({
      success: true,
      message: 'Database test completed',
      data: {
        environment: process.env.NODE_ENV,
        databaseUrlExists: !!process.env.DATABASE_URL,
        basicQuery: testQuery,
        tables: tables.map(t => t.table_name),
        adminUsersExists: adminUsersExists[0]?.exists
      }
    });
  } catch (err) {
    console.error('💥 Database test error:', err);
    res.status(500).json({
      success: false,
      error: 'Database test failed',
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
} 