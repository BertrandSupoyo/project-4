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

      // Ensure columns exist and fetch photo URLs (single + six variants)
      await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrl" TEXT');
      await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlR" TEXT');
      await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlS" TEXT');
      await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlT" TEXT');
      await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlN" TEXT');
      await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlPP" TEXT');
      await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlPN" TEXT');

      const rows = await db.$queryRawUnsafe('SELECT id, "photoUrl", "photoUrlR", "photoUrlS", "photoUrlT", "photoUrlN", "photoUrlPP", "photoUrlPN" FROM "substations" WHERE id = $1', id);
      if (rows && rows.length > 0) {
        const r = rows[0];
        substation.photoUrl = r.photoUrl || null;
        substation.photoUrlR = r.photoUrlR || null;
        substation.photoUrlS = r.photoUrlS || null;
        substation.photoUrlT = r.photoUrlT || null;
        substation.photoUrlN = r.photoUrlN || null;
        substation.photoUrlPP = r.photoUrlPP || null;
        substation.photoUrlPN = r.photoUrlPN || null;
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

      // Handle imageBase64 with optional photoKind -> upload to blob (if token available) or store as data URL
      let photoUrlToSet;
      let photoColumnToSet; // one of photoUrl, photoUrlR/S/T/N/PP/PN
      if (typeof updateData.imageBase64 === 'string' && updateData.imageBase64.length > 0) {
        const isDataUrl = updateData.imageBase64.startsWith('data:') && updateData.imageBase64.includes(';base64,');
        const dataUrl = isDataUrl ? updateData.imageBase64 : `data:image/jpeg;base64,${updateData.imageBase64}`;

        const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
        if (blobToken) {
          try {
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
              photoUrlToSet = dataUrl;
            } else {
              const body = await uploadRes.json().catch(() => ({}));
              photoUrlToSet = body?.url || dataUrl;
            }
          } catch (e) {
            console.error('Blob upload error:', e);
            photoUrlToSet = dataUrl;
          }
        } else {
          photoUrlToSet = dataUrl;
        }

        // Decide column to set
        const kind = String(updateData.photoKind || '').toUpperCase();
        const kindToColumn = {
          'R': 'photoUrlR',
          'S': 'photoUrlS',
          'T': 'photoUrlT',
          'N': 'photoUrlN',
          'PP': 'photoUrlPP',
          'PN': 'photoUrlPN',
        };
        photoColumnToSet = kindToColumn[kind] || 'photoUrl';

        // Ensure columns exist
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrl" TEXT');
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlR" TEXT');
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlS" TEXT');
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlT" TEXT');
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlN" TEXT');
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlPP" TEXT');
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlPN" TEXT');
      }

      // Build filtered fields
      const allowedFields = ['is_active', 'status', 'daya', 'lastUpdate', 'ugb', 'latitude', 'longitude', 'tanggal'];
      const filteredData = {};
      for (const key of allowedFields) {
        if (updateData[key] !== undefined) {
          filteredData[key] = updateData[key];
        }
      }

      if (filteredData.latitude !== undefined) filteredData.latitude = parseFloat(filteredData.latitude);
      if (filteredData.longitude !== undefined) filteredData.longitude = parseFloat(filteredData.longitude);

      if (photoUrlToSet) {
        // Update specific photo column via unsafe query
        const updated = await db.$queryRawUnsafe(
          `UPDATE "substations" SET "${photoColumnToSet}" = $1, "lastUpdate" = NOW() WHERE id = $2 RETURNING *`,
          photoUrlToSet,
          id
        );
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