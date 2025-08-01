const { PrismaClient } = require('@prisma/client');

let prisma;

async function initPrisma() {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
    try {
      await prisma.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }
  return prisma;
}

module.exports = async (req, res) => {
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

  try {
    const db = await initPrisma();
    const totalSubstations = await db.substation.count();
    const activeSubstations = await db.substation.count({
      where: { is_active: 1 }
    });
    const ugbActive = await db.substation.count({
      where: { ugb: 1 }
    });

    res.json({
      success: true,
      data: {
        totalSubstations,
        activeSubstations,
        inactiveSubstations: totalSubstations - activeSubstations,
        ugbActive,
        criticalIssues: 0,
        monthlyMeasurements: 0
      }
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}; 