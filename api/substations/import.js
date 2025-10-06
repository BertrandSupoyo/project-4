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

// FIXED: Corrected formula to exactly match measurementSiang/measurementMalam APIs
function calculateMeasurements(r, s, t, n, rn, sn, tn, pp, pn, daya) {
    const rata2 = (r + s + t) / 3;
    const kva = (rata2 * pp * 1.73) / 1000;
    const persen = daya ? (kva / daya) * 100 : 0;
    
    // UNBALANCED: sesuai rumus Excel user - EXACT same formula as measurementSiang/measurementMalam
    const unbalanced = rata2 !== 0
        ? (Math.abs((r / rata2) - 1) + Math.abs((s / rata2) - 1) + Math.abs((t / rata2) - 1)) * 100
        : 0;

    return { 
        rata2: Number(rata2.toFixed(2)), 
        kva: Number(kva.toFixed(2)), 
        persen: Number(persen.toFixed(2)), 
        unbalanced: Number(unbalanced.toFixed(2)) 
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
                    // IMPORTANT: `no` will be generated sequentially on insert to avoid conflicts
                    no: 0,
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
                        const r = parseFloat(getField(rowObj, [`r${timeOfDay}`, `r(${timeOfDay})`, `r_${timeOfDay}`])) || 0;
                        const s = parseFloat(getField(rowObj, [`s${timeOfDay}`, `s(${timeOfDay})`, `s_${timeOfDay}`])) || 0;
                        const t = parseFloat(getField(rowObj, [`t${timeOfDay}`, `t(${timeOfDay})`, `t_${timeOfDay}`])) || 0;
                        const n = parseFloat(getField(rowObj, [`n${timeOfDay}`, `n(${timeOfDay})`, `n_${timeOfDay}`])) || 0;
                        const rn = parseFloat(getField(rowObj, [`rn${timeOfDay}`, `r-n(${timeOfDay})`, `rn_${timeOfDay}`])) || 0;
                        const sn = parseFloat(getField(rowObj, [`sn${timeOfDay}`, `s-n(${timeOfDay})`, `sn_${timeOfDay}`])) || 0;
                        const tn = parseFloat(getField(rowObj, [`tn${timeOfDay}`, `t-n(${timeOfDay})`, `tn_${timeOfDay}`])) || 0;
                        const pp = parseFloat(getField(rowObj, [`pp${timeOfDay}`, `p-p(${timeOfDay})`, `pp_${timeOfDay}`])) || 0;
                        const pn = parseFloat(getField(rowObj, [`pn${timeOfDay}`, `p-n(${timeOfDay})`, `pn_${timeOfDay}`])) || 0;

                        // DEBUG: Log the extracted values
                        console.log(`Row ${rowIndex} ${timeOfDay}:`, { r, s, t, n, pp, pn });

                        // Calculate using the EXACT same formula as measurementSiang/measurementMalam
                        const calculations = calculateMeasurements(r, s, t, n, rn, sn, tn, pp, pn, powerRating);

                        const measurementData = {
                            month: monthValue,
                            row_name: String(getField(rowObj, ['jurusan'])).toLowerCase() || 'unknown',
                            r: r,
                            s: s,
                            t: t,
                            n: n,
                            rn: rn,
                            sn: sn,
                            tn: tn,
                            pp: pp,
                            pn: pn,
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

                // De-duplicate by row_name and keep the last non-empty entry per row
                const allowRowNames = new Set(['induk','1','2','3','4']);
                const dedupe = (arr) => {
                    const map = new Map();
                    for (const item of arr) {
                        const key = String(item.row_name || '').toLowerCase().trim();
                        if (!key || !allowRowNames.has(key)) continue;
                        map.set(key, item);
                    }
                    return Array.from(map.values());
                };

                const measurementsSiangDeduped = dedupe(measurements_siang);
                const measurementsMalamDeduped = dedupe(measurements_malam);

                // DEBUG: Log measurements
                console.log(`Siang measurements count: ${measurements_siang.length}`);
                console.log(`Malam measurements count: ${measurements_malam.length}`);

                if (measurementsSiangDeduped.length === 0 && measurementsMalamDeduped.length === 0) {
                    // Skip completely empty groups
                    continue;
                }
                transformedData.push({ ...mainData, measurements_siang: measurementsSiangDeduped, measurements_malam: measurementsMalamDeduped });
            }

            if (transformedData.length === 0) throw new Error('Tidak ada data valid untuk diimpor.');
            
            console.log(`📊 Ditemukan ${transformedData.length} data gardu valid. Memulai transaksi database...`);
            
            const db = await initPrisma();
            
            const result = await db.$transaction(async (tx) => {
                let createdCount = 0;
                for (const data of transformedData) {
                    // Generate next sequential `no` regardless of Excel content
                    const agg = await tx.substation.aggregate({ _max: { no: true } });
                    const maxNo = agg?._max?.no || 0;
                    const safeNo = maxNo + 1;

                    // Create substation first, then bulk insert measurements to avoid nested unique conflicts
                    const created = await tx.substation.create({
                        data: {
                            no: safeNo,
                            ulp: data.ulp,
                            noGardu: data.noGardu,
                            namaLokasiGardu: data.namaLokasiGardu,
                            jenis: data.jenis,
                            merek: data.merek,
                            daya: data.daya,
                            tahun: data.tahun,
                            phasa: data.phasa,
                            tap_trafo_max_tap: data.tap_trafo_max_tap || '',
                            penyulang: data.penyulang || '',
                            arahSequence: data.arahSequence || '',
                            tanggal: data.tanggal,
                            status: 'normal',
                            is_active: 1,
                            ugb: 0,
                            latitude: null,
                            longitude: null,
                        }
                    });

                    if (data.measurements_siang?.length) {
                        const siangRows = data.measurements_siang.map(m => ({
                            substationId: created.id,
                            month: m.month,
                            row_name: m.row_name,
                            r: m.r, s: m.s, t: m.t, n: m.n,
                            rn: m.rn, sn: m.sn, tn: m.tn,
                            pp: m.pp, pn: m.pn,
                            rata2: m.rata2, kva: m.kva, persen: m.persen, unbalanced: m.unbalanced,
                            lastUpdate: new Date()
                        }));
                        await tx.measurementSiang.createMany({ data: siangRows, skipDuplicates: true });
                    }

                    if (data.measurements_malam?.length) {
                        const malamRows = data.measurements_malam.map(m => ({
                            substationId: created.id,
                            month: m.month,
                            row_name: m.row_name,
                            r: m.r, s: m.s, t: m.t, n: m.n,
                            rn: m.rn, sn: m.sn, tn: m.tn,
                            pp: m.pp, pn: m.pn,
                            rata2: m.rata2, kva: m.kva, persen: m.persen, unbalanced: m.unbalanced,
                            lastUpdate: new Date()
                        }));
                        await tx.measurementMalam.createMany({ data: malamRows, skipDuplicates: true });
                    }
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
            console.error('💥 Terjadi kesalahan kritis:', procError?.stack || procError);
            res.status(500).json({ 
                success: false, 
                error: 'Gagal memproses file di server.', 
                details: procError?.message || String(procError)
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