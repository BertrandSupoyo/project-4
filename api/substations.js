import { PrismaClient } from '../prisma/app/generated/prisma-client/index.js'
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
    console.log('🏭 Getting substations...');
    
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
      orderBy: { no: 'asc' },
      include: {
        measurements_siang: {
          orderBy: { lastUpdate: 'desc' },
          take: 1
        },
        measurements_malam: {
          orderBy: { lastUpdate: 'desc' },
          take: 1
        }
      }
    });

    console.log(`✅ Found ${substations.length} substations`);

    res.json({
      success: true,
      data: substations
    });
  } catch (err) {
    console.error('💥 Substations error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: err.message
    });
  }
} 