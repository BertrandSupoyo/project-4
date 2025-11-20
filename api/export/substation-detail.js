// File: pages/api/export/substation-detail.js
import { PrismaClient } from '../../../prisma/app/generated/prisma-client/index.js'
import { withAccelerate } from '@prisma/extension-accelerate'
import ExcelJS from 'exceljs'

// ============ CONSTANTS ============
const CONSTANTS = {
  MEASUREMENT_ROWS: ['INDUK', '1', '2', '3', '4'],
  TOTAL_COLUMNS: 40,
  HEADER_ROWS: 5,
  IDENTITY_COLS: 13,
  STATUS: {
    ACTIVE: 'ACTIVE',
    SUPERSEDED: 'SUPERSEDED'
  },
  EXCEL: {
    FONT_NAME: 'Calibri',
    FONT_SIZE: 11,
    SHEET_NAME: 'Detail Gardu'
  }
};

const HEADER_CONFIG = {
  row1: ['', '', '', '', 'DATA GARDU', '', '', '', '', '', '', '', '', '', '', 'PENGUKURAN SIANG', '', '', '', '', '', '', '', '', '', 'PENGUKURAN MALAM', '', '', '', '', '', '', '', '', '', 'BEBAN', '', '', '', '', '', '', '', ''],
  row2: ['NO', 'ULP', 'NO. GARDU', 'NAMA / LOKASI', '', '', '', '', '', '', '', '', '', 'TANGGAL', 'JURUSAN', 'ARUS', '', '', '', 'TEGANGAN', '', '', '', '', 'ARUS', '', '', '', 'TEGANGAN', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  row3: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'R', 'S', 'T', 'N', '', 'PANGKAL', '', '', 'UJUNG', '', '', 'R', 'S', 'T', 'N', 'PANGKAL', '', '', 'UJUNG', '', '', 'SIANG', '', '', 'MALAM', '', '', '', ''],
  row4: ['', '', '', '', 'JENIS', 'MERK', 'DAYA', 'TAHUN', 'PHASA', 'TAP TRAFO (MAX TAP)', 'ARAH SEQUENCE', 'PENYULANG', '', '', '', '', '', '', 'P-N', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
  row5: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'R', 'S', 'T', 'N', 'R-N', 'S-N', 'T-N', 'P-P', 'P-N', '', 'R', 'S', 'T', 'N', 'R-N', 'S-N', 'T-N', 'P-P', 'P-N', '', 'RATA2', 'KVA', '%', 'RATA2', 'KVA', '%', '', '']
};

const HEADER_MERGES = [
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
  { s: { r: 5, c: 38 }, e: { r: 5, c: 38 }, value: '%' }
];

const HEADER_COLORS = [
  { startCol: 1, endCol: 4, color: 'FFB6E7C9' },
  { startCol: 5, endCol: 13, color: 'FFB6E7C9' },
  { startCol: 14, endCol: 14, color: 'FFB6E7C9' },
  { startCol: 15, endCol: 23, color: 'FFFFF59D' },
  { startCol: 24, endCol: 32, color: 'FFFFCC80' },
  { startCol: 33, endCol: 40, color: 'FF90CAF9' }
];

// ============ PRISMA CLIENT ============

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

// ============ VALIDATION FUNCTIONS ============

function validateId(id) {
  if (!id || typeof id !== 'string' || id.trim() === '') {
    throw new Error('Parameter id wajib diisi');
  }
  return id.trim();
}

// ============ FORMATTING FUNCTIONS ============

function formatDate(dateObj) {
  if (!dateObj) return '';

  try {
    const d = new Date(dateObj);
    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.warn('⚠️  Date formatting error:', error);
    return '';
  }
}

function formatPercentage(value) {
  if (value === undefined || value === null) return '';
  return `${Number(value).toFixed(1)}%`;
}

function formatNumeric(value) {
  return value ?? '';
}

function generateFilename(noGardu, id) {
  const base = (noGardu ?? id ?? 'gardu');
  const sanitized = String(base).trim().replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);
  return `detail_gardu_${sanitized || 'export'}`;
}

