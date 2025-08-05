import React, { useState } from 'react';
// import * as ExcelJS from 'exceljs'; // Dihapus karena tidak digunakan lagi
import { Button } from './ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from './ui/Dialog';
// REMOVED: import axios from 'axios'; // Menghilangkan axios untuk mencegah konflik dengan variable 'n'

interface SubstationImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const SubstationImportModal: React.FC<SubstationImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => { // RENAMED: e -> event
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      // Enhanced validation
      const maxSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (selectedFile.size > maxSize) {
        setError('File terlalu besar. Maksimal 10MB.');
        setFile(null);
        return;
      }
      
      if (!allowedTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.xlsx')) {
        setError('File tidak valid. Harap upload file Excel (.xlsx).');
        setFile(null);
        return;
      }
      
      setFile(selectedFile);
      setError(null);
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
      
      // USING FETCH instead of axios to prevent 'n is not a function' error
      const response = await fetch(API_URL, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type - let browser handle multipart boundary
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(errorData.error || errorData.details || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Import berhasil:', result);
      
      onSuccess();
      onClose();

    } catch (error: any) { // RENAMED: err -> error
      let errorMessage = 'Gagal mengimpor file.';
      
      if (error.message?.includes('Failed to fetch')) {
        errorMessage = 'Gagal terhubung ke server. Periksa koneksi internet.';
      } else if (error.message?.includes('HTTP 413')) {
        errorMessage = 'File terlalu besar untuk diupload.';
      } else if (error.message?.includes('HTTP 400')) {
        errorMessage = 'Format file tidak valid.';
      } else if (error.message && error.message !== 'Server error') {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      console.error("Import failed:", error);
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
          Pilih file Excel (.xlsx) untuk diimpor. Data akan dihitung secara otomatis.
        </DialogDescription>
        <div className="py-4">
          {/* File input */}
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={isProcessing}
            className="w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
          />
          
          {/* Error message */}
          {error && (
            <div className="text-red-500 text-sm mt-2 bg-red-50 p-2 rounded border border-red-200">
              ❌ {error}
            </div>
          )}
          
          {/* Success message */}
          {file && (
            <div className="text-green-600 text-sm mt-2">
              ✅ File dipilih: {file.name} ({Math.round(file.size / 1024)} KB)
            </div>
          )}
          
          {/* Processing indicator */}
          {isProcessing && (
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse w-full"></div>
              </div>
              <div className="text-center text-sm text-gray-600 mt-1">
                Mengupload dan memproses data...
              </div>
            </div>
          )}
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