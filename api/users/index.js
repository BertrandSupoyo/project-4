import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

let prisma;

async function initPrisma() {
  if (!prisma) {
    try {
      prisma = new PrismaClient();
      await prisma.$connect();
      console.log('✅ Prisma connected successfully');
    } catch (error) {
      console.error('❌ Prisma connection failed:', error);
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
    const db = await initPrisma();

    // GET - Get all users
    if (req.method === 'GET') {
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

      return res.json({
        success: true,
        data: users
      });
    }

    // POST - Create new user
    if (req.method === 'POST') {
      const { username, password, name, role = 'petugas' } = req.body;

      // Validation
      if (!username || !password || !name) {
        return res.status(400).json({
          success: false,
          error: 'Username, password, and name are required'
        });
      }

      // Check if username already exists
      const existingUser = await db.adminUser.findUnique({
        where: { username }
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Username already exists'
        });
      }

      // Hash password
      const passwordHash = crypto.createHash('sha256').update(password).digest('hex');

      // Create user
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

      return res.json({
        success: true,
        data: newUser,
        message: 'User created successfully'
      });
    }

    // PUT - Update user
    if (req.method === 'PUT') {
      const { id, username, name, role, password } = req.body;

      if (!id) {
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
      const { id } = req.query;

      if (!id) {
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

      // Delete user
      await db.adminUser.delete({
        where: { id: parseInt(id) }
      });

      return res.json({
        success: true,
        message: 'User deleted successfully'
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('User management error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
