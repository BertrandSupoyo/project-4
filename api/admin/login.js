import { PrismaClient } from '../../prisma/app/generated/prisma-client/index.js'
import { withAccelerate } from '@prisma/extension-accelerate'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'

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
    
    // First try to find user in the new users table
    let user = await db.user.findUnique({
      where: { username },
    });

    console.log('👥 User found in users table:', user ? { id: user.id, username: user.username, role: user.role } : 'null');

    // If not found in users table, try admin_users table (for backward compatibility)
    if (!user) {
      console.log('🔍 Trying admin_users table...');
      
      // Hash password using SHA-256 (same as createAdmin script)
      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
      console.log('🔐 Password hash:', passwordHash);
      
      const adminUser = await db.adminUser.findUnique({
        where: { username },
      });

      console.log('👥 Admin user found:', adminUser ? { id: adminUser.id, username: adminUser.username, role: adminUser.role } : 'null');

      if (adminUser && adminUser.password_hash === passwordHash) {
        // Convert admin user to user format
        user = {
          id: adminUser.id.toString(),
          username: adminUser.username,
          role: adminUser.role,
          name: adminUser.username
        };
        console.log('✅ Admin user login successful');
      }
    } else {
      // Verify password using bcrypt for new users table
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        console.log('❌ Invalid password for user');
        user = null;
      } else {
        console.log('✅ User password verified');
      }
    }

    if (!user) {
      console.log('❌ Invalid credentials');
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    console.log('✅ Login successful');
    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name || user.username,
        },
        token: 'user_token',
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