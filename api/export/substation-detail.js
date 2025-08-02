import { PrismaClient } from '../../prisma/app/generated/prisma-client/index.js'
import { withAccelerate } from '@prisma/extension-accelerate'
import { generateSubstationExcel } from '../../server/utils/generateSubstationExcel.js'

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Substation ID is required' });
  }

  const db = await initPrisma();

  try {
    console.log('📊 Exporting substation detail for ID:', id);
    
    // Get substation with measurements
    const substation = await db.substation.findUnique({
      where: { id: String(id) },
      include: {
        measurements_siang: {
          orderBy: { row_name: 'asc' }
        },
        measurements_malam: {
          orderBy: { row_name: 'asc' }
        }
      }
    });

    if (!substation) {
      return res.status(404).json({ success: false, error: 'Substation not found' });
    }

    console.log(`✅ Found substation: ${substation.noGardu}`);
    console.log(`📊 Siang measurements: ${substation.measurements_siang.length}`);
    console.log(`📊 Malam measurements: ${substation.measurements_malam.length}`);

    // Generate Excel file
    await generateSubstationExcel(
      substation,
      substation.measurements_siang,
      substation.measurements_malam,
      res
    );

  } catch (error) {
    console.error('❌ Error exporting substation detail:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export substation detail',
      details: error.message
    });
  }
} 