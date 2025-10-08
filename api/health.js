import { PrismaClient } from '../prisma/app/generated/prisma-client/index.js'
import { withAccelerate } from '@prisma/extension-accelerate'

let prisma;

async function initPrisma() {
	if (!prisma) {
		try {
			prisma = new PrismaClient().$extends(withAccelerate());
			await prisma.$connect();
		} catch (error) {
			throw error;
		}
	}
	return prisma;
}

export default async function handler(req, res) {
	// CORS (allow preview/prod Vercel + localhost)
	const origin = req.headers.origin || '';
	const allow = origin && (origin.startsWith('http://localhost:') || origin.endsWith('.vercel.app'));
	if (allow) {
		res.setHeader('Access-Control-Allow-Origin', origin);
		res.setHeader('Vary', 'Origin');
	}
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
	res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
	if (req.method === 'OPTIONS') return res.status(200).end();
	if (req.method !== 'GET') return res.status(405).json({ success: false, error: 'Method not allowed' });

	try {
		const db = await initPrisma();
		await db.$queryRaw`SELECT 1`;
		return res.status(200).json({
			success: true,
			message: 'OK',
			environment: process.env.NODE_ENV || 'development'
		});
	} catch (err) {
		return res.status(500).json({ success: false, error: 'DB error', details: err?.message || String(err) });
	}
}


