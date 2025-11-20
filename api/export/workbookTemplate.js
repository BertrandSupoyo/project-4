import ExcelJS from 'exceljs';

const ROW_LABELS = ['INDUK', '1', '2', '3', '4'];

const HEADER_ROW_1 = ['', '', '', '', 'DATA GARDU', '', '', '', '', '', '', '', '', '', '', 'PENGUKURAN SIANG', '', '', '', '', '', '', '', '', '', 'PENGUKURAN MALAM', '', '', '', '', '', '', '', '', '', 'BEBAN', '', '', '', '', '', '', '', ''];
const HEADER_ROW_2 = ['NO', 'ULP', 'NO. GARDU', 'NAMA / LOKASI', '', '', '', '', '', '', '', '', '', 'TANGGAL', 'JURUSAN', 'ARUS', '', '', '', 'TEGANGAN', '', '', '', '', 'ARUS', '', '', '', 'TEGANGAN', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
const HEADER_ROW_3 = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'R', 'S', 'T', 'N', '', 'PANGKAL', '', '', 'UJUNG', '', '', 'R', 'S', 'T', 'N', 'PANGKAL', '', '', 'UJUNG', '', '', 'SIANG', '', '', 'MALAM', '', '', '', ''];
const HEADER_ROW_4 = ['', '', '', '', 'JENIS', 'MERK', 'DAYA', 'TAHUN', 'PHASA', 'TAP TRAFO (MAX TAP)', 'ARAH SEQUENCE', 'PENYULANG', '', '', '', '', '', '', 'P-N', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
const HEADER_ROW_5 = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'R', 'S', 'T', 'N', 'R-N', 'S-N', 'T-N', 'P-P', 'P-N', '', 'R', 'S', 'T', 'N', 'R-N', 'S-N', 'T-N', 'P-P', 'P-N', '', 'RATA2', 'KVA', '%', 'RATA2', 'KVA', '%', '', ''];

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
  { s: { r: 5, c: 38 }, e: { r: 5, c: 38 }, value: '%' },
];

const HEADER_COLORS = [
  { startCol: 1, endCol: 4, color: 'FFB6E7C9' },
  { startCol: 5, endCol: 13, color: 'FFB6E7C9' },
  { startCol: 14, endCol: 14, color: 'FFB6E7C9' },
  { startCol: 15, endCol: 23, color: 'FFFFF59D' },
  { startCol: 24, endCol: 32, color: 'FFFFCC80' },
  { startCol: 33, endCol: 40, color: 'FF90CAF9' },
];

const BOLD_CENTER = {
  font: { bold: true, name: 'Calibri', size: 11 },
  alignment: { vertical: 'middle', horizontal: 'center', wrapText: true },
};

