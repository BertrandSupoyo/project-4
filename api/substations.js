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

  const db = await initPrisma();

  // GET - Get substations
  if (req.method === 'GET') {
    try {
      console.log('🏭 Getting substations...');
      
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
      console.error('💥 Substations GET error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: err.message
      });
    }
  }

  // POST - Create substation
  else if (req.method === 'POST') {
    try {
      console.log('🏭 Creating substation...');
      
      const substationData = req.body;
      console.log('📝 Substation data:', substationData);

      const newSubstation = await db.substation.create({
        data: {
          no: substationData.no,
          ulp: substationData.ulp,
          noGardu: substationData.noGardu,
          namaLokasiGardu: substationData.namaLokasiGardu,
          jenis: substationData.jenis,
          merek: substationData.merek,
          daya: substationData.daya,
          tahun: substationData.tahun,
          phasa: substationData.phasa,
          tap_trafo_max_tap: substationData.tap_trafo_max_tap,
          penyulang: substationData.penyulang,
          arahSequence: substationData.arahSequence,
          tanggal: new Date(substationData.tanggal),
          status: substationData.status || 'normal',
          is_active: substationData.is_active || 1,
          ugb: substationData.ugb || 0,
          latitude: substationData.latitude,
          longitude: substationData.longitude
        }
      });

      console.log('✅ Substation created:', newSubstation.id);

      res.json({
        success: true,
        data: newSubstation,
        message: 'Substation created successfully'
      });
    } catch (err) {
      console.error('💥 Substation POST error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: err.message
      });
    }
  }

  // PATCH - Update substation
  else if (req.method === 'PATCH') {
    try {
      console.log('🏭 Updating substation...');
      
      const { id } = req.query;
      const updateData = req.body;
      
      console.log('📝 Update data:', { id, updateData });

      const updatedSubstation = await db.substation.update({
        where: { id },
        data: updateData
      });

      console.log('✅ Substation updated:', updatedSubstation.id);

      res.json({
        success: true,
        data: updatedSubstation,
        message: 'Substation updated successfully'
      });
    } catch (err) {
      console.error('💥 Substation PATCH error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: err.message
      });
    }
  }

  // DELETE - Delete substation
  else if (req.method === 'DELETE') {
    try {
      console.log('🏭 Deleting substation...');
      
      const { id } = req.query;
      
      await db.substation.delete({
        where: { id }
      });

      console.log('✅ Substation deleted:', id);

      res.json({
        success: true,
        message: 'Substation deleted successfully'
      });
    } catch (err) {
      console.error('💥 Substation DELETE error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: err.message
      });
    }
  }

  else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
} 