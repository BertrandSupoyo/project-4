import { PrismaClient } from '../prisma/app/generated/prisma-client/index.js'
import { withAccelerate } from '@prisma/extension-accelerate'

let prisma;
async function initPrisma() {
  if (!prisma) {
    try {
      prisma = new PrismaClient().$extends(withAccelerate());
    } catch (error) {
      console.error('Failed to initialize Prisma:', error);
      throw error;
    }
  }
  return prisma;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await initPrisma();
    
    // Get all substations with measurements
    const substations = await db.substation.findMany({
      include: {
        measurements_siang: true,
        measurements_malam: true
      }
    });

    // Count measurements
    const siangCount = await db.measurementSiang.count();
    const malamCount = await db.measurementMalam.count();

    res.json({
      success: true,
      data: {
        substations: substations.length,
        siangMeasurements: siangCount,
        malamMeasurements: malamCount,
        substationsWithMeasurements: substations.map(sub => ({
          id: sub.id,
          noGardu: sub.noGardu,
          siangCount: sub.measurements_siang.length,
          malamCount: sub.measurements_malam.length,
          siangRows: sub.measurements_siang.map(m => m.row_name),
          malamRows: sub.measurements_malam.map(m => m.row_name)
        }))
      }
    });
  } catch (error) {
    console.error('Test measurements error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
} 