// ============ STYLE FUNCTIONS ============

function getBoldCenterStyle() {
  return {
    font: { bold: true, name: CONSTANTS.EXCEL.FONT_NAME, size: CONSTANTS.EXCEL.FONT_SIZE },
    alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
  };
}

function getCellBorder() {
  return {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };
}

function getCellAlignment() {
  return {
    vertical: 'middle',
    horizontal: 'center',
    wrapText: true
  };
}

// ============ EXCEL BUILDER FUNCTIONS ============

function setupHeaderRows(sheet) {
  console.log('📋 Setting up header rows...');
  const boldCenter = getBoldCenterStyle();

  const allRows = [
    HEADER_CONFIG.row1,
    HEADER_CONFIG.row2,
    HEADER_CONFIG.row3,
    HEADER_CONFIG.row4,
    HEADER_CONFIG.row5
  ];

  // Ensure all rows have correct length
  allRows.forEach(row => { row.length = CONSTANTS.TOTAL_COLUMNS; });

  // Write header rows
  for (let r = 0; r < allRows.length; r++) {
    for (let c = 0; c < allRows[r].length; c++) {
      const cell = sheet.getCell(r + 1, c + 1);
      cell.value = allRows[r][c];
      Object.assign(cell, boldCenter);
    }
  }

  console.log('🔗 Applying cell merges...');
  // Apply merges and colors
  HEADER_MERGES.forEach(merge => {
    try {
      sheet.mergeCells(merge.s.r, merge.s.c, merge.e.r, merge.e.c);
      const cell = sheet.getCell(merge.s.r, merge.s.c);
      cell.value = merge.value;
      Object.assign(cell, boldCenter);

      const colorBlock = HEADER_COLORS.find(block =>
        merge.s.c >= block.startCol && merge.s.c <= block.endCol
      );

      if (colorBlock) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: colorBlock.color }
        };
      }
    } catch (error) {
      console.warn(`⚠️  Error merging cells [${merge.s.r}, ${merge.s.c}]:`, error.message);
    }
  });

  console.log('✅ Header setup complete');
}

function fillSubstationData(sheet, substation, startRow) {
  console.log('📝 Filling substation data...');

  const {
    ulp = '',
    noGardu = '',
    namaLokasiGardu = '',
    jenis = '',
    merek = '',
    daya = '',
    tahun = '',
    phasa = '',
    tap_trafo_max_tap = '',
    arahSequence = '',
    penyulang = '',
    tanggal
  } = substation;

  sheet.getCell(startRow, 1).value = 1;
  sheet.getCell(startRow, 2).value = ulp;
  sheet.getCell(startRow, 3).value = noGardu;
  sheet.getCell(startRow, 4).value = namaLokasiGardu;
  sheet.getCell(startRow, 5).value = jenis;
  sheet.getCell(startRow, 6).value = merek;
  sheet.getCell(startRow, 7).value = daya;
  sheet.getCell(startRow, 8).value = tahun;
  sheet.getCell(startRow, 9).value = phasa;
  sheet.getCell(startRow, 10).value = tap_trafo_max_tap;
  sheet.getCell(startRow, 11).value = arahSequence;
  sheet.getCell(startRow, 12).value = penyulang;
  sheet.getCell(startRow, 13).value = formatDate(tanggal);

  console.log(`✅ Substation data filled: ${noGardu}`);
}

