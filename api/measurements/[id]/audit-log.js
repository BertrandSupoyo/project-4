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
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const measurementId = parseInt(id, 10);

  if (!id || Number.isNaN(measurementId)) {
    return res.status(400).json({ error: 'Invalid measurement ID' });
  }

  try {
    const db = await initPrisma();

    // coba audit log siang terlebih dahulu
    let auditLogs = await db.measurementSiangAuditLog.findMany({
      where: { measurementId },
      orderBy: { changedAt: 'desc' }
    });

    if (!auditLogs || auditLogs.length === 0) {
      auditLogs = await db.measurementMalamAuditLog.findMany({
        where: { measurementId },
        orderBy: { changedAt: 'desc' }
      });
    }

    res.status(200).json(auditLogs);
  } catch (error) {
    console.error('Error fetching audit log:', error);
    res.status(500).json({
      error: 'Gagal mengambil audit log',
      details: error.message
    });
  }
}

