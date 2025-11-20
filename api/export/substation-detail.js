import { PrismaClient } from '../../../prisma/app/generated/prisma-client/index.js'
import { withAccelerate } from '@prisma/extension-accelerate'
import { buildSubstationWorkbook } from './workbookTemplate.js'

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
    const { id } = req.query;

    if (!id || typeof id !== 'string' || id.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameter',
        message: 'Parameter id wajib diisi'
      });
    }

    console.log('📥 Single export request for ID:', id);

    db = await initPrisma();

    let substation;
    try {
      substation = await db.substation.findUnique({
        where: { id },
        include: {
          measurements_siang: { orderBy: { row_name: 'asc' } },
          measurements_malam: { orderBy: { row_name: 'asc' } }
        }
      });
    } catch (dbError) {
      console.error('❌ Database query error:', dbError);
      throw new Error(`Gagal mengambil data dari database: ${dbError.message}`);
    }

    if (!substation) {
      return res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Data gardu dengan ID ${id} tidak ditemukan`,
        id
      });
    }

    console.log(`📊 Found substation: ${substation.noGardu}`);

    const workbook = buildSubstationWorkbook(
      [{
        substation,
        siang: substation.measurements_siang || [],
        malam: substation.measurements_malam || []
      }],
      { sheetName: 'Detail Gardu' }
    );

    const safeNoGardu = ((substation.noGardu ?? substation.id ?? 'gardu') + '').trim();
    const filename = `detail_gardu_${safeNoGardu.length ? safeNoGardu.replace(/[^a-zA-Z0-9]/g, '_') : 'gardu'}`;

    console.log(`📤 Sending file: ${filename}.xlsx`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();

    console.log(`✅ Single Excel exported successfully: ${filename}.xlsx`);
  } catch (error) {
    console.error('💥 Export error:', error);

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
