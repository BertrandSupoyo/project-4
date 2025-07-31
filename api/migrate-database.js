const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔄 Starting database migration...');

    // Test connection first
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection successful');

    // Run Prisma migrate
    try {
      execSync('npx prisma db push', { 
        stdio: 'pipe',
        env: { ...process.env }
      });
      console.log('✅ Database schema pushed successfully');
    } catch (migrationError) {
      console.error('Migration error:', migrationError);
      return res.status(500).json({
        success: false,
        error: 'Database migration failed',
        details: migrationError.message
      });
    }

    // Setup initial data
    const { setupDatabase } = require('../../setup-database');
    await setupDatabase();

    res.status(200).json({
      success: true,
      message: 'Database migration and setup completed successfully'
    });
  } catch (error) {
    console.error('Migration API error:', error);
    res.status(500).json({
      success: false,
      error: 'Database migration failed',
      details: error.message
    });
  }
}; 