export function buildSubstationWorkbook(data, options = {}) {
  const workbook = new ExcelJS.Workbook();
  const sheetName = options.sheetName || 'Riwayat Pengukuran';
  const sheet = workbook.addWorksheet(sheetName);

  const headerRows = [HEADER_ROW_1, HEADER_ROW_2, HEADER_ROW_3, HEADER_ROW_4, HEADER_ROW_5];
  headerRows.forEach((rowValues, rowIdx) => {
    rowValues.length = 40;
    rowValues.forEach((value, colIdx) => {
      const cell = sheet.getCell(rowIdx + 1, colIdx + 1);
      cell.value = value;
      Object.assign(cell, BOLD_CENTER);
    });
  });

  HEADER_MERGES.forEach((merge) => {
    sheet.mergeCells(merge.s.r, merge.s.c, merge.e.r, merge.e.c);
    const cell = sheet.getCell(merge.s.r, merge.s.c);
    cell.value = merge.value;
    Object.assign(cell, BOLD_CENTER);

    const colorBlock = HEADER_COLORS.find(
      (block) => merge.s.c >= block.startCol && merge.s.c <= block.endCol
    );

    if (colorBlock) {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: colorBlock.color },
      };
    }
  });

  const normalizedData = Array.isArray(data)
    ? data.map((item) =>
        item.substation
          ? item
          : {
              substation: item,
              siang: item.measurements_siang || [],
              malam: item.measurements_malam || [],
            }
      )
    : [];

  let currentRow = 6;
  let noUrut = options.startIndex ?? 1;

  normalizedData.forEach((item) => {
    const sub = item.substation || {};
    const siang = item.siang || [];
    const malam = item.malam || [];

    for (let c = 1; c <= 13; c++) {
      sheet.mergeCells(currentRow, c, currentRow + ROW_LABELS.length - 1, c);
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
      const date = new Date(sub.tanggal);
      if (!Number.isNaN(date.getTime())) {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        sheet.getCell(currentRow, 13).value = `${day}/${month}/${year}`;
      } else {
        sheet.getCell(currentRow, 13).value = '';
      }
    } else {
      sheet.getCell(currentRow, 13).value = '';
    }

    ROW_LABELS.forEach((label, idx) => {
      const rowIdx = currentRow + idx;
      sheet.getCell(rowIdx, 14).value = label;

      const findMeasurement = (arr) =>
        arr.find((m) => m.row_name?.toLowerCase() === label.toLowerCase()) || {};

      const mSiang = findMeasurement(siang);
      const mMalam = findMeasurement(malam);

      sheet.getCell(rowIdx, 15).value = mSiang.r ?? '';
      sheet.getCell(rowIdx, 16).value = mSiang.s ?? '';
      sheet.getCell(rowIdx, 17).value = mSiang.t ?? '';
      sheet.getCell(rowIdx, 18).value = mSiang.n ?? '';
      sheet.getCell(rowIdx, 19).value = mSiang.rn ?? '';
      sheet.getCell(rowIdx, 20).value = mSiang.sn ?? '';
      sheet.getCell(rowIdx, 21).value = mSiang.tn ?? '';
      sheet.getCell(rowIdx, 22).value = mSiang.pp ?? '';
      sheet.getCell(rowIdx, 23).value = mSiang.pn ?? '';

      sheet.getCell(rowIdx, 24).value = mMalam.r ?? '';
      sheet.getCell(rowIdx, 25).value = mMalam.s ?? '';
      sheet.getCell(rowIdx, 26).value = mMalam.t ?? '';
      sheet.getCell(rowIdx, 27).value = mMalam.n ?? '';
      sheet.getCell(rowIdx, 28).value = mMalam.rn ?? '';
      sheet.getCell(rowIdx, 29).value = mMalam.sn ?? '';
      sheet.getCell(rowIdx, 30).value = mMalam.tn ?? '';
      sheet.getCell(rowIdx, 31).value = mMalam.pp ?? '';
      sheet.getCell(rowIdx, 32).value = mMalam.pn ?? '';

      sheet.getCell(rowIdx, 33).value = mSiang.rata2 ?? '';
      sheet.getCell(rowIdx, 34).value = mSiang.kva ?? '';
      sheet.getCell(rowIdx, 35).value =
        mSiang.persen !== undefined ? `${Number(mSiang.persen).toFixed(1)}%` : '';
      sheet.getCell(rowIdx, 36).value = mMalam.rata2 ?? '';
      sheet.getCell(rowIdx, 37).value = mMalam.kva ?? '';
      sheet.getCell(rowIdx, 38).value =
        mMalam.persen !== undefined ? `${Number(mMalam.persen).toFixed(1)}%` : '';
      sheet.getCell(rowIdx, 39).value =
        mSiang.unbalanced !== undefined ? `${Number(mSiang.unbalanced).toFixed(1)}%` : '';
      sheet.getCell(rowIdx, 40).value =
        mMalam.unbalanced !== undefined ? `${Number(mMalam.unbalanced).toFixed(1)}%` : '';
    });

    currentRow += ROW_LABELS.length;
    noUrut += 1;
  });

  for (let r = 1; r < currentRow; r++) {
    for (let c = 1; c <= 40; c++) {
      const cell = sheet.getCell(r, c);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
      if (!cell.style.font) cell.font = { name: 'Calibri', size: 11 };
      if (!cell.alignment) {
        cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      }
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

  return workbook;
}

