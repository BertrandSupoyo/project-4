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

  // PATCH - Update substation (supports photo and coordinates)
  else if (req.method === 'PATCH') {
    try {
      console.log('🏭 PATCH update request:', req.body);
      const updateData = req.body || {};

      // Handle imageBase64 -> upload to blob (if token available) or store as data URL
      let photoUrlToSet;
      if (typeof updateData.imageBase64 === 'string' && updateData.imageBase64.length > 0) {
        const isDataUrl = updateData.imageBase64.startsWith('data:') && updateData.imageBase64.includes(';base64,');
        const dataUrl = isDataUrl ? updateData.imageBase64 : `data:image/jpeg;base64,${updateData.imageBase64}`;

        const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
        if (blobToken) {
          try {
            // Upload to Vercel Blob
            const uploadRes = await fetch('https://blob.vercel-storage.com', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${blobToken}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                content: dataUrl,
                encoding: 'base64-data-url',
                contentType: 'image/jpeg',
              })
            });
            if (!uploadRes.ok) {
              const errTxt = await uploadRes.text().catch(() => 'upload failed');
              console.error('Blob upload failed:', errTxt);
              photoUrlToSet = dataUrl; // fallback
            } else {
              const body = await uploadRes.json().catch(() => ({}));
              if (body?.url) {
                photoUrlToSet = body.url; // public URL
              } else {
                photoUrlToSet = dataUrl; // fallback
              }
            }
          } catch (e) {
            console.error('Blob upload error:', e);
            photoUrlToSet = dataUrl; // fallback
          }
        } else {
          photoUrlToSet = dataUrl; // fallback without Blob
        }

        // Ensure column exists
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrl" TEXT');
      }

      // Build filtered fields
      const allowedFields = ['is_active', 'status', 'daya', 'lastUpdate', 'ugb', 'latitude', 'longitude', 'tanggal'];
      const filteredData = {};
      for (const key of allowedFields) {
        if (updateData[key] !== undefined) {
          filteredData[key] = updateData[key];
        }
      }

      // Normalize coordinates if provided as strings
      if (filteredData.latitude !== undefined) filteredData.latitude = parseFloat(filteredData.latitude);
      if (filteredData.longitude !== undefined) filteredData.longitude = parseFloat(filteredData.longitude);

      // If photo was provided, update via raw SQL to avoid client mismatch
      if (photoUrlToSet) {
        const updated = await db.$queryRawUnsafe(
          'UPDATE "substations" SET "photoUrl" = $1, "lastUpdate" = NOW() WHERE id = $2 RETURNING *',
          photoUrlToSet,
          id
        );
        // Also update any other filtered fields if present
        if (Object.keys(filteredData).length > 0) {
          await db.substation.update({ where: { id }, data: filteredData });
        }
        if (!updated || updated.length === 0) {
          return res.status(404).json({ success: false, error: 'Substation not found' });
        }
        return res.json({ success: true, data: updated[0], message: 'Substation updated successfully' });
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