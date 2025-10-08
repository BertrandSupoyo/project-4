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
            orderBy: { row_name: 'asc' }
          },
          measurements_malam: {
            orderBy: { row_name: 'asc' }
          }
        }
      });

      // Ensure photoUrl columns exist and merge into results (ignore DDL errors in serverless envs)
      try {
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrl" TEXT');
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlR" TEXT');
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlS" TEXT');
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlT" TEXT');
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlN" TEXT');
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlPP" TEXT');
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlPN" TEXT');
      } catch (ddlErr) {
        console.warn('⚠️  Skipping photoUrl DDL:', ddlErr?.message || ddlErr);
      }
      if (substations.length > 0) {
        const ids = substations.map(s => s.id);
        const placeholders = ids.map((_, i) => `$${i + 1}`).join(',');
        const rows = await db.$queryRawUnsafe(
          `SELECT id, "photoUrl", "photoUrlR", "photoUrlS", "photoUrlT", "photoUrlN", "photoUrlPP", "photoUrlPN" FROM "substations" WHERE id IN (${placeholders})`,
          ...ids
        );
        const map = new Map(rows.map(r => [r.id, r]));
        for (const s of substations) {
          const r = map.get(s.id);
          if (r) {
            s.photoUrl = r.photoUrl || null;
            s.photoUrlR = r.photoUrlR || null;
            s.photoUrlS = r.photoUrlS || null;
            s.photoUrlT = r.photoUrlT || null;
            s.photoUrlN = r.photoUrlN || null;
            s.photoUrlPP = r.photoUrlPP || null;
            s.photoUrlPN = r.photoUrlPN || null;
          }
        }
      }

      console.log(`✅ Found ${substations.length} substations`);

      res.json({
        success: true,
        data: substations
      });
    } catch (err) {
      console.error('💥 Substations GET error:', err);
      // Fail-soft: allow UI to render while we inspect logs
      res.status(200).json({
        success: true,
        data: [],
        warning: 'Substations fallback due to error',
        details: err?.message || String(err)
      });
    }
  }

  // POST - Create substation
  else if (req.method === 'POST') {
    try {
      console.log('🏭 Creating substation...');
      
      const substationData = req.body || {};
      console.log('📝 Substation data:', substationData);

      // Validate required fields to avoid 500
      const required = ['noGardu','namaLokasiGardu','ulp','jenis','merek','daya','tahun','phasa','tanggal'];
      const missing = required.filter((k) => !substationData[k] || String(substationData[k]).trim() === '');
      if (missing.length) {
        console.warn('⚠️ Missing required fields:', missing);
        return res.status(400).json({ success: false, error: 'Missing required fields', details: missing });
      }

      // Safeguard for field 'no' (Postgres Int32). Compute next sequential no; ignore client-provided value.
      const agg = await db.substation.aggregate({ _max: { no: true } });
      const maxNo = agg?._max?.no || 0;
      const safeNo = maxNo + 1;

      // Coerce coordinates to float if provided as string
      const lat = substationData.latitude !== undefined && substationData.latitude !== null
        ? Number(substationData.latitude)
        : null;
      const lng = substationData.longitude !== undefined && substationData.longitude !== null
        ? Number(substationData.longitude)
        : null;

      const newSubstation = await db.substation.create({
        data: {
          no: safeNo,
          ulp: substationData.ulp,
          noGardu: substationData.noGardu,
          namaLokasiGardu: substationData.namaLokasiGardu,
          jenis: substationData.jenis,
          merek: substationData.merek,
          daya: substationData.daya,
          tahun: substationData.tahun,
          phasa: substationData.phasa,
          tap_trafo_max_tap: substationData.tap_trafo_max_tap || '',
          penyulang: substationData.penyulang || '',
          arahSequence: substationData.arahSequence || '',
          tanggal: new Date(substationData.tanggal),
          status: substationData.status || 'normal',
          is_active: substationData.is_active || 1,
          ugb: substationData.ugb || 0,
          latitude: lat !== null && !Number.isNaN(lat) ? lat : null,
          longitude: lng !== null && !Number.isNaN(lng) ? lng : null
        }
      });

      console.log('✅ Substation created:', newSubstation.id);

      // Auto-generate measurements untuk gardu baru
      const month = new Date(substationData.tanggal).toISOString().slice(0, 7); // Format: YYYY-MM
      const rowNames = ['induk', '1', '2', '3', '4'];
      
      // Buat measurements siang
      const siangMeasurements = rowNames.map(rowName => ({
        substationId: newSubstation.id,
        row_name: rowName,
        month: month,
        r: 0, s: 0, t: 0, n: 0,
        rn: 0, sn: 0, tn: 0,
        pp: 0, pn: 0,
        rata2: 0, kva: 0, persen: 0, unbalanced: 0,
        lastUpdate: new Date()
      }));

      // Buat measurements malam
      const malamMeasurements = rowNames.map(rowName => ({
        substationId: newSubstation.id,
        row_name: rowName,
        month: month,
        r: 0, s: 0, t: 0, n: 0,
        rn: 0, sn: 0, tn: 0,
        pp: 0, pn: 0,
        rata2: 0, kva: 0, persen: 0, unbalanced: 0,
        lastUpdate: new Date()
      }));

      // Insert measurements siang dan malam
      await Promise.all([
        db.measurementSiang.createMany({
          data: siangMeasurements
        }),
        db.measurementMalam.createMany({
          data: malamMeasurements
        })
      ]);

      console.log('✅ Auto-generated measurements for substation:', newSubstation.id);

      res.json({
        success: true,
        data: newSubstation,
        message: 'Substation created successfully with auto-generated measurements'
      });
    } catch (err) {
      console.error('💥 Substation POST error:', err?.stack || err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: err?.message || String(err)
      });
    }
  }

  // PATCH - Update substation
  else if (req.method === 'PATCH') {
    try {
      console.log('🏭 PATCH update request:', req.body);
      const { id } = req.query;
      const updateData = req.body;
      
      console.log('📝 Update data:', { id, updateData });

      const updatedSubstation = await db.substation.update({
        where: { id },
        data: updateData
      });

      console.log('✅ Substation updated:', updatedSubstation.id);
      console.log('📝 Updated fields:', updateData);
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