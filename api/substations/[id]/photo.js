import { PrismaClient } from '../../../prisma/app/generated/prisma-client/index.js'
import { withAccelerate } from '@prisma/extension-accelerate'

let prisma;

async function initPrisma() {
  if (!prisma) {
    console.log('🔧 Initializing Prisma Client (photo endpoint)...');
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
  // CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PATCH,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, Authorization, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'PATCH') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const db = await initPrisma();
  const { id } = req.query;

  try {
    const { imageBase64 } = req.body || {};

    if (!imageBase64 || typeof imageBase64 !== 'string') {
      return res.status(400).json({ success: false, error: 'imageBase64 is required' });
    }

    const isDataUrl = imageBase64.startsWith('data:') && imageBase64.includes(';base64,');
    const photoUrl = isDataUrl ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`;

    // Ensure column exists (PostgreSQL)
    await db.$executeRawUnsafe('ALTER TABLE "substations" ADD COLUMN IF NOT EXISTS "photoUrl" TEXT');

    // Update via SQL to avoid Prisma model mismatch
    const updated = await db.$queryRawUnsafe(
      'UPDATE "substations" SET "photoUrl" = $1, "lastUpdate" = NOW() WHERE id = $2 RETURNING *',
      photoUrl,
      id
    );

    if (!updated || updated.length === 0) {
      return res.status(404).json({ success: false, error: 'Substation not found' });
    }

    return res.json({ success: true, data: updated[0] });
  } catch (err) {
    console.error('💥 Photo upload PATCH error:', err);
    return res.status(500).json({ success: false, error: 'Internal server error', details: err.message });
  }
} 