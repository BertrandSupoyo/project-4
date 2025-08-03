import { PrismaClient } from '../../prisma/app/generated/prisma-client/index.js';
import { withAccelerate } from '@prisma/extension-accelerate';
import { IncomingForm } from 'formidable';
import * as XLSX from 'xlsx';
import fs from 'fs';

let prisma;

// Fungsi untuk menginisialisasi Prisma Client
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

// Menonaktifkan bodyParser bawaan Next.js agar formidable bisa bekerja
export const config = {
  api: {
    bodyParser: false,
  },
};

// Handler utama untuk API
export default async function handler(req, res) {
  // Pengaturan CORS untuk mengizinkan permintaan dari domain lain
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Menangani pre-flight request dari browser
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Metode tidak diizinkan' });
  }

  const form = new IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err || !files.file) {
      console.error('❌ Gagal mem-parsing form:', err);
      return res.status(400).json({ success: false, error: 'Gagal mengunggah file atau tidak ada file yang diunggah.' });
    }

    try {
      // === TAHAP 1: MEMBACA DAN MEMPROSES FILE EXCEL ===
      console.log('📄 Mulai memproses file Excel di backend...');
      const fileContent = fs.readFileSync(files.file[0].filepath);
      const workbook = XLSX.read(fileContent, { type: 'buffer' });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const allRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });

      if (allRows.length < 1) {
        throw new Error('File Excel kosong atau tidak memiliki data.');
      }

      const normalize = (str) => String(str || '').toLowerCase().replace(/[^a-z0-9]/g, '');
      
      const headerRowIdx = allRows.findIndex(row =>
        row.some((cell) => normalize(cell) === 'nogardu')
      );
      
      if (headerRowIdx === -1) {
        throw new Error('Header "nogardu" tidak dapat ditemukan di file Excel.');
      }

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

        if (!getField(rowObj0, ['ulp']) || !getField(rowObj0, ['nogardu']) || !getField(rowObj0, ['namalokasi'])) {
            continue;
        }
        
        const mainData = {
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
            tanggal: new Date(getField(rowObj0, ['tanggal']) || Date.now()),
        };

        const extractMeasurements = (siangOrMalam) => {
            return group.map(rowArr => {
                const rowObj = {};
                headerRow.forEach((col, idx) => { rowObj[col] = rowArr?.[idx]; });
                return {
                    row_name: String(getField(rowObj, ['jurusan'])).toLowerCase() || 'unknown',
                    r: parseFloat(getField(rowObj, [`r${siangOrMalam}`, `r(${siangOrMalam})`])) || 0,
                    s: parseFloat(getField(rowObj, [`s${siangOrMalam}`, `s(${siangOrMalam})`])) || 0,
                    t: parseFloat(getField(rowObj, [`t${siangOrMalam}`, `t(${siangOrMalam})`])) || 0,
                    n: parseFloat(getField(rowObj, [`n${siangOrMalam}`, `n(${siangOrMalam})`])) || 0,
                    rn: parseFloat(getField(rowObj, [`rn${siangOrMalam}`, `r-n(${siangOrMalam})`])) || 0,
                    sn: parseFloat(getField(rowObj, [`sn${siangOrMalam}`, `s-n(${siangOrMalam})`])) || 0,
                    tn: parseFloat(getField(rowObj, [`tn${siangOrMalam}`, `t-n(${siangOrMalam})`])) || 0,
                    pp: parseFloat(getField(rowObj, [`pp${siangOrMalam}`, `p-p(${siangOrMalam})`])) || 0,
                    pn: parseFloat(getField(rowObj, [`pn${siangOrMalam}`, `p-n(${siangOrMalam})`])) || 0,
                };
            }).filter(m => m.row_name !== 'unknown');
        };
        
        const measurements_siang = extractMeasurements('siang');
        const measurements_malam = extractMeasurements('malam');

        transformedData.push({ ...mainData, measurements_siang, measurements_malam });
      }

      if (transformedData.length === 0) {
        throw new Error('Tidak ada data yang valid untuk diimpor dari file ini.');
      }
      
      console.log(`📊 Ditemukan ${transformedData.length} data gardu valid untuk diimpor.`);

      // === TAHAP 2: MENYIMPAN DATA KE DATABASE ===
      const db = await initPrisma();
      let createdCount = 0;
      const errors = [];

      for (const data of transformedData) {
        try {
          await db.substation.create({
            data: {
              ulp: data.ulp, noGardu: data.noGardu, namaLokasiGardu: data.namaLokasiGardu,
              jenis: data.jenis, merek: data.merek, daya: data.daya, tahun: data.tahun,
              phasa: data.phasa, tap_trafo_max_tap: data.tap_trafo_max_tap,
              penyulang: data.penyulang, arahSequence: data.arahSequence, tanggal: data.tanggal,
              
              measurements_siang: { create: data.measurements_siang },
              measurements_malam: { create: data.measurements_malam }
            }
          });
          createdCount++;
        } catch (dbError) {
          console.error(`❌ Gagal menyimpan No. Gardu: ${data.noGardu}`, dbError.message);
          errors.push({ noGardu: data.noGardu, error: dbError.message });
        }
      }

      console.log(`✅ Impor selesai. ${createdCount} gardu berhasil dibuat.`);
      res.status(200).json({
        success: true,
        message: `Impor selesai. ${createdCount} gardu berhasil dibuat. ${errors.length} gagal.`,
        data: { createdCount, errors },
      });

    } catch (procError) {
      console.error('💥 Terjadi kesalahan saat memproses file:', procError);
      res.status(500).json({ success: false, error: 'Gagal memproses file.', details: procError.message });
    }
  });
}