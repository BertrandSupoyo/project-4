import { PrismaClient } from '../../prisma/app/generated/prisma-client/index.js';
import { withAccelerate } from '@prisma/extension-accelerate';
import { IncomingForm } from 'formidable';
import * as XLSX from 'xlsx';
import fs from 'fs';

let prisma;

async function initPrisma() {
    if (!prisma) {
        console.log('🔧 Menginisialisasi Prisma Client...');
        try {
            prisma = new PrismaClient().$extends(withAccelerate());
            await prisma.$connect();
            console.log('✅ Koneksi database berhasil');
        } catch (error) {
            console.error('❌ Koneksi database gagal:', error);
            throw error;
        }
    }
    return prisma;
}

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Metode tidak diizinkan' });
    }

    const form = new IncomingForm();
    form.parse(req, async (err, fields, files) => {
        if (err || !files.file) {
            return res.status(400).json({ success: false, error: 'Gagal mengunggah file.' });
        }

        try {
            console.log('📄 Mulai memproses file Excel di backend...');
            const fileContent = fs.readFileSync(files.file[0].filepath);
            const workbook = XLSX.read(fileContent, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const allRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

            const normalize = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const headerRowIdx = allRows.findIndex(row => row.some(cell => normalize(cell) === 'nogardu'));
            if (headerRowIdx === -1) throw new Error('Header "nogardu" tidak ditemukan.');
            
            const headerRow = allRows[headerRowIdx].map(normalize);
            const dataRows = allRows.slice(headerRowIdx + 1);

            const getField = (rowObj, keys) => {
                for (const key of keys) {
                    const val = rowObj[key];
                    if (val !== undefined && val !== null && String(val).trim() !== '') return val;
                }
                return '';
            };

            const transformedData = [];
            for (let i = 0; i < dataRows.length; i += 5) {
                const group = dataRows.slice(i, i + 5);
                if (group.length < 5) continue;

                const rowObj0 = {};
                headerRow.forEach((col, idx) => { rowObj0[col] = group[0]?.[idx]; });

                if (!getField(rowObj0, ['ulp']) || !getField(rowObj0, ['nogardu']) || !getField(rowObj0, ['namalokasi'])) continue;

                const mainData = { /* ... (kode ekstraksi data Anda sama) ... */ };
                const measurements_siang = [ /* ... */ ];
                const measurements_malam = [ /* ... */ ];

                transformedData.push({ ...mainData, measurements_siang, measurements_malam });
            }

            if (transformedData.length === 0) throw new Error('Tidak ada data valid untuk diimpor.');
            
            console.log(`📊 Ditemukan ${transformedData.length} data gardu valid. Memulai transaksi database...`);
            
            const db = await initPrisma();
            
            // --- LOGIKA TRANSAKSI YANG DIOPTIMALKAN ---
            const result = await db.$transaction(async (tx) => {
                let createdCount = 0;
                for (const data of transformedData) {
                    await tx.substation.create({
                        data: {
                            // Data gardu
                            ulp: data.ulp,
                            noGardu: data.noGardu,
                            // ... semua field gardu lainnya
                            
                            // Data pengukuran terkait
                            measurements_siang: { create: data.measurements_siang },
                            measurements_malam: { create: data.measurements_malam }
                        }
                    });
                    createdCount++;
                }
                return { createdCount };
            });

            console.log(`✅ Transaksi berhasil. ${result.createdCount} gardu berhasil dibuat.`);
            res.status(200).json({
                success: true,
                message: `Impor selesai. ${result.createdCount} gardu berhasil dibuat.`,
                data: { createdCount: result.createdCount, errors: [] },
            });

        } catch (procError) {
            console.error('💥 Terjadi kesalahan kritis:', procError);
            res.status(500).json({ success: false, error: 'Gagal memproses file di server.', details: procError.message });
        }
    });
}