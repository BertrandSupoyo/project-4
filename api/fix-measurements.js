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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await initPrisma();
    
    // Get all substations
    const substations = await db.substation.findMany();
    const rowNames = ['induk', '1', '2', '3', '4'];
    
    let createdSiang = 0;
    let createdMalam = 0;

    for (const substation of substations) {
      const month = new Date(substation.tanggal).toISOString().slice(0, 7);
      
      // Check and create missing siang measurements
      for (const rowName of rowNames) {
        const existingSiang = await db.measurementSiang.findFirst({
          where: {
            substationId: substation.id,
            row_name: rowName,
            month: month
          }
        });
        
        if (!existingSiang) {
          await db.measurementSiang.create({
            data: {
              substationId: substation.id,
              row_name: rowName,
              month: month,
              r: 0, s: 0, t: 0, n: 0,
              rn: 0, sn: 0, tn: 0,
              pp: 0, pn: 0,
              rata2: 0, kva: 0, persen: 0, unbalanced: 0,
              lastUpdate: new Date()
            }
          });
          createdSiang++;
        }
      }
      
      // Check and create missing malam measurements
      for (const rowName of rowNames) {
        const existingMalam = await db.measurementMalam.findFirst({
          where: {
            substationId: substation.id,
            row_name: rowName,
            month: month
          }
        });
        
        if (!existingMalam) {
          await db.measurementMalam.create({
            data: {
              substationId: substation.id,
              row_name: rowName,
              month: month,
              r: 0, s: 0, t: 0, n: 0,
              rn: 0, sn: 0, tn: 0,
              pp: 0, pn: 0,
              rata2: 0, kva: 0, persen: 0, unbalanced: 0,
              lastUpdate: new Date()
            }
          });
          createdMalam++;
        }
      }
    }

    res.json({
      success: true,
      data: {
        substationsProcessed: substations.length,
        siangMeasurementsCreated: createdSiang,
        malamMeasurementsCreated: createdMalam,
        message: `Created ${createdSiang} siang and ${createdMalam} malam measurements for ${substations.length} substations`
      }
    });
  } catch (error) {
    console.error('Fix measurements error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
} 