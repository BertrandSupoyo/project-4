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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('📥 Importing substations...');
    
    const db = await initPrisma();
    const substationsData = req.body;
    
    console.log(`📝 Importing ${substationsData.length} substations`);

    const createdSubstations = [];
    const errors = [];

    for (let i = 0; i < substationsData.length; i++) {
      try {
        const data = substationsData[i];
        
        const newSubstation = await db.substation.create({
          data: {
            no: data.no,
            ulp: data.ulp,
            noGardu: data.noGardu,
            namaLokasiGardu: data.namaLokasiGardu,
            jenis: data.jenis,
            merek: data.merek,
            daya: data.daya,
            tahun: data.tahun,
            phasa: data.phasa,
            tap_trafo_max_tap: data.tap_trafo_max_tap,
            penyulang: data.penyulang,
            arahSequence: data.arahSequence,
            tanggal: new Date(data.tanggal),
            status: data.status || 'normal',
            is_active: data.is_active || 1,
            ugb: data.ugb || 0,
            latitude: data.latitude,
            longitude: data.longitude
          }
        });

        createdSubstations.push(newSubstation);
        console.log(`✅ Created substation ${i + 1}/${substationsData.length}:`, newSubstation.id);
      } catch (error) {
        console.error(`❌ Error creating substation ${i + 1}:`, error);
        errors.push({
          index: i,
          data: substationsData[i],
          error: error.message
        });
      }
    }

    console.log(`✅ Import completed: ${createdSubstations.length} created, ${errors.length} errors`);

    res.json({
      success: true,
      data: {
        count: createdSubstations.length,
        created: createdSubstations,
        errors: errors
      },
      message: `Imported ${createdSubstations.length} substations successfully`
    });
  } catch (err) {
    console.error('💥 Import error:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: err.message
    });
  }
} 