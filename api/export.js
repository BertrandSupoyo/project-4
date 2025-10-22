import { PrismaClient } from '../../prisma/app/generated/prisma-client/index.js';
import { withAccelerate } from '@prisma/extension-accelerate';

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
  res.setHeader('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await initPrisma();
    const { type, substationId, format = 'json' } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Type is required (riwayat, substation, substation-detail)'
      });
    }

    // Export Riwayat
    if (type === 'riwayat') {
      const { startDate, endDate, ulp, jenis } = req.query;
      
      const whereClause = {};
      if (startDate && endDate) {
        whereClause.tanggal = {
          gte: new Date(startDate),
          lte: new Date(endDate)
        };
      }
      if (ulp) whereClause.ulp = ulp;
      if (jenis) whereClause.jenis = jenis;

      const substations = await db.substation.findMany({
        where: whereClause,
        include: {
          measurements_siang: true,
          measurements_malam: true
        },
        orderBy: { tanggal: 'desc' }
      });

      if (format === 'excel') {
        // Generate Excel file
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Riwayat Gardu');

        // Add headers
        worksheet.addRow([
          'No', 'No Gardu', 'Nama Lokasi', 'ULP', 'Jenis', 'Daya', 'Status', 'Tanggal'
        ]);

        // Add data
        substations.forEach((substation, index) => {
          worksheet.addRow([
            index + 1,
            substation.noGardu,
            substation.namaLokasiGardu,
            substation.ulp,
            substation.jenis,
            substation.daya,
            substation.status,
            substation.tanggal
          ]);
        });

        // Set response headers for Excel
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="riwayat_gardu.xlsx"');
        
        await workbook.xlsx.write(res);
        return;
      }

      return res.json({
        success: true,
        data: substations
      });
    }

    // Export Substation
    if (type === 'substation') {
      const substations = await db.substation.findMany({
        include: {
          measurements_siang: true,
          measurements_malam: true
        },
        orderBy: { no: 'asc' }
      });

      if (format === 'excel') {
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data Gardu');

        // Add headers
        worksheet.addRow([
          'No', 'No Gardu', 'Nama Lokasi', 'ULP', 'Jenis', 'Merek', 'Daya', 'Tahun', 'Status'
        ]);

        // Add data
        substations.forEach((substation, index) => {
          worksheet.addRow([
            index + 1,
            substation.noGardu,
            substation.namaLokasiGardu,
            substation.ulp,
            substation.jenis,
            substation.merek,
            substation.daya,
            substation.tahun,
            substation.status
          ]);
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="data_gardu.xlsx"');
        
        await workbook.xlsx.write(res);
        return;
      }

      return res.json({
        success: true,
        data: substations
      });
    }

    // Export Substation Detail
    if (type === 'substation-detail' && substationId) {
      const substation = await db.substation.findUnique({
        where: { id: substationId },
        include: {
          measurements_siang: true,
          measurements_malam: true
        }
      });

      if (!substation) {
        return res.status(404).json({
          success: false,
          error: 'Substation not found'
        });
      }

      if (format === 'excel') {
        const ExcelJS = require('exceljs');
        const workbook = new ExcelJS.Workbook();
        
        // Main data sheet
        const mainSheet = workbook.addWorksheet('Data Gardu');
        mainSheet.addRow(['Field', 'Value']);
        mainSheet.addRow(['No Gardu', substation.noGardu]);
        mainSheet.addRow(['Nama Lokasi', substation.namaLokasiGardu]);
        mainSheet.addRow(['ULP', substation.ulp]);
        mainSheet.addRow(['Jenis', substation.jenis]);
        mainSheet.addRow(['Daya', substation.daya]);
        mainSheet.addRow(['Status', substation.status]);

        // Measurements sheets
        if (substation.measurements_siang.length > 0) {
          const siangSheet = workbook.addWorksheet('Pengukuran Siang');
          siangSheet.addRow(['Bulan', 'R', 'S', 'T', 'N', 'RN', 'SN', 'TN', 'PP', 'PN', 'Unbalanced']);
          substation.measurements_siang.forEach(measurement => {
            siangSheet.addRow([
              measurement.month,
              measurement.r,
              measurement.s,
              measurement.t,
              measurement.n,
              measurement.rn,
              measurement.sn,
              measurement.tn,
              measurement.pp,
              measurement.pn,
              measurement.unbalanced
            ]);
          });
        }

        if (substation.measurements_malam.length > 0) {
          const malamSheet = workbook.addWorksheet('Pengukuran Malam');
          malamSheet.addRow(['Bulan', 'R', 'S', 'T', 'N', 'RN', 'SN', 'TN', 'PP', 'PN', 'Unbalanced']);
          substation.measurements_malam.forEach(measurement => {
            malamSheet.addRow([
              measurement.month,
              measurement.r,
              measurement.s,
              measurement.t,
              measurement.n,
              measurement.rn,
              measurement.sn,
              measurement.tn,
              measurement.pp,
              measurement.pn,
              measurement.unbalanced
            ]);
          });
        }

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="detail_gardu_${substation.noGardu}.xlsx"`);
        
        await workbook.xlsx.write(res);
        return;
      }

      return res.json({
        success: true,
        data: substation
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Invalid type. Use: riwayat, substation, substation-detail'
    });

  } catch (error) {
    console.error('Export error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error.message
    });
  }
}
