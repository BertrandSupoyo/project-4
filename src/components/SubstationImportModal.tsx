import React, { useState } from 'react';
import * as ExcelJS from 'exceljs';
import { Button } from './ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/Dialog';

// Interface prop diubah untuk menerima FormData
interface SubstationImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (formData: FormData) => Promise<void>;
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

    const formData = new FormData();
    formData.append('file', file);

    try {
      await onImport(formData);
      onClose();

    } catch (err: any) {
      const serverError = err.response?.data?.details || err.message;
      setError(serverError || 'Gagal mengimpor file. Terjadi kesalahan.');
      console.error("Import failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadTemplate = async () => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Template Import');
    
    const headers = [
      'NO', 'ULP', 'NO. GARDU', 'NAMA / LOKASI', 'JENIS', 'MERK', 'DAYA', 'TAHUN', 'PHASA', 'TAP TRAFO (MAX TAP)', 'ARAH SEQUENCE', 'PENYULANG', 'TANGGAL', 'JURUSAN',
      'R (SIANG)', 'S (SIANG)', 'T (SIANG)', 'N (SIANG)', 'R-N (SIANG)', 'S-N (SIANG)', 'T-N (SIANG)', 'P-P (SIANG)', 'P-N (SIANG)',
      'R (MALAM)', 'S (MALAM)', 'T (MALAM)', 'N (MALAM)', 'R-N (MALAM)', 'S-N (MALAM)', 'T-N (MALAM)', 'P-P (MALAM)', 'P-N (MALAM)'
    ];
    
    sheet.addRow(headers);
    
    const exampleData = [
      [1, 'ULP CONTOH', 'G001', 'LOKASI CONTOH', 'PORTAL', 'SINTRA', 200, 2023, 3, 3, 'KANAN', 'SL12', '2023-07-01', 'INDUK', 95, 102, 121, 36, 233, 233, 233, 405, 225, 43, 70, 89, 25, 233, 233, 233, 407, 221],
      ['', '', '', '', '', '', '', '', '', '', '', '', '', '1', 88, 95, 110, 32, 232, 232, 232, 398, 218, 40, 65, 82, 22, 232, 232, 232, 395, 214],
      ['', '', '', '', '', '', '', '', '', '', '', '', '', '2', 92, 98, 115, 34, 233, 233, 233, 400, 220, 42, 68, 85, 24, 233, 233, 233, 398, 216],
      ['', '', '', '', '', '', '', '', '', '', '', '', '', '3', 90, 96, 112, 33, 232, 232, 232, 399, 219, 41, 67, 83, 23, 232, 232, 232, 396, 215],
      ['', '', '', '', '', '', '', '', '', '', '', '', '', '4', 87, 93, 108, 31, 231, 231, 231, 397, 217, 39, 64, 81, 21, 231, 231, 231, 394, 213]
    ];
    exampleData.forEach(row => sheet.addRow(row));
    
    headers.forEach((_, index) => {
      sheet.getColumn(index + 1).width = 15;
    });
    
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Template_Import_Gardu.xlsx';
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Gardu dari Excel</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Pilih file Excel (.xlsx) untuk diimpor ke sistem.
        </DialogDescription>
        <div className="py-4">
          <Button variant="outline" onClick={handleDownloadTemplate} className="mb-4">
            Download Template
          </Button>
          <input
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
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