const ExcelJS = require('exceljs');

async function generateSubstationExcel(substation, siangMeasurements, malamMeasurements, res) {
  const sub = substation;
  const rows = ['INDUK', '1', '2', '3', '4']; // Data rows for measurements
  const fieldOrder = ['r', 's', 't', 'n', 'rn', 'sn', 'tn', 'pp', 'pn']; // Order of fields for measurements
  const fieldLabels = ['R', 'S', 'T', 'N', 'R-N', 'S-N', 'T-N', 'P-P', 'P-N']; // Labels for measurement fields

  // Helper function to find a row's measurements based on row_name and substationId
  const getRow = (arr, row) => arr.find((x) => x.row_name?.toLowerCase() === row.toLowerCase() && String(x.substationId) === String(sub.id)) || {};

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Rekap Gardu');

  // Define a common style for bold, centered text with word wrapping
  const boldCenter = {
    font: { bold: true, name: 'Calibri', size: 11 },
    alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
  };

  // --- Define Header Rows based on the provided CSV structure ---
  // Total columns inferred from CSV: 44 columns (A to QQ)

  // Header Row 1 (Row 1 in Excel) - Main titles for each block
  // Columns A-D, N, O, PP, QQ are now empty in Row 1, as their labels will merge from Row 2
  const headerRow1Values = [
    '', '', '', '', // Col A-D (empty in Row 1)
    'DATA GARDU', '', '', '', '', '', '', '', '', // Col E-M (9 columns) - Merged below
    '', // Col N (empty in Row 1)
    '', // Col O (empty in Row 1)
    'PENGUKURAN SIANG', '', '', '', '', '', '', '', '', '', // Col P-Y (10 columns) - Merged below
    'PENGUKURAN MALAM', '', '', '', '', '', '', '', '', '', // Col Z-II (10 columns) - Merged below
    'BEBAN', '', '', '', '', '', '', // Col JJ-OO (7 columns) - Merged below
    '', // Col PP (empty in Row 1)
    '' // Col QQ (empty in Row 1)
  ];

  // Header Row 2 (Row 2 in Excel) - Sub-titles for ARUS/TEGANGAN and main labels for A-D, N, O, PP, QQ
  const headerRow2Values = [
    'NO', 'ULP', 'NO. GARDU', 'NAMA / LOKASI', // Col A-D (labels now start here)
    '', '', '', '', '', '', '', '', '', // Col E-M (empty, as labels are on Row 4)
    'TANGGAL', // Col N (label now starts here)
    'JURUSAN', // Col O (label now starts here)
    'ARUS', '', '', '', // Col P-S (4 columns)
    'TEGANGAN', '', '', '', '', // Col T-Y (5 columns)
    'ARUS', '', '', '', // Col Z-CC (4 columns)
    'TEGANGAN', '', '', '', '', // Col DD-II (5 columns)
    '', '', '', '', '', '', '', // Col JJ-OO (empty, as labels are on Row 3)
    
  ];

  // Header Row 3 (Row 3 in Excel) - R,S,T,N, PANGKAL, UJUNG, SIANG, MALAM
  const headerRow3Values = [
    '', '', '', '', // Col A-D (empty, merged from Row 2)
    '', '', '', '', '', '', '', '', '', // Col E-M (empty, merged from Row 4)
    '', // Col N (empty, merged from Row 2)
    // Col O (empty, merged from Row 2)
    'R', 'S', 'T', 'N','', // Col P-S (under ARUS Siang)
    'PANGKAL', '', '', // Col T-V (under TEGANGAN Siang)
    'UJUNG', '', '', // Col W-Y (under TEGANGAN Siang)
    'R', 'S', 'T', 'N', // Col Z-CC (under ARUS Malam)
    'PANGKAL', '', '', // Col DD-FF (under TEGANGAN Malam)
    'UJUNG', '', '', // Col GG-II (under TEGANGAN Malam)
    'SIANG', '', '', // Col JJ-LL (under BEBAN)
    'MALAM', '', '', // Col MM-OO (under BEBAN)
    '', // Col PP (empty, merged from Row 2)
    '' // Col QQ (empty, merged from Row 2)
  ];

  // Header Row 4 (Row 4 in Excel) - DATA GARDU specific fields
  const headerRow4Values = [
    '', '', '', '', // Col A-D (empty, merged from Row 2)
    'JENIS', 'MERK', 'DAYA', 'TAHUN', 'PHASA', 'TAP TRAFO (MAX TAP)', 'ARAH SEQUENCE', 'PENYULANG', '', // Col E-M (under DATA GARDU)
    '', // Col N (empty, merged from Row 2)
    '', // Col O (empty, merged from Row 2)
    '', '', '', 'P-N', // Col P-S (empty, merged from Row 3)
    '', '', '', // Col T-V (empty)
    '', '', '', // Col W-Y (empty)
    '', '', '', '', // Col Z-CC (empty)
    '', '', '', // Col DD-FF (empty)
    '', '', '', // Col GG-II (empty)
    '', '', '', // Col JJ-LL (empty)
    '', '', '', // Col MM-OO (empty)
    '', // Col PP (empty, merged from Row 2)
    '' // Col QQ (empty, merged from Row 2)
  ];

  // Header Row 5 (Row 5 in Excel) - Edit label per kolom di bawah ini
  const headerRow5Values = [
    '',  // A
    '',  // B
    '',  // C
    '',  // D
    '',  // E
    '',  // F
    '',  // G
    '',  // H
    '',  // I
    '',  // J
    '',  // K
    '',  // L
    '',  // M
    '',  // N
    '',  // O
    // --- SIANG (P-Y) ---
    'R',    // P (15)
    'S',    // Q (16)
    'T',    // R (17)
        // S (18)
    'R-N',  // T (19)
    'S-N',  // U (20)
    'T-N',  // V (21)
    'P-P',  // W (22)
    'P-N',  // X (23)
    '',     // Y (24)
    // --- MALAM (Z-II) ---
    'R',    // Z (25)
    'S',    // AA (26)
    'T',    // AB (27)
    'N',    // AC (28)
    'R-N',  // AD (29)
    'S-N',  // AE (30)
    'T-N',  // AF (31)
    'P-P',  // AG (32)
    'P-N',  // AH (33)
    '',     // AI (34)
    // --- BEBAN (JJ-OO) ---
    'RATA2', // AJ (35)
    'KVA',   // AK (36)
    '%',     // AL (37)
    'RATA2', // AM (38)
    'KVA',   // AN (39)
    '%',     // AO (40)
  ];

  // Array of all header rows for easier iteration
  const allHeaderRows = [
    headerRow1Values,
    headerRow2Values,
    headerRow3Values,
    headerRow4Values,
    headerRow5Values
  ];

  // Define all merge cells for the headers
  const headerMerges = [
    // Row 1 Merges (Main Titles)
    { s: { r: 1, c: 5 }, e: { r: 2, c: 12 }, value: 'DATA GARDU' }, // DATA GARDU (E1:M1)
    { s: { r: 1, c: 15 }, e: { r: 1, c: 23 }, value: 'PENGUKURAN SIANG' }, // PENGUKURAN SIANG (P1:Y1)
    { s: { r: 1, c: 24 }, e: { r: 1, c: 32 }, value: 'PENGUKURAN MALAM' }, // PENGUKURAN MALAM (Z1:II1)
    { s: { r: 1, c: 33 }, e: { r: 2, c: 38 }, value: 'BEBAN' }, // BEBAN (JJ1:OO1)

    // Merges for the static header columns (A-D, N, O, PP, QQ) - now starting from Row 2
    { s: { r: 1, c: 1 }, e: { r: 5, c: 1 }, value: 'NO' }, // NO (A2:A5)
    { s: { r: 1, c: 2 }, e: { r: 5, c: 2 }, value: 'ULP' }, // ULP (B2:B5)
    { s: { r: 1, c: 3 }, e: { r: 5, c: 3 }, value: 'NO. GARDU' }, // NO. GARDU (C2:C5)
    { s: { r: 1, c: 4 }, e: { r: 5, c: 4 }, value: 'NAMA / LOKASI' }, // NAMA / LOKASI (D2:D5)
    { s: { r: 1, c: 13 }, e: { r: 5, c: 13 }, value: 'TANGGAL' }, // TANGGAL (N2:N5)
    { s: { r: 1, c: 14 }, e: { r: 5, c: 14 }, value: 'JURUSAN' }, // JURUSAN (O2:O5)
    { s: { r: 1, c: 39 }, e: { r: 5, c: 39 }, value: 'UNBALANCED SIANG' }, // UNBALANCED SIANG (PP2:PP5)
    { s: { r: 1, c: 40 }, e: { r: 5, c: 40 }, value: 'UNBALANCED MALAM' }, // UNBALANCED MALAM (QQ2:QQ5)

    // Row 2 Merges (ARUS/TEGANGAN)
    { s: { r: 2, c: 15 }, e: { r: 2, c: 18 }, value: 'ARUS' }, // ARUS Siang (P2:S2)
    { s: { r: 2, c: 19 }, e: { r: 2, c: 23 }, value: 'TEGANGAN' }, // TEGANGAN Siang (T2:Y2)
    { s: { r: 2, c: 24 }, e: { r: 2, c: 27 }, value: 'ARUS' }, // ARUS Malam (Z2:CC2)
    { s: { r: 2, c: 28 }, e: { r: 2, c: 32 }, value: 'TEGANGAN' }, // TEGANGAN Malam (DD2:II2)

    // Row 3 Merges
    { s: { r: 3, c: 15 }, e: { r: 5, c: 15 }, value: 'R' }, // R Siang (P3:P5)
    { s: { r: 3, c: 16 }, e: { r: 5, c: 16 }, value: 'S' }, // S Siang (Q3:Q5)
    { s: { r: 3, c: 17 }, e: { r: 5, c: 17 }, value: 'T' }, // T Siang (R3:R5)
    { s: { r: 3, c: 18 }, e: { r: 5, c: 18 }, value: 'N' }, // N Siang (S3:S5)
    { s: { r: 3, c: 19 }, e: { r: 3, c: 22 }, value: 'PANGKAL' }, // PANGKAL Siang (T3:V3)
    { s: { r: 3, c: 23 }, e: { r: 3, c: 23 }, value: 'UJUNG' }, // UJUNG Siang (W3:Y3)
    { s: { r: 3, c: 24 }, e: { r: 5, c: 24 }, value: 'R' }, // R Malam (Z3:Z5)
    { s: { r: 3, c: 25 }, e: { r: 5, c: 25 }, value: 'S' }, // S Malam (AA3:AA5)
    { s: { r: 3, c: 26 }, e: { r: 5, c: 26 }, value: 'T' }, // T Malam (BB3:BB5)
    { s: { r: 3, c: 27 }, e: { r: 5, c: 27 }, value: 'N' }, // N Malam (CC3:CC5)
    { s: { r: 3, c: 28 }, e: { r: 3, c: 31 }, value: 'PANGKAL' }, // PANGKAL Malam (DD3:FF3)
    { s: { r: 3, c: 32 }, e: { r: 3, c: 32 }, value: 'UJUNG' }, // UJUNG Malam (GG3:II3)
    { s: { r: 3, c: 33 }, e: { r: 4, c: 35 }, value: 'SIANG' }, // SIANG Beban (JJ3:LL3)
    { s: { r: 3, c: 36 }, e: { r: 4, c: 38 }, value: 'MALAM' }, // MALAM Beban (MM3:OO3)

    // Row 4 Merges (under DATA GARDU)
    { s: { r: 3, c: 5 }, e: { r: 5, c: 5 }, value: 'JENIS' }, // JENIS (E4:E5)
    { s: { r: 3, c: 6 }, e: { r: 5, c: 6 }, value: 'MERK' }, // MERK (F4:F5)
    { s: { r: 3, c: 7 }, e: { r: 5, c: 7 }, value: 'DAYA' }, // DAYA (G4:G5)
    { s: { r: 3, c: 8 }, e: { r: 5, c: 8 }, value: 'TAHUN' }, // TAHUN (H4:H5)
    { s: { r: 3, c: 9 }, e: { r: 5, c: 9 }, value: 'PHASA' }, // PHASA (I4:I5)
    { s: { r: 3, c: 10 }, e: { r: 5, c: 10 }, value: 'TAP TRAFO (MAX TAP)' }, // TAP TRAFO (MAX TAP) (J4:J5)
    { s: { r: 3, c: 11 }, e: { r: 5, c: 11 }, value: 'ARAH SEQUENCE' }, // ARAH SEQUENCE (K4:K5)
    { s: { r: 3, c: 12 }, e: { r: 5, c: 12 }, value: 'PENYULANG' }, // PENYULANG (L4:L5)
    { s: { r: 4, c: 19 }, e: { r: 4, c: 21 }, value: 'P-N' }, // TAHUN (H4:H5)
    { s: { r: 4, c: 28 }, e: { r: 4, c: 30 }, value: 'P-N' }, // TAHUN (H4:H5)
  

  // Row 5 Merges (under DATA GARDU)
  { s: { r: 5, c: 19 }, e: { r: 5, c: 19 }, value: 'R-N' }, // TAHUN (H4:H5)
  { s: { r: 5, c: 20 }, e: { r: 5, c: 20 }, value: 'S-N' }, // TAHUN (H4:H5)
  { s: { r: 5, c: 21 }, e: { r: 5, c: 21 }, value: 'T-N' }, // TAHUN (H4:H5)
  { s: { r: 4, c: 22 }, e: { r: 5, c: 22 }, value: 'P-P' }, // TAHUN (H4:H5)
  { s: { r: 4, c: 23 }, e: { r: 5, c: 23 }, value: 'P-N' }, // TAHUN (H4:H5)
  { s: { r: 5, c: 28 }, e: { r: 5, c: 28 }, value: 'R-N' }, // TAHUN (H4:H5)
  { s: { r: 5, c: 29 }, e: { r: 5, c: 29 }, value: 'S-N' }, // TAHUN (H4:H5)
  { s: { r: 5, c: 30 }, e: { r: 5, c: 30 }, value: 'T-N' }, // TAHUN (H4:H5)
  { s: { r: 4, c: 31 }, e: { r: 5, c: 31 }, value: 'P-P' }, // TAHUN (H4:H5)
  { s: { r: 4, c: 32 }, e: { r: 5, c: 32 }, value: 'P-N' }, // TAHUN (H4:H5)
  { s: { r: 5, c: 33 }, e: { r: 5, c: 33 }, value: 'RATA2' }, // TAHUN (H4:H5)
  { s: { r: 5, c: 34 }, e: { r: 5, c: 34 }, value: 'KVA' }, // TAHUN (H4:H5)
  { s: { r: 5, c: 35 }, e: { r: 5, c: 35 }, value: '%' }, // TAHUN (H4:H5)
  { s: { r: 5, c: 36 }, e: { r: 5, c: 36 }, value: 'RATA2' }, // TAHUN (H4:H5)
  { s: { r: 5, c: 37 }, e: { r: 5, c: 37 }, value: 'KVA' }, // TAHUN (H4:H5)
  { s: { r: 5, c: 38 }, e: { r: 5, c: 38 }, value: '%' }, // TAHUN (H4:H5)
  
 

];


  // Colors for main header blocks (Row 1)
  const headerColors = [
    { startCol: 1, endCol: 4, color: 'FFB6E7C9' }, // NO, ULP, NO. GARDU, NAMA / LOKASI (Light Green)
    { startCol: 5, endCol: 13, color: 'FFB6E7C9' }, // DATA GARDU (Light Green)
    { startCol: 14, endCol: 14, color: 'FFB6E7C9' }, // TANGGAL, JURUSAN (Light Green)
    { startCol: 15, endCol: 23, color: 'FFFFF59D' }, // PENGUKURAN SIANG (Yellow)
    { startCol: 24, endCol: 32, color: 'FFFFCC80' }, // PENGUKURAN MALAM (Light Orange)
    { startCol: 33, endCol: 40, color: 'FF90CAF9' }, // BEBAN (Light Blue)
    { startCol: 33, endCol: 40, color: 'FF90CAF9' }, // UNBALANCED SIANG, UNBALANCED MALAM (Light Blue)
  ];

  // 1. Potong semua array headerRowXValues hanya sampai 40 elemen.
  headerRow1Values.length = 40;
  headerRow2Values.length = 40;
  headerRow3Values.length = 40;
  headerRow4Values.length = 40;
  headerRow5Values.length = 40;
  // 2. Filter headerMerges dan headerColors agar tidak ada yang menyentuh kolom 41 ke atas
  const filteredHeaderMerges = headerMerges.filter(m => m.s.c <= 40 && m.e.c <= 40);
  const filteredHeaderColors = headerColors.filter(c => c.startCol <= 40);
  // 3. Pada pengisian data, hanya isi sampai sheet.getCell(rowIdx, 40)
  // (Pastikan loop pengisian data dan pengaturan lebar kolom hanya sampai 40)

  // Set header values and apply merges and colors
  for (let r = 0; r < allHeaderRows.length; r++) {
    const currentRowValues = allHeaderRows[r];
    for (let c = 0; c < currentRowValues.length; c++) {
      const cell = sheet.getCell(r + 1, c + 1);
      cell.value = currentRowValues[c];
      Object.assign(cell, boldCenter); // Apply bold and center alignment
    }
  }

  // Apply merges and set colors for the merged cells (top-left cell of the merge)
  filteredHeaderMerges.forEach(merge => {
    sheet.mergeCells(merge.s.r, merge.s.c, merge.e.r, merge.e.c);
    const cell = sheet.getCell(merge.s.r, merge.s.c);
    cell.value = merge.value; // Ensure value is set after merge
    Object.assign(cell, boldCenter); // Re-apply style as merge can sometimes reset it
    // Apply background color based on the main block it belongs to
    const colorBlock = filteredHeaderColors.find(block => merge.s.c >= block.startCol && merge.s.c <= block.endCol);
    if (colorBlock) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: colorBlock.color } };
    }
  });

  // --- Populate Data Rows (starting from Row 6) ---
  const dataStartRow = 6; // Data starts after 5 header rows
  const totalRowsWithHeadersAndData = dataStartRow + rows.length - 1; // Total rows including headers and data

  // Merge identitas columns (A-M / 1-13) vertically from row 6 to 10
  for (let c = 1; c <= 13; c++) {
    sheet.mergeCells(dataStartRow, c, dataStartRow + rows.length - 1, c);
  }

  // Isi data identitas hanya di baris 6 (data INDUK)
  sheet.getCell(dataStartRow, 1).value = sub.no;
  sheet.getCell(dataStartRow, 2).value = sub.ulp;
  sheet.getCell(dataStartRow, 3).value = sub.noGardu;
  sheet.getCell(dataStartRow, 4).value = sub.namaLokasiGardu;
  sheet.getCell(dataStartRow, 5).value = sub.jenis;
  sheet.getCell(dataStartRow, 6).value = sub.merek;
  sheet.getCell(dataStartRow, 7).value = sub.daya;
  sheet.getCell(dataStartRow, 8).value = sub.tahun;
  sheet.getCell(dataStartRow, 9).value = sub.phasa;
  sheet.getCell(dataStartRow, 10).value = sub.tap_trafo_max_tap;
  sheet.getCell(dataStartRow, 11).value = sub.arahSequence;
  sheet.getCell(dataStartRow, 12).value = sub.penyulang;
  sheet.getCell(dataStartRow, 13).value = sub.tanggal;

  // Data measurement (kolom 14 dst) tetap 5 baris (INDUK, 1, 2, 3, 4)
  for (let r = 0; r < rows.length; r++) {
    const rowIdx = dataStartRow + r; // Current Excel row index for data
    // JURUSAN (Col O / 14)
    sheet.getCell(rowIdx, 14).value = rows[r];
    // Siang Measurements (Col P-Y) - 9 data fields + 1 empty (Col 24)
    const mSiang = getRow(siangMeasurements, rows[r]);
    sheet.getCell(rowIdx, 15).value = mSiang.r ?? '';
    sheet.getCell(rowIdx, 16).value = mSiang.s ?? '';
    sheet.getCell(rowIdx, 17).value = mSiang.t ?? '';
    sheet.getCell(rowIdx, 18).value = mSiang.n ?? '';
    sheet.getCell(rowIdx, 19).value = mSiang.rn ?? '';
    sheet.getCell(rowIdx, 20).value = mSiang.sn ?? '';
    sheet.getCell(rowIdx, 21).value = mSiang.tn ?? '';
    sheet.getCell(rowIdx, 22).value = mSiang.pp ?? '';
    sheet.getCell(rowIdx, 23).value = mSiang.pn ?? '';
  
    // Malam Measurements (Col Z-II) - 9 data fields + 1 empty (Col 33)
    const mMalam = getRow(malamMeasurements, rows[r]);
    sheet.getCell(rowIdx, 24).value = mMalam.r ?? '';
    sheet.getCell(rowIdx, 25).value = mMalam.s ?? '';
    sheet.getCell(rowIdx, 26).value = mMalam.t ?? '';
    sheet.getCell(rowIdx, 27).value = mMalam.n ?? '';
    sheet.getCell(rowIdx, 28).value = mMalam.rn ?? '';
    sheet.getCell(rowIdx, 29).value = mMalam.sn ?? '';
    sheet.getCell(rowIdx, 30).value = mMalam.tn ?? '';
    sheet.getCell(rowIdx, 31).value = mMalam.pp ?? '';
    sheet.getCell(rowIdx, 32).value = mMalam.pn ?? '';
  
    // Hasil Beban (Col JJ-OO) - 6 data fields + 1 empty (Col 42)
    sheet.getCell(rowIdx, 33).value = mSiang?.rata2 ?? '';
    sheet.getCell(rowIdx, 34).value = mSiang?.kva ?? '';
    sheet.getCell(rowIdx, 35).value = mSiang?.persen !== undefined ? `${Number(mSiang.persen).toFixed(1)}%` : '';
    sheet.getCell(rowIdx, 36).value = mMalam?.rata2 ?? '';
    sheet.getCell(rowIdx, 37).value = mMalam?.kva ?? '';
    sheet.getCell(rowIdx, 38).value = mMalam?.persen !== undefined ? `${Number(mMalam.persen).toFixed(1)}%` : '';

    // Unbalanced (Col PP, QQ)
    sheet.getCell(rowIdx, 39).value = mSiang?.unbalanced !== undefined ? `${Number(mSiang.unbalanced).toFixed(1)}%` : '';
    sheet.getCell(rowIdx, 40).value = mMalam?.unbalanced !== undefined ? `${Number(mMalam.unbalanced).toFixed(1)}%` : '';
  }

  // Apply general styling (borders, default font, alignment) to all relevant cells
  const totalCols = headerRow1Values.length; // Max columns is 44

  for (let r = 1; r <= totalRowsWithHeadersAndData; r++) {
    for (let c = 1; c <= totalCols; c++) {
      const cell = sheet.getCell(r, c);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
      // Ensure existing styles (like boldCenter and fill from headerMerges) are not overwritten
      if (!cell.style.font) cell.font = { name: 'Calibri', size: 11 };
      if (!cell.alignment) cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    }
  }

  // Set column widths for better readability
  // Adjust these values as needed for optimal display
  for (let c = 1; c <= 40; c++) { // Changed to 40
    if (c >= 1 && c <= 4) sheet.getColumn(c).width = 10; // NO, ULP, NO. GARDU, NAMA / LOKASI
    else if (c >= 5 && c <= 13) sheet.getColumn(c).width = 12; // DATA GARDU fields
    else if (c === 14) sheet.getColumn(c).width = 15; // TANGGAL
    else if (c === 15) sheet.getColumn(c).width = 10; // JURUSAN
    else if (c >= 16 && c <= 35) sheet.getColumn(c).width = 8; // PENGUKURAN SIANG/MALAM fields
    else if (c >= 36 && c <= 40) sheet.getColumn(c).width = 10; // BEBAN fields
    else if (c >= 41 && c <= 42) sheet.getColumn(c).width = 12; // UNBALANCED fields
    else sheet.getColumn(c).width = 10; // Default for any other column
  }


  // Set HTTP headers for file download
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=RekapGardu_${sub.noGardu}.xlsx`);

  // Write the workbook to the response stream and end the response
  try {
  await workbook.xlsx.write(res);
  res.end();
  } catch (error) {
    console.error("Failed to generate Excel file:", error);
    if (!res.headersSent) {
      res.status(500).send('Error generating Excel report.');
    }
  }
}

module.exports = { generateSubstationExcel }; 
