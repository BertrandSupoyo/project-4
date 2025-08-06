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

// FIXED: Corrected unbalanced formula to match measurementSiang/measurementMalam APIs
function calculateMeasurements(voltR, voltS, voltT, voltN, voltRN, voltSN, voltTN, currentPP, currentPN, powerRating) {
    const average = (voltR + voltS + voltT) / 3;
    const kvaValue = (average * currentPP * 1.73) / 1000;
    const percentage = powerRating ? (kvaValue / powerRating) * 100 : 0;
    
    // FIXED: Use the same correct formula as in measurementSiang/measurementMalam
    const unbalancedValue = average !== 0
        ? (Math.abs((voltR / average) - 1) + Math.abs((voltS / average) - 1) + Math.abs((voltT / average) - 1)) * 100
        : 0;

    return { 
        rata2: Number(average.toFixed(2)), 
        kva: Number(kvaValue.toFixed(2)), 
        persen: Number(percentage.toFixed(2)), 
        unbalanced: Number(unbalancedValue.toFixed(2)) 
    };
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
        maxFileSize: 10 * 1024 * 1024,
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
                
                // Extract measurements with corrected calculations
                const extractMeasurementsWithCalculations = (timeOfDay) => {
                    const powerRating = parseFloat(mainData.daya) || 0;
                    
                    console.log(`🔍 Processing ${timeOfDay} measurements for gardu: ${mainData.noGardu}`);
                    
                    return group.map((rowArr, rowIndex) => {
                        const rowObj = {};
                        headerRow.forEach((col, idx) => { rowObj[col] = rowArr?.[idx]; });

                        // Extract values for the specific time of day
                        const voltR = parseFloat(getField(rowObj, [`r${timeOfDay}`, `r(${timeOfDay})`, `r_${timeOfDay}`])) || 0;
                        const voltS = parseFloat(getField(rowObj, [`s${timeOfDay}`, `s(${timeOfDay})`, `s_${timeOfDay}`])) || 0;
                        const voltT = parseFloat(getField(rowObj, [`t${timeOfDay}`, `t(${timeOfDay})`, `t_${timeOfDay}`])) || 0;
                        const voltN = parseFloat(getField(rowObj, [`n${timeOfDay}`, `n(${timeOfDay})`, `n_${timeOfDay}`])) || 0;
                        const voltRN = parseFloat(getField(rowObj, [`rn${timeOfDay}`, `r-n(${timeOfDay})`, `rn_${timeOfDay}`])) || 0;
                        const voltSN = parseFloat(getField(rowObj, [`sn${timeOfDay}`, `s-n(${timeOfDay})`, `sn_${timeOfDay}`])) || 0;
                        const voltTN = parseFloat(getField(rowObj, [`tn${timeOfDay}`, `t-n(${timeOfDay})`, `tn_${timeOfDay}`])) || 0;
                        const currentPP = parseFloat(getField(rowObj, [`pp${timeOfDay}`, `p-p(${timeOfDay})`, `pp_${timeOfDay}`])) || 0;
                        const currentPN = parseFloat(getField(rowObj, [`pn${timeOfDay}`, `p-n(${timeOfDay})`, `pn_${timeOfDay}`])) || 0;

                        // DEBUG: Log the extracted values
                        console.log(`Row ${rowIndex} ${timeOfDay}:`, { voltR, voltS, voltT, voltN, currentPP, currentPN });

                        // Calculate using the CORRECTED formula
                        const calculations = calculateMeasurements(voltR, voltS, voltT, voltN, voltRN, voltSN, voltTN, currentPP, currentPN, powerRating);

                        const measurementData = {
                            month: monthValue,
                            row_name: String(getField(rowObj, ['jurusan'])).toLowerCase() || 'unknown',
                            r: voltR,
                            s: voltS,
                            t: voltT,
                            n: voltN,
                            rn: voltRN,
                            sn: voltSN,
                            tn: voltTN,
                            pp: currentPP,
                            pn: currentPN,
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

                // DEBUG: Log measurements
                console.log(`Siang measurements count: ${measurements_siang.length}`);
                console.log(`Malam measurements count: ${measurements_malam.length}`);

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

            console.log(`✅ Transaksi berhasil. ${result.createdCount} gardu berhasil dibuat WITH CORRECTED CALCULATIONS.`);
            res.status(200).json({
                success: true,
                message: `Impor selesai. ${result.createdCount} gardu berhasil dibuat dengan kalkulasi otomatis yang benar.`,
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