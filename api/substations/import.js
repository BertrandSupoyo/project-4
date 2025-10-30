// PENGUKURAN SIANG: Columns O-W (index 14-22)
                    // O=14:R, P=15:S, Q=16:T, R=17:N, S=18:R-N, T=19:S-N, U=20:T-N, V=21:P-P, W=22:P-N
                    const r_siang = parseFloat(row[14]) || 0;
                    const s_siang = parseFloat(row[15]) || 0;
                    const t_siang = parseFloat(row[16]) || 0;
                    const n_siang = parseFloat(row[17]) || 0;
                    const rn_siang = parseFloat(row[18]) || 0;
                    const sn_siang = parseFloat(row[19]) || 0;
                    const tn_siang = parseFloat(row[20]) || 0;
                    const pp_siang = parseFloat(row[21]) || 0;
                    const pn_siang = parseFloat(row[22]) || 0;import { PrismaClient } from '../../prisma/app/generated/prisma-client/index.js';
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

// Validasi 5 row data untuk 1 substation
function validateFiveRows(substationRows, startRowNumber, expectedJurusan = ['induk', '1', '2', '3', '4']) {
    const errors = [];
    const validRows = [];

    console.log(`\n🔍 Validasi 5 row: baris ${startRowNumber} s/d ${startRowNumber + 4}`);

    for (let j = 0; j < 5; j++) {
        const row = substationRows[j];
        const currentRowNum = startRowNumber + j;
        
        // Cek jurusan (column N / index 13) - WAJIB ada
        const jurusanRaw = String(row[13] || '').toLowerCase().trim();
        
        if (!jurusanRaw || jurusanRaw === '') {
            errors.push(`  ❌ Row ${currentRowNum}: Jurusan kosong (column O)`);
            continue;
        }

        const jurusanNormalized = jurusanRaw === 'induk' ? 'induk' : jurusanRaw;
        
        if (!expectedJurusan.includes(jurusanNormalized)) {
            errors.push(`  ⚠️  Row ${currentRowNum}: Jurusan tidak valid "${jurusanRaw}" (expected: ${expectedJurusan.join(', ')})`);
            continue;
        }

        // Data kosong = default 0 (tidak perlu error)
        const r_siang = parseFloat(row[15]) || 0;
        const s_siang = parseFloat(row[16]) || 0;
        const t_siang = parseFloat(row[17]) || 0;
        const pp_siang = parseFloat(row[22]) || 0;

        const r_malam = parseFloat(row[24]) || 0;
        const s_malam = parseFloat(row[25]) || 0;
        const t_malam = parseFloat(row[26]) || 0;
        const pp_malam = parseFloat(row[31]) || 0;

        // Row valid (jurusan valid sudah cukup, data bisa 0)
        validRows.push({
            rowNumber: currentRowNum,
            jurusan: jurusanNormalized,
            data: row
        });
        
        console.log(`  ✅ Row ${currentRowNum}: ${jurusanNormalized} - Siang: ${r_siang}/${s_siang}/${t_siang}, Malam: ${r_malam}/${s_malam}/${t_malam}`);
    }

    return { validRows, errors };
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
        if (origin.endsWith('.vercel.app')) return true;
        if (origin === 'https://project-4-vyl4.vercel.app') return true;
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
                workbook = XLSX.read(fileContent, { type: 'buffer', cellDates: true });
            } catch (parseErr) {
                console.error('📄 Failed to parse Excel file:', parseErr);
                return res.status(400).json({ success: false, error: 'Invalid Excel file', details: parseErr.message });
            }

            const sheetName = workbook.SheetNames?.[0];
            if (!sheetName) {
                return res.status(400).json({ success: false, error: 'Excel has no sheets' });
            }
            
            const worksheet = workbook.Sheets[sheetName];
            
            const allRows = XLSX.utils.sheet_to_json(worksheet, { 
                header: 1, 
                defval: '',
                raw: false,
                cellDates: true
            });

            console.log(`📊 Total rows in Excel: ${allRows.length}`);
            
            let dataStartRow = -1;
            for (let i = 0; i < Math.min(10, allRows.length); i++) {
                const row = allRows[i];
                const ulp = String(row[1] || '').trim();
                const noGardu = String(row[2] || '').trim();
                if ((ulp && ulp !== 'ULP') || (noGardu && noGardu !== 'NO GARDU' && noGardu !== 'NO. GARDU')) {
                    dataStartRow = i;
                    console.log(`✅ Data starts at row ${i + 1} (index ${i})`);
                    break;
                }
            }
            
            if (dataStartRow === -1) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Tidak dapat menemukan baris data. Pastikan file Excel memiliki data yang valid.' 
                });
            }

            const dataRows = allRows.slice(dataStartRow);
            console.log(`📋 Data rows to process: ${dataRows.length} (starting from Excel row ${dataStartRow + 1})`);
            
            if (dataRows.length > 0) {
                console.log('🔍 First data row [0] (first 20 columns):');
                console.log(dataRows[0].slice(0, 20).map((val, idx) => `[${idx}]=${val}`).join(', '));
            }

            const transformedData = [];
            const ROWS_PER_SUBSTATION = 5;
            const expectedJurusan = ['induk', '1', '2', '3', '4'];
            const allValidationErrors = [];
            
            for (let i = 0; i < dataRows.length; i += ROWS_PER_SUBSTATION) {
                const substationRows = dataRows.slice(i, i + ROWS_PER_SUBSTATION);
                const excelRowStart = i + dataStartRow + 1;
                
                if (substationRows.length < ROWS_PER_SUBSTATION) {
                    console.warn(`⚠️  Skipping incomplete group at row ${excelRowStart}: only ${substationRows.length} rows`);
                    allValidationErrors.push(`Group at Excel row ${excelRowStart}: incomplete (${substationRows.length}/5 rows)`);
                    continue;
                }

                // Validasi 5 row dulu
                const { validRows, errors } = validateFiveRows(substationRows, excelRowStart, expectedJurusan);
                
                if (errors.length > 0) {
                    console.warn(`⚠️  Validasi gagal untuk baris ${excelRowStart}:`);
                    errors.forEach(err => console.warn(err));
                    allValidationErrors.push(`Row ${excelRowStart}: ${errors.join('; ')}`);
                    continue; // Skip substation ini
                }

                if (validRows.length !== ROWS_PER_SUBSTATION) {
                    console.warn(`⚠️  Row ${excelRowStart}: Hanya ${validRows.length}/5 row yang valid`);
                    allValidationErrors.push(`Row ${excelRowStart}: hanya ${validRows.length}/5 row valid`);
                    continue; // Skip substation ini jika tidak semua 5 row valid
                }

                // Jika semua 5 row valid, baru proses master data
                const masterRow = substationRows[0];
                
                const noFromExcel = String(masterRow[0] || '').trim();
                const ulp = String(masterRow[1] || '').trim();
                const noGardu = String(masterRow[2] || '').trim();
                const namaLokasiGardu = String(masterRow[3] || '').trim();
                const jenis = String(masterRow[4] || '').trim();
                const merek = String(masterRow[5] || '').trim();
                const daya = String(masterRow[6] || '').trim();
                const tahun = String(masterRow[7] || '').trim();
                const phasa = String(masterRow[8] || '').trim();
                const tap_trafo_max_tap = String(masterRow[9] || '').trim();
                const arahSequence = String(masterRow[10] || '').trim();
                const penyulang = String(masterRow[11] || '').trim();
                const tanggalRaw = masterRow[12];
                const tanggal = parseSafeDate(tanggalRaw);
                const monthValue = tanggal.toISOString().slice(0, 7);

                if (!noGardu && !namaLokasiGardu) {
                    console.warn(`⚠️  Skipping substation at row ${excelRowStart}: no identifier`);
                    allValidationErrors.push(`Row ${excelRowStart}: tidak ada identitas substation`);
                    continue;
                }

                const powerRating = parseFloat(daya) || 0;
                
                console.log(`\n📍 Processing: ${noGardu || namaLokasiGardu} (${ulp})`);

                const measurements_siang = [];
                const measurements_malam = [];

                // Proses semua valid rows
                for (const validRow of validRows) {
                    const row = validRow.data;
                    const jurusanNormalized = validRow.jurusan;

                    // PENGUKURAN SIANG
                    const r_siang = parseFloat(row[15]) || 0;
                    const s_siang = parseFloat(row[16]) || 0;
                    const t_siang = parseFloat(row[17]) || 0;
                    const n_siang = parseFloat(row[18]) || 0;
                    const rn_siang = parseFloat(row[19]) || 0;
                    const sn_siang = parseFloat(row[20]) || 0;
                    const tn_siang = parseFloat(row[21]) || 0;
                    const pp_siang = parseFloat(row[22]) || 0;
                    const pn_siang = parseFloat(row[23]) || 0;

                    const calc_siang = calculateMeasurements(
                        r_siang, s_siang, t_siang, n_siang,
                        rn_siang, sn_siang, tn_siang,
                        pp_siang, pn_siang, powerRating
                    );

                    measurements_siang.push({
                        month: monthValue,
                        row_name: jurusanNormalized,
                        r: r_siang,
                        s: s_siang,
                        t: t_siang,
                        n: n_siang,
                        rn: rn_siang,
                        sn: sn_siang,
                        tn: tn_siang,
                        pp: pp_siang,
                        pn: pn_siang,
                        rata2: calc_siang.rata2,
                        kva: calc_siang.kva,
                        persen: calc_siang.persen,
                        unbalanced: calc_siang.unbalanced
                    });

                    // PENGUKURAN MALAM: Columns X-AF (index 23-31)
                    // X=23:R, Y=24:S, Z=25:T, AA=26:N, AB=27:R-N, AC=28:S-N, AD=29:T-N, AE=30:P-P, AF=31:P-N
                    const r_malam = parseFloat(row[23]) || 0;
                    const s_malam = parseFloat(row[24]) || 0;
                    const t_malam = parseFloat(row[25]) || 0;
                    const n_malam = parseFloat(row[26]) || 0;
                    const rn_malam = parseFloat(row[27]) || 0;
                    const sn_malam = parseFloat(row[28]) || 0;
                    const tn_malam = parseFloat(row[29]) || 0;
                    const pp_malam = parseFloat(row[30]) || 0;
                    const pn_malam = parseFloat(row[31]) || 0;

                    const calc_malam = calculateMeasurements(
                        r_malam, s_malam, t_malam, n_malam,
                        rn_malam, sn_malam, tn_malam,
                        pp_malam, pn_malam, powerRating
                    );

                    measurements_malam.push({
                        month: monthValue,
                        row_name: jurusanNormalized,
                        r: r_malam,
                        s: s_malam,
                        t: t_malam,
                        n: n_malam,
                        rn: rn_malam,
                        sn: sn_malam,
                        tn: tn_malam,
                        pp: pp_malam,
                        pn: pn_malam,
                        rata2: calc_malam.rata2,
                        kva: calc_malam.kva,
                        persen: calc_malam.persen,
                        unbalanced: calc_malam.unbalanced
                    });

                    console.log(`  ✓ ${jurusanNormalized}: Siang=${r_siang}/${s_siang}/${t_siang}, Malam=${r_malam}/${s_malam}/${t_malam}`);
                }

                // Semua 5 row valid, tambahkan ke transformedData
                transformedData.push({
                    no: 0,
                    ulp,
                    noGardu,
                    namaLokasiGardu,
                    jenis,
                    merek,
                    daya,
                    tahun,
                    phasa,
                    tap_trafo_max_tap,
                    penyulang,
                    arahSequence,
                    tanggal,
                    measurements_siang,
                    measurements_malam
                });
                console.log(`  ✅ Substation diterima: ${measurements_siang.length} siang + ${measurements_malam.length} malam`);
            }

            console.log(`\n📊 Summary: ${transformedData.length} substation valid dari ${Math.ceil(dataRows.length / ROWS_PER_SUBSTATION)} group`);

            if (transformedData.length === 0) {
                console.error('❌ All validation errors:', allValidationErrors);
                return res.status(400).json({ 
                    success: false, 
                    error: 'Tidak ada data valid untuk diimpor.',
                    details: 'Periksa validationErrors di bawah',
                    validationErrors: allValidationErrors,
                    totalErrors: allValidationErrors.length
                });
            }
            
            console.log(`\n📊 Total ${transformedData.length} substation siap diimpor ke database...`);
            
            const db = await initPrisma();
            
            const result = await db.$transaction(async (tx) => {
                let createdCount = 0;
                
                for (const data of transformedData) {
                    const agg = await tx.substation.aggregate({ _max: { no: true } });
                    const maxNo = agg?._max?.no || 0;
                    const safeNo = maxNo + 1;

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
                    console.log(`  ✅ Disimpan ke DB: ${data.noGardu}`);
                }
                
                return { createdCount };
            });

            console.log(`\n🎉 Import berhasil! ${result.createdCount} substation telah dibuat.`);
            
            res.status(200).json({
                success: true,
                message: `Import berhasil! ${result.createdCount} substation dengan pengukuran telah ditambahkan.`,
                data: { 
                    createdCount: result.createdCount, 
                    errors: allValidationErrors
                },
            });

        } catch (procError) {
            console.error('💥 Error:', procError?.stack || procError);
            res.status(500).json({ 
                success: false, 
                error: 'Gagal memproses file.', 
                details: procError?.message || String(procError)
            });
        } finally {
            try {
                if (tempFilePath && fs.existsSync(tempFilePath)) {
                    fs.unlinkSync(tempFilePath);
                    console.log('🧹 Temp file cleaned');
                }
            } catch (cleanupError) {
                console.warn('⚠️  Cleanup warning:', cleanupError);
            }
        }
    });
}