import React, { useEffect, useState, useMemo } from 'react';
import { Button } from './ui/Button';
import { Download, AlertCircle } from 'lucide-react';
import { ApiService } from '../services/api';

// Tipe untuk measurement
interface Measurement {
  id?: number;
  substationId?: string;
  month?: string;
  r?: number;
  s?: number;
  t?: number;
  n?: number;
  rn?: number;
  sn?: number;
  tn?: number;
  pp?: number;
  pn?: number;
  row_name?: string;
  unbalanced?: number;
  rata2?: number;
  kva?: number;
  persen?: number;
}

interface SubstationData {
  substation: any;
  siang: Measurement[];
  malam: Measurement[];
}

export const RiwayatGarduTable: React.FC = () => {
  const [months, setMonths] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [data, setData] = useState<SubstationData[]>([]);
  const [allData, setAllData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 🔥 PERBAIKAN: State untuk export
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Pagination state untuk riwayat
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice((page - 1) * pageSize, page * pageSize);

  // Reset pagination ke halaman 1 setiap kali ganti bulan/tahun
  useEffect(() => {
    setPage(1);
  }, [selectedMonth, selectedYear]);

  // Ambil semua substation dan generate daftar bulan/tahun unik dari field tanggal
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    ApiService.getSubstations()
      .then(substations => {
        setAllData(substations);
        
        // Generate daftar bulan-tahun unik dari field tanggal
        const monthYearSet = new Set<string>();
        const yearSet = new Set<string>();
        const monthSet = new Set<string>();
        
        substations.forEach(sub => {
          if (sub.tanggal) {
            const d = new Date(sub.tanggal);
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = String(d.getFullYear());
            monthYearSet.add(`${year}-${month}`);
            yearSet.add(year);
            monthSet.add(month);
          }
        });
        
        const monthYearArr = Array.from(monthYearSet).sort().reverse();
        const yearArr = Array.from(yearSet).sort().reverse();
        const monthArr = Array.from(monthSet).sort();
        
        setMonths(monthArr);
        setYears(yearArr);
        
        // Set default ke data terbaru
        if (monthYearArr.length > 0) {
          const [latestYear, latestMonth] = monthYearArr[0].split('-');
          setSelectedYear(latestYear);
          setSelectedMonth(latestMonth);
        }
        
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching substations:', err);
        setError('Gagal mengambil data gardu');
        setLoading(false);
      });
  }, []);

  // Filter data berdasarkan bulan-tahun yang dipilih
  useEffect(() => {
    if (!selectedMonth || !selectedYear) return;
    
    const filtered = allData.filter(sub => {
      if (!sub.tanggal) return false;
      const d = new Date(sub.tanggal);
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear());
      return month === selectedMonth && year === selectedYear;
    })
    // Mapping agar row.siang dan row.malam ada
    .map(sub => ({
      substation: sub,
      siang: sub.measurements_siang || [],
      malam: sub.measurements_malam || []
    }));
    
    setData(filtered);
  }, [selectedMonth, selectedYear, allData]);

  // 🔥 PERBAIKAN: Memoize unbalanced calculations untuk performance
  const processedData = useMemo(() => {
    return paginatedData.map(row => {
      // Ambil unbalance terbesar dari array pengukuran siang/malam
      const unbSiangRaw = Array.isArray(row.siang) && row.siang.length > 0
        ? Math.max(...row.siang.map((m: Measurement) => Number(m.unbalanced) || 0))
        : null;
      const unbMalamRaw = Array.isArray(row.malam) && row.malam.length > 0
        ? Math.max(...row.malam.map((m: Measurement) => Number(m.unbalanced) || 0))
        : null;
      
      return {
        ...row,
        unbSiangRaw,
        unbMalamRaw,
        unbSiang: unbSiangRaw !== null ? `${unbSiangRaw.toFixed(2)}%` : '-',
        unbMalam: unbMalamRaw !== null ? `${unbMalamRaw.toFixed(2)}%` : '-',
        unbSiangClass: unbSiangRaw !== null ? (unbSiangRaw < 80 ? 'text-green-700 font-bold' : 'text-red-700 font-bold') : '',
        unbMalamClass: unbMalamRaw !== null ? (unbMalamRaw < 80 ? 'text-green-700 font-bold' : 'text-red-700 font-bold') : ''
      };
    });
  }, [paginatedData]);

  // 🔥 PERBAIKAN: Handle export Excel dengan filter yang sesuai
  const handleExportRiwayat = async () => {
    if (!selectedMonth || !selectedYear) {
      setExportError('Silakan pilih bulan dan tahun terlebih dahulu');
      return;
    }

    setExportLoading(true);
    setExportError(null);
    
    try {
      // 🔥 PERBAIKAN: Kirim parameter filter ke backend
      const params = new URLSearchParams({
        month: selectedMonth,
        year: selectedYear
      });
      
      console.log('📤 Exporting with filter:', { month: selectedMonth, year: selectedYear });
      
      const response = await fetch(`/api/export/riwayat?${params}`, {
        method: 'GET'
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // 🔥 PERBAIKAN: Nama file yang lebih informatif
      const monthName = new Date(`2000-${selectedMonth}-01`).toLocaleString('id-ID', { month: 'long' });
      a.download = `Riwayat_Pengukuran_${monthName}_${selectedYear}.xlsx`;
      
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ Export completed successfully');
      
    } catch (err) {
      console.error('❌ Export failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengunduh file Excel';
      setExportError(errorMessage);
    } finally {
      setExportLoading(false);
    }
  };

  const getStatusBadge = (isActive: number) => {
    if (isActive === 1) {
      return <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Aktif</span>;
    } else {
      return <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Nonaktif</span>;
    }
  };

  // 🔥 PERBAIKAN: Helper function untuk format bulan
  const getMonthName = (monthNumber: string) => {
    return new Date(`2000-${monthNumber}-01`).toLocaleString('id-ID', { month: 'long' });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Riwayat Pengukuran Gardu</h2>
      
      {/* 🔥 PERBAIKAN: Filter dan Export Section */}
      <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <label className="font-medium">Pilih Tahun:</label>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="border rounded px-2 py-1 min-w-[100px]"
            disabled={loading}
          >
            <option value="">-- Pilih Tahun --</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          
          <label className="font-medium ml-4">Pilih Bulan:</label>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="border rounded px-2 py-1 min-w-[120px]"
            disabled={loading}
          >
            <option value="">-- Pilih Bulan --</option>
            {months.map(month => (
              <option key={month} value={month}>
                {getMonthName(month)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleExportRiwayat} 
            disabled={!selectedMonth || !selectedYear || exportLoading || loading}
            className="flex items-center gap-1"
          >
            {exportLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Mengunduh...
              </>
            ) : (
              <>
                <Download size={16} />
                Export Excel
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 🔥 PERBAIKAN: Error handling untuk export */}
      {exportError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
          <AlertCircle size={16} />
          <span>{exportError}</span>
          <button 
            onClick={() => setExportError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* 🔥 PERBAIKAN: Info filter yang aktif */}
      {selectedMonth && selectedYear && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
          📊 Menampilkan data untuk <strong>{getMonthName(selectedMonth)} {selectedYear}</strong> 
          ({data.length} gardu ditemukan)
        </div>
      )}
      
      {loading ? (
        <div className="py-8 text-center text-gray-500 flex items-center justify-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-400"></div>
          Memuat data...
        </div>
      ) : error ? (
        <div className="py-8 text-center text-red-500 flex items-center justify-center gap-2">
          <AlertCircle size={20} />
          {error}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border text-base">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">No</th>
                <th className="px-4 py-2 border">Nama Gardu</th>
                <th className="px-4 py-2 border">ULP</th>
                <th className="px-4 py-2 border">Jenis</th>
                <th className="px-4 py-2 border">Daya</th>
                <th className="px-4 py-2 border">Status</th>
                <th className="px-4 py-2 border">Unbalance Siang</th>
                <th className="px-4 py-2 border">Unbalance Malam</th>
              </tr>
            </thead>
            <tbody>
              {processedData.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    {selectedMonth && selectedYear 
                      ? `Tidak ada data untuk ${getMonthName(selectedMonth)} ${selectedYear}`
                      : 'Silakan pilih bulan dan tahun untuk melihat data'
                    }
                  </td>
                </tr>
              ) : processedData.map((row, idx) => {
                const sub = row.substation || row;
                return (
                  <tr key={sub.id || idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border text-center">{(page - 1) * pageSize + idx + 1}</td>
                    <td className="px-4 py-2 border font-semibold">{sub.namaLokasiGardu || '-'}</td>
                    <td className="px-4 py-2 border">{sub.ulp || '-'}</td>
                    <td className="px-4 py-2 border">{sub.jenis || '-'}</td>
                    <td className="px-4 py-2 border font-bold">{sub.daya || '-'}</td>
                    <td className="px-4 py-2 border text-center">{getStatusBadge(sub.is_active)}</td>
                    <td className={`px-4 py-2 border text-center ${row.unbSiangClass}`}>{row.unbSiang}</td>
                    <td className={`px-4 py-2 border text-center ${row.unbMalamClass}`}>{row.unbMalam}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {/* 🔥 PERBAIKAN: Pagination controls yang lebih baik */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-4 gap-2">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page === 1} 
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            ← Prev
          </button>
          
          <div className="flex gap-1">
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1 border rounded ${
                    page === pageNum 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>
          
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
            disabled={page === totalPages} 
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next →
          </button>
          
          <span className="ml-2 text-sm text-gray-600">
            Halaman {page} dari {totalPages}
          </span>
        </div>
      )}
    </div>
  );
};