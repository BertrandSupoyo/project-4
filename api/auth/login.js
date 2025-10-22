import { PrismaClient } from '../../prisma/app/generated/prisma-client/index.js';
import { withAccelerate } from '@prisma/extension-accelerate';
import crypto from 'crypto';

let prisma;

async function initPrisma() {
  if (!prisma) {
    console.log('🔧 Initializing Prisma Client...');
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
    
    const db = await initPrisma();
    const { username, password, loginType = 'admin' } = req.body;
    
    console.log('👤 Login attempt:', { username, password: password ? '***' : 'undefined', loginType });
    
    // Handle viewer login (no database check)
    if (loginType === 'viewer') {
      const viewerUser = {
        id: 'viewer',
        username: 'viewer',
        name: 'Viewer',
        role: 'viewer'
      };

      return res.json({
        success: true,
        data: {
          user: viewerUser,
          token: 'viewer_token',
        },
        message: 'Viewer login successful',
      });
    }

    // Handle admin and petugas login with database
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Username and password are required'
      });
    }

    // Hash password using SHA-256
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    console.log('🔐 Password hash:', passwordHash);
    
    // Find user based on login type
    const whereClause = { username };
    if (loginType === 'petugas') {
      whereClause.role = 'petugas';
    } else if (loginType === 'admin') {
      whereClause.role = 'admin';
    }

    const user = await db.adminUser.findFirst({
      where: whereClause,
    });

    console.log('👥 User found:', user ? { id: user.id, username: user.username, role: user.role } : 'null');

    if (!user || user.password_hash !== passwordHash) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials',
      });
    }

    const token = loginType === 'admin' ? 'admin_token' : 'petugas_token';

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          name: user.name || user.username,
          role: user.role,
        },
        token,
      },
      message: `${loginType} login successful`,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
