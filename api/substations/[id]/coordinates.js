import { PrismaClient } from '../../../prisma/app/generated/prisma-client/index.js'
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,PATCH,POST,PUT');
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

  console.log(`🌍 Coordinates request method: ${req.method}, ID: ${id}`);

  // GET - Get coordinates
  if (req.method === 'GET') {
    try {
      console.log('🌍 Getting coordinates...');
      
      const substation = await db.substation.findUnique({
        where: { id },
        select: {
          id: true,
          noGardu: true,
          namaLokasiGardu: true,
          latitude: true,
          longitude: true
        }
      });

      if (!substation) {
        return res.status(404).json({
          success: false,
          error: 'Substation not found'
        });
      }

      console.log(`✅ Found coordinates for: ${substation.noGardu}`);

      res.json({
        success: true,
        data: {
          id: substation.id,
          noGardu: substation.noGardu,
          namaLokasiGardu: substation.namaLokasiGardu,
          latitude: substation.latitude,
          longitude: substation.longitude
        }
      });
    } catch (err) {
      console.error('💥 Coordinates GET error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: err.message
      });
    }
  }

  // PATCH - Update coordinates
  else if (req.method === 'PATCH') {
    try {
      console.log('🌍 PATCH coordinates request:', req.body);
      const { latitude, longitude } = req.body;
      
      console.log('📝 Coordinates data:', { id, latitude, longitude });

      // Validasi input
      if (latitude === undefined || longitude === undefined) {
        return res.status(400).json({ 
          success: false, 
          message: 'Latitude and longitude are required.' 
        });
      }

      // Validasi range koordinat
      if (latitude < -90 || latitude > 90) {
        return res.status(400).json({ 
          success: false, 
          message: 'Latitude must be between -90 and 90.' 
        });
      }

      if (longitude < -180 || longitude > 180) {
        return res.status(400).json({ 
          success: false, 
          message: 'Longitude must be between -180 and 180.' 
        });
      }

      const updatedSubstation = await db.substation.update({
        where: { id },
        data: { 
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          lastUpdate: new Date()
        }
      });

      console.log('✅ Coordinates updated:', updatedSubstation.id);
      console.log('📝 New coordinates:', { latitude: updatedSubstation.latitude, longitude: updatedSubstation.longitude });

      res.json({
        success: true,
        data: {
          id: updatedSubstation.id,
          noGardu: updatedSubstation.noGardu,
          namaLokasiGardu: updatedSubstation.namaLokasiGardu,
          latitude: updatedSubstation.latitude,
          longitude: updatedSubstation.longitude,
          lastUpdate: updatedSubstation.lastUpdate
        },
        message: 'Coordinates updated successfully'
      });
    } catch (err) {
      console.error('💥 Coordinates PATCH error:', err);
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