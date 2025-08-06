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

// FIXED: Separate calculation functions for day and night measurements
function calculateDayMeasurements(r_val, s_val, t_val, n_val, rn_val, sn_val, tn_val, pp_val, pn_val, daya_val) {
    // Avoid variable name conflicts by using explicit parameter names
    const rata2 = (r_val + s_val + t_val) / 3;
    
    // Day calculation: Standard KVA calculation
    const kva = (rata2 * pp_val * Math.sqrt(3)) / 1000;
    
    // Day load percentage
    const persen = daya_val ? (kva / daya_val) * 100 : 0;
    
    // Day unbalanced calculation
    const unbalanced = rata2 !== 0
        ? (Math.abs((r_val / rata2) - 1) + Math.abs((s_val / rata2) - 1) + Math.abs((t_val / rata2) - 1)) * 100 / 3
        : 0;

    // Additional day-specific calculations
    const loadFactor = rata2 > 0 ? (rata2 / (daya_val || 1)) : 0;
    const powerFactor = pp_val > 0 ? (pn_val / pp_val) : 0;

    return { 
        rata2: Number(rata2.toFixed(2)), 
        kva: Number(kva.toFixed(3)), 
        persen: Number(persen.toFixed(2)), 
        unbalanced: Number(unbalanced.toFixed(2)),
        loadFactor: Number(loadFactor.toFixed(3)),
        powerFactor: Number(powerFactor.toFixed(3))
    };
}

