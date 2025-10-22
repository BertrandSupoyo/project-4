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
    console.log('🔍 Starting petugas login process...');
    
    const db = await initPrisma();
    const { username, password } = req.body;
    
    console.log('👤 Petugas login attempt:', { username, password: password ? '***' : 'undefined' });
    
    // Hash password using SHA-256
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    console.log('🔐 Password hash:', passwordHash);
    
    // Find user with role 'petugas'
    const user = await db.adminUser.findFirst({
      where: { 
        username,
        role: 'petugas'
      },
    });

    console.log('👥 Petugas found:', user ? { id: user.id, username: user.username, role: user.role } : 'null');

    if (!user || user.password_hash !== passwordHash) {
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials or not a petugas user',
      });
    }

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          name: user.name || user.username,
          role: user.role,
        },
        token: 'petugas_token',
      },
      message: 'Petugas login successful',
    });
  } catch (error) {
    console.error('Petugas login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
