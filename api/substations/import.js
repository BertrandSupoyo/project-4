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

// ✅ IMPROVED VALIDATION FUNCTIONS
function validateMainData(data, rowNumber) {
    const errors = [];
    const warnings = [];
    
    // Critical validations (will block import)
    if (!data.noGardu || data.noGardu.trim() === '') {
        errors.push(`Baris ${rowNumber}: No. Gardu wajib diisi`);
    }
    
    if (!data.namaLokasiGardu || data.namaLokasiGardu.trim() === '') {
        errors.push(`Baris ${rowNumber}: Nama/Lokasi Gardu wajib diisi`);
    }
    
    if (!data.ulp || data.ulp.trim() === '') {
        errors.push(`Baris ${rowNumber}: ULP wajib diisi`);
    }
    
    // Soft validations (will show warnings but allow import)
    if (data.daya && isNaN(parseFloat(data.daya))) {
        warnings.push(`Baris ${rowNumber}: Daya harus berupa angka (akan diset ke 0)`);
        data.daya = '0'; // Fix it
    }
    
    if (data.tahun && !/^\d{4}$/.test(data.tahun)) {
        warnings.push(`Baris ${rowNumber}: Tahun harus 4 digit (akan diset ke tahun sekarang)`);
        data.tahun = new Date().getFullYear().toString();
    }
    
    return { errors, warnings };
}

