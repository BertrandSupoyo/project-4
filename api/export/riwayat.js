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

    // Build query based on whether filter is applied
    let query = {
      orderBy: { no: 'asc' },
      include: {
        measurements_siang: {
          orderBy: { row_name: 'asc' }
        },
        measurements_malam: {
          orderBy: { row_name: 'asc' }
        }
      }
    };

    // Apply filter if month and year are provided
    if (month && year) {
      const monthStr = String(month).padStart(2, '0');
      const yearStr = String(year);
      const monthYear = `${yearStr}-${monthStr}`;
      
      console.log('🔍 Filtering for month-year:', monthYear);
      
      // Filter substations based on tanggal field
      const startDate = new Date(`${yearStr}-${monthStr}-01`);
      const endDate = new Date(`${yearStr}-${monthStr}-31`);
      
      query.where = {
        tanggal: {
          gte: startDate,
          lte: endDate
        }
      };
      
      query.include.measurements_siang.where = { month: monthYear };
      query.include.measurements_malam.where = { month: monthYear };
    }

    // Get substations with measurements
    const substations = await db.substation.findMany(query);
    
    console.log(`✅ Found ${substations.length} substations with measurements`);
    console.log('🔍 Query details:', JSON.stringify(query, null, 2));
    
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

    // --- HEADER (copy dari generateSubstationExcel.js) ---
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
      { startCol: 33, endCol: 40, color: 'FF90CAF9' },
    ];
    headerRow1Values.length = 40;
    headerRow2Values.length = 40;
    headerRow3Values.length = 40;
    headerRow4Values.length = 40;
    headerRow5Values.length = 40;
    const filteredHeaderMerges = headerMerges.filter(m => m.s.c <= 40 && m.e.c <= 40);
    const filteredHeaderColors = headerColors.filter(c => c.startCol <= 40);
    for (let r = 0; r < allHeaderRows.length; r++) {
      const currentRowValues = allHeaderRows[r];
      for (let c = 0; c < currentRowValues.length; c++) {
        const cell = sheet.getCell(r + 1, c + 1);
        cell.value = currentRowValues[c];
        Object.assign(cell, boldCenter);
      }
    }
    filteredHeaderMerges.forEach(merge => {
      sheet.mergeCells(merge.s.r, merge.s.c, merge.e.r, merge.e.c);
      const cell = sheet.getCell(merge.s.r, merge.s.c);
      cell.value = merge.value;
      Object.assign(cell, boldCenter);
      const colorBlock = filteredHeaderColors.find(block => merge.s.c >= block.startCol && merge.s.c <= block.endCol);
      if (colorBlock) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorBlock.color } };
      }
    });

    // --- DATA ROWS ---
    let currentRow = 6;
    let noUrut = 1; // Tambah variabel untuk nomor urut otomatis
    data.forEach((item) => {
      const sub = item.substation;
      const siangMeasurements = item.siang;
      const malamMeasurements = item.malam;
      // Merge identitas columns (A-M / 1-13) vertically per substation
      for (let c = 1; c <= 13; c++) {
        sheet.mergeCells(currentRow, c, currentRow + rows.length - 1, c);
      }
      // Isi data identitas hanya di baris pertama blok
      sheet.getCell(currentRow, 1).value = noUrut; // Gunakan noUrut otomatis, bukan sub.no
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
    for (let c = 1; c <= 40; c++) {
      if (c >= 1 && c <= 4) sheet.getColumn(c).width = 10;
      else if (c >= 5 && c <= 13) sheet.getColumn(c).width = 12;
      else if (c === 14) sheet.getColumn(c).width = 15;
      else if (c === 15) sheet.getColumn(c).width = 10;
      else if (c >= 16 && c <= 35) sheet.getColumn(c).width = 8;
      else if (c >= 36 && c <= 40) sheet.getColumn(c).width = 10;
      else sheet.getColumn(c).width = 10;
    }

    // Generate filename based on filter
    let filename = 'riwayat_pengukuran.xlsx';
    if (month && year) {
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const monthStr = String(month).padStart(2, '0');
      const monthName = monthNames[parseInt(monthStr) - 1];
      const yearStr = String(year);
      filename = `Riwayat_Pengukuran_${monthName}_${yearStr}.xlsx`;
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