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
            
            // Read as array of arrays
            const allRows = XLSX.utils.sheet_to_json(worksheet, { 
                header: 1, 
                defval: '',
                raw: false,
                cellDates: true
            });

            console.log(`📊 Total rows in Excel: ${allRows.length}`);
            
            // Find where data actually starts by looking for first non-empty NO or ULP
            let dataStartRow = -1;
            for (let i = 0; i < Math.min(10, allRows.length); i++) {
                const row = allRows[i];
                const ulp = String(row[1] || '').trim();
                const noGardu = String(row[2] || '').trim();
                // Check if this looks like data (not header)
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
            
            // Debug: Log first few data rows
            if (dataRows.length > 0) {
                console.log('🔍 First data row [0] (first 20 columns):');
                console.log(dataRows[0].slice(0, 20).map((val, idx) => `[${idx}]=${val}`).join(', '));
                if (dataRows.length > 1) {
                    console.log('🔍 Second data row [1] (columns 0-15):');
                    console.log(dataRows[1].slice(0, 16).map((val, idx) => `[${idx}]=${val}`).join(', '));
                }
            }

            // Group every 5 rows as 1 substation
            const transformedData = [];
            const ROWS_PER_SUBSTATION = 5;
            const expectedJurusan = ['induk', '1', '2', '3', '4'];
            
            for (let i = 0; i < dataRows.length; i += ROWS_PER_SUBSTATION) {
                const substationRows = dataRows.slice(i, i + ROWS_PER_SUBSTATION);
                
                if (substationRows.length < ROWS_PER_SUBSTATION) {
                    console.warn(`⚠️  Skipping incomplete group at row ${i + dataStartRow + 1}: only ${substationRows.length} rows`);
                    continue;
                }

                // Master data from first row (columns A-N / index 0-13)
                // These are merged cells, so only first row has data
                const masterRow = substationRows[0];
                
                // Column mapping based on your Excel:
                // A=0:NO, B=1:ULP, C=2:NO_GARDU, D=3:NAMA/LOKASI, E=4:JENIS, 
                // F=5:MEREK, G=6:DAYA, H=7:TAHUN, I=8:PHASA, J=9:TAP_TRAFO,
                // K=10:ARAH_SEQ, L=11:PENYULANG, M=12:TANGGAL, N=13:JURUSAN(not used here)
                
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

                // Validate essential fields
                if (!noGardu && !namaLokasiGardu) {
                    console.warn(`⚠️  Skipping substation at row ${i + dataStartRow + 1}: no identifier`);
                    continue;
                }

                const powerRating = parseFloat(daya) || 0;
                
                console.log(`\n📍 Processing: ${noGardu || namaLokasiGardu} (${ulp}) - rows ${i + dataStartRow + 1} to ${i + dataStartRow + 5}`);

                // Extract measurements from all 5 rows
                // Column O (index 14) = JURUSAN for each row
                // Columns P-X (index 15-23) = PENGUKURAN SIANG (R,S,T,N,R-N,S-N,T-N,P-P,P-N)
                // Columns Y-AG (index 24-32) = PENGUKURAN MALAM (R,S,T,N,R-N,S-N,T-N,P-P,P-N)
                const measurements_siang = [];
                const measurements_malam = [];

                for (let j = 0; j < ROWS_PER_SUBSTATION; j++) {
                    const row = substationRows[j];
                    
                    // Try both column N (13) and O (14) for JURUSAN
                    let jurusanRaw = String(row[14] || '').toLowerCase().trim(); // Try O first
                    if (!jurusanRaw || jurusanRaw === '') {
                        jurusanRaw = String(row[13] || '').toLowerCase().trim(); // Fallback to N
                    }
                    
                    const jurusanNormalized = jurusanRaw === 'induk' ? 'induk' : jurusanRaw;
                    
                    // More flexible validation - skip empty but warn invalid
                    if (!jurusanRaw || jurusanRaw === '') {
                        console.warn(`⚠️  Row ${i + j + dataStartRow + 1}: empty jurusan, skipping`);
                        continue;
                    }
                    
                    if (!expectedJurusan.includes(jurusanNormalized)) {
                        console.warn(`⚠️  Row ${i + j + dataStartRow + 1}: unexpected jurusan "${jurusanRaw}", accepting anyway`);
                        // Don't skip - accept it anyway
                    }

                    // Debug first row
                    if (i === 0 && j === 0) {
                        console.log(`🔍 First measurement row [${i + j + dataStartRow + 1}]:`);
                        console.log(`  - Jurusan [13]="${row[13]}", [14]="${row[14]}" -> normalized="${jurusanNormalized}"`);
                        console.log(`  - Siang: [15-23]=${row.slice(15, 24).join(',')}`);
                        console.log(`  - Malam: [24-32]=${row.slice(24, 33).join(',')}`);
                    }

                    // PENGUKURAN SIANG: Columns P-X (index 15-23)
                    // P=15:R, Q=16:S, R=17:T, S=18:N, T=19:R-N, U=20:S-N, V=21:T-N, W=22:P-P, X=23:P-N
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

                    // PENGUKURAN MALAM: Columns Y-AG (index 24-32)
                    // Y=24:R, Z=25:S, AA=26:T, AB=27:N, AC=28:R-N, AD=29:S-N, AE=30:T-N, AF=31:P-P, AG=32:P-N
                    const r_malam = parseFloat(row[24]) || 0;
                    const s_malam = parseFloat(row[25]) || 0;
                    const t_malam = parseFloat(row[26]) || 0;
                    const n_malam = parseFloat(row[27]) || 0;
                    const rn_malam = parseFloat(row[28]) || 0;
                    const sn_malam = parseFloat(row[29]) || 0;
                    const tn_malam = parseFloat(row[30]) || 0;
                    const pp_malam = parseFloat(row[31]) || 0;
                    const pn_malam = parseFloat(row[32]) || 0;

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

                // Only add if we have valid measurements
                if (measurements_siang.length > 0 || measurements_malam.length > 0) {
                    transformedData.push({
                        no: 0, // Will be set by database
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
                    console.log(`  ✅ Added to import queue: ${measurements_siang.length} siang + ${measurements_malam.length} malam`);
                } else {
                    console.warn(`⚠️  No valid measurements for substation at row ${i + dataStartRow + 1}, SKIPPING`);
                }
            }

            console.log(`\n📊 Summary: ${transformedData.length} substation(s) out of ${Math.floor(dataRows.length / ROWS_PER_SUBSTATION)} groups will be imported`);

            if (transformedData.length === 0) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Tidak ada data valid untuk diimpor. Pastikan format Excel sesuai dengan template.' 
                });
            }
            
            console.log(`\n📊 Total ${transformedData.length} substation(s) siap diimpor ke database...`);
            
            const db = await initPrisma();
            
            const result = await db.$transaction(async (tx) => {
                let createdCount = 0;
                
                for (const data of transformedData) {
                    // Generate sequential number
                    const agg = await tx.substation.aggregate({ _max: { no: true } });
                    const maxNo = agg?._max?.no || 0;
                    const safeNo = maxNo + 1;

                    // Create substation
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

                    // Bulk insert measurements
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
                    console.log(`  ✅ Created: ${data.noGardu} with ${data.measurements_siang.length} siang + ${data.measurements_malam.length} malam measurements`);
                }
                
                return { createdCount };
            });

            console.log(`\n🎉 Import berhasil! ${result.createdCount} substation telah dibuat.`);
            
            res.status(200).json({
                success: true,
                message: `Import berhasil! ${result.createdCount} substation dengan pengukuran telah ditambahkan.`,
                data: { 
                    createdCount: result.createdCount, 
                    errors: [] 
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