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

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await initPrisma();
    
    // Get query parameters for filtering
    const { month, year } = req.query;
    
    console.log('📊 Export riwayat with filter:', { month, year });

    let substations = [];
    let filename = 'riwayat_pengukuran.xlsx';

    // Apply filter if month and year are provided
    if (month && year) {
      const monthStr = String(month).padStart(2, '0');
      const yearStr = String(year);
      const monthYear = `${yearStr}-${monthStr}`;
      
      console.log('🔍 Filtering for month-year:', monthYear);
      
      // Filter substations based on tanggal field
      const startDate = new Date(`${yearStr}-${monthStr}-01`);
      const endDate = new Date(`${yearStr}-${monthStr}-31`);
      
      console.log('📅 Date range:', { startDate, endDate });

      // Get substations with measurements filtered by date and month
      substations = await db.substation.findMany({
        where: {
          tanggal: {
            gte: startDate,
            lte: endDate
          }
        },
        orderBy: { no: 'asc' },
        include: {
          measurements_siang: {
            where: {
              month: monthYear
            },
            orderBy: { row_name: 'asc' }
          },
          measurements_malam: {
            where: {
              month: monthYear
            },
            orderBy: { row_name: 'asc' }
          }
        }
      });

      // Generate filename with month and year
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const monthName = monthNames[parseInt(monthStr) - 1];
      filename = `Riwayat_Pengukuran_${monthName}_${yearStr}.xlsx`;
      
    } else {
      // Get all substations without filter
      substations = await db.substation.findMany({
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
    }
    
    console.log(`✅ Found ${substations.length} substations with measurements`);
    
    // Log sample data for debugging
    if (substations.length > 0) {
      console.log('📊 Sample substation:', {
        id: substations[0].id,
        namaLokasiGardu: substations[0].namaLokasiGardu,
        tanggal: substations[0].tanggal,
        siangCount: substations[0].measurements_siang?.length || 0,
        malamCount: substations[0].measurements_malam?.length || 0
      });
    }

    // Transform data to match generateRiwayatExcel format
    const data = substations.map(sub => ({
      substation: sub,
      siang: sub.measurements_siang || [],
      malam: sub.measurements_malam || []
    }));

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Riwayat Pengukuran');
    
    const rows = ['INDUK', '1', '2', '3', '4'];
    const fieldOrder = ['r', 's', 't', 'n', 'rn', 'sn', 'tn', 'pp', 'pn'];
    const fieldLabels = ['R', 'S', 'T', 'N', 'R-N', 'S-N', 'T-N', 'P-P', 'P-N'];

    const boldCenter = {
      font: { bold: true, name: 'Calibri', size: 11 },
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
    };

    // --- HEADER ---
    const headerRow1Values = ['', '', '', '', 'DATA GARDU', '', '', '', '', '', '', '', '', '', 'PENGUKURAN SIANG', '', '', '', '', '', '', '', '', '', 'PENGUKURAN MALAM', '', '', '', '', '', '', '', '', '', 'BEBAN', '', '', '', '', '', '', '', ''];
    const headerRow2Values = ['NO', 'ULP', 'NO. GARDU', 'NAMA / LOKASI', '', '', '', '', '', '', '', '', '', 'TANGGAL', 'JURUSAN', 'ARUS', '', '', '', 'TEGANGAN', '', '', '', '', 'ARUS', '', '', '', 'TEGANGAN', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    const headerRow3Values = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'R', 'S', 'T', 'N', '', 'PANGKAL', '', '', 'UJUNG', '', '', 'R', 'S', 'T', 'N', 'PANGKAL', '', '', 'UJUNG', '', '', 'SIANG', '', '', 'MALAM', '', '', '', ''];
    const headerRow4Values = ['', '', '', '', 'JENIS', 'MERK', 'DAYA', 'TAHUN', 'PHASA', 'TAP TRAFO (MAX TAP)', 'ARAH SEQUENCE', 'PENYULANG', '', '', '', '', '', '', 'P-N', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    const headerRow5Values = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'R', 'S', 'T', 'N', 'R-N', 'S-N', 'T-N', 'P-P', 'P-N', '', 'R', 'S', 'T', 'N', 'R-N', 'S-N', 'T-N', 'P-P', 'P-N', '', 'RATA2', 'KVA', '%', 'RATA2', 'KVA', '%', '', ''];
    const allHeaderRows = [headerRow1Values, headerRow2Values, headerRow3Values, headerRow4Values, headerRow5Values];
    
    // Apply header styles
    allHeaderRows.forEach((rowValues, rowIndex) => {
      rowValues.forEach((value, colIndex) => {
        const cell = sheet.getCell(rowIndex + 1, colIndex + 1);
        cell.value = value;
        Object.assign(cell, boldCenter);
      });
    });

    // Merge cells for headers
    const headerMerges = [
      { s: { r: 0, c: 4 }, e: { r: 0, c: 12 }, value: 'DATA GARDU' },
      { s: { r: 0, c: 14 }, e: { r: 0, c: 22 }, value: 'PENGUKURAN SIANG' },
      { s: { r: 0, c: 23 }, e: { r: 0, c: 31 }, value: 'PENGUKURAN MALAM' },
      { s: { r: 0, c: 32 }, e: { r: 1, c: 37 }, value: 'BEBAN' },
      { s: { r: 0, c: 0 }, e: { r: 4, c: 0 }, value: 'NO' },
      { s: { r: 0, c: 1 }, e: { r: 4, c: 1 }, value: 'ULP' },
      { s: { r: 0, c: 2 }, e: { r: 4, c: 2 }, value: 'NO. GARDU' },
      { s: { r: 0, c: 3 }, e: { r: 4, c: 3 }, value: 'NAMA / LOKASI' },
      { s: { r: 0, c: 12 }, e: { r: 4, c: 12 }, value: 'TANGGAL' },
      { s: { r: 0, c: 13 }, e: { r: 4, c: 13 }, value: 'JURUSAN' },
      { s: { r: 0, c: 38 }, e: { r: 4, c: 38 }, value: 'UNBALANCED SIANG' },
      { s: { r: 0, c: 39 }, e: { r: 4, c: 39 }, value: 'UNBALANCED MALAM' },
      { s: { r: 1, c: 14 }, e: { r: 1, c: 17 }, value: 'ARUS' },
      { s: { r: 1, c: 18 }, e: { r: 1, c: 22 }, value: 'TEGANGAN' },
      { s: { r: 1, c: 23 }, e: { r: 1, c: 26 }, value: 'ARUS' },
      { s: { r: 1, c: 27 }, e: { r: 1, c: 31 }, value: 'TEGANGAN' },
      { s: { r: 2, c: 14 }, e: { r: 4, c: 14 }, value: 'R' },
      { s: { r: 2, c: 15 }, e: { r: 4, c: 15 }, value: 'S' },
      { s: { r: 2, c: 16 }, e: { r: 4, c: 16 }, value: 'T' },
      { s: { r: 2, c: 17 }, e: { r: 4, c: 17 }, value: 'N' },
      { s: { r: 2, c: 18 }, e: { r: 4, c: 18 }, value: 'R-N' },
      { s: { r: 2, c: 19 }, e: { r: 4, c: 19 }, value: 'S-N' },
      { s: { r: 2, c: 20 }, e: { r: 4, c: 20 }, value: 'T-N' },
      { s: { r: 2, c: 21 }, e: { r: 4, c: 21 }, value: 'P-P' },
      { s: { r: 2, c: 22 }, e: { r: 4, c: 22 }, value: 'P-N' },
      { s: { r: 2, c: 23 }, e: { r: 4, c: 23 }, value: 'R' },
      { s: { r: 2, c: 24 }, e: { r: 4, c: 24 }, value: 'S' },
      { s: { r: 2, c: 25 }, e: { r: 4, c: 25 }, value: 'T' },
      { s: { r: 2, c: 26 }, e: { r: 4, c: 26 }, value: 'N' },
      { s: { r: 2, c: 27 }, e: { r: 4, c: 27 }, value: 'R-N' },
      { s: { r: 2, c: 28 }, e: { r: 4, c: 28 }, value: 'S-N' },
      { s: { r: 2, c: 29 }, e: { r: 4, c: 29 }, value: 'T-N' },
      { s: { r: 2, c: 30 }, e: { r: 4, c: 30 }, value: 'P-P' },
      { s: { r: 2, c: 31 }, e: { r: 4, c: 31 }, value: 'P-N' },
      { s: { r: 2, c: 32 }, e: { r: 4, c: 32 }, value: 'RATA2' },
      { s: { r: 2, c: 33 }, e: { r: 4, c: 33 }, value: 'KVA' },
      { s: { r: 2, c: 34 }, e: { r: 4, c: 34 }, value: '%' },
      { s: { r: 2, c: 35 }, e: { r: 4, c: 35 }, value: 'RATA2' },
      { s: { r: 2, c: 36 }, e: { r: 4, c: 36 }, value: 'KVA' },
      { s: { r: 2, c: 37 }, e: { r: 4, c: 37 }, value: '%' }
    ];

    headerMerges.forEach(merge => {
      sheet.mergeCells(merge.s.r + 1, merge.s.c + 1, merge.e.r + 1, merge.e.c + 1);
      const cell = sheet.getCell(merge.s.r + 1, merge.s.c + 1);
      cell.value = merge.value;
      Object.assign(cell, boldCenter);
    });

    // --- DATA ROWS ---
    let currentRow = 6; // Start after headers
    let noUrut = 1;

    data.forEach(({ substation: sub, siang: siangMeasurements, malam: malamMeasurements }) => {
      // Substation info (kolom 1-13) - hanya baris pertama dari 5 baris
      sheet.getCell(currentRow, 1).value = noUrut;
      sheet.getCell(currentRow, 2).value = sub.ulp;
      sheet.getCell(currentRow, 3).value = sub.noGardu;
      sheet.getCell(currentRow, 4).value = sub.namaLokasiGardu;
      sheet.getCell(currentRow, 5).value = sub.jenis;
      sheet.getCell(currentRow, 6).value = sub.merek;
      sheet.getCell(currentRow, 7).value = sub.daya;
      sheet.getCell(currentRow, 8).value = sub.tahun;
      sheet.getCell(currentRow, 9).value = sub.phasa;
      sheet.getCell(currentRow, 10).value = sub.tap_trafo_max_tap;
      sheet.getCell(currentRow, 11).value = sub.arahSequence;
      sheet.getCell(currentRow, 12).value = sub.penyulang;
      // Format tanggal ke dd/mm/yyyy
      if (sub.tanggal) {
        const d = new Date(sub.tanggal);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        sheet.getCell(currentRow, 13).value = `${day}/${month}/${year}`;
      } else {
        sheet.getCell(currentRow, 13).value = '';
      }
      
      // Data measurement (kolom 14 dst) tetap 5 baris (INDUK, 1, 2, 3, 4)
      for (let r = 0; r < rows.length; r++) {
        const rowIdx = currentRow + r;
        // JURUSAN (Col O / 14)
        sheet.getCell(rowIdx, 14).value = rows[r];
        // Siang Measurements (Col P-Y)
        const mSiang = siangMeasurements ? siangMeasurements.filter(x => x.row_name?.toLowerCase() === rows[r].toLowerCase() && String(x.substationId) === String(sub.id))[0] || {} : {};
        sheet.getCell(rowIdx, 15).value = mSiang.r ?? '';
        sheet.getCell(rowIdx, 16).value = mSiang.s ?? '';
        sheet.getCell(rowIdx, 17).value = mSiang.t ?? '';
        sheet.getCell(rowIdx, 18).value = mSiang.n ?? '';
        sheet.getCell(rowIdx, 19).value = mSiang.rn ?? '';
        sheet.getCell(rowIdx, 20).value = mSiang.sn ?? '';
        sheet.getCell(rowIdx, 21).value = mSiang.tn ?? '';
        sheet.getCell(rowIdx, 22).value = mSiang.pp ?? '';
        sheet.getCell(rowIdx, 23).value = mSiang.pn ?? '';
        // Malam Measurements (Col Z-II)
        const mMalam = malamMeasurements ? malamMeasurements.filter(x => x.row_name?.toLowerCase() === rows[r].toLowerCase() && String(x.substationId) === String(sub.id))[0] || {} : {};
        sheet.getCell(rowIdx, 24).value = mMalam.r ?? '';
        sheet.getCell(rowIdx, 25).value = mMalam.s ?? '';
        sheet.getCell(rowIdx, 26).value = mMalam.t ?? '';
        sheet.getCell(rowIdx, 27).value = mMalam.n ?? '';
        sheet.getCell(rowIdx, 28).value = mMalam.rn ?? '';
        sheet.getCell(rowIdx, 29).value = mMalam.sn ?? '';
        sheet.getCell(rowIdx, 30).value = mMalam.tn ?? '';
        sheet.getCell(rowIdx, 31).value = mMalam.pp ?? '';
        sheet.getCell(rowIdx, 32).value = mMalam.pn ?? '';
        // Hasil Beban (Col JJ-OO)
        sheet.getCell(rowIdx, 33).value = mSiang?.rata2 ?? '';
        sheet.getCell(rowIdx, 34).value = mSiang?.kva ?? '';
        sheet.getCell(rowIdx, 35).value = mSiang?.persen !== undefined ? `${Number(mSiang.persen).toFixed(1)}%` : '';
        sheet.getCell(rowIdx, 36).value = mMalam?.rata2 ?? '';
        sheet.getCell(rowIdx, 37).value = mMalam?.kva ?? '';
        sheet.getCell(rowIdx, 38).value = mMalam?.persen !== undefined ? `${Number(mMalam.persen).toFixed(1)}%` : '';
        // Unbalanced
        sheet.getCell(rowIdx, 39).value = mSiang?.unbalanced !== undefined ? `${Number(mSiang.unbalanced).toFixed(1)}%` : '';
        sheet.getCell(rowIdx, 40).value = mMalam?.unbalanced !== undefined ? `${Number(mMalam.unbalanced).toFixed(1)}%` : '';
      }
      currentRow += rows.length;
      noUrut++; // Increment nomor urut untuk substation berikutnya
    });

    // Style all cells
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
        if (!cell.alignment) cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    }
    
    // Set column widths
    for (let c = 1; c <= 40; c++) {
      if (c >= 1 && c <= 4) sheet.getColumn(c).width = 10;
      else if (c >= 5 && c <= 13) sheet.getColumn(c).width = 12;
      else if (c === 14) sheet.getColumn(c).width = 15;
      else if (c === 15) sheet.getColumn(c).width = 10;
      else if (c >= 16 && c <= 35) sheet.getColumn(c).width = 8;
      else if (c >= 36 && c <= 40) sheet.getColumn(c).width = 10;
      else sheet.getColumn(c).width = 10;
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error('💥 Export error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export data',
      details: error.message
    });
  }
} 