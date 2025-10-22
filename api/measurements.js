import { PrismaClient } from '../../prisma/app/generated/prisma-client/index.js';
import { withAccelerate } from '@prisma/extension-accelerate';

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

  try {
    const db = await initPrisma();
    const { type, substationId, month } = req.query; // type: 'siang' | 'malam'

    // GET - Get measurements
    if (req.method === 'GET') {
      if (!type || !substationId) {
        return res.status(400).json({
          success: false,
          error: 'Type and substationId are required'
        });
      }

      let measurements;
      if (type === 'siang') {
        measurements = await db.measurementSiang.findMany({
          where: {
            substationId,
            ...(month && { month })
          },
          orderBy: { lastUpdate: 'desc' }
        });
      } else if (type === 'malam') {
        measurements = await db.measurementMalam.findMany({
          where: {
            substationId,
            ...(month && { month })
          },
          orderBy: { lastUpdate: 'desc' }
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Type must be siang or malam'
        });
      }

      return res.json({
        success: true,
        data: measurements
      });
    }

    // POST - Create measurements (bulk)
    if (req.method === 'POST') {
      const { measurements, type } = req.body;

      if (!measurements || !Array.isArray(measurements) || !type) {
        return res.status(400).json({
          success: false,
          error: 'Measurements array and type are required'
        });
      }

      let createdMeasurements;
      if (type === 'siang') {
        createdMeasurements = await db.measurementSiang.createMany({
          data: measurements,
          skipDuplicates: true
        });
      } else if (type === 'malam') {
        createdMeasurements = await db.measurementMalam.createMany({
          data: measurements,
          skipDuplicates: true
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Type must be siang or malam'
        });
      }

      return res.json({
        success: true,
        data: createdMeasurements,
        message: `${type} measurements created successfully`
      });
    }

    // PUT - Update measurements
    if (req.method === 'PUT') {
      const { id, type, data } = req.body;

      if (!id || !type || !data) {
        return res.status(400).json({
          success: false,
          error: 'ID, type, and data are required'
        });
      }

      let updatedMeasurement;
      if (type === 'siang') {
        updatedMeasurement = await db.measurementSiang.update({
          where: { id: parseInt(id) },
          data
        });
      } else if (type === 'malam') {
        updatedMeasurement = await db.measurementMalam.update({
          where: { id: parseInt(id) },
          data
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Type must be siang or malam'
        });
      }

      return res.json({
        success: true,
        data: updatedMeasurement,
        message: `${type} measurement updated successfully`
      });
    }

    // DELETE - Delete measurements
    if (req.method === 'DELETE') {
      const { id, type } = req.query;

      if (!id || !type) {
        return res.status(400).json({
          success: false,
          error: 'ID and type are required'
        });
      }

      if (type === 'siang') {
        await db.measurementSiang.delete({
          where: { id: parseInt(id) }
        });
      } else if (type === 'malam') {
        await db.measurementMalam.delete({
          where: { id: parseInt(id) }
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Type must be siang or malam'
        });
      }

      return res.json({
        success: true,
        message: `${type} measurement deleted successfully`
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });

  } catch (error) {
    console.error('Measurements error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
