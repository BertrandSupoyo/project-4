import React, { useEffect, useState, useMemo } from 'react';
import { Button } from './ui/Button';
import { Download, AlertCircle, Edit2, History } from 'lucide-react';
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
  status?: 'ACTIVE' | 'SUPERSEDED' | 'DELETED';
}

interface SubstationData {
  substation: any;
  siang: Measurement[];
  malam: Measurement[];
}

interface HistoricalData {
  [monthYearKey: string]: SubstationData[];
}

// ============ MODAL: EDIT MEASUREMENT ============
const EditMeasurementModal = ({
  measurement,
  isOpen,
  onClose,
  onSave
}: {
  measurement: Measurement | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}) => {
  const [newValue, setNewValue] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (measurement && isOpen) {
      setNewValue(measurement.unbalanced?.toString() || '');
      setReason('');
    }
  }, [measurement, isOpen]);

  if (!isOpen || !measurement) return null;

  const handleSave = async () => {
    if (!newValue || isNaN(parseFloat(newValue))) {
      alert('Masukkan nilai yang valid');
      return;
    }

    setLoading(true);
    try {
      await onSave({
        id: measurement.id,
        newValue: parseFloat(newValue),
        reason
      });
      onClose();
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        <h2 className="text-xl font-bold mb-4">Update Nilai Unbalanced</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nilai Sekarang: {measurement.unbalanced}%</label>
          <input
            type="number"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            className="w-full border rounded px-3 py-2"
            placeholder="Masukkan nilai baru"
            step="0.1"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Alasan Perubahan:</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded px-3 py-2 resize-none"
            rows={3}
            placeholder="Contoh: Koreksi pembacaan sensor"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ MODAL: HISTORY ============
const HistoryModal = ({
  measurementId,
  isOpen,
  onClose
}: {
  measurementId: number | null;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && measurementId) {
      loadHistory();
    }
  }, [isOpen, measurementId]);

  const loadHistory = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/measurements/${measurementId}/audit-log`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal memuat riwayat perubahan');
      }
      const data = await response.json();
      setAuditLog(data);
    } catch (error) {
      console.error('Error loading history:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Tidak dapat memuat riwayat perubahan');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Riwayat Perubahan</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            ×
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4">Memuat riwayat...</div>
        ) : errorMessage ? (
          <p className="text-red-500 text-center">{errorMessage}</p>
        ) : (
          <div className="space-y-4">
            {auditLog.length === 0 ? (
              <p className="text-gray-500 text-center">Belum ada riwayat perubahan untuk measurement ini.</p>
            ) : (
              auditLog.map((log, idx) => (
                <div key={log.id || idx} className="border rounded p-3 bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">
                        Perubahan #{idx + 1}: {log.oldValue ?? log.old_value}% → {log.newValue ?? log.new_value}%
                      </p>
                      <p className="text-sm text-gray-600">
                        Alasan: {log.changeReason ?? log.change_reason ?? '-'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {(log.changedBy ?? log.changed_by) || 'admin'} •{' '}
                        {new Date(log.changedAt ?? log.changed_at).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============
export const RiwayatGarduTable: React.FC = () => {
  const [months, setMonths] = useState<string[]>([]);
  const [years, setYears] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [historicalData, setHistoricalData] = useState<HistoricalData>({});
  const [currentData, setCurrentData] = useState<SubstationData[]>([]);
  const [allData, setAllData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  // Modal states
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMeasurement, setSelectedMeasurement] = useState<Measurement | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedMeasurementForHistory, setSelectedMeasurementForHistory] = useState<number | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const totalPages = Math.ceil(currentData.length / pageSize);
  const paginatedData = currentData.slice((page - 1) * pageSize, page * pageSize);

  // Reset pagination
  useEffect(() => {
    setPage(1);
  }, [selectedMonth, selectedYear]);

  // Load substations
  useEffect(() => {
    setLoading(true);
    setError(null);

    ApiService.getSubstations()
      .then(substations => {
        setAllData(substations);

        const monthYearSet = new Set<string>();
        const yearSet = new Set<string>();
        const monthSet = new Set<string>();

        substations.forEach((sub: any) => {
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

        if (monthYearArr.length > 0) {
          const [latestYear, latestMonth] = monthYearArr[0].split('-');
          setSelectedYear(latestYear);
          setSelectedMonth(latestMonth);
        }

        setLoading(false);
      })
      .catch(err => {
        console.error('Error:', err);
        setError('Gagal mengambil data gardu');
        setLoading(false);
      });
  }, []);

  // Load measurements dengan cache
  useEffect(() => {
    if (!selectedMonth || !selectedYear) return;

    const monthYearKey = `${selectedYear}-${selectedMonth}`;

    if (historicalData[monthYearKey]) {
      setCurrentData(historicalData[monthYearKey]);
      return;
    }

    setLoading(true);
    setError(null);

    const run = async () => {
      try {
        const filteredSubs = allData.filter(sub => {
          if (!sub.tanggal) return false;
          const d = new Date(sub.tanggal);
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const year = String(d.getFullYear());
          return month === selectedMonth && year === selectedYear;
        });

        const results: SubstationData[] = [];
        for (const sub of filteredSubs) {
          try {
            const detail = await ApiService.getSubstationById(sub.id);
            const monthLabel = `${selectedYear}-${selectedMonth}`;
            // Filter by status = ACTIVE only
            const siang = Array.isArray((detail as any).measurements_siang)
              ? (detail as any).measurements_siang.filter(
                  (m: any) => m.month === monthLabel && m.status === 'ACTIVE'
                )
              : [];
            const malam = Array.isArray((detail as any).measurements_malam)
              ? (detail as any).measurements_malam.filter(
                  (m: any) => m.month === monthLabel && m.status === 'ACTIVE'
                )
              : [];
            results.push({ substation: detail, siang, malam });
          } catch (e) {
            results.push({ substation: sub, siang: [], malam: [] });
          }
        }

        setHistoricalData(prev => ({
          ...prev,
          [monthYearKey]: results
        }));
        setCurrentData(results);
      } catch (e) {
        setError('Gagal memuat riwayat pengukuran');
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [selectedMonth, selectedYear, allData, historicalData]);

  // Process data
  const processedData = useMemo(() => {
    return paginatedData.map(row => {
      const unbSiangRaw =
        Array.isArray(row.siang) && row.siang.length > 0
          ? Math.max(...row.siang.map((m: Measurement) => Number(m.unbalanced) || 0))
          : null;
      const unbMalamRaw =
        Array.isArray(row.malam) && row.malam.length > 0
          ? Math.max(...row.malam.map((m: Measurement) => Number(m.unbalanced) || 0))
          : null;

      return {
        ...row,
        unbSiangRaw,
        unbMalamRaw,
        unbSiang: unbSiangRaw !== null ? `${unbSiangRaw.toFixed(2)}%` : '-',
        unbMalam: unbMalamRaw !== null ? `${unbMalamRaw.toFixed(2)}%` : '-',
        unbSiangClass:
          unbSiangRaw !== null
            ? unbSiangRaw < 80
              ? 'text-green-700 font-bold'
              : 'text-red-700 font-bold'
            : '',
        unbMalamClass:
          unbMalamRaw !== null
            ? unbMalamRaw < 80
              ? 'text-green-700 font-bold'
              : 'text-red-700 font-bold'
            : ''
      };
    });
  }, [paginatedData]);

  // Handle update measurement
  const handleUpdateMeasurement = async (updateData: any) => {
    try {
      const response = await fetch(`/api/measurements/${updateData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          unbalanced: updateData.newValue,
          reason: updateData.reason
        })
      });

      const result = await response.json();

      if (result.success) {
        alert(`✅ Update berhasil!\n${result.old_value}% → ${result.new_value}%`);
        // Refresh data
        const monthYearKey = `${selectedYear}-${selectedMonth}`;
        setHistoricalData(prev => {
          const newData = { ...prev };
          delete newData[monthYearKey];
          return newData;
        });
        setCurrentData([]);
      } else {
        alert('❌ Update gagal');
      }
    } catch (error) {
      console.error('Error updating:', error);
      alert('❌ Terjadi kesalahan saat update');
    }
  };

  // Export riwayat
  const handleExportRiwayat = async () => {
    if (!selectedMonth || !selectedYear) {
      setExportError('Silakan pilih bulan dan tahun terlebih dahulu');
      return;
    }

    setExportLoading(true);
    setExportError(null);

    try {
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
      return (
        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
          Aktif
        </span>
      );
    } else {
      return (
        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
          Nonaktif
        </span>
      );
    }
  };

  const getMonthName = (monthNumber: string) => {
    return new Date(`2000-${monthNumber}-01`).toLocaleString('id-ID', { month: 'long' });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">Riwayat Pengukuran Gardu</h2>

      {/* Filter Section */}
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
              <option key={year} value={year}>
                {year}
              </option>
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

      {/* Error Export */}
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

      {/* Filter Info */}
      {selectedMonth && selectedYear && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-md text-blue-700 text-sm">
          📊 Menampilkan data untuk <strong>{getMonthName(selectedMonth)} {selectedYear}</strong> (
          {currentData.length} gardu ditemukan)
        </div>
      )}

      {/* Loading / Error */}
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
                <th className="px-4 py-2 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {processedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">
                    {selectedMonth && selectedYear
                      ? `Tidak ada data untuk ${getMonthName(selectedMonth)} ${selectedYear}`
                      : 'Silakan pilih bulan dan tahun'}
                  </td>
                </tr>
              ) : (
                processedData.map((row, idx) => {
                  const sub = row.substation || row;
                  const siangMeasurement = row.siang && row.siang[0];
                  const malamMeasurement = row.malam && row.malam[0];

                  return (
                    <tr key={sub.id || idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border text-center">
                        {(page - 1) * pageSize + idx + 1}
                      </td>
                      <td className="px-4 py-2 border font-semibold">{sub.namaLokasiGardu || '-'}</td>
                      <td className="px-4 py-2 border">{sub.ulp || '-'}</td>
                      <td className="px-4 py-2 border">{sub.jenis || '-'}</td>
                      <td className="px-4 py-2 border font-bold">{sub.daya || '-'}</td>
                      <td className="px-4 py-2 border text-center">{getStatusBadge(sub.is_active)}</td>
                      <td className={`px-4 py-2 border text-center ${row.unbSiangClass}`}>
                        {row.unbSiang}
                      </td>
                      <td className={`px-4 py-2 border text-center ${row.unbMalamClass}`}>
                        {row.unbMalam}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        <div className="flex gap-1 justify-center">
                          {siangMeasurement && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedMeasurement(siangMeasurement);
                                  setEditModalOpen(true);
                                }}
                                className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                                title="Edit Siang"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedMeasurementForHistory(siangMeasurement.id!);
                                  setHistoryModalOpen(true);
                                }}
                                className="p-1 text-green-500 hover:bg-green-50 rounded"
                                title="History Siang"
                              >
                                <History size={16} />
                              </button>
                            </>
                          )}
                          {malamMeasurement && (
                            <>
                              <button
                                onClick={() => {
                                  setSelectedMeasurement(malamMeasurement);
                                  setEditModalOpen(true);
                                }}
                                className="p-1 text-blue-500 hover:bg-blue-50 rounded"
                                title="Edit Malam"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedMeasurementForHistory(malamMeasurement.id!);
                                  setHistoryModalOpen(true);
                                }}
                                className="p-1 text-green-500 hover:bg-green-50 rounded"
                                title="History Malam"
                              >
                                <History size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
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
              let pageNum =
                totalPages <= 5
                  ? i + 1
                  : page <= 3
                    ? i + 1
                    : page >= totalPages - 2
                      ? totalPages - 4 + i
                      : page - 2 + i;

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

      {/* Modals */}
      <EditMeasurementModal
        measurement={selectedMeasurement}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedMeasurement(null);
        }}
        onSave={handleUpdateMeasurement}
      />

      <HistoryModal
        measurementId={selectedMeasurementForHistory}
        isOpen={historyModalOpen}
        onClose={() => {
          setHistoryModalOpen(false);
          setSelectedMeasurementForHistory(null);
        }}
      />
    </div>
  );
};