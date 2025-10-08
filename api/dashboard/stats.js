import { PrismaClient } from '../../prisma/app/generated/prisma-client/index.js'
import { withAccelerate } from '@prisma/extension-accelerate'

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

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📊 Getting dashboard stats...');
    
    const db = await initPrisma();
    
    const totalSubstations = await db.substation.count();
    const activeSubstations = await db.substation.count({ where: { is_active: 1 } });
    const ugbActive = await db.substation.count({ where: { ugb: 1 } });

    console.log('📊 Dashboard stats calculated:');
    console.log('  - Total substations:', totalSubstations);
    console.log('  - Active substations (is_active: 1):', activeSubstations);
    console.log('  - UGB active (ugb: 1):', ugbActive);

    // Calculate critical issues (unbalanced > 80%) using aggregate count instead of loading all rows
    let criticalCount = 0;
    try {
      criticalCount = await db.substation.count({
        where: {
          OR: [
            { measurements_siang: { some: { unbalanced: { gt: 80 } } } },
            { measurements_malam: { some: { unbalanced: { gt: 80 } } } },
          ],
        },
      });
    } catch (aggErr) {
      console.warn('⚠️ Critical count aggregate failed, falling back to 0:', aggErr.message);
      criticalCount = 0;
    }

    res.json({
      success: true,
      data: {
        totalSubstations,
        activeSubstations,
        inactiveSubstations: totalSubstations - activeSubstations,
        ugbActive,
        criticalIssues: criticalCount,
        monthlyMeasurements: 0 // TODO: Calculate based on current month
      }
    });
  } catch (err) {
    console.error('💥 Stats error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: err.message
    });
  }
} 