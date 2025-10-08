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
      // Clamp limit to prevent excessive loads
      const MAX_LIMIT = 1000;
      const parsedLimit = parseInt(limit);
      const safeLimit = Math.min(Math.max(Number.isFinite(parsedLimit) ? parsedLimit : 100, 1), MAX_LIMIT);
      const parsedPage = parseInt(page);
      const safePage = Math.max(Number.isFinite(parsedPage) ? parsedPage : 1, 1);
      
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
        take: safeLimit,
        skip: (safePage - 1) * safeLimit,
        orderBy: { no: 'asc' }
      });

      // Ensure photoUrl columns exist and merge into results (best-effort; ignore permission errors)
      try {
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrl" TEXT');
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlR" TEXT');
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlS" TEXT');
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlT" TEXT');
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlN" TEXT');
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlPP" TEXT');
        await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrlPN" TEXT');
      } catch (e) {
        console.warn('⚠️ Skipping ALTER TABLE for photo columns (likely no permission):', e.message);
      }
      try {
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
      } catch (e) {
        console.warn('⚠️ Skipping photoUrl merge (columns may not exist):', e.message);
      }

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
      
      const substationData = req.body || {};
      console.log('📝 Substation data:', substationData);

      // Basic required fields validation
      const required = ['ulp','noGardu','namaLokasiGardu','jenis','merek','daya','tahun','phasa'];
      const missing = required.filter(k => !substationData[k] || String(substationData[k]).trim() === '');
      if (missing.length) {
        return res.status(400).json({
          success: false,
          error: 'Validation error',
          details: `Field wajib belum diisi: ${missing.join(', ')}`,
        });
      }

      // Sanitize/coerce inputs
      const toStringSafe = (v, def = '') => (v === null || v === undefined ? def : String(v));
      const toIntSafe = (v, def = 0) => {
        const n = parseInt(v);
        return Number.isFinite(n) ? n : def;
      };
      const toFloatOrNull = (v) => {
        if (v === undefined || v === null || v === '') return null;
        const n = parseFloat(v);
        return Number.isFinite(n) ? n : null;
      };
      const toDateSafe = (v) => {
        const d = v ? new Date(v) : new Date();
        return isNaN(d.getTime()) ? new Date() : d;
      };

      // Generate a safe 32-bit integer for 'no' when missing/invalid
      const generateSafeNo = () => {
        const seconds = Math.floor(Date.now() / 1000);
        // keep within signed 32-bit range
        return seconds % 2000000000;
      };

      const createData = {
        no: toIntSafe(substationData.no, generateSafeNo()),
        ulp: toStringSafe(substationData.ulp),
        noGardu: toStringSafe(substationData.noGardu),
        namaLokasiGardu: toStringSafe(substationData.namaLokasiGardu),
        jenis: toStringSafe(substationData.jenis),
        merek: toStringSafe(substationData.merek),
        daya: toStringSafe(substationData.daya),
        tahun: toStringSafe(substationData.tahun),
        phasa: toStringSafe(substationData.phasa),
        tap_trafo_max_tap: toStringSafe(substationData.tap_trafo_max_tap),
        penyulang: toStringSafe(substationData.penyulang),
        arahSequence: toStringSafe(substationData.arahSequence),
        tanggal: toDateSafe(substationData.tanggal),
        status: toStringSafe(substationData.status, 'normal'),
        is_active: toIntSafe(substationData.is_active, 1),
        ugb: toIntSafe(substationData.ugb, 0),
        latitude: toFloatOrNull(substationData.latitude),
        longitude: toFloatOrNull(substationData.longitude),
      };

      const newSubstation = await db.substation.create({ data: createData });

      console.log('✅ Substation created:', newSubstation.id);

      // Auto-generate measurements untuk gardu baru
      const month = toDateSafe(substationData.tanggal).toISOString().slice(0, 7); // Format: YYYY-MM
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
      try {
        await Promise.all([
          db.measurementSiang.createMany({ data: siangMeasurements }),
          db.measurementMalam.createMany({ data: malamMeasurements }),
        ]);
      } catch (meErr) {
        console.error('❌ Failed to create initial measurements:', meErr);
        // Do not fail the whole request; continue with created substation
      }

      console.log('✅ Auto-generated measurements for substation:', newSubstation.id);

      res.json({
        success: true,
        data: newSubstation,
        message: 'Substation created successfully with auto-generated measurements'
      });
    } catch (err) {
      console.error('💥 Substation POST error:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        payloadSample: {
          // small sample for debugging
          ulp: req.body?.ulp,
          noGardu: req.body?.noGardu,
        }
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