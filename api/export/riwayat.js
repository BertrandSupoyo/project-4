import { PrismaClient } from '../../prisma/app/generated/prisma-client/index.js'
import { withAccelerate } from '@prisma/extension-accelerate'
import { buildSubstationWorkbook } from './workbookTemplate.js'

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

function validateDateParams(month, year) {
  const errors = [];
  
  if (month) {
    const monthNum = parseInt(month);
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      errors.push('Parameter month harus antara 1-12');
    }
  }
  
  if (year) {
    const yearNum = parseInt(year);
    if (isNaN(yearNum) || yearNum < 2000 || yearNum > 2100) {
      errors.push('Parameter year harus antara 2000-2100');
    }
  }
  
  return errors;
}

function buildDateFilter(month, year) {
  if (!month && !year) {
    return {};
  }
  
  let startDate, endDate;
  
  if (month && year) {
    startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    endDate = new Date(parseInt(year), parseInt(month), 1);
    endDate.setMilliseconds(-1);
  } else if (year) {
    startDate = new Date(parseInt(year), 0, 1);
    endDate = new Date(parseInt(year) + 1, 0, 1);
    endDate.setMilliseconds(-1);
  } else {
    return {};
  }
  
  console.log('📅 Date filter range:', { 
    startDate: startDate.toISOString(), 
    endDate: endDate.toISOString() 
  });
  
  return {
    tanggal: {
      gte: startDate,
      lte: endDate
    }
  };
}

