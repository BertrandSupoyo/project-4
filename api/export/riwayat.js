import { PrismaClient } from '../../prisma/app/generated/prisma-client/index.js';
import { withAccelerate } from '@prisma/extension-accelerate';
import ExcelJS from 'exceljs';

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

  // --- PENAMBAHAN KODE: MENCEGAH CACHING ---
  // Header ini memberitahu browser dan proxy untuk tidak menyimpan respons.
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');


  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await initPrisma();
    const { year, month } = req.query; // Mengambil parameter tahun dan bulan dari URL

    let prismaQueryOptions = {
      orderBy: { no: 'asc' },
      include: {
        measurements_siang: { orderBy: { row_name: 'asc' } },
        measurements_malam: { orderBy: { row_name: 'asc' } }
      }
    };

    let fileName = 'riwayat_pengukuran_semua.xlsx';

    // --- LOGIKA FILTER BARU ---
    // Jika tahun dan bulan diberikan, tambahkan kondisi 'where'
    if (year && month) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 1); // Awal bulan berikutnya
      
      console.log(`📊 Filtering data for date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);
      
      prismaQueryOptions.where = {
        tanggal: {
          gte: startDate,
          lt: endDate, // 'lt' (less than) untuk mengambil semua data hingga akhir bulan
        }
      };

      fileName = `riwayat_pengukuran_${year}-${String(month).padStart(2, '0')}.xlsx`;
    }
    
    // Get substations with measurements based on the query options
    const substations = await db.substation.findMany(prismaQueryOptions);

    if (substations.length === 0) {
        res.status(404).send('<html><body><h1>Tidak ada data</h1><p>Tidak ada data pengukuran yang ditemukan untuk periode yang dipilih.</p></body></html>');
        return;
    }

    // Transform data to match generateRiwayatExcel format
    const data = substations.map(sub => ({
      substation: sub,
      siang: sub.measurements_siang || [],
      malam: sub.measurements_malam || []
    }));

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Riwayat Pengukuran');
    
    // ... (Semua kode untuk membuat header dan mengisi data Excel tetap sama persis)
    const rows = ['INDUK', '1', '2', '3', '4'];
    const boldCenter = {
      font: { bold: true, name: 'Calibri', size: 11 },
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
    };

    // --- HEADER ---
    const headerRow1Values = ['', '', '', '', 'DATA GARDU', '', '', '', '', '', '', '', '', '', '', 'PENGUKURAN SIANG', '', '', '', '', '', '', '', '', '', 'PENGUKURAN MALAM', '', '', '', '', '', '', '', '', '', 'BEBAN', '', '', '', '', '', '', '', ''];
    const headerRow2Values = ['NO', 'ULP', 'NO. GARDU', 'NAMA / LOKASI', '', '', '', '', '', '', '', '', '', 'TANGGAL', 'JURUSAN', 'ARUS', '', '', '', 'TEGANGAN', '', '', '', '', 'ARUS', '', '', '', 'TEGANGAN', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    const headerRow3Values = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'R', 'S', 'T', 'N', '', 'PANGKAL', '', '', 'UJUNG', '', '', 'R', 'S', 'T', 'N', 'PANGKAL', '', '', 'UJUNG', '', '', 'SIANG', '', '', 'MALAM', '', '', '', ''];
    const headerRow4Values = ['', '', '', '', 'JENIS', 'MERK', 'DAYA', 'TAHUN', 'PHASA', 'TAP TRAFO (MAX TAP)', 'ARAH SEQUENCE', 'PENYULANG', '', '', '', '', '', '', 'P-N', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    const headerRow5Values = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'R', 'S', 'T', 'N', 'R-N', 'S-N', 'T-N', 'P-P', 'P-N', '', 'R', 'S', 'T', 'N', 'R-N', 'S-N', 'T-N', 'P-P', 'P-N', '', 'RATA2', 'KVA', '%', 'RATA2', 'KVA', '%', '', ''];
    const allHeaderRows = [headerRow1Values, headerRow2Values, headerRow3Values, headerRow4Values, headerRow5Values];
    const headerMerges = [
      { s: { r: 1, c: 5 }, e: { r: 2, c: 12 }, value: 'DATA GARDU' }, { s: { r: 1, c: 15 }, e: { r: 1, c: 23 }, value: 'PENGUKURAN SIANG' }, { s: { r: 1, c: 24 }, e: { r: 1, c: 32 }, value: 'PENGUKURAN MALAM' }, { s: { r: 1, c: 33 }, e: { r: 2, c: 38 }, value: 'BEBAN' }, { s: { r: 1, c: 1 }, e: { r: 5, c: 1 }, value: 'NO' }, { s: { r: 1, c: 2 }, e: { r: 5, c: 2 }, value: 'ULP' }, { s: { r: 1, c: 3 }, e: { r: 5, c: 3 }, value: 'NO. GARDU' }, { s: { r: 1, c: 4 }, e: { r: 5, c: 4 }, value: 'NAMA / LOKASI' }, { s: { r: 1, c: 13 }, e: { r: 5, c: 13 }, value: 'TANGGAL' }, { s: { r: 1, c: 14 }, e: { r: 5, c: 14 }, value: 'JURUSAN' }, { s: { r: 1, c: 39 }, e: { r: 5, c: 39 }, value: 'UNBALANCED SIANG' }, { s: { r: 1, c: 40 }, e: { r: 5, c: 40 }, value: 'UNBALANCED MALAM' }, { s: { r: 2, c: 15 }, e: { r: 2, c: 18 }, value: 'ARUS' }, { s: { r: 2, c: 19 }, e: { r: 2, c: 23 }, value: 'TEGANGAN' }, { s: { r: 2, c: 24 }, e: { r: 2, c: 27 }, value: 'ARUS' }, { s: { r: 2, c: 28 }, e: { r: 2, c: 32 }, value: 'TEGANGAN' }, { s: { r: 3, c: 15 }, e: { r: 5, c: 15 }, value: 'R' }, { s: { r: 3, c: 16 }, e: { r: 5, c: 16 }, value: 'S' }, { s: { r: 3, c: 17 }, e: { r: 5, c: 17 }, value: 'T' }, { s: { r: 3, c: 18 }, e: { r: 5, c: 18 }, value: 'N' }, { s: { r: 3, c: 19 }, e: { r: 3, c: 22 }, value: 'PANGKAL' }, { s: { r: 3, c: 23 }, e: { r: 3, c: 23 }, value: 'UJUNG' }, { s: { r: 3, c: 24 }, e: { r: 5, c: 24 }, value: 'R' }, { s: { r: 3, c: 25 }, e: { r: 5, c: 25 }, value: 'S' }, { s: { r: 3, c: 26 }, e: { r: 5, c: 26 }, value: 'T' }, { s: { r: 3, c: 27 }, e: { r: 5, c: 27 }, value: 'N' }, { s: { r: 3, c: 28 }, e: { r: 3, c: 31 }, value: 'PANGKAL' }, { s: { r: 3, c: 32 }, e: { r: 3, c: 32 }, value: 'UJUNG' }, { s: { r: 3, c: 33 }, e: { r: 4, c: 35 }, value: 'SIANG' }, { s: { r: 3, c: 36 }, e: { r: 4, c: 38 }, value: 'MALAM' }, { s: { r: 3, c: 5 }, e: { r: 5, c: 5 }, value: 'JENIS' }, { s: { r: 3, c: 6 }, e: { r: 5, c: 6 }, value: 'MERK' }, { s: { r: 3, c: 7 }, e: { r: 5, c: 7 }, value: 'DAYA' }, { s: { r: 3, c: 8 }, e: { r: 5, c: 8 }, value: 'TAHUN' }, { s: { r: 3, c: 9 }, e: { r: 5, c: 9 }, value: 'PHASA' }, { s: { r: 3, c: 10 }, e: { r: 5, c: 10 }, value: 'TAP TRAFO (MAX TAP)' }, { s: { r: 3, c: 11 }, e: { r: 5, c: 11 }, value: 'ARAH SEQUENCE' }, { s: { r: 3, c: 12 }, e: { r: 5, c: 12 }, value: 'PENYULANG' }, { s: { r: 4, c: 19 }, e: { r: 4, c: 21 }, value: 'P-N' }, { s: { r: 4, c: 28 }, e: { r: 4, c: 30 }, value: 'P-N' }, { s: { r: 5, c: 19 }, e: { r: 5, c: 19 }, value: 'R-N' }, { s: { r: 5, c: 20 }, e: { r: 5, c: 20 }, value: 'S-N' }, { s: { r: 5, c: 21 }, e: { r: 5, c: 21 }, value: 'T-N' }, { s: { r: 4, c: 22 }, e: { r: 5, c: 22 }, value: 'P-P' }, { s: { r: 4, c: 23 }, e: { r: 5, c: 23 }, value: 'P-N' }, { s: { r: 5, c: 28 }, e: { r: 5, c: 28 }, value: 'R-N' }, { s: { r: 5, c: 29 }, e: { r: 5, c: 29 }, value: 'S-N' }, { s: { r: 5, c: 30 }, e: { r: 5, c: 30 }, value: 'T-N' }, { s: { r: 4, c: 31 }, e: { r: 5, c: 31 }, value: 'P-P' }, { s: { r: 4, c: 32 }, e: { r: 5, c: 32 }, value: 'P-N' }, { s: { r: 5, c: 33 }, e: { r: 5, c: 33 }, value: 'RATA2' }, { s: { r: 5, c: 34 }, e: { r: 5, c: 34 }, value: 'KVA' }, { s: { r: 5, c: 35 }, e: { r: 5, c: 35 }, value: '%' }, { s: { r: 5, c: 36 }, e: { r: 5, c: 36 }, value: 'RATA2' }, { s: { r: 5, c: 37 }, e: { r: 5, c: 37 }, value: 'KVA' }, { s: { r: 5, c: 38 }, e: { r: 5, c: 38 }, value: '%' },
    ];
    headerRow1Values.length = 40; headerRow2Values.length = 40; headerRow3Values.length = 40; headerRow4Values.length = 40; headerRow5Values.length = 40;
    const filteredHeaderMerges = headerMerges.filter(m => m.s.c <= 40 && m.e.c <= 40);
    allHeaderRows.forEach((rowValues, rIdx) => {
        rowValues.forEach((value, cIdx) => {
            const cell = sheet.getCell(rIdx + 1, cIdx + 1);
            cell.value = value;
            Object.assign(cell, boldCenter);
        });
    });
    filteredHeaderMerges.forEach(merge => {
        sheet.mergeCells(merge.s.r, merge.s.c, merge.e.r, merge.e.c);
        sheet.getCell(merge.s.r, merge.s.c).value = merge.value;
    });

    // --- DATA ROWS ---
    let currentRow = 6;
    let noUrut = 1;
    data.forEach((item) => {
      const sub = item.substation;
      const siangMeasurements = item.siang;
      const malamMeasurements = item.malam;
      sheet.mergeCells(currentRow, 1, currentRow + rows.length - 1, 1); sheet.getCell(currentRow, 1).value = noUrut++;
      sheet.mergeCells(currentRow, 2, currentRow + rows.length - 1, 2); sheet.getCell(currentRow, 2).value = sub.ulp;
      sheet.mergeCells(currentRow, 3, currentRow + rows.length - 1, 3); sheet.getCell(currentRow, 3).value = sub.noGardu;
      sheet.mergeCells(currentRow, 4, currentRow + rows.length - 1, 4); sheet.getCell(currentRow, 4).value = sub.namaLokasiGardu;
      sheet.mergeCells(currentRow, 5, currentRow + rows.length - 1, 5); sheet.getCell(currentRow, 5).value = sub.jenis;
      sheet.mergeCells(currentRow, 6, currentRow + rows.length - 1, 6); sheet.getCell(currentRow, 6).value = sub.merek;
      sheet.mergeCells(currentRow, 7, currentRow + rows.length - 1, 7); sheet.getCell(currentRow, 7).value = sub.daya;
      sheet.mergeCells(currentRow, 8, currentRow + rows.length - 1, 8); sheet.getCell(currentRow, 8).value = sub.tahun;
      sheet.mergeCells(currentRow, 9, currentRow + rows.length - 1, 9); sheet.getCell(currentRow, 9).value = sub.phasa;
      sheet.mergeCells(currentRow, 10, currentRow + rows.length - 1, 10); sheet.getCell(currentRow, 10).value = sub.tap_trafo_max_tap;
      sheet.mergeCells(currentRow, 11, currentRow + rows.length - 1, 11); sheet.getCell(currentRow, 11).value = sub.arahSequence;
      sheet.mergeCells(currentRow, 12, currentRow + rows.length - 1, 12); sheet.getCell(currentRow, 12).value = sub.penyulang;
      sheet.mergeCells(currentRow, 13, currentRow + rows.length - 1, 13);
      if (sub.tanggal) {
        const d = new Date(sub.tanggal);
        sheet.getCell(currentRow, 13).value = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
      }
      
      rows.forEach((rowName, rIdx) => {
        const rowIdx = currentRow + rIdx;
        sheet.getCell(rowIdx, 14).value = rowName;
        const mSiang = siangMeasurements.find(x => x.row_name?.toLowerCase() === rowName.toLowerCase()) || {};
        sheet.getCell(rowIdx, 15).value = mSiang.r ?? ''; sheet.getCell(rowIdx, 16).value = mSiang.s ?? ''; sheet.getCell(rowIdx, 17).value = mSiang.t ?? ''; sheet.getCell(rowIdx, 18).value = mSiang.n ?? ''; sheet.getCell(rowIdx, 19).value = mSiang.rn ?? ''; sheet.getCell(rowIdx, 20).value = mSiang.sn ?? ''; sheet.getCell(rowIdx, 21).value = mSiang.tn ?? ''; sheet.getCell(rowIdx, 22).value = mSiang.pp ?? ''; sheet.getCell(rowIdx, 23).value = mSiang.pn ?? '';
        const mMalam = malamMeasurements.find(x => x.row_name?.toLowerCase() === rowName.toLowerCase()) || {};
        sheet.getCell(rowIdx, 24).value = mMalam.r ?? ''; sheet.getCell(rowIdx, 25).value = mMalam.s ?? ''; sheet.getCell(rowIdx, 26).value = mMalam.t ?? ''; sheet.getCell(rowIdx, 27).value = mMalam.n ?? ''; sheet.getCell(rowIdx, 28).value = mMalam.rn ?? ''; sheet.getCell(rowIdx, 29).value = mMalam.sn ?? ''; sheet.getCell(rowIdx, 30).value = mMalam.tn ?? ''; sheet.getCell(rowIdx, 31).value = mMalam.pp ?? ''; sheet.getCell(rowIdx, 32).value = mMalam.pn ?? '';
        sheet.getCell(rowIdx, 33).value = mSiang?.rata2 ?? ''; sheet.getCell(rowIdx, 34).value = mSiang?.kva ?? ''; sheet.getCell(rowIdx, 35).value = mSiang?.persen !== undefined ? `${Number(mSiang.persen).toFixed(1)}%` : '';
        sheet.getCell(rowIdx, 36).value = mMalam?.rata2 ?? ''; sheet.getCell(rowIdx, 37).value = mMalam?.kva ?? ''; sheet.getCell(rowIdx, 38).value = mMalam?.persen !== undefined ? `${Number(mMalam.persen).toFixed(1)}%` : '';
        sheet.getCell(rowIdx, 39).value = mSiang?.unbalanced !== undefined ? `${Number(mSiang.unbalanced).toFixed(1)}%` : '';
        sheet.getCell(rowIdx, 40).value = mMalam?.unbalanced !== undefined ? `${Number(mMalam.unbalanced).toFixed(1)}%` : '';
      });
      currentRow += rows.length;
    });

    // Style all cells
    for (let r = 1; r < currentRow; r++) {
      for (let c = 1; c <= 40; c++) {
        const cell = sheet.getCell(r, c);
        cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        if (!cell.style.font) cell.font = { name: 'Calibri', size: 11 };
        if (!cell.alignment) cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
    }
    for (let c = 1; c <= 40; c++) {
      sheet.getColumn(c).width = (c >= 16 && c <= 35) ? 8 : 12;
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
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
