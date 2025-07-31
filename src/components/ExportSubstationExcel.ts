import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { SubstationData } from '../types';

export async function exportSubstationToExcel(
  substation: SubstationData,
  siangMeasurements: any[],
  malamMeasurements: any[]
) {
  const sub = substation;
  const rows = ['induk', '1', '2', '3', '4'];
  const fieldOrder = ['r','s','t','n','rn','sn','tn','pp','pn'];
  const titikHeader = ['R','S','T','N','R-N','S-N','T-N','P-P','P-N'];

  const getRow = (arr: any[], row: string) => arr.find((x: any) => x.row_name?.toLowerCase() === row && String(x.substationId) === String(sub.id)) || {};
  const siang = rows.map(row => getRow(siangMeasurements, row));
  const malam = rows.map(row => getRow(malamMeasurements, row));

  // Hasil beban
  const rata2Siang = siang[0]?.rata2 ?? '';
  const kvaSiang = siang[0]?.kva ?? '';
  const persenSiang = siang[0]?.persen !== undefined ? `${Number(siang[0]?.persen).toFixed(1)}%` : '';
  const unbSiang = siang[0]?.unbalanced !== undefined ? `${Number(siang[0]?.unbalanced).toFixed(0)}%` : '';

  const rata2Malam = malam[0]?.rata2 ?? '';
  const kvaMalam = malam[0]?.kva ?? '';
  const persenMalam = malam[0]?.persen !== undefined ? `${Number(malam[0]?.persen).toFixed(1)}%` : '';
  const unbMalam = malam[0]?.unbalanced !== undefined ? `${Number(malam[0]?.unbalanced).toFixed(0)}%` : '';

  const identitasHeader = ['NO', 'ULP', 'NO. GARDU', 'NAMA / LOKASI', 'JENIS', 'MERK', 'DAYA', 'TAHUN', 'PHASA', 'JML TRAFO (MAX)', 'PENYULANG', 'ARAH SEQUENCE', 'TANGGAL'];
  const identitas = [sub.no, sub.ulp, sub.noGardu, sub.namaLokasiGardu, sub.jenis, sub.merek, sub.daya, sub.tahun, sub.phasa, sub.tap_trafo_max_tap, sub.penyulang, sub.arahSequence, sub.tanggal];

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Rekap Gardu');

  // Header baris 1 s.d. 4
  const header1 = [
    ...identitasHeader,
    ...Array(rows.length * fieldOrder.length).fill(''),
    ...Array(rows.length * fieldOrder.length).fill(''),
    ...Array(8).fill('')
  ];
  header1[identitasHeader.length] = 'PENGUKURAN SIANG';
  header1[identitasHeader.length + rows.length * fieldOrder.length] = 'PENGUKURAN MALAM';
  header1[identitasHeader.length + 2 * rows.length * fieldOrder.length] = 'BEBAN';

  const header2 = [
    ...Array(identitasHeader.length).fill(''),
    ...Array(rows.length * fieldOrder.length).fill('ARUS'),
    ...Array(rows.length * fieldOrder.length).fill('ARUS'),
    'SIANG','','','MALAM','','','UNBALANCED SIANG','UNBALANCED MALAM'
  ];
  const header3 = [
    ...Array(identitasHeader.length).fill(''),
    ...rows.map(t => Array(fieldOrder.length).fill(t.toUpperCase())).flat(),
    ...rows.map(t => Array(fieldOrder.length).fill(t.toUpperCase())).flat(),
    'RATA2','KVA','%','RATA2','KVA','%','UNBALANCED SIANG','UNBALANCED MALAM'
  ];
  const header4 = [
    ...Array(identitasHeader.length).fill(''),
    ...rows.map(() => [...titikHeader]).flat(),
    ...rows.map(() => [...titikHeader]).flat(),
    'RATA2','KVA','%','RATA2','KVA','%','UNBALANCED SIANG','UNBALANCED MALAM'
  ];

  const dataRow = [
    ...identitas,
    ...siang.map(m => fieldOrder.map(f => m[f] ?? '')).flat(),
    ...malam.map(m => fieldOrder.map(f => m[f] ?? '')).flat(),
    rata2Siang, kvaSiang, persenSiang, rata2Malam, kvaMalam, persenMalam, unbSiang, unbMalam
  ];

  const rowsData = [header1, header2, header3, header4, dataRow];
  rowsData.forEach((row, i) => {
    const newRow = sheet.addRow(row);
    newRow.eachCell((cell, colNumber) => {
      cell.font = { name: 'Calibri', size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      // Style khusus header
      if (i === 0) {
        if (colNumber <= identitasHeader.length) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'C6EFCE' } }; // hijau
        } else if (colNumber <= identitasHeader.length + rows.length * fieldOrder.length) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDE68A' } }; // kuning
        } else if (colNumber <= identitasHeader.length + 2 * rows.length * fieldOrder.length) {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF4B084' } }; // oranye
        } else {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F81BD' } }; // biru
          cell.font = { ...cell.font, color: { argb: 'FFFFFFFF' }, bold: true };
        }
        cell.font = { ...cell.font, bold: true };
      }
    });
  });

  // Lebar kolom
  sheet.columns = rowsData[0].map(() => ({ width: 12 }));

  // Merge header
  sheet.mergeCells(1, 1, 1, identitasHeader.length);
  sheet.mergeCells(1, identitasHeader.length + 1, 1, identitasHeader.length + rows.length * fieldOrder.length);
  sheet.mergeCells(1, identitasHeader.length + rows.length * fieldOrder.length + 1, 1, identitasHeader.length + 2 * rows.length * fieldOrder.length);
  sheet.mergeCells(1, identitasHeader.length + 2 * rows.length * fieldOrder.length + 1, 1, identitasHeader.length + 2 * rows.length * fieldOrder.length + 8);

  const totalMerge = rows.length;
  for (let i = 0; i < totalMerge; i++) {
    const startSiang = identitasHeader.length + i * fieldOrder.length + 1;
    const endSiang = startSiang + fieldOrder.length - 1;
    sheet.mergeCells(2, startSiang, 2, endSiang);

    const startMalam = identitasHeader.length + totalMerge * fieldOrder.length + i * fieldOrder.length + 1;
    const endMalam = startMalam + fieldOrder.length - 1;
    sheet.mergeCells(2, startMalam, 2, endMalam);
  }

  // Merge BEBAN
  sheet.mergeCells(2, identitasHeader.length + 2 * totalMerge * fieldOrder.length + 1, 2, identitasHeader.length + 2 * totalMerge * fieldOrder.length + 3);
  sheet.mergeCells(2, identitasHeader.length + 2 * totalMerge * fieldOrder.length + 4, 2, identitasHeader.length + 2 * totalMerge * fieldOrder.length + 6);

  // Save
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `RekapGardu_${sub.noGardu}.xlsx`);
} 