import React, { useState } from 'react';
// import * as ExcelJS from 'exceljs'; // Dihapus karena tidak digunakan lagi
import { Button } from './ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/Dialog';
import axios from 'axios'; // Pastikan axios diimpor

interface SubstationImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SubstationImportModal: React.FC<SubstationImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
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
      const API_URL = `${import.meta.env.VITE_API_BASE_URL}/substations/import`;
      await axios.post(API_URL, formData);
      
      onSuccess();
      onClose();

    } catch (err: any) {
      const serverError = err.response?.data?.details || err.message;
      setError(serverError || 'Gagal mengimpor file.');
      console.error("Import failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Gardu dari Excel</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Pilih file Excel (.xlsx) untuk diimpor. Proses akan dilakukan di server.
        </DialogDescription>
        <div className="py-4">
          {/* Anda bisa menambahkan kembali tombol download template jika diperlukan */}
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