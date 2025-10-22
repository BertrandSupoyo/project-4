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
    const { action } = req.query;

    // Fix measurements data
    if (action === 'fix-measurements') {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      // Get all substations
      const substations = await db.substation.findMany();
      let fixedCount = 0;

      for (const substation of substations) {
        // Fix siang measurements
        const siangMeasurements = await db.measurementSiang.findMany({
          where: { substationId: substation.id }
        });

        for (const measurement of siangMeasurements) {
          const r = Number(measurement.r) || 0;
          const s = Number(measurement.s) || 0;
          const t = Number(measurement.t) || 0;
          const n = Number(measurement.n) || 0;

          // Calculate rata2
          const rata2 = (r + s + t + n) / 4;

          // Calculate unbalanced
          const max = Math.max(r, s, t, n);
          const min = Math.min(r, s, t, n);
          const unbalanced = max > 0 ? ((max - min) / max) * 100 : 0;

          await db.measurementSiang.update({
            where: { id: measurement.id },
            data: {
              rata2,
              unbalanced
            }
          });

          fixedCount++;
        }

        // Fix malam measurements
        const malamMeasurements = await db.measurementMalam.findMany({
          where: { substationId: substation.id }
        });

        for (const measurement of malamMeasurements) {
          const r = Number(measurement.r) || 0;
          const s = Number(measurement.s) || 0;
          const t = Number(measurement.t) || 0;
          const n = Number(measurement.n) || 0;

          // Calculate rata2
          const rata2 = (r + s + t + n) / 4;

          // Calculate unbalanced
          const max = Math.max(r, s, t, n);
          const min = Math.min(r, s, t, n);
          const unbalanced = max > 0 ? ((max - min) / max) * 100 : 0;

          await db.measurementMalam.update({
            where: { id: measurement.id },
            data: {
              rata2,
              unbalanced
            }
          });

          fixedCount++;
        }
      }

      return res.json({
        success: true,
        message: `Fixed ${fixedCount} measurements`,
        data: { fixedCount }
      });
    }

    // Bulk delete measurements
    if (action === 'delete-measurements') {
      if (req.method !== 'DELETE') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { type, substationId } = req.query;

      if (!type || !substationId) {
        return res.status(400).json({
          success: false,
          error: 'Type and substationId are required'
        });
      }

      let deletedCount = 0;
      if (type === 'siang') {
        const result = await db.measurementSiang.deleteMany({
          where: { substationId }
        });
        deletedCount = result.count;
      } else if (type === 'malam') {
        const result = await db.measurementMalam.deleteMany({
          where: { substationId }
        });
        deletedCount = result.count;
      } else {
        return res.status(400).json({
          success: false,
          error: 'Type must be siang or malam'
        });
      }

      return res.json({
        success: true,
        message: `Deleted ${deletedCount} ${type} measurements`,
        data: { deletedCount }
      });
    }

    // Bulk update substations
    if (action === 'update-substations') {
      if (req.method !== 'PUT') {
        return res.status(405).json({ error: 'Method not allowed' });
      }

      const { updates } = req.body;

      if (!Array.isArray(updates)) {
        return res.status(400).json({
          success: false,
          error: 'Updates must be an array'
        });
      }

      let updatedCount = 0;
      for (const update of updates) {
        if (update.id && update.data) {
          await db.substation.update({
            where: { id: update.id },
            data: update.data
          });
          updatedCount++;
        }
      }

      return res.json({
        success: true,
        message: `Updated ${updatedCount} substations`,
        data: { updatedCount }
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid action. Use: fix-measurements, delete-measurements, update-substations'
    });

  } catch (error) {
    console.error('Bulk operation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