function generateFilename(month, year) {
  const monthNames = ['', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
                     'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
  
  if (month && year) {
    return `riwayat_pengukuran_${monthNames[parseInt(month)]}_${year}`;
  } else if (year) {
    return `riwayat_pengukuran_${year}`;
  }
  
  return 'riwayat_pengukuran';
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST, PUT, DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  let db;
  
  try {
    const { month, year, action, measurementId: measurementIdParam } = req.query || {};
    const measurementId = measurementIdParam ? parseInt(measurementIdParam, 10) : null;

    // ============ UPDATE MEASUREMENT (PUT) ============
    if (req.method === 'PUT' && measurementId) {
      db = await initPrisma();

      if (req.body?.unbalanced === undefined || req.body?.unbalanced === null) {
        return res.status(400).json({ error: 'Field unbalanced wajib diisi' });
      }

      const { reason, changedBy = 'admin', unbalanced } = req.body;

      // helper: find record in siang/malam
      const findMeasurement = async (id) => {
        let record = await db.measurementSiang.findUnique({ where: { id } });
        if (record) return { record, type: 'siang' };
        record = await db.measurementMalam.findUnique({ where: { id } });
        if (record) return { record, type: 'malam' };
        return null;
      };

      const measurementData = await findMeasurement(measurementId);
      if (!measurementData) {
        return res.status(404).json({ error: 'Measurement tidak ditemukan' });
      }

      const { record: oldRecord, type } = measurementData;

      // mark old record as SUPERSEDED
      if (type === 'siang') {
        await db.measurementSiang.update({
          where: { id: measurementId },
          data: { status: 'SUPERSEDED' }
        });
      } else {
        await db.measurementMalam.update({
          where: { id: measurementId },
          data: { status: 'SUPERSEDED' }
        });
      }

      const newData = {
        substationId: oldRecord.substationId,
        month: oldRecord.month,
        r: oldRecord.r,
        s: oldRecord.s,
        t: oldRecord.t,
        n: oldRecord.n,
        rn: oldRecord.rn,
        sn: oldRecord.sn,
        tn: oldRecord.tn,
        pp: oldRecord.pp,
        pn: oldRecord.pn,
        row_name: oldRecord.row_name,
        unbalanced: Number(unbalanced),
        rata2: oldRecord.rata2,
        kva: oldRecord.kva,
        persen: oldRecord.persen,
        status: 'ACTIVE'
      };

      const newRecord =
        type === 'siang'
          ? await db.measurementSiang.create({ data: newData })
          : await db.measurementMalam.create({ data: newData });

      const auditData = {
        measurementId,
        oldValue: oldRecord.unbalanced,
        newValue: Number(unbalanced),
        changedBy,
        changeReason: reason || 'Update data pengukuran'
      };

      if (type === 'siang') {
        await db.measurementSiangAuditLog.create({ data: auditData });
      } else {
        await db.measurementMalamAuditLog.create({ data: auditData });
      }

      return res.status(200).json({
        success: true,
        message: 'Measurement updated successfully',
        old_id: measurementId,
        new_id: newRecord.id,
        old_value: oldRecord.unbalanced,
        new_value: newRecord.unbalanced
      });
    }

    // ============ GET AUDIT LOG (GET) ============
    if (req.method === 'GET' && action === 'audit-log' && measurementId) {
      db = await initPrisma();
      let auditLogs = await db.measurementSiangAuditLog.findMany({
        where: { measurementId },
        orderBy: { changedAt: 'desc' }
      });

      if (!auditLogs || auditLogs.length === 0) {
        auditLogs = await db.measurementMalamAuditLog.findMany({
          where: { measurementId },
          orderBy: { changedAt: 'desc' }
        });
      }

      return res.status(200).json(auditLogs);
    }

    // ============ EXPORT RIWAYAT (GET) ============
    if (req.method === 'GET') {
      const { month, year } = req.query;
      
      console.log('📥 Export request with filters:', { month, year });
      
      const validationErrors = validateDateParams(month, year);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Invalid parameters',
          details: validationErrors
        });
      }
      
      if (month && !year) {
        return res.status(400).json({
          success: false,
          error: 'Invalid parameters',
          message: 'Parameter year wajib diisi jika menggunakan filter month'
        });
      }
      
      db = await initPrisma();
      
      const dateFilter = buildDateFilter(month, year);
      
      let substations;
      try {
        substations = await db.substation.findMany({
          where: dateFilter,
          orderBy: { no: 'asc' },
          include: {
            measurements_siang: {
              where: { status: 'ACTIVE' }, // Filter ACTIVE only
              orderBy: { row_name: 'asc' }
            },
            measurements_malam: {
              where: { status: 'ACTIVE' }, // Filter ACTIVE only
              orderBy: { row_name: 'asc' }
            }
          }
        });
      } catch (dbError) {
        console.error('❌ Database query error:', dbError);
        throw new Error(`Gagal mengambil data dari database: ${dbError.message}`);
      }

      console.log(`📊 Found ${substations.length} substations`);

      if (!substations || substations.length === 0) {
        const filterDesc = month && year 
          ? `bulan ${month} tahun ${year}` 
          : year 
            ? `tahun ${year}` 
            : 'tanpa filter';
          
        return res.status(404).json({ 
          success: false,
          error: 'No data found', 
          message: `Tidak ada data untuk ${filterDesc}. Pastikan data sudah diinput.`,
          filter: { month, year }
        });
      }

      const data = substations.map(sub => ({
        substation: sub,
        siang: sub.measurements_siang || [],
        malam: sub.measurements_malam || []
      }));

      console.log('📝 Generating Excel workbook...');
      const workbook = buildSubstationWorkbook(data, { sheetName: 'Riwayat Pengukuran' });

      const filename = generateFilename(month, year);
      console.log(`📤 Sending file: ${filename}.xlsx`);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);

      await workbook.xlsx.write(res);
      res.end();

      console.log(`✅ Excel exported successfully: ${filename}.xlsx (${substations.length} substations)`);
      return;
    }

    // ============ UPDATE MEASUREMENT (PUT) ============
    if (req.method === 'PUT' && req.url?.includes('/api/measurements/')) {
      db = await initPrisma();
      const idMatch = req.url.match(/\/api\/measurements\/(\d+)$/);
      
      if (!idMatch) {
        return res.status(400).json({ error: 'Invalid measurement ID' });
      }

      const measurementId = parseInt(idMatch[1]);
      const { unbalanced, reason } = req.body;

      if (unbalanced === undefined) {
        return res.status(400).json({ error: 'Field unbalanced wajib diisi' });
      }

      try {
        // Try to find in measurement_siang first
        let oldRecord = await db.measurementSiang.findUnique({
          where: { id: measurementId }
        });
        let isSiang = true;
        
        if (!oldRecord) {
          // Try measurement_malam
          oldRecord = await db.measurementMalam.findUnique({
            where: { id: measurementId }
          });
          isSiang = false;
        }

        if (!oldRecord) {
          return res.status(404).json({ error: 'Measurement tidak ditemukan' });
        }

        // Mark old as SUPERSEDED
        if (isSiang) {
          await db.measurementSiang.update({
            where: { id: measurementId },
            data: { status: 'SUPERSEDED' }
          });
        } else {
          await db.measurementMalam.update({
            where: { id: measurementId },
            data: { status: 'SUPERSEDED' }
          });
        }

        // Create new record with ACTIVE status
        const newData = {
          substationId: oldRecord.substationId,
          month: oldRecord.month,
          r: oldRecord.r,
          s: oldRecord.s,
          t: oldRecord.t,
          n: oldRecord.n,
          rn: oldRecord.rn,
          sn: oldRecord.sn,
          tn: oldRecord.tn,
          pp: oldRecord.pp,
          pn: oldRecord.pn,
          row_name: oldRecord.row_name,
          unbalanced: parseFloat(unbalanced.toString()),
          rata2: oldRecord.rata2,
          kva: oldRecord.kva,
          persen: oldRecord.persen,
          status: 'ACTIVE'
        };

        const newRecord = isSiang 
          ? await db.measurementSiang.create({ data: newData })
          : await db.measurementMalam.create({ data: newData });

        // Create audit log
        if (isSiang) {
          await db.measurementSiangAuditLog.create({
            data: {
              measurementId: measurementId,
              oldValue: oldRecord.unbalanced,
              newValue: parseFloat(unbalanced.toString()),
              changedBy: 'admin',
              changeReason: reason || 'Update data pengukuran'
            }
          });
        } else {
          await db.measurementMalamAuditLog.create({
            data: {
              measurementId: measurementId,
              oldValue: oldRecord.unbalanced,
              newValue: parseFloat(unbalanced.toString()),
              changedBy: 'admin',
              changeReason: reason || 'Update data pengukuran'
            }
          });
        }

        res.status(200).json({
          success: true,
          message: 'Measurement updated successfully',
          old_id: measurementId,
          new_id: newRecord.id,
          old_value: oldRecord.unbalanced,
          new_value: newRecord.unbalanced
        });
      } catch (error) {
        console.error('Error updating measurement:', error);
        res.status(500).json({
          error: 'Gagal mengupdate measurement',
          details: error.message
        });
      }
      return;
    }

    // ============ GET AUDIT LOG (GET) ============
    if (req.method === 'GET' && req.url?.includes('/api/measurements/') && req.url?.includes('/audit-log')) {
      db = await initPrisma();
      const idMatch = req.url.match(/\/api\/measurements\/(\d+)\/audit-log/);
      
      if (!idMatch) {
        return res.status(400).json({ error: 'Invalid measurement ID' });
      }

      const measurementId = parseInt(idMatch[1]);

      try {
        // Try to find in measurement_siang first
        let auditLogs = await db.measurementSiangAuditLog.findMany({
          where: { measurementId: measurementId },
          orderBy: { changedAt: 'desc' }
        });
        
        if (auditLogs.length === 0) {
          // Try measurement_malam
          auditLogs = await db.measurementMalamAuditLog.findMany({
            where: { measurementId: measurementId },
            orderBy: { changedAt: 'desc' }
          });
        }

        res.status(200).json(auditLogs);
      } catch (error) {
        console.error('Error getting audit log:', error);
        res.status(500).json({
          error: 'Gagal mengambil audit log',
          details: error.message
        });
      }
      return;
    }

    // Method not allowed
    res.status(405).json({ 
      error: 'Method not allowed',
      method: req.method
    });

  } catch (error) {
    console.error('💥 Handler error:', error);
    
    if (res.headersSent) {
      console.error('⚠️  Headers already sent');
      return;
    }
    
    res.status(500).json({
      error: 'Internal server error',
      details: error.message
    });
  } finally {
    if (db) {
      try {
        await db.$disconnect();
        console.log('🔌 Database disconnected');
      } catch (disconnectError) {
        console.warn('⚠️  Failed to disconnect database:', disconnectError);
      }
    }
  }
}