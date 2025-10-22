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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const db = await initPrisma();

  try {
    console.log('🔧 Starting measurements data fix...');
    
    // Get all substations
    const substations = await db.substation.findMany({
      include: {
        measurements_siang: true,
        measurements_malam: true
      }
    });

    console.log(`📊 Found ${substations.length} substations to process`);

    let fixedCount = 0;
    const rowNames = ['induk', '1', '2', '3', '4'];

    for (const substation of substations) {
      console.log(`🔧 Processing substation: ${substation.noGardu} (ID: ${substation.id})`);
      
      // Check and fix siang measurements
      for (const rowName of rowNames) {
        const existingSiang = substation.measurements_siang.find(
          m => m.row_name?.toLowerCase() === rowName.toLowerCase() && 
               String(m.substationId) === String(substation.id)
        );

        if (!existingSiang) {
          console.log(`  ➕ Creating missing siang measurement for row: ${rowName}`);
          await db.measurementSiang.create({
            data: {
              substationId: substation.id,
              row_name: rowName,
              r: 0, s: 0, t: 0, n: 0,
              rn: 0, sn: 0, tn: 0, pp: 0, pn: 0,
              rata2: 0, kva: 0, persen: 0, unbalanced: 0,
              month: substation.tanggal ? new Date(substation.tanggal).toISOString().slice(0, 7) : new Date().toISOString().slice(0, 7)
            }
          });
          fixedCount++;
        }
      }

      // Check and fix malam measurements
      for (const rowName of rowNames) {
        const existingMalam = substation.measurements_malam.find(
          m => m.row_name?.toLowerCase() === rowName.toLowerCase() && 
               String(m.substationId) === String(substation.id)
        );

        if (!existingMalam) {
          console.log(`  ➕ Creating missing malam measurement for row: ${rowName}`);
          await db.measurementMalam.create({
            data: {
              substationId: substation.id,
              row_name: rowName,
              r: 0, s: 0, t: 0, n: 0,
              rn: 0, sn: 0, tn: 0, pp: 0, pn: 0,
              rata2: 0, kva: 0, persen: 0, unbalanced: 0,
              month: substation.tanggal ? new Date(substation.tanggal).toISOString().slice(0, 7) : new Date().toISOString().slice(0, 7)
            }
          });
          fixedCount++;
        }
      }
    }

    console.log(`✅ Fixed ${fixedCount} missing measurements`);

    res.json({
      success: true,
      message: `Successfully fixed ${fixedCount} missing measurements`,
      fixedCount,
      processedSubstations: substations.length
    });

  } catch (error) {
    console.error('❌ Error fixing measurements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fix measurements data',
      details: error.message
    });
  }
} 