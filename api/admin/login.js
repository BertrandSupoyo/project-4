import { PrismaClient } from '../../prisma/app/generated/prisma-client/index.js'
import { withAccelerate } from '@prisma/extension-accelerate'
import crypto from 'crypto'

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

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('🔍 Starting login process...');
    
    // Test database connection first
    const db = await initPrisma();
    
    // Test query
    const testQuery = await db.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database test query successful:', testQuery);
    
    const { username, password } = req.body;
    console.log('👤 Login attempt:', { username, password: password ? '***' : 'undefined' });
    
    // Hash password using SHA-256 (same as createAdmin script)
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    console.log('🔐 Password hash:', passwordHash);
    
    // Check if admin_users table exists
    try {
      const tableExists = await db.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'admin_users'
        ) as exists
      `;
      console.log('📋 Admin users table exists:', tableExists[0]?.exists);
    } catch (tableError) {
      console.error('❌ Error checking table:', tableError);
    }
    
    const user = await db.adminUser.findUnique({
      where: { username },
    });

    console.log('👥 User found:', user ? { id: user.id, username: user.username, role: user.role } : 'null');
    console.log('🔐 Stored password hash:', user?.password_hash);

    if (!user || user.password_hash !== passwordHash) {
      console.log('❌ Invalid credentials');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    // Generate token based on role
    const token = `${user.role}_token_${user.id}`;

    console.log('✅ Login successful');
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role,
        },
        token: token,
      },
      message: 'Login successful',
    });
  } catch (err) {
    console.error('💥 Login error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
} 