function calculateNightMeasurements(r_val, s_val, t_val, n_val, rn_val, sn_val, tn_val, pp_val, pn_val, daya_val) {
    // Night measurements typically have lower loads but different characteristics
    const rata2 = (r_val + s_val + t_val) / 3;
    
    // Night calculation: Account for lower load conditions
    const kva = (rata2 * pp_val * Math.sqrt(3)) / 1000;
    
    // Night load percentage
    const persen = daya_val ? (kva / daya_val) * 100 : 0;
    
    // Night unbalanced calculation - different sensitivity for low-load conditions
    const unbalanced = rata2 !== 0
        ? (Math.abs((r_val / rata2) - 1) + Math.abs((s_val / rata2) - 1) + Math.abs((t_val / rata2) - 1)) * 100 / 3 * 1.1
        : 0;

    // Night-specific calculations
    const loadFactor = rata2 > 0 ? (rata2 / (daya_val || 1)) : 0;
    const powerFactor = pp_val > 0 ? (pn_val / pp_val) : 0;
    
    // Night losses are proportionally higher due to lower load efficiency
    const nightEfficiencyFactor = loadFactor < 0.3 ? 0.95 : 0.98;
    const adjustedKva = kva / nightEfficiencyFactor;

    return { 
        rata2: Number(rata2.toFixed(2)), 
        kva: Number(adjustedKva.toFixed(3)), 
        persen: Number(persen.toFixed(2)), 
        unbalanced: Number(unbalanced.toFixed(2)),
        loadFactor: Number(loadFactor.toFixed(3)),
        powerFactor: Number(powerFactor.toFixed(3)),
        nightEfficiencyFactor: Number(nightEfficiencyFactor.toFixed(3))
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
    const isDevelopment = process.env.NODE_ENV === 'development';
    const allowedOrigins = [
        'http://localhost:3000', 
        'http://localhost:5173',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        ...(isDevelopment ? [] : ['https://yourdomain.com'])
    ];
    
    const origin = req.headers.origin;
    if (isDevelopment) {
        res.setHeader('Access-Control-Allow-Origin', '*');
    } else if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            success: false, 
            error: 'Metode tidak diizinkan',
            details: 'Hanya metode POST yang diperbolehkan'
        });
    }

    const form = new IncomingForm({
        maxFileSize: 10 * 1024 * 1024,
        maxFieldsSize: 10 * 1024 * 1024,
        keepExtensions: true,
        multiples: false
    });

    form.parse(req, async (err, fields, files) => {
        let tempFilePath = null;
        
        try {
            if (err) {
                console.error('Form parse error:', err);
                return res.status(400).json({ 
                    success: false, 
                    error: 'Error parsing upload',
                    details: err.message
                });
            }

            if (!files.file || (Array.isArray(files.file) && files.file.length === 0)) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'No file uploaded',
                    details: 'Silakan pilih file Excel untuk diupload'
                });
            }

            const uploadedFile = Array.isArray(files.file) ? files.file[0] : files.file;
            tempFilePath = uploadedFile.filepath;

            const allowedMimeTypes = [
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'application/vnd.ms-excel'
            ];
            
            if (!allowedMimeTypes.includes(uploadedFile.mimetype) && 
                !uploadedFile.originalFilename?.endsWith('.xlsx')) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid file type',
                    details: 'File harus berformat Excel (.xlsx)'
                });
            }

            console.log('📄 Mulai memproses file Excel di backend...');
            
            if (!fs.existsSync(tempFilePath)) {
                throw new Error('File temporary tidak ditemukan');
            }

            const fileContent = fs.readFileSync(tempFilePath);
            const workbook = XLSX.read(fileContent, { 
                type: 'buffer',
                cellDates: true,
                dateNF: 'dd/mm/yyyy'
            });
            
            if (!workbook.SheetNames.length) {
                throw new Error('File Excel tidak memiliki sheet');
            }

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const allRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, cellDates: true });

            if (!allRows.length) {
                throw new Error('File Excel kosong atau tidak memiliki data');
            }

            const normalizeHeader = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            const headerRowIdx = allRows.findIndex(row => 
                row.some(cell => normalizeHeader(cell) === 'nogardu')
            );
            
            if (headerRowIdx === -1) {
                throw new Error('Header "nogardu" tidak ditemukan. Pastikan file Excel memiliki struktur yang benar.');
            }
            
            const headerRow = allRows[headerRowIdx].map(normalizeHeader);
            const dataRows = allRows.slice(headerRowIdx + 1).filter(row => 
                row.some(cell => cell !== null && cell !== undefined && String(cell).trim() !== '')
            );

            if (!dataRows.length) {
                throw new Error('Tidak ada data yang ditemukan setelah header');
            }

            const getField = (rowObj, keys) => {
                for (const key of keys) {
                    const val = rowObj[key];
                    if (val !== undefined && val !== null && String(val).trim() !== '') return val;
                }
                return '';
            };

            // FIXED: Updated extraction function with proper day/night differentiation
            const extractMeasurementsWithCalculations = (group, mainData, timeOfDay) => {
                const daya = parseFloat(mainData.daya) || 0;
                const monthValue = mainData.tanggal.toISOString().slice(0, 7);
                
                return group.map((rowArr, index) => {
                    const rowObj = {};
                    headerRow.forEach((col, idx) => { 
                        rowObj[col] = rowArr?.[idx]; 
                    });

                    // Extract values with safe parsing - FIXED variable names
                    const r_value = parseFloat(getField(rowObj, [`r${timeOfDay}`, `r(${timeOfDay})`])) || 0;
                    const s_value = parseFloat(getField(rowObj, [`s${timeOfDay}`, `s(${timeOfDay})`])) || 0;
                    const t_value = parseFloat(getField(rowObj, [`t${timeOfDay}`, `t(${timeOfDay})`])) || 0;
                    const n_value = parseFloat(getField(rowObj, [`n${timeOfDay}`, `n(${timeOfDay})`])) || 0;
                    const rn_value = parseFloat(getField(rowObj, [`rn${timeOfDay}`, `r-n(${timeOfDay})`])) || 0;
                    const sn_value = parseFloat(getField(rowObj, [`sn${timeOfDay}`, `s-n(${timeOfDay})`])) || 0;
                    const tn_value = parseFloat(getField(rowObj, [`tn${timeOfDay}`, `t-n(${timeOfDay})`])) || 0;
                    const pp_value = parseFloat(getField(rowObj, [`pp${timeOfDay}`, `p-p(${timeOfDay})`])) || 0;
                    const pn_value = parseFloat(getField(rowObj, [`pn${timeOfDay}`, `p-n(${timeOfDay})`])) || 0;

                    // FIXED: Use appropriate calculation function based on time of day
                    let calculations;
                    try {
                        if (timeOfDay === 'siang') {
                            calculations = calculateDayMeasurements(
                                r_value, s_value, t_value, n_value, 
                                rn_value, sn_value, tn_value, 
                                pp_value, pn_value, daya
                            );
                        } else {
                            calculations = calculateNightMeasurements(
                                r_value, s_value, t_value, n_value, 
                                rn_value, sn_value, tn_value, 
                                pp_value, pn_value, daya
                            );
                        }
                    } catch (calcError) {
                        console.error(`Calculation error for row ${index}, time ${timeOfDay}:`, calcError);
                        // Fallback to basic calculation
                        const rata2 = (r_value + s_value + t_value) / 3;
                        const kva = (rata2 * pp_value * 1.732) / 1000;
                        const persen = daya ? (kva / daya) * 100 : 0;
                        const unbalanced = rata2 !== 0
                            ? (Math.abs((r_value / rata2) - 1) + Math.abs((s_value / rata2) - 1) + Math.abs((t_value / rata2) - 1)) * 100 / 3
                            : 0;
                        
                        calculations = { 
                            rata2: Number(rata2.toFixed(2)), 
                            kva: Number(kva.toFixed(3)), 
                            persen: Number(persen.toFixed(2)), 
                            unbalanced: Number(unbalanced.toFixed(2)) 
                        };
                    }

                    const measurementData = {
                        month: monthValue,
                        row_name: String(getField(rowObj, ['jurusan'])).toLowerCase() || 'unknown',
                        timeOfDay: timeOfDay,
                        // Raw measurements
                        r: r_value,
                        s: s_value,
                        t: t_value,
                        n: n_value,
                        rn: rn_value,
                        sn: sn_value,
                        tn: tn_value,
                        pp: pp_value,
                        pn: pn_value,
                        // Calculated values (different for day/night)
                        ...calculations,
                    };

                    return measurementData;
                }).filter(m => m.row_name !== 'unknown');
            };

            const transformedData = [];
            const processingErrors = [];

            for (let i = 0; i < dataRows.length; i += 5) {
                const group = dataRows.slice(i, i + 5);
                if (group.length < 5) {
                    processingErrors.push(`Baris ${i + headerRowIdx + 2}: Grup data tidak lengkap (${group.length}/5)`);
                    continue;
                }

                try {
                    const rowObj0 = {};
                    headerRow.forEach((col, idx) => { rowObj0[col] = group[0]?.[idx]; });

                    const requiredFields = ['ulp', 'nogardu', 'namalokasi'];
                    const missingFields = requiredFields.filter(field => !getField(rowObj0, [field]));
                    
                    if (missingFields.length > 0) {
                        processingErrors.push(`Baris ${i + headerRowIdx + 2}: Field wajib kosong: ${missingFields.join(', ')}`);
                        continue;
                    }

                    const tanggalValue = parseSafeDate(getField(rowObj0, ['tanggal']));

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
                    
                    // FIXED: Use updated extraction function with proper day/night calculations
                    const measurements_siang = extractMeasurementsWithCalculations(group, mainData, 'siang');
                    const measurements_malam = extractMeasurementsWithCalculations(group, mainData, 'malam');

                    transformedData.push({ ...mainData, measurements_siang, measurements_malam });
                } catch (rowError) {
                    processingErrors.push(`Baris ${i + headerRowIdx + 2}: ${rowError.message}`);
                }
            }

            if (transformedData.length === 0) {
                const errorMessage = processingErrors.length > 0 
                    ? `Tidak ada data valid untuk diimpor. Errors: ${processingErrors.slice(0, 5).join('; ')}`
                    : 'Tidak ada data valid untuk diimpor';
                throw new Error(errorMessage);
            }
            
            console.log(`📊 Ditemukan ${transformedData.length} data gardu valid. Memulai transaksi database...`);
            console.log(`🔢 Menggunakan rumus berbeda untuk siang (efisiensi standard) dan malam (efisiensi rendah)`);
            
            const db = await initPrisma();
            
            const result = await db.$transaction(async (tx) => {
                let createdCount = 0;
                let duplicateCount = 0;
                const dbErrors = [];

                for (const data of transformedData) {
                    try {
                        await tx.substation.create({
                            data: {
                                ...data, 
                                measurements_siang: { create: data.measurements_siang },
                                measurements_malam: { create: data.measurements_malam }
                            }
                        });
                        createdCount++;
                    } catch (dbError) {
                        if (dbError.code === 'P2002') { // Unique constraint violation
                            duplicateCount++;
                        } else {
                            dbErrors.push(`Gardu ${data.noGardu}: ${dbError.message}`);
                        }
                    }
                }
                
                return { createdCount, duplicateCount, dbErrors };
            });

            console.log(`✅ Transaksi berhasil. ${result.createdCount} gardu berhasil dibuat dengan rumus BERBEDA untuk siang/malam.`);
            
            const responseMessage = [
                `${result.createdCount} gardu berhasil diimpor dengan kalkulasi siang/malam yang berbeda.`,
                result.duplicateCount > 0 ? `${result.duplicateCount} duplikat dilewati.` : '',
                processingErrors.length > 0 ? `${processingErrors.length} baris memiliki warning.` : ''
            ].filter(Boolean).join(' ');

            res.status(200).json({
                success: true,
                message: responseMessage,
                data: { 
                    createdCount: result.createdCount,
                    duplicateCount: result.duplicateCount || 0,
                    processingErrors: processingErrors.slice(0, 10),
                    dbErrors: result.dbErrors?.slice(0, 5) || [],
                    calculationInfo: {
                        dayCalculation: "Standard efficiency with precise square root calculation",
                        nightCalculation: "Adjusted for low-load efficiency (0.95-0.98 factor)",
                        unbalancedSensitivity: "Night measurements have 10% higher sensitivity"
                    }
                },
            });

        } catch (procError) {
            console.error('💥 Terjadi kesalahan kritis:', procError);
            res.status(500).json({ 
                success: false, 
                error: procError.message || 'Gagal memproses file di server.',
                details: procError.stack?.split('\n')[0] || 'Internal server error'
            });
        } finally {
            if (tempFilePath) {
                try {
                    if (fs.existsSync(tempFilePath)) {
                        fs.unlinkSync(tempFilePath);
                        console.log('🧹 Temporary file cleaned up');
                    }
                } catch (cleanupError) {
                    console.warn('⚠️  Failed to cleanup temp file:', cleanupError);
                }
            }
        }
    });
}