const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const [
      totalSubstations,
      activeSubstations,
      inactiveSubstations,
      ugbActive,
      totalMeasurements
    ] = await Promise.all([
      prisma.substation.count(),
      prisma.substation.count({ where: { is_active: 1 } }),
      prisma.substation.count({ where: { is_active: 0 } }),
      prisma.substation.count({ where: { ugb: 1 } }),
      prisma.measurementSiang.count()
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSubstations,
        activeSubstations,
        inactiveSubstations,
        ugbActive,
        totalMeasurements
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}; 