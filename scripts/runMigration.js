import { execSync } from 'child_process';
import { PrismaClient } from '../prisma/app/generated/prisma-client/index.js';

// Set DATABASE_URL for PostgreSQL
process.env.DATABASE_URL = 'postgresql://username:password@localhost:5432/substation_monitoring';

async function runMigration() {
  try {
    console.log('🔧 Running Prisma migration...');
    console.log('📊 Environment:', process.env.NODE_ENV);
    console.log('🔗 Database URL:', process.env.DATABASE_URL);
    
    // Run Prisma migration
    console.log('📦 Running: npx prisma migrate dev');
    execSync('npx prisma migrate dev --name init', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('✅ Migration completed successfully');
    
    // Test database connection
    console.log('🔍 Testing database connection...');
    const prisma = new PrismaClient();
    await prisma.$connect();
    
    // Test query
    const testQuery = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Test query successful:', testQuery);
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    console.log('📋 Tables created:', tables);
    
    await prisma.$disconnect();
    console.log('✅ Database setup completed successfully');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    
    if (error.message.includes('P1001')) {
      console.log('\n💡 Database connection failed. Please check:');
      console.log('1. PostgreSQL is running');
      console.log('2. Database "substation_monitoring" exists');
      console.log('3. Username and password are correct');
      console.log('4. Update DATABASE_URL in the script with correct credentials');
    }
  }
}

runMigration();