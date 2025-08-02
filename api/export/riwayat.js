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
    
    // Get all substations with measurements
    const substations = await db.substation.findMany({
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

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Riwayat Pengukuran');
    
    const rows = ['INDUK', '1', '2', '3', '4'];
    const fieldOrder = ['r', 's', 't', 'n', 'rn', 'sn', 'tn', 'pp', 'pn'];
    const fieldLabels = ['R', 'S', 'T', 'N', 'R-N', 'S-N', 'T-N', 'P-P', 'P-N'];

    const boldCenter = {
      font: { bold: true, name: 'Calibri', size: 11 },
      alignment: { vertical: 'middle', horizontal: 'center', wrapText: true }
    };

    // Header rows
    const headerRow1Values = ['', '', '', '', 'DATA GARDU', '', '', '', '', '', '', '', '', '', '', 'PENGUKURAN SIANG', '', '', '', '', '', '', '', '', '', 'PENGUKURAN MALAM', '', '', '', '', '', '', '', '', '', 'BEBAN', '', '', '', '', '', '', '', ''];
    const headerRow2Values = ['NO', 'ULP', 'NO. GARDU', 'NAMA / LOKASI', '', '', '', '', '', '', '', '', '', 'TANGGAL', 'JURUSAN', 'ARUS', '', '', '', 'TEGANGAN', '', '', '', '', 'ARUS', '', '', '', 'TEGANGAN', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    const headerRow3Values = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'R', 'S', 'T', 'N', '', 'PANGKAL', '', '', 'UJUNG', '', '', 'R', 'S', 'T', 'N', 'PANGKAL', '', '', 'UJUNG', '', '', 'SIANG', '', '', 'MALAM', '', '', '', ''];
    const headerRow4Values = ['', '', '', '', 'JENIS', 'MERK', 'DAYA', 'TAHUN', 'PHASA', 'TAP TRAFO (MAX TAP)', 'ARAH SEQUENCE', 'PENYULANG', '', '', '', '', '', '', 'P-N', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
    const headerRow5Values = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', 'R', 'S', 'T', 'N', 'R-N', 'S-N', 'T-N', 'P-P', 'P-N', '', 'R', 'S', 'T', 'N', 'R-N', 'S-N', 'T-N', 'P-P', 'P-N', '', 'RATA2', 'KVA', '%', 'RATA2', 'KVA', '%', '', ''];
    
    const allHeaderRows = [headerRow1Values, headerRow2Values, headerRow3Values, headerRow4Values, headerRow5Values];
    
    // Add header rows
    allHeaderRows.forEach((row, index) => {
      const excelRow = sheet.addRow(row);
      excelRow.eachCell((cell) => {
        cell.style = boldCenter;
      });
    });

    // Add data rows for each substation
    let rowIndex = 6; // Start after headers
    substations.forEach((substation) => {
      const siang = substation.measurements_siang || [];
      const malam = substation.measurements_malam || [];
      
      const getRow = (arr, row) => arr.find(x => x.row_name?.toLowerCase() === row.toLowerCase() && String(x.substationId) === String(substation.id)) || {};
      const siangData = rows.map(row => getRow(siang, row));
      const malamData = rows.map(row => getRow(malam, row));

      // Get beban data (induk row)
      const siangInduk = siangData[0] || {};
      const malamInduk = malamData[0] || {};

      const dataRow = [
        substation.no,
        substation.ulp,
        substation.noGardu,
        substation.namaLokasiGardu,
        substation.jenis,
        substation.merek,
        substation.daya,
        substation.tahun,
        substation.phasa,
        substation.tap_trafo_max_tap,
        substation.arahSequence,
        substation.penyulang,
        substation.tanggal ? new Date(substation.tanggal).toLocaleDateString('id-ID') : '',
        'INDUK',
        ...siangData.map(m => fieldOrder.map(f => m[f] || '')).flat(),
        ...malamData.map(m => fieldOrder.map(f => m[f] || '')).flat(),
        siangInduk.rata2 || '',
        siangInduk.kva || '',
        siangInduk.persen ? `${Number(siangInduk.persen).toFixed(1)}%` : '',
        malamInduk.rata2 || '',
        malamInduk.kva || '',
        malamInduk.persen ? `${Number(malamInduk.persen).toFixed(1)}%` : '',
        siangInduk.unbalanced ? `${Number(siangInduk.unbalanced).toFixed(1)}%` : '',
        malamInduk.unbalanced ? `${Number(malamInduk.unbalanced).toFixed(1)}%` : ''
      ];

      const excelRow = sheet.addRow(dataRow);
      excelRow.eachCell((cell, colNumber) => {
        if (colNumber <= 13) {
          cell.style = { font: { bold: true } };
        }
      });

      rowIndex++;
    });

    // Set column widths
    for (let i = 1; i <= 50; i++) {
      sheet.getColumn(i).width = 12;
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=riwayat_pengukuran.xlsx');

    // Write to response
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