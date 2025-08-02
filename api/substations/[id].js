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

  const db = await initPrisma();
  const { id } = req.query;

  console.log(`🏭 Request method: ${req.method}, ID: ${id}`);

  // GET - Get substation by ID
  if (req.method === 'GET') {
    try {
      console.log('🏭 Getting substation by ID...');
      
      const substation = await db.substation.findUnique({
        where: { id },
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
        return res.status(404).json({
          success: false,
          error: 'Substation not found'
        });
      }

      console.log(`✅ Found substation: ${substation.noGardu}`);

      res.json({
        success: true,
        data: substation
      });
    } catch (err) {
      console.error('💥 Substation GET by ID error:', err);
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
      console.log('🏭 PATCH update request:', req.body);
      const updateData = req.body;
      
      console.log('📝 Update data:', { id, updateData });

      // Hanya izinkan field tertentu untuk diupdate
      const allowedFields = ['is_active', 'status', 'daya', 'lastUpdate', 'ugb', 'latitude', 'longitude', 'tanggal'];
      const filteredData = {};
      for (const key of allowedFields) {
        if (updateData[key] !== undefined) {
          filteredData[key] = updateData[key];
        }
      }

      if (Object.keys(filteredData).length === 0) {
        return res.status(400).json({ 
          success: false, 
          message: 'No valid fields to update.' 
        });
      }

      const updatedSubstation = await db.substation.update({
        where: { id },
        data: filteredData
      });

      console.log('✅ Substation updated:', updatedSubstation.id);
      console.log('📝 Updated fields:', filteredData);
      console.log('📊 New values - is_active:', updatedSubstation.is_active, 'ugb:', updatedSubstation.ugb);

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
      console.log('🏭 Deleting substation and all related data...');
      
      // First, delete all related measurements
      console.log('🗑️ Deleting related measurements...');
      
      // Delete siang measurements
      const deletedSiangMeasurements = await db.measurementSiang.deleteMany({
        where: { substationId: id }
      });
      console.log(`🗑️ Deleted ${deletedSiangMeasurements.count} siang measurements`);
      
      // Delete malam measurements
      const deletedMalamMeasurements = await db.measurementMalam.deleteMany({
        where: { substationId: id }
      });
      console.log(`🗑️ Deleted ${deletedMalamMeasurements.count} malam measurements`);
      
      // Then delete the substation
      const deletedSubstation = await db.substation.delete({
        where: { id }
      });

      console.log('✅ Substation and all related data deleted:', {
        substationId: id,
        substationName: deletedSubstation.namaLokasiGardu,
        siangMeasurementsDeleted: deletedSiangMeasurements.count,
        malamMeasurementsDeleted: deletedMalamMeasurements.count
      });

      res.json({
        success: true,
        message: 'Substation and all related data deleted successfully',
        data: {
          substationId: id,
          substationName: deletedSubstation.namaLokasiGardu,
          siangMeasurementsDeleted: deletedSiangMeasurements.count,
          malamMeasurementsDeleted: deletedMalamMeasurements.count
        }
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