function fillMeasurementData(sheet, substation, startRow) {
  console.log('📊 Filling measurement data...');

  const siangMeasurements = substation.measurements_siang || [];
  const malamMeasurements = substation.measurements_malam || [];
  const rows = CONSTANTS.MEASUREMENT_ROWS;

  for (let r = 0; r < rows.length; r++) {
    const rowIdx = startRow + r;

    sheet.getCell(rowIdx, 14).value = rows[r];

    const mSiang = siangMeasurements.find(
      x => x.row_name?.toLowerCase() === rows[r].toLowerCase()
    ) || {};

    const mMalam = malamMeasurements.find(
      x => x.row_name?.toLowerCase() === rows[r].toLowerCase()
    ) || {};

    // Siang ARUS (15-18)
    sheet.getCell(rowIdx, 15).value = formatNumeric(mSiang.r);
    sheet.getCell(rowIdx, 16).value = formatNumeric(mSiang.s);
    sheet.getCell(rowIdx, 17).value = formatNumeric(mSiang.t);
    sheet.getCell(rowIdx, 18).value = formatNumeric(mSiang.n);

    // Siang TEGANGAN (19-23)
    sheet.getCell(rowIdx, 19).value = formatNumeric(mSiang.rn);
    sheet.getCell(rowIdx, 20).value = formatNumeric(mSiang.sn);
    sheet.getCell(rowIdx, 21).value = formatNumeric(mSiang.tn);
    sheet.getCell(rowIdx, 22).value = formatNumeric(mSiang.pp);
    sheet.getCell(rowIdx, 23).value = formatNumeric(mSiang.pn);

    // Malam ARUS (24-27)
    sheet.getCell(rowIdx, 24).value = formatNumeric(mMalam.r);
    sheet.getCell(rowIdx, 25).value = formatNumeric(mMalam.s);
    sheet.getCell(rowIdx, 26).value = formatNumeric(mMalam.t);
    sheet.getCell(rowIdx, 27).value = formatNumeric(mMalam.n);

    // Malam TEGANGAN (28-32)
    sheet.getCell(rowIdx, 28).value = formatNumeric(mMalam.rn);
    sheet.getCell(rowIdx, 29).value = formatNumeric(mMalam.sn);
    sheet.getCell(rowIdx, 30).value = formatNumeric(mMalam.tn);
    sheet.getCell(rowIdx, 31).value = formatNumeric(mMalam.pp);
    sheet.getCell(rowIdx, 32).value = formatNumeric(mMalam.pn);

    // Beban SIANG (33-35)
    sheet.getCell(rowIdx, 33).value = formatNumeric(mSiang.rata2);
    sheet.getCell(rowIdx, 34).value = formatNumeric(mSiang.kva);
    sheet.getCell(rowIdx, 35).value = formatPercentage(mSiang.persen);

    // Beban MALAM (36-38)
    sheet.getCell(rowIdx, 36).value = formatNumeric(mMalam.rata2);
    sheet.getCell(rowIdx, 37).value = formatNumeric(mMalam.kva);
    sheet.getCell(rowIdx, 38).value = formatPercentage(mMalam.persen);

    // Unbalanced (39-40)
    sheet.getCell(rowIdx, 39).value = formatPercentage(mSiang.unbalanced);
    sheet.getCell(rowIdx, 40).value = formatPercentage(mMalam.unbalanced);
  }

  console.log(`✅ Measurement data filled for ${rows.length} rows`);
}

function applyCellStyles(sheet, startRow, endRow) {
  console.log('🎨 Applying cell styles...');

  const border = getCellBorder();
  const alignment = getCellAlignment();
  const font = { name: CONSTANTS.EXCEL.FONT_NAME, size: CONSTANTS.EXCEL.FONT_SIZE };

  for (let r = startRow; r <= endRow; r++) {
    for (let c = 1; c <= CONSTANTS.TOTAL_COLUMNS; c++) {
      const cell = sheet.getCell(r, c);
      cell.border = border;
      if (!cell.style.font) cell.font = font;
      if (!cell.alignment) cell.alignment = alignment;
    }
  }

  console.log(`✅ Styles applied to rows ${startRow}-${endRow}`);
}

function setColumnWidths(sheet) {
  console.log('📏 Setting column widths...');

  for (let c = 1; c <= CONSTANTS.TOTAL_COLUMNS; c++) {
    let width = 8;

    if (c >= 1 && c <= 4) width = 10;
    else if (c >= 5 && c <= 13) width = 12;
    else if (c === 14) width = 15;
    else if (c === 15) width = 10;
    else if (c >= 16 && c <= 35) width = 8;
    else if (c >= 36 && c <= 40) width = 10;

    sheet.getColumn(c).width = width;
  }

  console.log('✅ Column widths set');
}

