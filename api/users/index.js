import { PrismaClient } from '../../prisma/app/generated/prisma-client/index.js';
import { withAccelerate } from '@prisma/extension-accelerate';
import crypto from 'crypto';

// Set DATABASE_URL if not already set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://username:password@localhost:5432/substation_monitoring';
}

let prisma;

async function initPrisma() {
  if (!prisma) {
    try {
      console.log('🔧 Initializing Prisma Client for users API...');
      console.log('📊 Environment:', process.env.NODE_ENV);
      console.log('🔗 Database URL exists:', !!process.env.DATABASE_URL);
      
      prisma = new PrismaClient().$extends(withAccelerate());
      await prisma.$connect();
      console.log('✅ Prisma connected successfully for users API');
    } catch (error) {
      console.error('❌ Prisma connection failed for users API:', error);
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

  try {
    console.log('🔄 Users API called with method:', req.method);
    const db = await initPrisma();

    // GET - Get all users
    if (req.method === 'GET') {
      console.log('📋 Fetching all users...');
      const users = await db.adminUser.findMany({
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          created_at: true,
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      console.log('✅ Found users:', users.length);
      return res.json({
        success: true,
        data: users
      });
    }

    // POST - Create new user
    if (req.method === 'POST') {
      console.log('📝 Creating new user...');
      const { username, password, name, role = 'petugas' } = req.body;
      console.log('📝 User data:', { username, name, role, password: password ? '***' : 'undefined' });

      // Validation
      if (!username || !password || !name) {
        console.log('❌ Validation failed: missing required fields');
        return res.status(400).json({
          success: false,
          error: 'Username, password, and name are required'
        });
      }

      // Check if username already exists
      console.log('🔍 Checking if username exists...');
      const existingUser = await db.adminUser.findUnique({
        where: { username }
      });

      if (existingUser) {
        console.log('❌ Username already exists');
        return res.status(400).json({
          success: false,
          error: 'Username already exists'
        });
      }

      // Hash password
      console.log('🔐 Hashing password...');
      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

      // Create user
      console.log('👤 Creating user in database...');
      const newUser = await db.adminUser.create({
        data: {
          username,
          password_hash: passwordHash,
          name,
          role
        },
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          created_at: true,
        }
      });

      console.log('✅ User created successfully:', newUser);
      return res.json({
        success: true,
        data: newUser,
        message: 'User created successfully'
      });
    }

    // PUT - Update user
    if (req.method === 'PUT') {
      console.log('📝 Updating user...');
      const { id, username, name, role, password } = req.body;
      console.log('📝 Update data:', { id, username, name, role, password: password ? '***' : 'undefined' });

      if (!id) {
        console.log('❌ User ID is required');
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      // Check if user exists
      const existingUser = await db.adminUser.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingUser) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Check if username is being changed and if it already exists
      if (username && username !== existingUser.username) {
        const usernameExists = await db.adminUser.findUnique({
          where: { username }
        });

        if (usernameExists) {
          return res.status(400).json({
            success: false,
            error: 'Username already exists'
          });
        }
      }

      // Prepare update data
      const updateData = {};
      if (username) updateData.username = username;
      if (name) updateData.name = name;
      if (role) updateData.role = role;
      if (password) {
        updateData.password_hash = crypto.createHash('sha256').update(password).digest('hex');
      }

      // Update user
      const updatedUser = await db.adminUser.update({
        where: { id: parseInt(id) },
        data: updateData,
        select: {
          id: true,
          username: true,
          name: true,
          role: true,
          created_at: true,
        }
      });

      return res.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully'
      });
    }

    // DELETE - Delete user
    if (req.method === 'DELETE') {
      console.log('🗑️ Deleting user...');
      const { id } = req.query;
      console.log('🗑️ Delete user ID:', id);

      if (!id) {
        console.log('❌ User ID is required for deletion');
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      // Check if user exists
      console.log('🔍 Checking if user exists...');
      const existingUser = await db.adminUser.findUnique({
        where: { id: parseInt(id) }
      });

      if (!existingUser) {
        console.log('❌ User not found');
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Delete user
      console.log('🗑️ Deleting user from database...');
      await db.adminUser.delete({
        where: { id: parseInt(id) }
      });

      console.log('✅ User deleted successfully');
      return res.json({
        success: true,
        message: 'User deleted successfully'
      });
    }

    console.log('❌ Method not allowed:', req.method);
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('❌ User management error:', error);
    console.error('❌ Error stack:', error.stack);
    console.error('❌ Error details:', {
      message: error.message,
      name: error.name,
      code: error.code
    });
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
