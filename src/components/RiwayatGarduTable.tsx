import React, { useEffect, useState } from 'react';
import { Button } from './ui/Button';
import { Download } from 'lucide-react';
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

export const RiwayatGarduTable: React.FC = () => {
  const [months, setMonths] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [data, setData] = useState<any[]>([]);
  const [allData, setAllData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    ApiService.getSubstations()
      .then(substations => {
        setAllData(substations);
        // Generate daftar bulan-tahun unik dari field tanggal
        const monthYearSet = new Set<string>();
        const yearSet = new Set<string>();
        substations.forEach(sub => {
          if (sub.tanggal) {
            const d = new Date(sub.tanggal);
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = String(d.getFullYear());
            monthYearSet.add(`${year}-${month}`);
            yearSet.add(year);
          }
        });
        const monthYearArr = Array.from(monthYearSet).sort().reverse();
        const yearArr = Array.from(yearSet).sort().reverse();
        setMonths(monthYearArr.map(my => my.split('-')[1]));
        setYears(yearArr);
        if (monthYearArr.length > 0) {
          setSelectedYear(monthYearArr[0].split('-')[0]);
          setSelectedMonth(monthYearArr[0].split('-')[1]);
        }
        setLoading(false);
      })
      .catch(() => {
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

  // Handle export Excel (hanya data yang tampil di tabel)
  const handleExportRiwayat = async () => {
    if (!data || data.length === 0) return;
    try {
      const response = await fetch('/api/export/riwayat/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Gagal mengunduh file Excel');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const monthName = selectedMonth ? new Date(`2000-${selectedMonth}-01`).toLocaleString('id-ID', { month: 'long' }) : '';
      a.download = `Riwayat_Filtered_${selectedYear || ''}_${monthName || ''}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.alert('Gagal mengunduh file Excel!');
    }
  };

  const getStatusBadge = (isActive: number) => {
    if (isActive === 1) {
      return <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Aktif</span>;
    } else {
      return <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Nonaktif</span>;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Riwayat Pengukuran Gardu</h2>
      <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="font-medium">Pilih Tahun:</label>
          <select
            value={selectedYear}
            onChange={e => setSelectedYear(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <label className="font-medium ml-4">Pilih Bulan:</label>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="border rounded px-2 py-1"
          >
            {months.map(month => (
              <option key={month} value={month}>
                {new Date(`2000-${month}-01`).toLocaleString('id-ID', { month: 'long' })}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={handleExportRiwayat} disabled={!selectedMonth || !selectedYear}>
          <Download size={16} className="mr-1" />
          Export Excel
        </Button>
      </div>
      {loading ? (
        <div className="py-8 text-center text-gray-500">Memuat data...</div>
      ) : error ? (
        <div className="py-8 text-center text-red-500">{error}</div>
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
              {paginatedData.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-500">Tidak ada data</td></tr>
              ) : paginatedData.map((row, idx) => {
                // Ambil unbalance terbesar dari array pengukuran siang/malam
                const unbSiangRaw = Array.isArray(row.siang) && row.siang.length > 0
                  ? Math.max(...row.siang.map((m: Measurement) => Number(m.unbalanced) || 0))
                  : null;
                const unbMalamRaw = Array.isArray(row.malam) && row.malam.length > 0
                  ? Math.max(...row.malam.map((m: Measurement) => Number(m.unbalanced) || 0))
                  : null;
                const unbSiang = unbSiangRaw !== null ? `${unbSiangRaw.toFixed(2)}%` : '-';
                const unbMalam = unbMalamRaw !== null ? `${unbMalamRaw.toFixed(2)}%` : '-';
                const unbSiangClass = unbSiangRaw !== null ? (unbSiangRaw < 80 ? 'text-green-700 font-bold' : 'text-red-700 font-bold') : '';
                const unbMalamClass = unbMalamRaw !== null ? (unbMalamRaw < 80 ? 'text-green-700 font-bold' : 'text-red-700 font-bold') : '';
                const sub = row.substation || row; // fallback jika row.substation undefined
                return (
                  <tr key={sub.id || idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border text-center">{(page - 1) * pageSize + idx + 1}</td>
                    <td className="px-4 py-2 border font-semibold">{sub.namaLokasiGardu || '-'}</td>
                    <td className="px-4 py-2 border">{sub.ulp || '-'}</td>
                    <td className="px-4 py-2 border">{sub.jenis || '-'}</td>
                    <td className="px-4 py-2 border font-bold">{sub.daya || '-'}</td>
                    <td className="px-4 py-2 border text-center">{getStatusBadge(sub.is_active)}</td>
                    <td className={`px-4 py-2 border text-center ${unbSiangClass}`}>{unbSiang}</td>
                    <td className={`px-4 py-2 border text-center ${unbMalamClass}`}>{unbMalam}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {/* Pagination controls */}
      <div className="flex justify-center mt-4 gap-2">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 border rounded disabled:opacity-50">Prev</button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-2 py-1 border rounded ${page === i + 1 ? 'bg-blue-500 text-white' : ''}`}
          >
            {i + 1}
          </button>
        ))}
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 border rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  );
}; 