function validateMeasurements(measurements, rowNumber, timeOfDay) {
    const errors = [];
    const warnings = [];
    
    if (!measurements || measurements.length === 0) {
        warnings.push(`Baris ${rowNumber}: Data pengukuran ${timeOfDay} kosong`);
        return { errors, warnings };
    }
    
    measurements.forEach((m, idx) => {
        // Allow 'unknown' row names but warn about them
        if (m.row_name === 'unknown' || !m.row_name) {
            warnings.push(`Baris ${rowNumber}, ${timeOfDay}, Jurusan ${idx + 1}: Nama jurusan kosong (akan diabaikan)`);
        }
        
        // Convert negative values to 0 instead of rejecting
        const numericFields = ['r', 's', 't', 'n', 'rn', 'sn', 'tn', 'pp', 'pn'];
        numericFields.forEach(field => {
            if (m[field] < 0) {
                warnings.push(`Baris ${rowNumber}, ${timeOfDay}, ${m.row_name || 'unknown'}: ${field} negatif (akan diset ke 0)`);
                m[field] = 0;
            }
        });
    });
    
    return { errors, warnings };
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
            
            if (!fs.existsSync(tempFilePath)) {
                throw new Error('File temporary tidak ditemukan');
            }
            
            const fileContent = fs.readFileSync(tempFilePath);
            
            let workbook;
            try {
                workbook = XLSX.read(fileContent, { type: 'buffer', cellDates: true });
            } catch (xlsxError) {
                throw new Error('File bukan format Excel yang valid (.xlsx atau .xls)');
            }
            
            if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
                throw new Error('File Excel tidak memiliki sheet');
            }
            
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const allRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, cellDates: true, raw: false });

            console.log(`📊 Total rows in Excel: ${allRows.length}`);

            if (!allRows || allRows.length === 0) {
                throw new Error('File Excel kosong');
            }

            // ✅ IMPROVED HEADER DETECTION
            const normalizeHeader = (str) => String(str || '')
                .toLowerCase()
                .trim()
                .replace(/\s+/g, '')
                .replace(/[\/\-\.]/g, '');
            
            let headerRowIdx = -1;
            let headerRow = [];
            
            // Try to find header row more flexibly
            for (let i = 0; i < Math.min(10, allRows.length); i++) {
                const row = allRows[i];
                const normalizedRow = row.map(normalizeHeader);
                
                // Check for key columns
                const hasNoGardu = normalizedRow.some(h => h.includes('nogardu') || h === 'no.gardu');
                const hasULP = normalizedRow.some(h => h === 'ulp');
                const hasNamaLokasi = normalizedRow.some(h => h.includes('nama') || h.includes('lokasi'));
                
                if (hasNoGardu || (hasULP && hasNamaLokasi)) {
                    headerRowIdx = i;
                    headerRow = normalizedRow;
                    console.log(`✅ Header found at row ${i + 1}`);
                    console.log(`📋 Headers:`, row);
                    break;
                }
            }
            
            if (headerRowIdx === -1) {
                throw new Error(
                    'Header tidak ditemukan. Pastikan baris pertama memiliki kolom: "No. Gardu", "ULP", "Nama/Lokasi Gardu", dll.\n' +
                    'Preview baris pertama: ' + JSON.stringify(allRows[0])
                );
            }
            
            const dataRows = allRows.slice(headerRowIdx + 1);

            if (dataRows.length === 0) {
                throw new Error('Tidak ada data untuk diimport setelah header');
            }

            // ✅ IMPROVED FIELD GETTER
            const getField = (rowObj, keys) => {
                for (const key of keys) {
                    const val = rowObj[key];
                    if (val !== undefined && val !== null && String(val).trim() !== '') {
                        return String(val).trim();
                    }
                }
                return '';
            };

            // ✅ COLLECT ALL DATA WITH LENIENT VALIDATION
            const transformedData = [];
            const validationErrors = [];
            const validationWarnings = [];
            const skippedRows = [];

            console.log(`📊 Memproses ${dataRows.length} baris data...`);

            // ✅ HANDLE BOTH GROUPED AND FLAT DATA
            let i = 0;
            while (i < dataRows.length) {
                const rowNumber = headerRowIdx + 2 + i;
                
                // Build row object
                const rowObj = {};
                headerRow.forEach((col, idx) => { 
                    rowObj[col] = dataRows[i]?.[idx]; 
                });

                // Check if completely empty
                const hasAnyData = Object.values(rowObj).some(val => 
                    val !== undefined && val !== null && String(val).trim() !== ''
                );
                
                if (!hasAnyData) {
                    console.log(`⏭️  Skipping empty row ${rowNumber}`);
                    i++;
                    continue;
                }

                // Extract main data
                const tanggalValue = parseSafeDate(getField(rowObj, ['tanggal', 'tgl']));
                const monthValue = tanggalValue.toISOString().slice(0, 7);

                const mainData = {
                    no: parseInt(getField(rowObj, ['no'])) || 0,
                    ulp: getField(rowObj, ['ulp']),
                    noGardu: getField(rowObj, ['nogardu', 'no.gardu', 'no_gardu', 'gardu']),
                    namaLokasiGardu: getField(rowObj, ['namalokasi', 'namalokasigardu', 'nama/lokasi', 'namagardu', 'lokasi']),
                    jenis: getField(rowObj, ['jenis', 'jenisgardu']),
                    merek: getField(rowObj, ['merk', 'merek', 'merktrafo']),
                    daya: getField(rowObj, ['daya', 'dayatrafo', 'kva']) || '0',
                    tahun: getField(rowObj, ['tahun', 'tahunpembuatan']) || new Date().getFullYear().toString(),
                    phasa: getField(rowObj, ['phasa', 'phase']),
                    tap_trafo_max_tap: getField(rowObj, ['taptrafomaxtap', 'tap', 'maxtap']),
                    penyulang: getField(rowObj, ['penyulang', 'feeder']),
                    arahSequence: getField(rowObj, ['arahsequence', 'sequence', 'arah']),
                    tanggal: tanggalValue,
                };

                // ✅ VALIDATE with separate errors and warnings
                const validation = validateMainData(mainData, rowNumber);
                
                if (validation.errors.length > 0) {
                    validationErrors.push(...validation.errors);
                    console.log(`❌ Row ${rowNumber} validation failed:`, validation.errors);
                    i++;
                    continue;
                }
                
                if (validation.warnings.length > 0) {
                    validationWarnings.push(...validation.warnings);
                    console.log(`⚠️  Row ${rowNumber} warnings:`, validation.warnings);
                }

                // ✅ FLEXIBLE MEASUREMENT EXTRACTION
                const extractMeasurements = (timeOfDay) => {
                    const powerRating = parseFloat(mainData.daya) || 0;
                    const measurements = [];
                    
                    // Try to find measurement data in current or next few rows
                    const searchRows = dataRows.slice(i, i + 5);
                    
                    searchRows.forEach((rowArr, offset) => {
                        const mRowObj = {};
                        headerRow.forEach((col, idx) => { 
                            mRowObj[col] = rowArr?.[idx]; 
                        });

                        // Check if this row has measurement data for this time of day
                        const hasTimeData = headerRow.some(h => h.includes(timeOfDay));
                        
                        if (!hasTimeData) return; // Skip if no data for this time

                        const r = parseFloat(getField(mRowObj, [`r${timeOfDay}`, `r(${timeOfDay})`, `r_${timeOfDay}`, `rsiang`, `rmalam`])) || 0;
                        const s = parseFloat(getField(mRowObj, [`s${timeOfDay}`, `s(${timeOfDay})`, `s_${timeOfDay}`, `ssiang`, `smalam`])) || 0;
                        const t = parseFloat(getField(mRowObj, [`t${timeOfDay}`, `t(${timeOfDay})`, `t_${timeOfDay}`, `tsiang`, `tmalam`])) || 0;
                        const n = parseFloat(getField(mRowObj, [`n${timeOfDay}`, `n(${timeOfDay})`, `n_${timeOfDay}`, `nsiang`, `nmalam`])) || 0;
                        const rn = parseFloat(getField(mRowObj, [`rn${timeOfDay}`, `r-n(${timeOfDay})`, `rn_${timeOfDay}`, `rnsiang`, `rnmalam`])) || 0;
                        const sn = parseFloat(getField(mRowObj, [`sn${timeOfDay}`, `s-n(${timeOfDay})`, `sn_${timeOfDay}`, `snsiang`, `snmalam`])) || 0;
                        const tn = parseFloat(getField(mRowObj, [`tn${timeOfDay}`, `t-n(${timeOfDay})`, `tn_${timeOfDay}`, `tnsiang`, `tnmalam`])) || 0;
                        const pp = parseFloat(getField(mRowObj, [`pp${timeOfDay}`, `p-p(${timeOfDay})`, `pp_${timeOfDay}`, `ppsiang`, `ppmalam`])) || 0;
                        const pn = parseFloat(getField(mRowObj, [`pn${timeOfDay}`, `p-n(${timeOfDay})`, `pn_${timeOfDay}`, `pnsiang`, `pnmalam`])) || 0;

                        // Only add if has actual measurement data
                        if (r > 0 || s > 0 || t > 0 || pp > 0 || pn > 0) {
                            const calculations = calculateMeasurements(r, s, t, n, rn, sn, tn, pp, pn, powerRating);

                            const jurusan = getField(mRowObj, ['jurusan', 'jur', 'outlet', 'feeder']).toLowerCase();
                            
                            measurements.push({
                                month: monthValue,
                                row_name: jurusan || `jurusan_${offset + 1}`,
                                r, s, t, n, rn, sn, tn, pp, pn,
                                rata2: calculations.rata2,
                                kva: calculations.kva,
                                persen: calculations.persen,
                                unbalanced: calculations.unbalanced,
                            });
                        }
                    });
                    
                    return measurements;
                };

                const measurements_siang = extractMeasurements('siang');
                const measurements_malam = extractMeasurements('malam');

                console.log(`📊 Row ${rowNumber}: Found ${measurements_siang.length} siang, ${measurements_malam.length} malam measurements`);

                // ✅ ALLOW DATA WITH OR WITHOUT MEASUREMENTS
                const siangValidation = validateMeasurements(measurements_siang, rowNumber, 'siang');
                const malamValidation = validateMeasurements(measurements_malam, rowNumber, 'malam');
                
                if (siangValidation.warnings.length > 0) {
                    validationWarnings.push(...siangValidation.warnings);
                }
                if (malamValidation.warnings.length > 0) {
                    validationWarnings.push(...malamValidation.warnings);
                }

                // Filter out invalid measurements
                const validSiang = measurements_siang.filter(m => m.row_name && m.row_name !== 'unknown');
                const validMalam = measurements_malam.filter(m => m.row_name && m.row_name !== 'unknown');

                transformedData.push({ 
                    ...mainData, 
                    measurements_siang: validSiang,
                    measurements_malam: validMalam,
                    rowNumber 
                });

                // Move to next gardu (skip grouped rows if detected, otherwise just next row)
                const nextGarduRows = dataRows.slice(i + 1, i + 5);
                const hasNextGroup = nextGarduRows.some(row => {
                    const obj = {};
                    headerRow.forEach((col, idx) => { obj[col] = row?.[idx]; });
                    return getField(obj, ['nogardu']) === '';
                });
                
                i += hasNextGroup ? 5 : 1;
            }

            // ✅ BETTER ERROR REPORTING
            if (transformedData.length === 0) {
                console.log('❌ No valid data found');
                console.log(`Validation errors: ${validationErrors.length}`);
                console.log(`Warnings: ${validationWarnings.length}`);
                
                const errorReport = {
                    success: false,
                    error: 'Tidak ada data valid untuk diimpor',
                    details: {
                        message: 'Semua baris gagal validasi atau tidak memiliki data yang cukup',
                        validationErrors: validationErrors.slice(0, 50),
                        warnings: validationWarnings.slice(0, 30),
                        hint: 'Pastikan minimal kolom "No. Gardu", "ULP", dan "Nama/Lokasi Gardu" terisi'
                    },
                    summary: {
                        totalRows: dataRows.length,
                        validData: 0,
                        errorData: validationErrors.length,
                        warnings: validationWarnings.length
                    }
                };
                return res.status(400).json(errorReport);
            }
            
            console.log(`✅ ${transformedData.length} data valid ditemukan`);
            
            const db = await initPrisma();
            
            // ✅ CHECK FOR DUPLICATES
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

            // ✅ INSERT DATA
            let createdCount = 0;
            const insertErrors = [];

            if (dataToInsert.length > 0) {
                console.log(`💾 Menyimpan ${dataToInsert.length} data ke database...`);
                
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
                                measurements_siang: data.measurements_siang.length > 0 
                                    ? { create: data.measurements_siang } 
                                    : undefined,
                                measurements_malam: data.measurements_malam.length > 0 
                                    ? { create: data.measurements_malam } 
                                    : undefined
                            }
                        });
                        createdCount++;
                        console.log(`✅ Imported: ${data.noGardu}`);
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
                    ? `✅ Import berhasil! ${createdCount} gardu telah disimpan ke database.`
                    : '❌ Import gagal. Tidak ada data yang berhasil disimpan.',
                summary: {
                    totalProcessed: transformedData.length,
                    successful: createdCount,
                    failed: insertErrors.length,
                    duplicates: duplicates.length,
                    validationErrors: validationErrors.length,
                    warnings: validationWarnings.length
                },
                details: {}
            };

            if (insertErrors.length > 0) {
                response.details.insertErrors = insertErrors.slice(0, 20);
            }
            if (duplicates.length > 0) {
                response.details.duplicates = duplicates.slice(0, 20);
            }
            if (validationErrors.length > 0) {
                response.details.validationErrors = validationErrors.slice(0, 30);
            }
            if (validationWarnings.length > 0) {
                response.details.warnings = validationWarnings.slice(0, 20);
            }

            console.log(`✅ Import complete: ${createdCount} success, ${insertErrors.length} failed, ${duplicates.length} duplicates`);
            
            const statusCode = createdCount > 0 ? 200 : 400;
            res.status(statusCode).json(response);

        } catch (procError) {
            console.error('💥 Critical error:', procError);
            res.status(500).json({ 
                success: false, 
                error: 'Gagal memproses file',
                details: procError.message,
                stack: process.env.NODE_ENV === 'development' ? procError.stack : undefined,
                hint: 'Pastikan format file sesuai dengan template export dan kolom wajib terisi (No. Gardu, ULP, Nama/Lokasi Gardu)'
            });
        } finally {
            try {
                if (tempFilePath && fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                    console.log('🧹 Temporary file cleaned');
                }
            } catch (cleanupError) {
                console.warn('⚠️  Failed to cleanup temp file:', cleanupError);
            }
        }
    });
}