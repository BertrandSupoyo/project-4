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

function calculateMeasurements(r, s, t, n, rn, sn, tn, pp, pn, daya) {
    const rata2 = (r + s + t) / 3;
    const kva = (rata2 * pp * 1.73) / 1000;
    const persen = daya ? (kva / daya) * 100 : 0;
    
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

// ✅ VALIDATION FUNCTIONS
function validateMainData(data, rowNumber) {
    const errors = [];
    
    if (!data.noGardu || data.noGardu.trim() === '') {
        errors.push(`Baris ${rowNumber}: No. Gardu wajib diisi`);
    }
    
    if (!data.namaLokasiGardu || data.namaLokasiGardu.trim() === '') {
        errors.push(`Baris ${rowNumber}: Nama/Lokasi Gardu wajib diisi`);
    }
    
    if (!data.ulp || data.ulp.trim() === '') {
        errors.push(`Baris ${rowNumber}: ULP wajib diisi`);
    }
    
    if (data.daya && isNaN(parseFloat(data.daya))) {
        errors.push(`Baris ${rowNumber}: Daya harus berupa angka`);
    }
    
    if (data.tahun && !/^\d{4}$/.test(data.tahun)) {
        errors.push(`Baris ${rowNumber}: Tahun harus 4 digit (misal: 2024)`);
    }
    
    return errors;
}

function validateMeasurements(measurements, rowNumber, timeOfDay) {
    const errors = [];
    
    if (!measurements || measurements.length === 0) {
        errors.push(`Baris ${rowNumber}: Data pengukuran ${timeOfDay} tidak ditemukan`);
        return errors;
    }
    
    measurements.forEach((m, idx) => {
        if (m.row_name === 'unknown') {
            errors.push(`Baris ${rowNumber}, Jurusan ${idx + 1}: Nama jurusan tidak valid`);
        }
        
        // Validate numeric values are not negative
        const numericFields = ['r', 's', 't', 'n', 'rn', 'sn', 'tn', 'pp', 'pn'];
        numericFields.forEach(field => {
            if (m[field] < 0) {
                errors.push(`Baris ${rowNumber}, ${timeOfDay}, ${m.row_name}: ${field} tidak boleh negatif`);
            }
        });
    });
    
    return errors;
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
            console.error('❌ Form parse error:', err);
            return res.status(400).json({ 
                success: false, 
                error: 'Error parsing upload',
                details: err.message 
            });
        }

        if (!files.file || !files.file[0]) {
            return res.status(400).json({ 
                success: false, 
                error: 'File tidak ditemukan. Pastikan Anda mengupload file Excel.' 
            });
        }

        const tempFilePath = files.file[0].filepath;

        try {
            console.log('📄 Mulai memproses file Excel...');
            
            // ✅ Validate file exists
            if (!fs.existsSync(tempFilePath)) {
                throw new Error('File temporary tidak ditemukan');
            }
            
            const fileContent = fs.readFileSync(tempFilePath);
            
            // ✅ Validate file is Excel
            let workbook;
            try {
                workbook = XLSX.read(fileContent, { type: 'buffer' });
            } catch (xlsxError) {
                throw new Error('File bukan format Excel yang valid (.xlsx atau .xls)');
            }
            
            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                throw new Error('File Excel tidak memiliki sheet');
            }
            
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const allRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, cellDates: true });

            if (!allRows || allRows.length === 0) {
                throw new Error('File Excel kosong');
            }

            const normalizeHeader = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const headerRowIdx = allRows.findIndex(row => row.some(cell => normalizeHeader(cell) === 'nogardu'));
            
            if (headerRowIdx === -1) {
                throw new Error('Header "No. Gardu" tidak ditemukan. Pastikan format file sesuai dengan template export.');
            }
            
            const headerRow = allRows[headerRowIdx].map(normalizeHeader);
            const dataRows = allRows.slice(headerRowIdx + 1);

            if (dataRows.length === 0) {
                throw new Error('Tidak ada data untuk diimport setelah header');
            }

            const getField = (rowObj, keys) => {
                for (const key of keys) {
                    const val = rowObj[key];
                    if (val !== undefined && val !== null && String(val).trim() !== '') return val;
                }
                return '';
            };

            // ✅ COLLECT ALL DATA WITH VALIDATION
            const transformedData = [];
            const validationErrors = [];
            const skippedRows = [];

            console.log(`📊 Memproses ${Math.floor(dataRows.length / 5)} grup data...`);

            for (let i = 0; i < dataRows.length; i += 5) {
                const group = dataRows.slice(i, i + 5);
                const rowNumber = headerRowIdx + 2 + i; // Actual Excel row number
                
                if (group.length < 5) {
                    skippedRows.push({
                        row: rowNumber,
                        reason: `Data tidak lengkap (hanya ${group.length} baris, seharusnya 5 baris per gardu)`
                    });
                    continue;
                }

                const rowObj0 = {};
                headerRow.forEach((col, idx) => { rowObj0[col] = group[0]?.[idx]; });

                // Check if row is completely empty
                const hasAnyData = getField(rowObj0, ['ulp', 'nogardu', 'namalokasi']);
                if (!hasAnyData) {
                    skippedRows.push({
                        row: rowNumber,
                        reason: 'Baris kosong'
                    });
                    continue;
                }

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

                // ✅ VALIDATE MAIN DATA
                const mainErrors = validateMainData(mainData, rowNumber);
                if (mainErrors.length > 0) {
                    validationErrors.push(...mainErrors);
                    continue;
                }
                
                // Extract measurements
                const extractMeasurementsWithCalculations = (timeOfDay) => {
                    const powerRating = parseFloat(mainData.daya) || 0;
                    
                    return group.map((rowArr, rowIndex) => {
                        const rowObj = {};
                        headerRow.forEach((col, idx) => { rowObj[col] = rowArr?.[idx]; });

                        const r = parseFloat(getField(rowObj, [`r${timeOfDay}`, `r(${timeOfDay})`, `r_${timeOfDay}`])) || 0;
                        const s = parseFloat(getField(rowObj, [`s${timeOfDay}`, `s(${timeOfDay})`, `s_${timeOfDay}`])) || 0;
                        const t = parseFloat(getField(rowObj, [`t${timeOfDay}`, `t(${timeOfDay})`, `t_${timeOfDay}`])) || 0;
                        const n = parseFloat(getField(rowObj, [`n${timeOfDay}`, `n(${timeOfDay})`, `n_${timeOfDay}`])) || 0;
                        const rn = parseFloat(getField(rowObj, [`rn${timeOfDay}`, `r-n(${timeOfDay})`, `rn_${timeOfDay}`])) || 0;
                        const sn = parseFloat(getField(rowObj, [`sn${timeOfDay}`, `s-n(${timeOfDay})`, `sn_${timeOfDay}`])) || 0;
                        const tn = parseFloat(getField(rowObj, [`tn${timeOfDay}`, `t-n(${timeOfDay})`, `tn_${timeOfDay}`])) || 0;
                        const pp = parseFloat(getField(rowObj, [`pp${timeOfDay}`, `p-p(${timeOfDay})`, `pp_${timeOfDay}`])) || 0;
                        const pn = parseFloat(getField(rowObj, [`pn${timeOfDay}`, `p-n(${timeOfDay})`, `pn_${timeOfDay}`])) || 0;

                        const calculations = calculateMeasurements(r, s, t, n, rn, sn, tn, pp, pn, powerRating);

                        const measurementData = {
                            month: monthValue,
                            row_name: String(getField(rowObj, ['jurusan'])).toLowerCase() || 'unknown',
                            r, s, t, n, rn, sn, tn, pp, pn,
                            rata2: calculations.rata2,
                            kva: calculations.kva,
                            persen: calculations.persen,
                            unbalanced: calculations.unbalanced,
                        };

                        return measurementData;
                    });
                };
        
                const measurements_siang = extractMeasurementsWithCalculations('siang');
                const measurements_malam = extractMeasurementsWithCalculations('malam');

                // ✅ VALIDATE MEASUREMENTS
                const siangErrors = validateMeasurements(measurements_siang, rowNumber, 'siang');
                const malamErrors = validateMeasurements(measurements_malam, rowNumber, 'malam');
                
                if (siangErrors.length > 0 || malamErrors.length > 0) {
                    validationErrors.push(...siangErrors, ...malamErrors);
                    continue;
                }

                transformedData.push({ 
                    ...mainData, 
                    measurements_siang: measurements_siang.filter(m => m.row_name !== 'unknown'),
                    measurements_malam: measurements_malam.filter(m => m.row_name !== 'unknown'),
                    rowNumber 
                });
            }

            // ✅ REPORT IF NO VALID DATA
            if (transformedData.length === 0) {
                const errorReport = {
                    success: false,
                    error: 'Tidak ada data valid untuk diimpor',
                    validationErrors: validationErrors.slice(0, 50), // Limit to first 50 errors
                    skippedRows: skippedRows.slice(0, 20),
                    summary: {
                        totalRows: Math.floor(dataRows.length / 5),
                        validData: 0,
                        errorData: validationErrors.length,
                        skippedData: skippedRows.length
                    }
                };
                return res.status(400).json(errorReport);
            }
            
            console.log(`✅ ${transformedData.length} data valid siap diimport`);
            
            const db = await initPrisma();
            
            // ✅ CHECK FOR DUPLICATES IN DATABASE
            const existingGardus = await db.substation.findMany({
                where: {
                    noGardu: { in: transformedData.map(d => d.noGardu) }
                },
                select: { noGardu: true }
            });
            
            const existingNoGardus = new Set(existingGardus.map(g => g.noGardu));
            const duplicates = [];
            const dataToInsert = [];
            
            transformedData.forEach(data => {
                if (existingNoGardus.has(data.noGardu)) {
                    duplicates.push({
                        row: data.rowNumber,
                        noGardu: data.noGardu,
                        reason: 'No. Gardu sudah ada di database'
                    });
                } else {
                    dataToInsert.push(data);
                }
            });

            // ✅ PARTIAL SUCCESS: Insert valid data
            let createdCount = 0;
            const insertErrors = [];

            if (dataToInsert.length > 0) {
                console.log(`💾 Menyimpan ${dataToInsert.length} data ke database...`);
                
                // Process in transaction but catch individual errors
                for (const data of dataToInsert) {
                    try {
                        await db.substation.create({
                            data: {
                                no: data.no,
                                ulp: data.ulp,
                                noGardu: data.noGardu,
                                namaLokasiGardu: data.namaLokasiGardu,
                                jenis: data.jenis,
                                merek: data.merek,
                                daya: data.daya,
                                tahun: data.tahun,
                                phasa: data.phasa,
                                tap_trafo_max_tap: data.tap_trafo_max_tap,
                                penyulang: data.penyulang,
                                arahSequence: data.arahSequence,
                                tanggal: data.tanggal,
                                measurements_siang: { create: data.measurements_siang },
                                measurements_malam: { create: data.measurements_malam }
                            }
                        });
                        createdCount++;
                    } catch (dbError) {
                        insertErrors.push({
                            row: data.rowNumber,
                            noGardu: data.noGardu,
                            error: dbError.message
                        });
                        console.error(`❌ Error inserting gardu ${data.noGardu}:`, dbError.message);
                    }
                }
            }

            // ✅ COMPREHENSIVE RESPONSE
            const response = {
                success: createdCount > 0,
                message: createdCount > 0 
                    ? `Import selesai. ${createdCount} gardu berhasil disimpan.`
                    : 'Import gagal. Tidak ada data yang berhasil disimpan.',
                summary: {
                    totalProcessed: transformedData.length,
                    successful: createdCount,
                    failed: insertErrors.length,
                    duplicates: duplicates.length,
                    validationErrors: validationErrors.length,
                    skippedRows: skippedRows.length
                },
                details: {}
            };

            // Add error details only if there are errors
            if (insertErrors.length > 0) {
                response.details.insertErrors = insertErrors.slice(0, 20);
            }
            if (duplicates.length > 0) {
                response.details.duplicates = duplicates.slice(0, 20);
            }
            if (validationErrors.length > 0) {
                response.details.validationErrors = validationErrors.slice(0, 30);
            }
            if (skippedRows.length > 0) {
                response.details.skippedRows = skippedRows.slice(0, 10);
            }

            console.log(`✅ Import selesai: ${createdCount} sukses, ${insertErrors.length} gagal`);
            
            const statusCode = createdCount > 0 ? 200 : 400;
            res.status(statusCode).json(response);

        } catch (procError) {
            console.error('💥 Terjadi kesalahan kritis:', procError);
            res.status(500).json({ 
                success: false, 
                error: 'Gagal memproses file',
                details: procError.message,
                hint: 'Pastikan format file sesuai dengan template export dan semua kolom wajib terisi.'
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