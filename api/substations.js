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
    const { limit = 100, page = 1, search, status, ulp, jenis } = req.query;
    
    const where = {};
    if (search) {
      where.OR = [
        { namaLokasiGardu: { contains: search, mode: 'insensitive' } },
        { ulp: { contains: search, mode: 'insensitive' } },
        { noGardu: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (status) where.status = status;
    if (ulp) where.ulp = ulp;
    if (jenis) where.jenis = jenis;

    const substations = await db.substation.findMany({
      where,
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: { no: 'asc' }
    });

    res.json({
      success: true,
      data: substations
    });
  } catch (err) {
    console.error('Substations error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
}; 