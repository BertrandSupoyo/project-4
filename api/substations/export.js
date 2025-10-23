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

// ✅ VALIDATION: Validate month and year parameters
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

// ✅ BUILD DATE FILTER: Create proper date range filter
function buildDateFilter(month, year) {
  if (!month && !year) {
    return {};
  }
  
  let startDate, endDate;
  
  if (month && year) {
    // Filter by specific month and year
    startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    endDate = new Date(parseInt(year), parseInt(month), 1);
    endDate.setMilliseconds(-1); // Last millisecond of the month
  } else if (year) {
    // Filter by year only
    startDate = new Date(parseInt(year), 0, 1);
    endDate = new Date(parseInt(year) + 1, 0, 1);
    endDate.setMilliseconds(-1);
  } else {
    // Month without year is invalid, return empty filter
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

// ✅ GENERATE FILENAME: Create descriptive filename based on filter
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false,
      error: 'Method not allowed',
      message: 'Hanya metode GET yang diperbolehkan' 
    });
  }

  let db;
  
  try {
    // ✅ EXTRACT & VALIDATE PARAMETERS
    const { month, year } = req.query;
    
    console.log('📥 Export request with filters:', { month, year });
    
    // Validate date parameters
    const validationErrors = validateDateParams(month, year);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        details: validationErrors
      });
    }
    
    // Check if month is provided without year
    if (month && !year) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        message: 'Parameter year wajib diisi jika menggunakan filter month'
      });
    }
    
    // ✅ INITIALIZE DATABASE
    db = await initPrisma();
    
    // ✅ BUILD FILTER
    const dateFilter = buildDateFilter(month, year);
    
    // ✅ FETCH DATA WITH ERROR HANDLING
    let substations;
    try {
      substations = await db.substation.findMany({
        where: dateFilter,
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
    } catch (dbError) {
      console.error('❌ Database query error:', dbError);
      throw new Error(`Gagal mengambil data dari database: ${dbError.message}`);
    }

    console.log(`📊 Found ${substations.length} substations`);

    // ✅ VALIDATE DATA EXISTS
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

    // ✅ TRANSFORM DATA
    const data = substations.map(sub => ({
      substation: sub,
      siang: sub.measurements_siang || [],
      malam: sub.measurements_malam || []
    }));

    // ✅ CREATE WORKBOOK
    console.log('📝 Generating Excel workbook...');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Riwayat Pengukuran');
    
    const rows = ['INDUK', '1', '2', '3', '4'];

    const boldCenter = {
      font: { bold: true, name: 'Calibri', size: 11 },
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
    };

    // --- HEADER SETUP ---
    const headerRow1Values = ['', '', '', '', 'DATA GARDU', '', '', '', '', '', '', '', '', '', '', 'PENGUKURAN SIANG', '', '', '', '', '', '', '', '', '', 'PENGUKURAN MALAM', '', '', '', '', '', '', '', '', '', 'BEBAN', '', '', '', '', '', '', '', ''];
    const headerRow2Values = ['NO', 'ULP', 'NO. GARDU', 'NAMA / LOKASI', '', '', '', '', '', '', '', '', '', 'TANGGAL', 'JURUSAN', 'ARUS', '', '', '', 'TEGANGAN', '', '', '', '', 'ARUS', '', '', '', 'TEGANGAN', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    const headerRow3Values = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'R', 'S', 'T', 'N', '', 'PANGKAL', '', '', 'UJUNG', '', '', 'R', 'S', 'T', 'N', 'PANGKAL', '', '', 'UJUNG', '', '', 'SIANG', '', '', 'MALAM', '', '', '', ''];
    const headerRow4Values = ['', '', '', '', 'JENIS', 'MERK', 'DAYA', 'TAHUN', 'PHASA', 'TAP TRAFO (MAX TAP)', 'ARAH SEQUENCE', 'PENYULANG', '', '', '', '', '', '', 'P-N', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    const headerRow5Values = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'R', 'S', 'T', 'N', 'R-N', 'S-N', 'T-N', 'P-P', 'P-N', '', 'R', 'S', 'T', 'N', 'R-N', 'S-N', 'T-N', 'P-P', 'P-N', '', 'RATA2', 'KVA', '%', 'RATA2', 'KVA', '%', '', ''];
    
    const allHeaderRows = [headerRow1Values, headerRow2Values, headerRow3Values, headerRow4Values, headerRow5Values];
    
    const headerMerges = [
      { s: { r: 1, c: 5 }, e: { r: 2, c: 12 }, value: 'DATA GARDU' },
      { s: { r: 1, c: 15 }, e: { r: 1, c: 23 }, value: 'PENGUKURAN SIANG' },
      { s: { r: 1, c: 24 }, e: { r: 1, c: 32 }, value: 'PENGUKURAN MALAM' },
      { s: { r: 1, c: 33 }, e: { r: 2, c: 38 }, value: 'BEBAN' },
      { s: { r: 1, c: 1 }, e: { r: 5, c: 1 }, value: 'NO' },
      { s: { r: 1, c: 2 }, e: { r: 5, c: 2 }, value: 'ULP' },
      { s: { r: 1, c: 3 }, e: { r: 5, c: 3 }, value: 'NO. GARDU' },
      { s: { r: 1, c: 4 }, e: { r: 5, c: 4 }, value: 'NAMA / LOKASI' },
      { s: { r: 1, c: 13 }, e: { r: 5, c: 13 }, value: 'TANGGAL' },
      { s: { r: 1, c: 14 }, e: { r: 5, c: 14 }, value: 'JURUSAN' },
      { s: { r: 1, c: 39 }, e: { r: 5, c: 39 }, value: 'UNBALANCED SIANG' },
      { s: { r: 1, c: 40 }, e: { r: 5, c: 40 }, value: 'UNBALANCED MALAM' },
      { s: { r: 2, c: 15 }, e: { r: 2, c: 18 }, value: 'ARUS' },
      { s: { r: 2, c: 19 }, e: { r: 2, c: 23 }, value: 'TEGANGAN' },
      { s: { r: 2, c: 24 }, e: { r: 2, c: 27 }, value: 'ARUS' },
      { s: { r: 2, c: 28 }, e: { r: 2, c: 32 }, value: 'TEGANGAN' },
      { s: { r: 3, c: 15 }, e: { r: 5, c: 15 }, value: 'R' },
      { s: { r: 3, c: 16 }, e: { r: 5, c: 16 }, value: 'S' },
      { s: { r: 3, c: 17 }, e: { r: 5, c: 17 }, value: 'T' },
      { s: { r: 3, c: 18 }, e: { r: 5, c: 18 }, value: 'N' },
      { s: { r: 3, c: 19 }, e: { r: 3, c: 22 }, value: 'PANGKAL' },
      { s: { r: 3, c: 23 }, e: { r: 3, c: 23 }, value: 'UJUNG' },
      { s: { r: 3, c: 24 }, e: { r: 5, c: 24 }, value: 'R' },
      { s: { r: 3, c: 25 }, e: { r: 5, c: 25 }, value: 'S' },
      { s: { r: 3, c: 26 }, e: { r: 5, c: 26 }, value: 'T' },
      { s: { r: 3, c: 27 }, e: { r: 5, c: 27 }, value: 'N' },
      { s: { r: 3, c: 28 }, e: { r: 3, c: 31 }, value: 'PANGKAL' },
      { s: { r: 3, c: 32 }, e: { r: 3, c: 32 }, value: 'UJUNG' },
      { s: { r: 3, c: 33 }, e: { r: 4, c: 35 }, value: 'SIANG' },
      { s: { r: 3, c: 36 }, e: { r: 4, c: 38 }, value: 'MALAM' },
      { s: { r: 3, c: 5 }, e: { r: 5, c: 5 }, value: 'JENIS' },
      { s: { r: 3, c: 6 }, e: { r: 5, c: 6 }, value: 'MERK' },
      { s: { r: 3, c: 7 }, e: { r: 5, c: 7 }, value: 'DAYA' },
      { s: { r: 3, c: 8 }, e: { r: 5, c: 8 }, value: 'TAHUN' },
      { s: { r: 3, c: 9 }, e: { r: 5, c: 9 }, value: 'PHASA' },
      { s: { r: 3, c: 10 }, e: { r: 5, c: 10 }, value: 'TAP TRAFO (MAX TAP)' },
      { s: { r: 3, c: 11 }, e: { r: 5, c: 11 }, value: 'ARAH SEQUENCE' },
      { s: { r: 3, c: 12 }, e: { r: 5, c: 12 }, value: 'PENYULANG' },
      { s: { r: 4, c: 19 }, e: { r: 4, c: 21 }, value: 'P-N' },
      { s: { r: 4, c: 28 }, e: { r: 4, c: 30 }, value: 'P-N' },
      { s: { r: 5, c: 19 }, e: { r: 5, c: 19 }, value: 'R-N' },
      { s: { r: 5, c: 20 }, e: { r: 5, c: 20 }, value: 'S-N' },
      { s: { r: 5, c: 21 }, e: { r: 5, c: 21 }, value: 'T-N' },
      { s: { r: 4, c: 22 }, e: { r: 5, c: 22 }, value: 'P-P' },
      { s: { r: 4, c: 23 }, e: { r: 5, c: 23 }, value: 'P-N' },
      { s: { r: 5, c: 28 }, e: { r: 5, c: 28 }, value: 'R-N' },
      { s: { r: 5, c: 29 }, e: { r: 5, c: 29 }, value: 'S-N' },
      { s: { r: 5, c: 30 }, e: { r: 5, c: 30 }, value: 'T-N' },
      { s: { r: 4, c: 31 }, e: { r: 5, c: 31 }, value: 'P-P' },
      { s: { r: 4, c: 32 }, e: { r: 5, c: 32 }, value: 'P-N' },
      { s: { r: 5, c: 33 }, e: { r: 5, c: 33 }, value: 'RATA2' },
      { s: { r: 5, c: 34 }, e: { r: 5, c: 34 }, value: 'KVA' },
      { s: { r: 5, c: 35 }, e: { r: 5, c: 35 }, value: '%' },
      { s: { r: 5, c: 36 }, e: { r: 5, c: 36 }, value: 'RATA2' },
      { s: { r: 5, c: 37 }, e: { r: 5, c: 37 }, value: 'KVA' },
      { s: { r: 5, c: 38 }, e: { r: 5, c: 38 }, value: '%' },
    ];
    
    const headerColors = [
      { startCol: 1, endCol: 4, color: 'FFB6E7C9' },
      { startCol: 5, endCol: 13, color: 'FFB6E7C9' },
      { startCol: 14, endCol: 14, color: 'FFB6E7C9' },
      { startCol: 15, endCol: 23, color: 'FFFFF59D' },
      { startCol: 24, endCol: 32, color: 'FFFFCC80' },
      { startCol: 33, endCol: 40, color: 'FF90CAF9' },
    ];

    // Ensure all header rows have correct length
    headerRow1Values.length = 40;
    headerRow2Values.length = 40;
    headerRow3Values.length = 40;
    headerRow4Values.length = 40;
    headerRow5Values.length = 40;

    // Write header rows
    for (let r = 0; r < allHeaderRows.length; r++) {
      const currentRowValues = allHeaderRows[r];
      for (let c = 0; c < currentRowValues.length; c++) {
        const cell = sheet.getCell(r + 1, c + 1);
        cell.value = currentRowValues[c];
        Object.assign(cell, boldCenter);
      }
    }

    // Apply merges and colors
    headerMerges.forEach(merge => {
      sheet.mergeCells(merge.s.r, merge.s.c, merge.e.r, merge.e.c);
      const cell = sheet.getCell(merge.s.r, merge.s.c);
      cell.value = merge.value;
      Object.assign(cell, boldCenter);
      
      const colorBlock = headerColors.find(block => 
        merge.s.c >= block.startCol && merge.s.c <= block.endCol
      );
      
      if (colorBlock) {
        cell.fill = { 
          type: 'pattern', 
          pattern: 'solid', 
          fgColor: { argb: colorBlock.color } 
        };
      }
    });

    // --- DATA ROWS ---
    console.log('📝 Writing data rows...');
    let currentRow = 6;
    let noUrut = 1;
    
    data.forEach((item) => {
      const sub = item.substation;
      const siangMeasurements = item.siang;
      const malamMeasurements = item.malam;
      
      // Merge identity columns vertically
      for (let c = 1; c <= 13; c++) {
        sheet.mergeCells(currentRow, c, currentRow + rows.length - 1, c);
      }
      
      // Fill identity data
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
      
      // Format date
      if (sub.tanggal) {
        try {
          const d = new Date(sub.tanggal);
          if (!isNaN(d.getTime())) {
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            sheet.getCell(currentRow, 13).value = `${day}/${month}/${year}`;
          } else {
            sheet.getCell(currentRow, 13).value = '';
          }
        } catch (dateError) {
          console.warn('⚠️  Invalid date for gardu:', sub.noGardu);
          sheet.getCell(currentRow, 13).value = '';
        }
      } else {
        sheet.getCell(currentRow, 13).value = '';
      }
      
      // Fill measurement data
      for (let r = 0; r < rows.length; r++) {
        const rowIdx = currentRow + r;
        
        // JURUSAN
        sheet.getCell(rowIdx, 14).value = rows[r];
        
        // Siang Measurements
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
        
        // Malam Measurements
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
        
        // Beban Results
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
        
        // Unbalanced
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

    // ✅ STYLE ALL CELLS
    console.log('🎨 Applying styles...');
    for (let r = 1; r < currentRow; r++) {
      for (let c = 1; c <= 40; c++) {
        const cell = sheet.getCell(r, c);
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        if (!cell.style.font) cell.font = { name: 'Calibri', size: 11 };
        if (!cell.alignment) cell.alignment = { 
          vertical: 'middle', 
          horizontal: 'center', 
          wrapText: true 
        };
      }
    }

    // ✅ SET COLUMN WIDTHS
    for (let c = 1; c <= 40; c++) {
      if (c >= 1 && c <= 4) sheet.getColumn(c).width = 10;
      else if (c >= 5 && c <= 13) sheet.getColumn(c).width = 12;
      else if (c === 14) sheet.getColumn(c).width = 15;
      else if (c === 15) sheet.getColumn(c).width = 10;
      else if (c >= 16 && c <= 35) sheet.getColumn(c).width = 8;
      else if (c >= 36 && c <= 40) sheet.getColumn(c).width = 10;
      else sheet.getColumn(c).width = 10;
    }

    // ✅ GENERATE FILENAME
    const filename = generateFilename(month, year);
    
    // ✅ WRITE TO RESPONSE
    console.log(`📤 Sending file: ${filename}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);
    
    await workbook.xlsx.write(res);
    res.end();

    console.log(`✅ Excel exported successfully: ${filename}.xlsx (${substations.length} substations)`);

  } catch (error) {
    console.error('💥 Export error:', error);
    
    // Don't send response if headers already sent
    if (res.headersSent) {
      console.error('⚠️  Headers already sent, cannot send error response');
      return;
    }
    
    res.status(500).json({
      success: false,
      error: 'Gagal export data',
      details: error.message,
      hint: 'Periksa log server untuk detail error'
    });
  } finally {
    // ✅ CLEANUP: Disconnect database
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