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
    const origin = req.headers.origin || '';
    const allowThisOrigin = (() => {
        if (!origin) return false;
        if (origin.startsWith('http://localhost:')) return true;
        if (origin.endsWith('.vercel.app')) return true; // allow all vercel preview/prod domains
        if (origin === 'https://project-4-vyl4.vercel.app') return true; // production
        return false;
    })();

    if (allowThisOrigin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
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

        // Handle formidable v3 shape: can be a single File or an array
        const incoming = files.file;
        const uploaded = Array.isArray(incoming) ? incoming[0] : incoming;
        if (!uploaded || !uploaded.filepath) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }

        const tempFilePath = uploaded.filepath;

        try {
            console.log('📄 Mulai memproses file Excel di backend...');
            
            let fileContent;
            try {
                fileContent = fs.readFileSync(tempFilePath);
            } catch (readErr) {
                console.error('📄 Failed to read uploaded file:', readErr);
                return res.status(400).json({ success: false, error: 'File cannot be read', details: readErr.message });
            }

            let workbook;
            try {
                workbook = XLSX.read(fileContent, { type: 'buffer' });
            } catch (parseErr) {
                console.error('📄 Failed to parse Excel file:', parseErr);
                return res.status(400).json({ success: false, error: 'Invalid Excel file', details: parseErr.message });
            }

            const sheetName = workbook.SheetNames?.[0];
            if (!sheetName) {
                return res.status(400).json({ success: false, error: 'Excel has no sheets' });
            }
            const worksheet = workbook.Sheets[sheetName];
            const allRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, cellDates: true });

            const normalizeHeader = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const headerRowIdx = allRows.findIndex(row => row.some(cell => normalizeHeader(cell) === 'nogardu'));
            if (headerRowIdx === -1) {
                return res.status(400).json({ success: false, error: 'Header "nogardu" tidak ditemukan.' });
            }
            
            const headerRow = allRows[headerRowIdx].map(normalizeHeader);
            const dataRows = allRows.slice(headerRowIdx + 1);

            const getField = (rowObj, keys) => {
                for (const key of keys) {
                    const val = rowObj[key];
                    if (val !== undefined && val !== null && String(val).trim() !== '') return val;
                }
                return '';
            };

            // New row-oriented parser: group rows by (noGardu, month)
            const groupsMap = new Map();
            for (let i = 0; i < dataRows.length; i++) {
                const rowArr = dataRows[i];
                if (!rowArr || rowArr.length === 0) continue;
                const rowObj = {};
                headerRow.forEach((col, idx) => { rowObj[col] = rowArr?.[idx]; });

                const ulpVal = String(getField(rowObj, ['ulp'])).trim();
                const noGarduVal = String(getField(rowObj, ['nogardu', 'no.gardu', 'no_gardu'])).trim();
                const namaLokasiVal = String(getField(rowObj, ['namalokasi', 'namalokasigardu', 'nama/lokasi'])).trim();
                if (!ulpVal && !noGarduVal && !namaLokasiVal) continue;

                const tanggalValue = parseSafeDate(getField(rowObj, ['tanggal']));
                const monthValue = tanggalValue.toISOString().slice(0, 7);
                const key = `${noGarduVal}__${monthValue}`;

                if (!groupsMap.has(key)) {
                    groupsMap.set(key, {
                        main: {
                            no: 0,
                            ulp: ulpVal,
                            noGardu: noGarduVal,
                            namaLokasiGardu: namaLokasiVal,
                            jenis: String(getField(rowObj, ['jenis'])).trim(),
                            merek: String(getField(rowObj, ['merk', 'merek'])).trim(),
                            daya: String(getField(rowObj, ['daya'])).trim(),
                            tahun: String(getField(rowObj, ['tahun'])).trim(),
                            phasa: String(getField(rowObj, ['phasa'])).trim(),
                            tap_trafo_max_tap: String(getField(rowObj, ['taptrafomaxtap'])).trim(),
                            penyulang: String(getField(rowObj, ['penyulang'])).trim(),
                            arahSequence: String(getField(rowObj, ['arahsequence'])).trim(),
                            tanggal: tanggalValue,
                        },
                        siang: [],
                        malam: []
                    });
                }

                const group = groupsMap.get(key);
                const m = group.main;
                m.ulp ||= ulpVal;
                m.noGardu ||= noGarduVal;
                m.namaLokasiGardu ||= namaLokasiVal;
                m.jenis ||= String(getField(rowObj, ['jenis'])).trim();
                m.merek ||= String(getField(rowObj, ['merk', 'merek'])).trim();
                m.daya ||= String(getField(rowObj, ['daya'])).trim();
                m.tahun ||= String(getField(rowObj, ['tahun'])).trim();
                m.phasa ||= String(getField(rowObj, ['phasa'])).trim();
                m.tap_trafo_max_tap ||= String(getField(rowObj, ['taptrafomaxtap'])).trim();
                m.penyulang ||= String(getField(rowObj, ['penyulang'])).trim();
                m.arahSequence ||= String(getField(rowObj, ['arahsequence'])).trim();

                const jurusan = String(getField(rowObj, ['jurusan'])).toLowerCase().trim();
                const allowRowNames = new Set(['induk','1','2','3','4']);
                if (!jurusan || !allowRowNames.has(jurusan)) continue;

                const powerRating = parseFloat(m.daya) || 0;
                const extractFor = (timeOfDay) => {
                    const r = parseFloat(getField(rowObj, [`r${timeOfDay}`, `r(${timeOfDay})`, `r_${timeOfDay}`])) || 0;
                    const s = parseFloat(getField(rowObj, [`s${timeOfDay}`, `s(${timeOfDay})`, `s_${timeOfDay}`])) || 0;
                    const t = parseFloat(getField(rowObj, [`t${timeOfDay}`, `t(${timeOfDay})`, `t_${timeOfDay}`])) || 0;
                    const n = parseFloat(getField(rowObj, [`n${timeOfDay}`, `n(${timeOfDay})`, `n_${timeOfDay}`])) || 0;
                    const rn = parseFloat(getField(rowObj, [`rn${timeOfDay}`, `r-n(${timeOfDay})`, `rn_${timeOfDay}`])) || 0;
                    const sn = parseFloat(getField(rowObj, [`sn${timeOfDay}`, `s-n(${timeOfDay})`, `sn_${timeOfDay}`])) || 0;
                    const tn = parseFloat(getField(rowObj, [`tn${timeOfDay}`, `t-n(${timeOfDay})`, `tn_${timeOfDay}`])) || 0;
                    const pp = parseFloat(getField(rowObj, [`pp${timeOfDay}`, `p-p(${timeOfDay})`, `pp_${timeOfDay}`])) || 0;
                    const pn = parseFloat(getField(rowObj, [`pn${timeOfDay}`, `p-n(${timeOfDay})`, `pn_${timeOfDay}`])) || 0;
                    const calc = calculateMeasurements(r, s, t, n, rn, sn, tn, pp, pn, powerRating);
                    return { month: monthValue, row_name: jurusan, r, s, t, n, rn, sn, tn, pp, pn, rata2: calc.rata2, kva: calc.kva, persen: calc.persen, unbalanced: calc.unbalanced };
                };
                const hasSiang = ['r','s','t','n','rn','sn','tn','pp','pn'].some(k => getField(rowObj, [`${k}siang`, `${k}(siang)`, `${k}_siang`]) !== '');
                const hasMalam = ['r','s','t','n','rn','sn','tn','pp','pn'].some(k => getField(rowObj, [`${k}malam`, `${k}(malam)`, `${k}_malam`]) !== '');
                if (hasSiang) group.siang.push(extractFor('siang'));
                if (hasMalam) group.malam.push(extractFor('malam'));
            }

            const transformedData = [];
            for (const [, g] of groupsMap) {
                const dedupeByRow = (arr) => {
                    const map = new Map();
                    for (const it of arr) map.set(it.row_name, it);
                    return Array.from(map.values());
                };
                const siang = dedupeByRow(g.siang);
                const malam = dedupeByRow(g.malam);
                if (!g.main.noGardu || (!siang.length && !malam.length)) continue;
                transformedData.push({ ...g.main, measurements_siang: siang, measurements_malam: malam });
            }

            if (transformedData.length === 0) {
                return res.status(400).json({ success: false, error: 'Tidak ada data valid untuk diimpor.' });
            }
            
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