function mergeIdentityColumns(sheet, startRow, endRow) {
  console.log('🔗 Merging identity columns...');

  for (let c = 1; c <= CONSTANTS.IDENTITY_COLS; c++) {
    try {
      sheet.mergeCells(startRow, c, endRow, c);
    } catch (error) {
      console.warn(`⚠️  Error merging column ${c}:`, error.message);
    }
  }

  console.log('✅ Identity columns merged');
}

// ============ MAIN HANDLER ============

export default async function handler(req, res) {
  console.log(`\n📨 ${new Date().toISOString()} - New request`);

  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    console.log('✅ OPTIONS request handled');
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    console.log(`❌ Invalid method: ${req.method}`);
    return res.status(405).json({
      success: false,
      error: 'Method not allowed',
      message: 'Hanya metode GET yang diperbolehkan'
    });
  }

  let db;

  try {
    console.log('🔍 Validating request parameters...');
    const { id } = req.query;
    const validatedId = validateId(id);
    console.log(`✅ ID validated: ${validatedId}`);

    db = await initPrisma();

    console.log(`🔎 Fetching substation with ID: ${validatedId}`);
    let substation;

    try {
      substation = await db.substation.findUnique({
        where: { id: validatedId },
        include: {
          measurements_siang: {
            where: { status: CONSTANTS.STATUS.ACTIVE },
            orderBy: { row_name: 'asc' }
          },
          measurements_malam: {
            where: { status: CONSTANTS.STATUS.ACTIVE },
            orderBy: { row_name: 'asc' }
          }
        }
      });
    } catch (dbError) {
      console.error('❌ Database query failed:', dbError);
      throw new Error(`Gagal mengambil data dari database: ${dbError.message}`);
    }

    if (!substation) {
      console.log(`❌ Substation not found: ${validatedId}`);
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Data gardu dengan ID ${validatedId} tidak ditemukan`,
        id: validatedId
      });
    }

    console.log(`✅ Substation found: ${substation.noGardu}`);

    // Create workbook
    console.log('📚 Creating Excel workbook...');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(CONSTANTS.EXCEL.SHEET_NAME);

    setupHeaderRows(sheet);

    console.log('📐 Calculating data layout...');
    const startDataRow = CONSTANTS.HEADER_ROWS + 1;
    const rowCount = CONSTANTS.MEASUREMENT_ROWS.length;
    const endDataRow = startDataRow + rowCount - 1;

    console.log(`📍 Data will occupy rows ${startDataRow} to ${endDataRow}`);

    mergeIdentityColumns(sheet, startDataRow, endDataRow);
    fillSubstationData(sheet, substation, startDataRow);
    fillMeasurementData(sheet, substation, startDataRow);

    applyCellStyles(sheet, 1, endDataRow);
    setColumnWidths(sheet);

    // Generate filename and send response
    const filename = generateFilename(substation.noGardu, substation.id);
    console.log(`📄 Filename generated: ${filename}.xlsx`);

    console.log(`📤 Preparing response...`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);

    console.log('✍️  Writing workbook to response stream...');
    await workbook.xlsx.write(res);
    res.end();

    console.log(`✅ Export completed successfully: ${filename}.xlsx`);
    console.log(`⏱️  Total data rows: ${rowCount}`);

  } catch (error) {
    console.error('💥 Error occurred:', error);

    if (res.headersSent) {
      console.error('⚠️  Headers already sent, cannot send error response');
      console.error('⚠️  Error details:', error.message);
      return;
    }

    const errorStatus = error.message.includes('wajib') ? 400 : 500;

    res.status(errorStatus).json({
      success: false,
      error: 'Gagal export data',
      details: error.message,
      hint: 'Periksa log server untuk detail error',
      timestamp: new Date().toISOString()
    });

  } finally {
    if (db) {
      try {
        await db.$disconnect();
        console.log('🔌 Database disconnected');
      } catch (disconnectError) {
        console.warn('⚠️  Failed to disconnect database:', disconnectError.message);
      }
    }

    console.log('✨ Request processing completed\n');
  }
}