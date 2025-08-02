import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import * as ExcelJS from 'exceljs';
import { Button } from './ui/Button';
import { SubstationData } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/Dialog';

interface SubstationImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (data: SubstationData[]) => Promise<void>;
}

const SubstationImportModal: React.FC<SubstationImportModalProps> = ({ isOpen, onClose, onImport }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || selectedFile.name.endsWith('.xlsx')) {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('File tidak valid. Harap upload file Excel (.xlsx).');
        setFile(null);
      }
    }
  };

  const handleImport = async () => {
    if (!file) {
      setError('Silakan pilih file untuk diimpor.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        // Ambil semua data sebagai array of array (termasuk header multi-baris)
        const allRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        if (allRows.length < 6) throw new Error('File tidak memiliki cukup baris data.');
        // Normalisasi label header
        const normalize = (str: string) => String(str).toLowerCase().replace(/[^a-z0-9]/g, '');
        // Cari baris header yang mengandung label 'nogardu' atau variasinya
        const headerRowIdx = allRows.findIndex(row =>
          row.some((cell: any) => normalize(cell) === 'nogardu')
        );
        if (headerRowIdx === -1) throw new Error('Tidak ditemukan baris header yang sesuai di file Excel.');
        const headerRowRaw: string[] = allRows[headerRowIdx];
        const headerRow: string[] = headerRowRaw.map(normalize);
        console.log('HEADER ROW RAW:', headerRowRaw);
        console.log('HEADER ROW NORMALIZED:', headerRow);
        const dataRows: any[][] = allRows.slice(headerRowIdx + 1);
        // Helper untuk ambil field dengan beberapa variasi label
        const getField = (rowObj: Record<string, any>, keys: string[]) => {
          for (const key of keys) {
            if (rowObj[key] !== undefined && rowObj[key] !== null && String(rowObj[key]).trim() !== '') {
              return rowObj[key];
            }
          }
          return '';
        };
        // --- GROUPING LOGIC ---
        // Hapus fungsi getSubstationKey yang tidak digunakan

        // --- LOGIKA BARU: BACA PER 5 BARIS, MULAI SETELAH HEADER ---
        // dataRows sudah hasil slice dari allRows setelah header, jadi dataRows[0] = baris data pertama
        const transformedData: any[] = [];
        for (let i = 0; i < dataRows.length; i += 5) {
          const group = dataRows.slice(i, i + 5);
          if (group.length < 5) continue; // skip jika kurang dari 5 baris
          // Ambil identitas dari baris pertama
          const rowObj0: any = {};
          headerRow.forEach((col: string, idx: number) => {
            rowObj0[col] = group[0][idx];
          });
          // Ambil tanggal
          let rawTanggal = getField(rowObj0, ['tanggal']);
          let tanggalVal: string = new Date().toISOString(); // Default to current date
          if (rawTanggal) {
            const d = new Date(rawTanggal);
            if (!isNaN(d.getTime())) {
              tanggalVal = d.toISOString();
            }
            // If date is invalid, tanggalVal remains as current date
          }
          // Ambil measurements siang & malam dari kelima baris
          const measurements_siang = group.map((rowArr, _) => {
            const rowObj: any = {};
            headerRow.forEach((col: string, idx: number) => {
              rowObj[col] = rowArr[idx];
            });
            const jurusan = getField(rowObj, ['jurusan']);
            return {
              row_name: String(jurusan).toLowerCase(),
              r: parseFloat(getField(rowObj, ['rsiang', 'r(siang)', 'r_siang'])) || 0,
              s: parseFloat(getField(rowObj, ['ssiang', 's(siang)', 's_siang'])) || 0,
              t: parseFloat(getField(rowObj, ['tsiang', 't(siang)', 't_siang'])) || 0,
              n: parseFloat(getField(rowObj, ['nsiang', 'n(siang)', 'n_siang'])) || 0,
              rn: parseFloat(getField(rowObj, ['rnsiang', 'r-n(siang)', 'rn_siang'])) || 0,
              sn: parseFloat(getField(rowObj, ['snsiang', 's-n(siang)', 'sn_siang'])) || 0,
              tn: parseFloat(getField(rowObj, ['tnsiang', 't-n(siang)', 'tn_siang'])) || 0,
              pp: parseFloat(getField(rowObj, ['ppsiang', 'p-p(siang)', 'pp_siang'])) || 0,
              pn: parseFloat(getField(rowObj, ['pnsiang', 'p-n(siang)', 'pn_siang'])) || 0
            };
          });
          const measurements_malam = group.map((rowArr, _) => {
            const rowObj: any = {};
            headerRow.forEach((col: string, idx: number) => {
              rowObj[col] = rowArr[idx];
            });
            const jurusan = getField(rowObj, ['jurusan']);
            return {
              row_name: String(jurusan).toLowerCase(),
              r: parseFloat(getField(rowObj, ['rmalam', 'r(malam)', 'r_malam'])) || 0,
              s: parseFloat(getField(rowObj, ['smalam', 's(malam)', 's_malam'])) || 0,
              t: parseFloat(getField(rowObj, ['tmalam', 't(malam)', 't_malam'])) || 0,
              n: parseFloat(getField(rowObj, ['nmalam', 'n(malam)', 'n_malam'])) || 0,
              rn: parseFloat(getField(rowObj, ['rnmalam', 'r-n(malam)', 'rn_malam'])) || 0,
              sn: parseFloat(getField(rowObj, ['snmalam', 's-n(malam)', 'sn_malam'])) || 0,
              tn: parseFloat(getField(rowObj, ['tnmalam', 't-n(malam)', 'tn_malam'])) || 0,
              pp: parseFloat(getField(rowObj, ['ppmalam', 'p-p(malam)', 'pp_malam'])) || 0,
              pn: parseFloat(getField(rowObj, ['pnmalam', 'p-n(malam)', 'pn_malam'])) || 0
            };
          });
          transformedData.push({
            no: getField(rowObj0, ['no']) ? parseInt(getField(rowObj0, ['no'])) : i + 1,
            ulp: String(getField(rowObj0, ['ulp'])),
            noGardu: String(getField(rowObj0, ['nogardu', 'no.gardu', 'no_gardu'])),
            namaLokasiGardu: String(getField(rowObj0, [
              'namalokasi', 'namalokasigardu', 'nama/lokasi', 'nama_lokasi', 'lokasi', 'namalokasilokasi', 'nama/ lokasi', 'nama lokasi', 'nama/ lokasi gardu', 'nama lokasi gardu', 'nama__lokasi', 'nama__lokasi__gardu',
            ])),
            jenis: String(getField(rowObj0, ['jenis'])),
            merek: String(getField(rowObj0, ['merk', 'merek'])),
            daya: String(getField(rowObj0, ['daya'])),
            tahun: (() => {
              const tahunValue = String(getField(rowObj0, ['tahun'])).trim();
              // Handle truncated or corrupted tahun values
              if (!tahunValue || tahunValue.length === 0) return '0';
              // If tahun is truncated (less than 4 digits), return '0'
              if (tahunValue.length < 4) return '0';
              // If tahun is valid (4 digits), return it
              if (/^\d{4}$/.test(tahunValue)) return tahunValue;
              // If tahun is longer than 4 digits, take first 4
              if (tahunValue.length > 4) return tahunValue.substring(0, 4);
              // Default fallback
              return '0';
            })(),
            phasa: String(getField(rowObj0, ['phasa'])),
            tap_trafo_max_tap: (() => {
              const tapValue = String(getField(rowObj0, ['taptrafomaxtap'])).trim();
              // Handle truncated or corrupted tap values
              if (!tapValue || tapValue.length === 0) return '0';
              // If it's a valid number, return it
              if (/^\d+$/.test(tapValue)) return tapValue;
              // If it's truncated, try to extract valid part
              const validPart = tapValue.match(/^\d+/);
              return validPart ? validPart[0] : '0';
            })(),
            penyulang: String(getField(rowObj0, ['penyulang'])),
            arahSequence: String(getField(rowObj0, ['arahsequence', 'arah_sequence'])),
            tanggal: tanggalVal,
            status: getField(rowObj0, ['status']) || 'normal',
            is_active: getField(rowObj0, ['isactive', 'is_active']) !== '' ? parseInt(getField(rowObj0, ['isactive', 'is_active'])) : 1,
            ugb: getField(rowObj0, ['ugb']) !== '' ? parseInt(getField(rowObj0, ['ugb'])) : 0,
            latitude: getField(rowObj0, ['latitude']) !== '' ? parseFloat(getField(rowObj0, ['latitude'])) : undefined,
            longitude: getField(rowObj0, ['longitude']) !== '' ? parseFloat(getField(rowObj0, ['longitude'])) : undefined,
            measurements_siang,
            measurements_malam
          });
        }
        // Pastikan setiap substation punya 5 measurement siang & malam (induk,1,2,3,4)
        const rowNames = ['induk', '1', '2', '3', '4'];
        transformedData.forEach(sub => {
          // Lengkapi measurement siang
          rowNames.forEach(rn => {
            if (!sub.measurements_siang.some((m: any) => String(m.row_name).toLowerCase() === rn)) {
              sub.measurements_siang.push({
                row_name: rn,
                r: 0, s: 0, t: 0, n: 0, rn: 0, sn: 0, tn: 0, pp: 0, pn: 0
              });
            }
          });
          // Lengkapi measurement malam
          rowNames.forEach(rn => {
            if (!sub.measurements_malam.some((m: any) => String(m.row_name).toLowerCase() === rn)) {
              sub.measurements_malam.push({
                row_name: rn,
                r: 0, s: 0, t: 0, n: 0, rn: 0, sn: 0, tn: 0, pp: 0, pn: 0
              });
            }
          });
          // Urutkan agar selalu INDUK,1,2,3,4
          sub.measurements_siang.sort((a: any, b: any) => rowNames.indexOf(String(a.row_name).toLowerCase()) - rowNames.indexOf(String(b.row_name).toLowerCase()));
          sub.measurements_malam.sort((a: any, b: any) => rowNames.indexOf(String(a.row_name).toLowerCase()) - rowNames.indexOf(String(b.row_name).toLowerCase()));
        });
        console.log('PAYLOAD IMPORT:', transformedData);
        // Filter hanya data valid (noGardu, ulp, namaLokasiGardu wajib terisi)
        const filteredData = transformedData.filter(
          d =>
            d.noGardu && String(d.noGardu).trim() !== '' &&
            d.ulp && String(d.ulp).trim() !== '' &&
            d.namaLokasiGardu && String(d.namaLokasiGardu).trim() !== ''
        );
        console.log('PAYLOAD IMPORT (filtered):', filteredData);
        if (filteredData.length === 0) {
          setError('Tidak ada data valid untuk diimport. Pastikan file sudah benar.');
          setIsProcessing(false);
          return;
        }
        console.log('SENDING TO BACKEND:', JSON.stringify(filteredData, null, 2));
        
        // Validate JSON before sending
        try {
          const jsonString = JSON.stringify(filteredData);
          JSON.parse(jsonString); // Test if JSON is valid
          console.log('✅ JSON validation passed');
        } catch (jsonError) {
          console.error('❌ JSON validation failed:', jsonError);
          setError('Data tidak valid untuk dikirim ke server. Silakan cek file Excel Anda.');
          setIsProcessing(false);
          return;
        }
        
        await onImport(filteredData);
        onClose();
      } catch (err) {
        setError('Gagal memproses file. Pastikan format file benar.');
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Fungsi untuk download template Excel import
  const handleDownloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Template Import');
    
    // Header sesuai dengan format export riwayat (hanya hingga P-N malam)
    const headers = [
      // Data Gardu
      'NO', 'ULP', 'NO. GARDU', 'NAMA / LOKASI', 'JENIS', 'MERK', 'DAYA', 'TAHUN', 'PHASA', 'TAP TRAFO (MAX TAP)', 'ARAH SEQUENCE', 'PENYULANG', 'TANGGAL', 'JURUSAN',
      // Pengukuran Siang
      'R (SIANG)', 'S (SIANG)', 'T (SIANG)', 'N (SIANG)', 'R-N (SIANG)', 'S-N (SIANG)', 'T-N (SIANG)', 'P-P (SIANG)', 'P-N (SIANG)',
      // Pengukuran Malam  
      'R (MALAM)', 'S (MALAM)', 'T (MALAM)', 'N (MALAM)', 'R-N (MALAM)', 'S-N (MALAM)', 'T-N (MALAM)', 'P-P (MALAM)', 'P-N (MALAM)'
    ];
    
    // Tambahkan header
    sheet.addRow(headers);
    
    // Baris data contoh untuk INDUK
    sheet.addRow([
      1, 'ULP CONTOH', 'G001', 'LOKASI CONTOH', 'PORTAL', 'SINTRA', 200, 2023, 3, 3, 'KANAN', 'SL12', '2023-07-01', 'INDUK',
      95, 102, 121, 36, 59, 66, 85, 413, 225,
      43, 70, 89, 25, 18, 45, 64, 407, 221
    ]);
    
    // Baris data contoh untuk JURUSAN 1
    sheet.addRow([
      1, 'ULP CONTOH', 'G001', 'LOKASI CONTOH', 'PORTAL', 'SINTRA', 200, 2023, 3, 3, 'KANAN', 'SL12', '2023-07-01', '1',
      88, 95, 110, 32, 56, 63, 78, 398, 218,
      40, 65, 82, 22, 18, 43, 60, 395, 214
    ]);
    
    // Baris data contoh untuk JURUSAN 2
    sheet.addRow([
      1, 'ULP CONTOH', 'G001', 'LOKASI CONTOH', 'PORTAL', 'SINTRA', 200, 2023, 3, 3, 'KANAN', 'SL12', '2023-07-01', '2',
      92, 98, 115, 34, 58, 64, 81, 400, 220,
      42, 68, 85, 24, 18, 44, 61, 398, 216
    ]);
    
    // Baris data contoh untuk JURUSAN 3
    sheet.addRow([
      1, 'ULP CONTOH', 'G001', 'LOKASI CONTOH', 'PORTAL', 'SINTRA', 200, 2023, 3, 3, 'KANAN', 'SL12', '2023-07-01', '3',
      90, 96, 112, 33, 57, 63, 79, 399, 219,
      41, 67, 83, 23, 18, 43, 61, 396, 215
    ]);
    
    // Baris data contoh untuk JURUSAN 4
    sheet.addRow([
      1, 'ULP CONTOH', 'G001', 'LOKASI CONTOH', 'PORTAL', 'SINTRA', 200, 2023, 3, 3, 'KANAN', 'SL12', '2023-07-01', '4',
      87, 93, 108, 31, 56, 62, 77, 397, 217,
      39, 64, 81, 21, 18, 42, 59, 394, 213
    ]);
    
    // Set lebar kolom
    headers.forEach((_, index) => {
      sheet.getColumn(index + 1).width = 15;
    });
    
    // Download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Template_Import_Gardu.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Gardu dari Excel</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Pilih file Excel hasil export untuk diimpor ke sistem. Format harus sesuai template export.
        </DialogDescription>
        <div className="py-4">
          <p className="text-sm text-gray-600 mb-2">
            Upload file Excel (.xlsx) dengan data gardu sesuai template.
          </p>
          <Button variant="outline" onClick={handleDownloadTemplate} className="mb-2">Download Template Import Excel</Button>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-700 bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            style={{ backgroundColor: 'white' }}
          />
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {file && <p className="text-green-600 text-sm mt-2">File dipilih: {file.name}</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Batal
          </Button>
          <Button onClick={handleImport} disabled={!file || isProcessing}>
            {isProcessing ? 'Memproses...' : 'Import'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubstationImportModal; 