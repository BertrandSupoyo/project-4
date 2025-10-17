import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';
import { LoadingSpinner } from './LoadingSpinner';
import { Search, Download, Eye } from 'lucide-react';
import { SubstationData } from '../types';
import { SubstationDetailModal } from './SubstationDetailModal';
import SubstationImportModal from './SubstationImportModal';
import { ApiService } from '../services/api';

interface SubstationTableProps {
  data: SubstationData[];
  onUpdateSubstation: (updatedSubstation: Partial<SubstationData>) => Promise<void>;
  loading?: boolean;
  onAddSubstation: (sub: Omit<SubstationData, 'id'>) => Promise<void>;
  isReadOnly?: boolean;
  currentUser?: { role: string };
  adminToken?: string;
  /** Opsional: bila disediakan, dipanggil setelah add/import supaya refresh data terpusat tanpa reload */
  onRefetch?: () => Promise<void>;
  /** Opsional: fungsi untuk fetch detail substation dan update state pusat */
  onFetchSubstationDetail?: (id: string) => Promise<void>;
}

/** Hook kecil untuk debounce value (250ms default) */
function useDebounced<T>(value: T, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

/** Helper aman lower-case string */
const s = (v: unknown) => (typeof v === 'string' ? v : '') as string;

export const SubstationTable: React.FC<SubstationTableProps> = ({
  data,
  onUpdateSubstation,
  loading = false,
  onAddSubstation,
  isReadOnly = false,
  currentUser,
 // adminToken,        // pengembangan berikut
  onRefetch,         // pengembangan berikut
  onFetchSubstationDetail,
}) => {
  /** Pegang salinan lokal agar bisa optimistic update tanpa reload */
  const [rows, setRows] = useState<SubstationData[]>(data);
  useEffect(() => {
    setRows(data);
  }, [data]);

  /** StrictMode guard: cegah efek init jalan 2× di dev */
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    
  }, []);

  // Filter & Search //
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jenisFilter, setJenisFilter] = useState<string>('all');

  const debouncedSearch = useDebounced(searchTerm, 300);

  const filteredData = useMemo(() => {
    const q = s(debouncedSearch).toLowerCase();
    return rows.filter((sub) => {
      const haystack =
        (s(sub.namaLokasiGardu).toLowerCase() +
          ' ' +
          s(sub.ulp).toLowerCase() +
          ' ' +
          s(sub.noGardu).toLowerCase()).trim();

      const matchesSearch = !q || haystack.includes(q);
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && sub.is_active === 1) ||
        (statusFilter === 'inactive' && sub.is_active === 0);

      const matchesJenis = jenisFilter === 'all' || s(sub.jenis).toLowerCase() === jenisFilter;

      return matchesSearch && matchesStatus && matchesJenis;
    });
  }, [rows, debouncedSearch, statusFilter, jenisFilter]);

  // Pagination dengan guard //
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  useEffect(() => {
    // Reset ke halaman 1 saat filter/search berubah
    setPage(1);
  }, [debouncedSearch, statusFilter, jenisFilter]);
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  // Detail Modal //
  const [selectedSubstation, setSelectedSubstation] = useState<SubstationData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleViewDetails = async (substation: SubstationData) => {
    // Buka modal segera dengan data ringkas agar terasa responsif
    setSelectedSubstation(substation);
    setIsDetailModalOpen(true);
    // Lalu fetch detail lengkap (termasuk measurements & foto) dari API
    try {
      const full = await ApiService.getSubstationById(substation.id);
      setSelectedSubstation(full);
    } catch (e) {
      console.error('Gagal memuat detail gardu:', e);
    }
  };

  // Busy flags (cegah double action) //
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyDeleteId, setBusyDeleteId] = useState<string | null>(null);

  /** Update daya lokal (non-API) untuk demo di modal */
  const handleUpdatePower = (id: string, newPower: string) => {
    setRows((prev) => prev.map((s) => (s.id === id ? { ...s, daya: newPower } : s)));
    // kalau mau kirim ke server juga, bisa panggil onUpdateSubstation({ id, daya: newPower })
  };

  /** Toggle aktif dengan optimistic update + rollback saat gagal */
  const handleUpdateIsActive = async (id: string, isActive: number) => {
    setBusyId(id);
    const prevRows = rows;
    setRows((cur) => cur.map((s) => (s.id === id ? { ...s, is_active: isActive } : s)));
    try {
      await onUpdateSubstation({ id, is_active: isActive });
    } catch (e) {
      console.error(e);
      setRows(prevRows); // rollback
      window.alert('Gagal mengupdate status aktif gardu!');
    } finally {
      setBusyId(null);
    }
  };

  /** Toggle UGB dengan optimistic update + rollback saat gagal */
  const handleUpdateUGB = async (id: string, ugb: number) => {
    setBusyId(id);
    const prevRows = rows;
    setRows((cur) => cur.map((s) => (s.id === id ? { ...s, ugb } : s)));
    try {
      await onUpdateSubstation({ id, ugb });
    } catch (e) {
      console.error(e);
      setRows(prevRows); // rollback
      window.alert('Gagal mengupdate status UGB gardu!');
    } finally {
      setBusyId(null);
    }
  };

  /** Add Substation (form modal lokal) */
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newSub, setNewSub] = useState<Omit<SubstationData, 'id'>>({
    no: 0,
    ulp: '',
    noGardu: '',
    namaLokasiGardu: '',
    jenis: '',
    merek: '',
    daya: '',            // NOTE: tipe kamu string; sesuaikan bila backend number
    tahun: '',
    phasa: '',
    tap_trafo_max_tap: '',
    penyulang: '',
    arahSequence: '',
    tanggal: '',
    status: 'normal',
    is_active: 1,
    ugb: 0,
    measurements: [],
    lastUpdate: ''
  });

  const handleSubmitAddSubstation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onAddSubstation({
        ...newSub,
        status: 'normal',
        ugb: 0,
      });
      setIsAddModalOpen(false);
      setNewSub({
        no: 0,
        ulp: '',
        noGardu: '',
        namaLokasiGardu: '',
        jenis: '',
        merek: '',
        daya: '',
        tahun: '',
        phasa: '',
        tap_trafo_max_tap: '',
        penyulang: '',
        arahSequence: '',
        tanggal: '',
        status: 'normal',
        is_active: 1,
        ugb: 0,
        measurements: [],
        lastUpdate: ''
      });
      window.alert('Data gardu berhasil disimpan!');
      // TANPA reload: kalau parent menyediakan onRefetch, panggil
      if (onRefetch) {
        await onRefetch();
      }
    } catch (err) {
      console.error(err);
      window.alert('Gagal menyimpan data gardu!');
    } finally {
      setIsSaving(false);
    }
  };

  /** Import */
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const handleExportAllExcel = () => {
    const base = import.meta.env.VITE_API_BASE_URL;
    if (!base) {
      window.alert('VITE_API_BASE_URL belum diset');
      return;
    }
    window.open(`${base}/export/riwayat`, '_blank');
  };

  /** Badge status */
  const getStatusBadge = (isActive: number) =>
    isActive === 1 ? (
      <Badge className="bg-green-100 text-green-800 border border-green-300">Aktif</Badge>
    ) : (
      <Badge className="bg-gray-200 text-gray-700 border border-gray-300">Nonaktif</Badge>
    );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Monitoring Gardu Distribusi</h3>
              <p className="text-sm text-gray-600">Status dan pengukuran real-time</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <LoadingSpinner text="Memuat data gardu..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Monitoring Gardu Distribusi</h3>
              <p className="text-sm text-gray-600">Status dan pengukuran real-time</p>
            </div>
            {!isReadOnly && (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleExportAllExcel}>
                  <Download size={16} className="mr-1" />
                  Export
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)}>
                  <Download size={16} className="mr-1" />
                  Import
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setNewSub((s) => ({ ...s, no: rows.length + 1, is_active: 1, ugb: 0 }));
                    setIsAddModalOpen(true);
                  }}
                >
                  + Tambah Gardu
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {/* Search + Filter */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    aria-label="Cari gardu"
                    type="text"
                    placeholder="Cari gardu berdasarkan nama, ULP, atau nomor gardu..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  aria-label="Filter status"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
                <select
                  aria-label="Filter jenis"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={jenisFilter}
                  onChange={(e) => setJenisFilter(e.target.value)}
                >
                  <option value="all">Semua Jenis</option>
                  <option value="cantol">Cantol</option>
                  <option value="portal">Portal</option>
                  <option value="beton">Beton</option>
                  <option value="kios">Kios</option>
                  <option value="compact">Compact</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto w-full">
            <table className="min-w-[900px] w-full divide-y divide-gray-200 text-base">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">No</th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">No Gardu</th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Nama Lokasi</th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Jenis</th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Daya</th>
                  <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  {!isReadOnly && (
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Aktif</th>
                  )}
                  {!isReadOnly && (
                    <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">UGB</th>
                  )}
                  <th className="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((substation, idx) => (
                  <tr key={substation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-4 whitespace-nowrap text-base font-semibold text-gray-900">
                      {(page - 1) * pageSize + idx + 1}
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className="text-base font-semibold text-gray-900">{substation.noGardu}</div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="text-base font-semibold text-gray-900 max-w-xs truncate">
                        {substation.namaLokasiGardu}
                      </div>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className="text-base text-gray-900">{substation.jenis}</div>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">
                      <div className="text-base font-bold text-gray-900">{substation.daya}</div>
                    </td>
                    <td className="px-8 py-4 whitespace-nowrap">{getStatusBadge(substation.is_active)}</td>

                    {!isReadOnly && (
                      <td className="px-8 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={substation.is_active === 1}
                          onChange={(e) => handleUpdateIsActive(substation.id, e.target.checked ? 1 : 0)}
                          disabled={busyId === substation.id}
                        />
                      </td>
                    )}
                    {!isReadOnly && (
                      <td className="px-8 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={substation.ugb === 1}
                          onChange={(e) => handleUpdateUGB(substation.id, e.target.checked ? 1 : 0)}
                          disabled={busyId === substation.id}
                        />
                      </td>
                    )}

                    <td className="px-8 py-4 whitespace-nowrap text-base font-medium">
                      <Button variant="ghost" size="sm" onClick={() => handleViewDetails(substation)}>
                        <Eye size={16} className="mr-1" />
                        Detail
                      </Button>

                      {currentUser?.role === 'admin' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={busyDeleteId === substation.id}
                          onClick={async () => {
                            if (window.confirm('Yakin ingin menghapus gardu ini beserta seluruh data pengukurannya?')) {
                              setBusyDeleteId(substation.id);
                              const prev = rows;
                              // Optimistic remove
                              setRows((r) => r.filter((s) => s.id !== substation.id));
                              try {
                                await ApiService.deleteSubstation(substation.id);
                                window.alert('Gardu berhasil dihapus!');
                                // kalau parent sediakan onRefetch, sinkronkan data
                                if (onRefetch) await onRefetch();
                              } catch (e) {
                                console.error('Error deleting substation:', e);
                                window.alert('Gagal menghapus gardu!');
                                setRows(prev); // rollback
                              } finally {
                                setBusyDeleteId(null);
                              }
                            }
                          }}
                        >
                          Hapus
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada gardu yang sesuai dengan kriteria pencarian.</p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center mt-4 gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              Prev
            </button>
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`px-2 py-1 border rounded ${page === i + 1 ? 'bg-blue-500 text-white' : ''}`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </CardContent>
      </Card>

      <SubstationDetailModal
        substation={selectedSubstation}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdatePower={handleUpdatePower}
        onUpdateSubstation={onUpdateSubstation}
        onFetchSubstationDetail={onFetchSubstationDetail}
        isReadOnly={isReadOnly}
      />

      {/* Modal Tambah Gardu */}
      {!isReadOnly && isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form
            onSubmit={handleSubmitAddSubstation}
            className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl space-y-4 overflow-y-auto"
            style={{ maxHeight: '90vh' }}
          >
            <h2 className="text-xl font-bold mb-4">Tambah Gardu Baru</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" placeholder="ULP" value={newSub.ulp} onChange={(e) => setNewSub((s) => ({ ...s, ulp: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="text" placeholder="No Gardu" value={newSub.noGardu} onChange={(e) => setNewSub((s) => ({ ...s, noGardu: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="text" placeholder="Nama Lokasi Gardu" value={newSub.namaLokasiGardu} onChange={(e) => setNewSub((s) => ({ ...s, namaLokasiGardu: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="text" placeholder="Jenis" value={newSub.jenis} onChange={(e) => setNewSub((s) => ({ ...s, jenis: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="text" placeholder="Merek" value={newSub.merek} onChange={(e) => setNewSub((s) => ({ ...s, merek: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="number" placeholder="Daya" value={newSub.daya as unknown as string} onChange={(e) => setNewSub((s) => ({ ...s, daya: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="number" placeholder="Tahun" value={newSub.tahun as unknown as string} onChange={(e) => setNewSub((s) => ({ ...s, tahun: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="number" placeholder="Jumlah Tap Trafo Max Tap" value={newSub.tap_trafo_max_tap as unknown as string} onChange={(e) => setNewSub((s) => ({ ...s, tap_trafo_max_tap: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="text" placeholder="Phasa" value={newSub.phasa} onChange={(e) => setNewSub((s) => ({ ...s, phasa: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="text" placeholder="Penyulang" value={newSub.penyulang} onChange={(e) => setNewSub((s) => ({ ...s, penyulang: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="text" placeholder="Arah Sequence" value={newSub.arahSequence} onChange={(e) => setNewSub((s) => ({ ...s, arahSequence: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="date" placeholder="Tanggal" value={newSub.tanggal} onChange={(e) => setNewSub((s) => ({ ...s, tanggal: e.target.value }))} className="border rounded px-3 py-2" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary" disabled={isSaving}>
                {isSaving ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Import Modal — tetap pakai onSuccess sesuai komponenmu */}
      <SubstationImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={async () => {
          window.alert('Data gardu berhasil diimpor!');
          if (onRefetch) await onRefetch();
        }}
      />
    </>
  );
};
