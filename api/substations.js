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

  try {
    if (req.method === 'GET') {
      const { limit = 100, page = 1, search } = req.query;
      const skip = (parseInt(page) - 1) * parseInt(limit);

      let where = {};
      if (search) {
        where = {
          OR: [
            { namaLokasiGardu: { contains: search, mode: 'insensitive' } },
            { noGardu: { contains: search, mode: 'insensitive' } },
            { ulp: { contains: search, mode: 'insensitive' } }
          ]
        };
      }

      const [substations, total] = await Promise.all([
        prisma.substation.findMany({
          where,
          orderBy: { no: 'asc' },
          skip,
          take: parseInt(limit),
          include: {
            measurements_siang: true,
            measurements_malam: true
          }
        }),
        prisma.substation.count({ where })
      ]);

      res.status(200).json({
        success: true,
        data: substations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } else {
      res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Substations API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}; 