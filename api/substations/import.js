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

/**
 * Fungsi baru untuk memperbaiki format tanggal yang ambigu.
 * Mengubah DD/MM/YYYY menjadi YYYY-MM-DD yang aman.
 */
function parseSafeDate(dateInput) {
    if (!dateInput) return new Date(); // Jika kosong, gunakan tanggal sekarang
    if (dateInput instanceof Date && !isNaN(dateInput)) return dateInput; // Jika sudah benar, langsung kembalikan

    if (typeof dateInput === 'string') {
        const parts = dateInput.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
        if (parts) {
            // parts[1] = hari, parts[2] = bulan, parts[3] = tahun
            // Format YYYY-MM-DD aman untuk semua sistem
            const isoDateStr = `${parts[3]}-${String(parts[2]).padStart(2, '0')}-${String(parts[1]).padStart(2, '0')}`;
            return new Date(isoDateStr);
        }
    }
    // Fallback jika formatnya sudah benar (misal: YYYY-MM-DD atau hasil dari Excel)
    const date = new Date(dateInput);
    return isNaN(date) ? new Date() : date;
}


export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    // ... (sisa kode CORS Anda tetap sama)

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
            // Menggunakan cellDates: true untuk membantu parsing tanggal dari Excel
            const allRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, cellDates: true });

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

                if (!getField(rowObj0, ['ulp', 'nogardu', 'namalokasi'])) continue;

                // --- BAGIAN YANG DIPERBAIKI ---
                // Menggunakan fungsi parseSafeDate untuk menghindari error
                const tanggalValue = parseSafeDate(getField(rowObj0, ['tanggal']));
                const monthValue = tanggalValue.toISOString().slice(0, 7);

                const mainData = {
                    no: parseInt(getField(rowObj0, ['no'])) || 0,
                    ulp: String(getField(rowObj0, ['ulp'])).trim(),
                    noGardu: String(getField(rowObj0, ['nogardu', 'no.gardu', 'no_gardu'])).trim(),
                    namaLokasiGardu: String(getField(rowObj0, ['namalokasi', 'namalokasigardu', 'nama/lokasi'])).trim(),
                    // ...field lainnya
                    tanggal: tanggalValue,
                };
                
                const extractMeasurements = (siangOrMalam) => {
                    return group.map(rowArr => {
                        const rowObj = {};
                        headerRow.forEach((col, idx) => { rowObj[col] = rowArr?.[idx]; });
                        return {
                            month: monthValue,
                            row_name: String(getField(rowObj, ['jurusan'])).toLowerCase() || 'unknown',
                            r: parseFloat(getField(rowObj, [`r${siangOrMalam}`, `r(${siangOrMalam})`])) || 0,
                            // ...field pengukuran lainnya
                        };
                    }).filter(m => m.row_name !== 'unknown');
                };
        
                const measurements_siang = extractMeasurements('siang');
                const measurements_malam = extractMeasurements('malam');

                transformedData.push({ ...mainData, measurements_siang, measurements_malam });
            }

            if (transformedData.length === 0) throw new Error('Tidak ada data valid untuk diimpor.');
            
            console.log(`📊 Ditemukan ${transformedData.length} data gardu valid. Memulai transaksi database...`);
            
            const db = await initPrisma();
            
            const result = await db.$transaction(async (tx) => {
                let createdCount = 0;
                for (const data of transformedData) {
                    await tx.substation.create({
                        data: {
                            ...data, 
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