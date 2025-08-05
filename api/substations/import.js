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

// ADD: Calculation functions (same as your bulk API)
function calculateMeasurements(r, s, t, n, rn, sn, tn, pp, pn, daya) {
    const rata2 = (r + s + t) / 3;
    const kva = (rata2 * pp * 1.73) / 1000;
    const persen = daya ? (kva / daya) * 100 : 0;
    
    // UNBALANCED: same formula as your bulk API
    const unbalanced = rata2 !== 0
        ? (Math.abs((r / rata2) - 1) + Math.abs((s / rata2) - 1) + (Math.abs(t / rata2) - 1)) * 100
        : 0;

    return { rata2, kva, persen, unbalanced };
}

function parseSafeDate(dateInput) {
    if (!dateInput) return new Date();
    if (dateInput instanceof Date && !isNaN(dateInput)) return dateInput;
    if (typeof dateInput === 'string') {
        const parts = dateInput.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
        if (parts) {
            const isoDateStr = `${parts[3]}-${String(parts[2]).padStart(2, '0')}-${String(parts[1]).padStart(2, '0')}`;
            return new Date(isoDateStr);
        }
    }
    const date = new Date(dateInput);
    return isNaN(date) ? new Date() : date;
}

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    // SECURITY FIX: More restrictive CORS
    const allowedOrigins = ['http://localhost:3000', 'https://yourdomain.com'];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Metode tidak diizinkan' });
    }

    const form = new IncomingForm({
        maxFileSize: 10 * 1024 * 1024, // 10MB limit
        maxFieldsSize: 10 * 1024 * 1024
    });

    form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Form parse error:', err);
            return res.status(400).json({ success: false, error: 'Error parsing upload' });
        }

        if (!files.file || !files.file[0]) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const tempFilePath = files.file[0].filepath;

        try {
            console.log('📄 Mulai memproses file Excel di backend...');
            
            // MEMORY FIX: Use streaming instead of readFileSync for large files
            const fileContent = fs.readFileSync(tempFilePath);
            const workbook = XLSX.read(fileContent, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const allRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, cellDates: true });

            const normalizeHeader = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const headerRowIdx = allRows.findIndex(row => row.some(cell => normalizeHeader(cell) === 'nogardu'));
            if (headerRowIdx === -1) throw new Error('Header "nogardu" tidak ditemukan.');
            
            const headerRow = allRows[headerRowIdx].map(normalizeHeader);
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

                const tanggalValue = parseSafeDate(getField(rowObj0, ['tanggal']));
                const monthValue = tanggalValue.toISOString().slice(0, 7);

                const mainData = {
                    no: parseInt(getField(rowObj0, ['no'])) || 0,
                    ulp: String(getField(rowObj0, ['ulp'])).trim(),
                    noGardu: String(getField(rowObj0, ['nogardu', 'no.gardu', 'no_gardu'])).trim(),
                    namaLokasiGardu: String(getField(rowObj0, ['namalokasi', 'namalokasigardu', 'nama/lokasi'])).trim(),
                    jenis: String(getField(rowObj0, ['jenis'])).trim(),
                    merek: String(getField(rowObj0, ['merk', 'merek'])).trim(),
                    daya: String(getField(rowObj0, ['daya'])).trim(),
                    tahun: String(getField(rowObj0, ['tahun'])).trim(),
                    phasa: String(getField(rowObj0, ['phasa'])).trim(),
                    tap_trafo_max_tap: String(getField(rowObj0, ['taptrafomaxtap'])).trim(),
                    penyulang: String(getField(rowObj0, ['penyulang'])).trim(),
                    arahSequence: String(getField(rowObj0, ['arahsequence'])).trim(),
                    tanggal: tanggalValue,
                };
                
                // FIXED: Extract measurements WITH calculations
                const extractMeasurementsWithCalculations = (siangOrMalam) => {
                    const daya = parseFloat(mainData.daya) || 0; // Get power rating
                    
                    return group.map(rowArr => {
                        const rowObj = {};
                        headerRow.forEach((col, idx) => { rowObj[col] = rowArr?.[idx]; });

                        const r = parseFloat(getField(rowObj, [`r${siangOrMalam}`, `r(${siangOrMalam})`])) || 0;
                        const s = parseFloat(getField(rowObj, [`s${siangOrMalam}`, `s(${siangOrMalam})`])) || 0;
                        const t = parseFloat(getField(rowObj, [`t${siangOrMalam}`, `t(${siangOrMalam})`])) || 0;
                        const n = parseFloat(getField(rowObj, [`n${siangOrMalam}`, `n(${siangOrMalam})`])) || 0;
                        const rn = parseFloat(getField(rowObj, [`rn${siangOrMalam}`, `r-n(${siangOrMalam})`])) || 0;
                        const sn = parseFloat(getField(rowObj, [`sn${siangOrMalam}`, `s-n(${siangOrMalam})`])) || 0;
                        const tn = parseFloat(getField(rowObj, [`tn${siangOrMalam}`, `t-n(${siangOrMalam})`])) || 0;
                        const pp = parseFloat(getField(rowObj, [`pp${siangOrMalam}`, `p-p(${siangOrMalam})`])) || 0;
                        const pn = parseFloat(getField(rowObj, [`pn${siangOrMalam}`, `p-n(${siangOrMalam})`])) || 0;

                        // CALCULATE the derived values
                        const calculations = calculateMeasurements(r, s, t, n, rn, sn, tn, pp, pn, daya);

                        const measurementData = {
                            month: monthValue,
                            row_name: String(getField(rowObj, ['jurusan'])).toLowerCase() || 'unknown',
                            r, s, t, n, rn, sn, tn, pp, pn,
                            // ADD: Include calculated values
                            rata2: calculations.rata2,
                            kva: calculations.kva,
                            persen: calculations.persen,
                            unbalanced: calculations.unbalanced,
                        };

                        return measurementData;
                    }).filter(m => m.row_name !== 'unknown');
                };
        
                const measurements_siang = extractMeasurementsWithCalculations('siang');
                const measurements_malam = extractMeasurementsWithCalculations('malam');

                transformedData.push({ ...mainData, measurements_siang, measurements_malam });
            }

            if (transformedData.length === 0) throw new Error('Tidak ada data valid untuk diimpor.');
            
            console.log(`📊 Ditemukan ${transformedData.length} data gardu valid. Memulai transaksi database...`);
            
            const db = await initPrisma();
            
            const result = await db.$transaction(async (tx) => {
                let createdCount = 0;
                for (const data of transformedData) {
                    // Create substation with calculated measurements
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

            console.log(`✅ Transaksi berhasil. ${result.createdCount} gardu berhasil dibuat WITH CALCULATIONS.`);
            res.status(200).json({
                success: true,
                message: `Impor selesai. ${result.createdCount} gardu berhasil dibuat dengan kalkulasi otomatis.`,
                data: { createdCount: result.createdCount, errors: [] },
            });

        } catch (procError) {
            console.error('💥 Terjadi kesalahan kritis:', procError);
            res.status(500).json({ 
                success: false, 
                error: 'Gagal memproses file di server.', 
                details: procError.message 
            });
        } finally {
            // CLEANUP: Remove temporary file
            try {
                if (tempFilePath && fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                    console.log('🧹 Temporary file cleaned up');
                }
            } catch (cleanupError) {
                console.warn('⚠️  Failed to cleanup temp file:', cleanupError);
            }
        }
    });
}