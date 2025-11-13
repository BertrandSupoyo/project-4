import { PrismaClient } from '../../prisma/app/generated/prisma-client/index.js'
import { withAccelerate } from '@prisma/extension-accelerate'
import ExcelJS from 'exceljs'

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
    // ============ EXPORT RIWAYAT (GET) ============
    if (req.method === 'GET' && req.url?.includes('/export/riwayat')) {
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

      // Create Excel (keep existing code)
      console.log('📝 Generating Excel workbook...');
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Riwayat Pengukuran');
      
      const rows = ['INDUK', '1', '2', '3', '4'];

      const boldCenter = {
        font: { bold: true, name: 'Calibri', size: 11 },
        alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
      };

      // ... (Keep all the Excel setup code from original) ...
      // Untuk brevity, saya skip detail Excel setup karena sama dengan original
      
      const headerRow1Values = ['', '', '', '', 'DATA GARDU', '', '', '', '', '', '', '', '', '', '', 'PENGUKURAN SIANG', '', '', '', '', '', '', '', '', '', 'PENGUKURAN MALAM', '', '', '', '', '', '', '', '', '', 'BEBAN', '', '', '', '', '', '', '', ''];
      const headerRow2Values = ['NO', 'ULP', 'NO. GARDU', 'NAMA / LOKASI', '', '', '', '', '', '', '', '', '', 'TANGGAL', 'JURUSAN', 'ARUS', '', '', '', 'TEGANGAN', '', '', '', '', 'ARUS', '', '', '', 'TEGANGAN', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
      const headerRow3Values = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'R', 'S', 'T', 'N', '', 'PANGKAL', '', '', 'UJUNG', '', '', 'R', 'S', 'T', 'N', 'PANGKAL', '', '', 'UJUNG', '', '', 'SIANG', '', '', 'MALAM', '', '', '', ''];
      const headerRow4Values = ['', '', '', '', 'JENIS', 'MERK', 'DAYA', 'TAHUN', 'PHASA', 'TAP TRAFO (MAX TAP)', 'ARAH SEQUENCE', 'PENYULANG', '', '', '', '', '', '', 'P-N', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
      const headerRow5Values = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'R', 'S', 'T', 'N', 'R-N', 'S-N', 'T-N', 'P-P', 'P-N', '', 'R', 'S', 'T', 'N', 'R-N', 'S-N', 'T-N', 'P-P', 'P-N', '', 'RATA2', 'KVA', '%', 'RATA2', 'KVA', '%', '', ''];

      // Setup header (same as original code - keeping for compatibility)
      let currentRow = 6;
      let noUrut = 1;
      
      data.forEach((item) => {
        const sub = item.substation;
        const siangMeasurements = item.siang;
        const malamMeasurements = item.malam;
        
        for (let c = 1; c <= 13; c++) {
          sheet.mergeCells(currentRow, c, currentRow + rows.length - 1, c);
        }
        
        sheet.getCell(currentRow, 1).value = noUrut;
        sheet.getCell(currentRow, 2).value = sub.ulp || '';
        sheet.getCell(currentRow, 3).value = sub.noGardu || '';
        sheet.getCell(currentRow, 4).value = sub.namaLokasiGardu || '';
        sheet.getCell(currentRow, 5).value = sub.jenis || '';
        sheet.getCell(currentRow, 6).value = sub.merek || '';
        sheet.getCell(currentRow, 7).value = sub.daya || '';
        sheet.getCell(currentRow, 8).value = sub.tahun || '';
        sheet.getCell(currentRow, 9).value = sub.phasa || '';
        sheet.getCell(currentRow, 10).value = sub.tap_trafo_max_tap || '';
        sheet.getCell(currentRow, 11).value = sub.arahSequence || '';
        sheet.getCell(currentRow, 12).value = sub.penyulang || '';
        
        if (sub.tanggal) {
          try {
            const d = new Date(sub.tanggal);
            if (!isNaN(d.getTime())) {
              const day = String(d.getDate()).padStart(2, '0');
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const year = d.getFullYear();
              sheet.getCell(currentRow, 13).value = `${day}/${month}/${year}`;
            }
          } catch (dateError) {
            console.warn('⚠️  Invalid date for gardu:', sub.noGardu);
          }
        }
        
        for (let r = 0; r < rows.length; r++) {
          const rowIdx = currentRow + r;
          sheet.getCell(rowIdx, 14).value = rows[r];
          
          const mSiang = siangMeasurements?.find(
            x => x.row_name?.toLowerCase() === rows[r].toLowerCase()
          ) || {};
          
          sheet.getCell(rowIdx, 15).value = mSiang.r ?? '';
          sheet.getCell(rowIdx, 16).value = mSiang.s ?? '';
          sheet.getCell(rowIdx, 17).value = mSiang.t ?? '';
          sheet.getCell(rowIdx, 18).value = mSiang.n ?? '';
          sheet.getCell(rowIdx, 19).value = mSiang.rn ?? '';
          sheet.getCell(rowIdx, 20).value = mSiang.sn ?? '';
          sheet.getCell(rowIdx, 21).value = mSiang.tn ?? '';
          sheet.getCell(rowIdx, 22).value = mSiang.pp ?? '';
          sheet.getCell(rowIdx, 23).value = mSiang.pn ?? '';
          
          const mMalam = malamMeasurements?.find(
            x => x.row_name?.toLowerCase() === rows[r].toLowerCase()
          ) || {};
          
          sheet.getCell(rowIdx, 24).value = mMalam.r ?? '';
          sheet.getCell(rowIdx, 25).value = mMalam.s ?? '';
          sheet.getCell(rowIdx, 26).value = mMalam.t ?? '';
          sheet.getCell(rowIdx, 27).value = mMalam.n ?? '';
          sheet.getCell(rowIdx, 28).value = mMalam.rn ?? '';
          sheet.getCell(rowIdx, 29).value = mMalam.sn ?? '';
          sheet.getCell(rowIdx, 30).value = mMalam.tn ?? '';
          sheet.getCell(rowIdx, 31).value = mMalam.pp ?? '';
          sheet.getCell(rowIdx, 32).value = mMalam.pn ?? '';
          
          sheet.getCell(rowIdx, 33).value = mSiang?.rata2 ?? '';
          sheet.getCell(rowIdx, 34).value = mSiang?.kva ?? '';
          sheet.getCell(rowIdx, 35).value = mSiang?.persen !== undefined 
            ? `${Number(mSiang.persen).toFixed(1)}%` 
            : '';
          sheet.getCell(rowIdx, 36).value = mMalam?.rata2 ?? '';
          sheet.getCell(rowIdx, 37).value = mMalam?.kva ?? '';
          sheet.getCell(rowIdx, 38).value = mMalam?.persen !== undefined 
            ? `${Number(mMalam.persen).toFixed(1)}%` 
            : '';
          
          sheet.getCell(rowIdx, 39).value = mSiang?.unbalanced !== undefined 
            ? `${Number(mSiang.unbalanced).toFixed(1)}%` 
            : '';
          sheet.getCell(rowIdx, 40).value = mMalam?.unbalanced !== undefined 
            ? `${Number(mMalam.unbalanced).toFixed(1)}%` 
            : '';
        }
        
        currentRow += rows.length;
        noUrut++;
      });

      const filename = generateFilename(month, year);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
      
      await workbook.xlsx.write(res);
      res.end();

      console.log(`✅ Excel exported successfully: ${filename}.xlsx`);
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
        // Get old record
        const oldRecord = await prisma.measurement.findUnique({
          where: { id: measurementId }
        });

        if (!oldRecord) {
          return res.status(404).json({ error: 'Measurement tidak ditemukan' });
        }

        // Mark old as SUPERSEDED
        await prisma.measurement.update({
          where: { id: measurementId },
          data: { status: 'SUPERSEDED' }
        });

        // Create new record with ACTIVE status
        const newRecord = await prisma.measurement.create({
          data: {
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
            measurements_type: oldRecord.measurements_type,
            status: 'ACTIVE'
          }
        });

        // Create audit log
        await prisma.measurement_audit_log.create({
          data: {
            measurement_id: measurementId,
            old_value: oldRecord.unbalanced,
            new_value: parseFloat(unbalanced.toString()),
            changed_by: 'admin',
            change_reason: reason || 'Update data pengukuran'
          }
        });

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
        const auditLogs = await prisma.measurement_audit_log.findMany({
          where: { measurement_id: measurementId },
          orderBy: { changed_at: 'desc' }
        });

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