import { PrismaClient } from '../../../prisma/app/generated/prisma-client/index.js';
import { withAccelerate } from '@prisma/extension-accelerate';

let prisma;

async function initPrisma() {
  if (!prisma) {
    prisma = new PrismaClient().$extends(withAccelerate());
    await prisma.$connect();
  }
  return prisma;
}

async function findMeasurement(db, measurementId) {
  let record = await db.measurementSiang.findUnique({ where: { id: measurementId } });
  if (record) {
    return { record, type: 'siang' };
  }

  record = await db.measurementMalam.findUnique({ where: { id: measurementId } });
  if (record) {
    return { record, type: 'malam' };
  }

  return null;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;
  const measurementId = parseInt(id, 10);

  if (!id || Number.isNaN(measurementId)) {
    return res.status(400).json({ error: 'Invalid measurement ID' });
  }

  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { unbalanced, reason, changedBy = 'admin' } = req.body || {};

  if (unbalanced === undefined || unbalanced === null || Number.isNaN(Number(unbalanced))) {
    return res.status(400).json({ error: 'Field unbalanced wajib diisi' });
  }

  let db;

  try {
    db = await initPrisma();
    const measurementData = await findMeasurement(db, measurementId);

    if (!measurementData) {
      return res.status(404).json({ error: 'Measurement tidak ditemukan' });
    }

    const { record: oldRecord, type } = measurementData;

    // tandai data lama sebagai SUPERSEDED
    if (type === 'siang') {
      await db.measurementSiang.update({
        where: { id: measurementId },
        data: { status: 'SUPERSEDED' }
      });
    } else {
      await db.measurementMalam.update({
        where: { id: measurementId },
        data: { status: 'SUPERSEDED' }
      });
    }

    const newData = {
      substationId: oldRecord.substationId,
      month: oldRecord.month,
      r: oldRecord.r,
      s: oldRecord.s,
      t: oldRecord.t,
      n: oldRecord.n,
      rn: oldRecord.rn,
      sn: oldRecord.sn,
      tn: oldRecord.tn,
      pp: oldRecord.pp,
      pn: oldRecord.pn,
      row_name: oldRecord.row_name,
      unbalanced: Number(unbalanced),
      rata2: oldRecord.rata2,
      kva: oldRecord.kva,
      persen: oldRecord.persen,
      status: 'ACTIVE'
    };

    const newRecord =
      type === 'siang'
        ? await db.measurementSiang.create({ data: newData })
        : await db.measurementMalam.create({ data: newData });

    const auditData = {
      measurementId: measurementId,
      oldValue: oldRecord.unbalanced,
      newValue: Number(unbalanced),
      changedBy,
      changeReason: reason || 'Update data pengukuran'
    };

    if (type === 'siang') {
      await db.measurementSiangAuditLog.create({ data: auditData });
    } else {
      await db.measurementMalamAuditLog.create({ data: auditData });
    }

    res.status(200).json({
      success: true,
      message: 'Measurement updated successfully',
      old_id: measurementId,
      new_id: newRecord.id,
      old_value: oldRecord.unbalanced,
      new_value: newRecord.unbalanced
    });
  } catch (error) {
    console.error('Error updating measurement:', error);
    res.status(500).json({
      error: 'Gagal mengupdate measurement',
      details: error.message
    });
  }
}

