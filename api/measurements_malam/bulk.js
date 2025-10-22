import { PrismaClient } from '../../prisma/app/generated/prisma-client/index.js'
import { withAccelerate } from '@prisma/extension-accelerate'

let prisma;
async function initPrisma() {
  if (!prisma) {
    try {
      prisma = new PrismaClient().$extends(withAccelerate());
    } catch (error) {
      console.error('Failed to initialize Prisma:', error);
      throw error;
    }
  }
  return prisma;
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await initPrisma();
    const measurements = req.body;

    if (!Array.isArray(measurements)) {
      return res.status(400).json({ error: 'Request body must be an array' });
    }

    const updatedMeasurements = [];
    const errors = [];

    for (const m of measurements) {
      try {
        if (!m.substationId || !m.row_name || !m.month) {
          errors.push({ row: m, error: 'Missing required fields: substationId, row_name, month' });
          continue;
        }

        // Ambil daya substation
        const substation = await db.substation.findUnique({ where: { id: m.substationId } });
        const daya = parseFloat(substation?.daya || 0);

        // Hitung rumus
        const r = Number(m.r) || 0;
        const s = Number(m.s) || 0;
        const t = Number(m.t) || 0;
        const n = Number(m.n) || 0;
        const rn = Number(m.rn) || 0;
        const sn = Number(m.sn) || 0;
        const tn = Number(m.tn) || 0;
        const pp = Number(m.pp) || 0;
        const pn = Number(m.pn) || 0;
        
        const rata2 = (r + s + t) / 3;
        const kva = (rata2 * pp * 1.73) / 1000;
        const persen = daya ? (kva / daya) * 100 : 0;
        
        // UNBALANCED: sesuai rumus Excel user - FIXED to match measurementSiang
        const unbalanced = rata2 !== 0
          ? (Math.abs((r / rata2) - 1) + Math.abs((s / rata2) - 1) + Math.abs((t / rata2) - 1)) * 100
          : 0;

        // Cari measurement yang sudah ada
        const existingMeasurement = await db.measurementMalam.findFirst({
          where: {
            substationId: m.substationId,
            row_name: m.row_name,
            month: m.month,
          }
        });

        let updatedMeasurement;
        if (existingMeasurement) {
          // Update measurement yang sudah ada
          updatedMeasurement = await db.measurementMalam.update({
            where: { id: existingMeasurement.id },
            data: {
              r, s, t, n, rn, sn, tn, pp, pn,
              rata2, kva, persen, unbalanced,
              lastUpdate: new Date(),
            }
          });
        } else {
          // Buat measurement baru
          updatedMeasurement = await db.measurementMalam.create({
            data: {
              substationId: m.substationId,
              row_name: m.row_name,
              month: m.month,
              r, s, t, n, rn, sn, tn, pp, pn,
              rata2, kva, persen, unbalanced,
              lastUpdate: new Date(),
            }
          });
        }

        updatedMeasurements.push(updatedMeasurement);
      } catch (error) {
        errors.push({ row: m, error: error.message || 'Unknown error' });
      }
    }

    if (updatedMeasurements.length > 0) {
      return res.json({
        success: true,
        data: updatedMeasurements,
        message: `Updated ${updatedMeasurements.length} measurements successfully`,
        errors: errors.length > 0 ? errors : undefined
      });
    } else {
      return res.status(400).json({
        success: false,
        error: 'No measurements were updated',
        errors
      });
    }
  } catch (error) {
    console.error('Bulk update error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
}