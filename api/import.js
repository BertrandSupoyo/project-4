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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await initPrisma();
    const { type, data } = req.body;

    if (!type || !data) {
      return res.status(400).json({
        success: false,
        error: 'Type and data are required'
      });
    }

    // Import Substations
    if (type === 'substations') {
      if (!Array.isArray(data)) {
        return res.status(400).json({
          success: false,
          error: 'Data must be an array'
        });
      }

      const result = await db.substation.createMany({
        data: data,
        skipDuplicates: true
      });

      return res.json({
        success: true,
        data: result,
        message: `${result.count} substations imported successfully`
      });
    }

    // Import Measurements
    if (type === 'measurements') {
      const { measurements, measurementType } = req.body; // measurementType: 'siang' | 'malam'

      if (!measurements || !Array.isArray(measurements) || !measurementType) {
        return res.status(400).json({
          success: false,
          error: 'Measurements array and measurementType are required'
        });
      }

      let result;
      if (measurementType === 'siang') {
        result = await db.measurementSiang.createMany({
          data: measurements,
          skipDuplicates: true
        });
      } else if (measurementType === 'malam') {
        result = await db.measurementMalam.createMany({
          data: measurements,
          skipDuplicates: true
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'measurementType must be siang or malam'
        });
      }

      return res.json({
        success: true,
        data: result,
        message: `${result.count} ${measurementType} measurements imported successfully`
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid type. Use: substations, measurements'
    });

  } catch (error) {
    console.error('Import error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
