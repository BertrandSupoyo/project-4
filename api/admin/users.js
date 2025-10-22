import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      // Get all users
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          role: true,
          name: true,
          createdAt: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      res.status(200).json({ success: true, users });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
  } else if (req.method === 'POST') {
    try {
      const { username, password, role, name } = req.body;

      // Validate required fields
      if (!username || !password || !role) {
        return res.status(400).json({ 
          success: false, 
          error: 'Username, password, and role are required' 
        });
      }

      // Check if username already exists
      const existingUser = await prisma.user.findUnique({
        where: { username }
      });

      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          error: 'Username already exists' 
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          role: role || 'viewer',
          name: name || username
        },
        select: {
          id: true,
          username: true,
          role: true,
          name: true,
          createdAt: true
        }
      });

      res.status(201).json({ success: true, user });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ success: false, error: 'Failed to create user' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, username, role, name } = req.body;

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          error: 'User ID is required' 
        });
      }

      // Update user
      const user = await prisma.user.update({
        where: { id },
        data: {
          username,
          role,
          name,
          updatedAt: new Date()
        },
        select: {
          id: true,
          username: true,
          role: true,
          name: true,
          createdAt: true
        }
      });

      res.status(200).json({ success: true, user });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ success: false, error: 'Failed to update user' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          error: 'User ID is required' 
        });
      }

      // Delete user
      await prisma.user.delete({
        where: { id }
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ success: false, error: 'Failed to delete user' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
