import React, { useState, useEffect } from 'react';
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
  onUpdateSubstation: (updatedSubstation: Partial<SubstationData>) => void;
  loading?: boolean;
  onAddSubstation: (sub: Omit<SubstationData, 'id'>) => Promise<void>;
  isReadOnly?: boolean; // Tambah prop isReadOnly
  currentUser?: { role: string }; // Tambahkan ini
  adminToken?: string; // Tambahkan ini
}

export const SubstationTable: React.FC<SubstationTableProps> = ({ 
  data, 
  onUpdateSubstation, 
  loading = false,
  onAddSubstation,
  isReadOnly = false, // Default false
  currentUser, // Tambahkan props currentUser
  adminToken // Tambahkan props adminToken
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jenisFilter, setJenisFilter] = useState<string>('all');
  const [selectedSubstation, setSelectedSubstation] = useState<SubstationData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // Filtered data harus dideklarasikan sebelum pagination
  const filteredData = data.filter(substation => {
    const matchesSearch = substation.namaLokasiGardu.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         substation.ulp.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         substation.noGardu.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && substation.is_active === 1) ||
                         (statusFilter === 'inactive' && substation.is_active === 0);
    const matchesJenis = jenisFilter === 'all' || substation.jenis.toLowerCase() === jenisFilter;
    return matchesSearch && matchesStatus && matchesJenis;
  });
  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 50;
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = filteredData.slice((page - 1) * pageSize, page * pageSize);

  // Reset halaman ke 1 ketika filter berubah
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, jenisFilter]);

  const [newSub, setNewSub] = useState<Omit<SubstationData, 'id'>>({
    no: 0, ulp: '', noGardu: '', namaLokasiGardu: '', jenis: '', merek: '', daya: '', tahun: '', phasa: '', tap_trafo_max_tap: '', penyulang: '', arahSequence: '', tanggal: '', status: 'normal', is_active: 1, ugb: 0, measurements: [], lastUpdate: ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const getStatusBadge = (isActive: number) => {
    if (isActive === 1) {
      return <Badge variant="success">Aktif</Badge>;
    } else {
      return <Badge variant="default" className="bg-gray-300 text-gray-700">Nonaktif</Badge>;
    }
  };

  const handleViewDetails = (substation: SubstationData) => {
    setSelectedSubstation(substation);
    setIsDetailModalOpen(true);
  };

  const handleUpdatePower = (id: string, newPower: string) => {
    const updatedSubstation = data.find(s => s.id === id);
    if (updatedSubstation) {
      const updated = { ...updatedSubstation, daya: newPower };
      onUpdateSubstation(updated);
      setSelectedSubstation(updated);
    }
  };

  const handleUpdateIsActive = async (id: string, isActive: number) => {
    console.log('🔥 Checkbox clicked! id:', id, 'isActive:', isActive);
    try {
      const updated = { id, is_active: isActive };
      console.log('🔗 PATCH to API with:', updated);
      console.log('🔗 API URL:', import.meta.env.VITE_API_BASE_URL);
      await onUpdateSubstation(updated);
      console.log('✅ Update successful');
      window.alert('Status aktif gardu berhasil diubah!');
    } catch (error) {
      console.error('❌ Update failed:', error);
      window.alert('Gagal mengupdate status aktif gardu!');
    }
  };

  const handleUpdateUGB = async (id: string, ugb: number) => {
    console.log('🔥 Checkbox UGB clicked! id:', id, 'ugb:', ugb);
    try {
      const updated = { id, ugb };
      console.log('🔗 PATCH to API with:', updated);
      console.log('🔗 API URL:', import.meta.env.VITE_API_BASE_URL);
      await onUpdateSubstation(updated);
      console.log('✅ UGB Update successful');
      window.alert('Status UGB gardu berhasil diubah!');
    } catch (error) {
      console.error('❌ UGB Update failed:', error);
      window.alert('Gagal mengupdate status UGB gardu!');
    }
  };

  const handleAddSubstation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onAddSubstation({
        ...newSub,
        status: 'normal', // status default
        daya: newSub.daya,
        tahun: newSub.tahun,
        tap_trafo_max_tap: newSub.tap_trafo_max_tap,
        ugb: 0 // UGB default selalu non-aktif
        // Hapus field measurements, biarkan backend yang generate default
      });
      setIsAddModalOpen(false);
      setNewSub({
        no: 0, ulp: '', noGardu: '', namaLokasiGardu: '', jenis: '', merek: '', daya: '', tahun: '', phasa: '', tap_trafo_max_tap: '', penyulang: '', arahSequence: '', tanggal: '', status: 'normal', is_active: 1, ugb: 0, measurements: [], lastUpdate: ''
      });
      window.alert('Data gardu berhasil disimpan!');
      window.location.reload();
    } catch (err) {
      window.alert('Gagal menyimpan data gardu!');
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportSubstations = async (importedData: SubstationData[]) => {
    try {
      await ApiService.importSubstations(importedData);
      // Optionally, refresh data or show a success message
      window.alert('Data gardu berhasil diimpor!');
      // You might want to refetch the substations list here
    } catch (error) {
      console.error('Failed to import substations:', error);
      window.alert('Gagal mengimpor data. Cek konsol untuk detail.');
    }
  };

  const handleExportAllExcel = () => {
    window.open(`${import.meta.env.VITE_API_BASE_URL}/export/riwayat`, '_blank');
  };

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

  console.log('isReadOnly:', isReadOnly); // DEBUG LOG
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Monitoring Gardu Distribusi</h3>
              <p className="text-sm text-gray-600">Status dan pengukuran real-time</p>
            </div>
            {!isReadOnly && ( // Hanya tampilkan tombol jika bukan read-only
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={handleExportAllExcel}>
                <Download size={16} className="mr-1" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)}>
                <Download size={16} className="mr-1" />
                Import
              </Button>
              <Button variant="primary" size="sm" onClick={() => {
                setNewSub(s => ({ ...s, no: data.length + 1, is_active: 1, ugb: 0 }));
                setIsAddModalOpen(true);
              }}>
                + Tambah Gardu
              </Button>
            </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter Controls */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
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
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Semua Status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
                <select
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
                  {!isReadOnly && ( // Hanya tampilkan kolom Aktif jika bukan read-only
                  <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Aktif</th>
                  )}
                  {!isReadOnly && ( // Hanya tampilkan kolom UGB jika bukan read-only
                  <th className="px-8 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">UGB</th>
                  )}
                  <th className="px-8 py-4"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((substation, idx) => {
                  return (
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
                        <div className="text-base text-gray-900">
                          {substation.jenis}
                        </div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        <div className="text-base font-bold text-gray-900">{substation.daya}</div>
                      </td>
                      <td className="px-8 py-4 whitespace-nowrap">
                        {getStatusBadge(substation.is_active)}
                      </td>
                      {!isReadOnly && ( // Hanya tampilkan checkbox jika bukan read-only
                      <td className="px-8 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={substation.is_active === 1}
                          onChange={e => handleUpdateIsActive(substation.id, e.target.checked ? 1 : 0)}
                        />
                      </td>
                      )}
                      {!isReadOnly && ( // Hanya tampilkan checkbox UGB jika bukan read-only
                      <td className="px-8 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={substation.ugb === 1}
                          onChange={e => handleUpdateUGB(substation.id, e.target.checked ? 1 : 0)}
                        />
                      </td>
                      )}
                      <td className="px-8 py-4 whitespace-nowrap text-base font-medium">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewDetails(substation)}
                        >
                          <Eye size={16} className="mr-1" />
                          Detail
                        </Button>
                        {/* Tombol Hapus hanya untuk admin */}
                        {currentUser?.role === 'admin' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={async () => {
                              if (window.confirm('Yakin ingin menghapus gardu ini beserta seluruh data pengukurannya?')) {
                                try {
                                  await ApiService.deleteSubstation(substation.id);
                                    window.alert('Gardu berhasil dihapus!');
                                    window.location.reload();
                                } catch (e) {
                                  console.error('Error deleting substation:', e);
                                  window.alert('Gagal menghapus gardu!');
                                }
                              }
                            }}
                          >
                            Hapus
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada gardu yang sesuai dengan kriteria pencarian.</p>
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
        </CardContent>
      </Card>

      <SubstationDetailModal
        substation={selectedSubstation}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onUpdatePower={handleUpdatePower}
        onUpdateSubstation={onUpdateSubstation}
        isReadOnly={isReadOnly} // Pass isReadOnly to modal
      />

      {/* Modal Tambah Gardu - Hanya tampilkan jika bukan read-only */}
      {!isReadOnly && isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <form onSubmit={handleAddSubstation} className="bg-white rounded-lg shadow-lg p-8 w-full max-w-2xl space-y-4 overflow-y-auto" style={{ maxHeight: '90vh' }}>
            <h2 className="text-xl font-bold mb-4">Tambah Gardu Baru</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required type="text" placeholder="ULP" value={newSub.ulp} onChange={e => setNewSub(s => ({ ...s, ulp: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="text" placeholder="No Gardu" value={newSub.noGardu} onChange={e => setNewSub(s => ({ ...s, noGardu: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="text" placeholder="Nama Lokasi Gardu" value={newSub.namaLokasiGardu} onChange={e => setNewSub(s => ({ ...s, namaLokasiGardu: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="text" placeholder="Jenis" value={newSub.jenis} onChange={e => setNewSub(s => ({ ...s, jenis: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="text" placeholder="Merek" value={newSub.merek} onChange={e => setNewSub(s => ({ ...s, merek: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="number" placeholder="Daya" value={newSub.daya} onChange={e => setNewSub(s => ({ ...s, daya: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="number" placeholder="Tahun" value={newSub.tahun} onChange={e => setNewSub(s => ({ ...s, tahun: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="number" placeholder="Jumlah Tap Trafo Max Tap" value={newSub.tap_trafo_max_tap} onChange={e => setNewSub(s => ({ ...s, tap_trafo_max_tap: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="text" placeholder="Phasa" value={newSub.phasa} onChange={e => setNewSub(s => ({ ...s, phasa: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="text" placeholder="Penyulang" value={newSub.penyulang} onChange={e => setNewSub(s => ({ ...s, penyulang: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="text" placeholder="Arah Sequence" value={newSub.arahSequence} onChange={e => setNewSub(s => ({ ...s, arahSequence: e.target.value }))} className="border rounded px-3 py-2" />
              <input required type="date" placeholder="Tanggal" value={newSub.tanggal} onChange={e => setNewSub(s => ({ ...s, tanggal: e.target.value }))} className="border rounded px-3 py-2" />
            </div>
            {/* Hapus renderMeasurementInputs('siang') dan renderMeasurementInputs('malam') */}
            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Batal</Button>
              <Button type="submit" variant="primary" disabled={isSaving}>{isSaving ? 'Menyimpan...' : 'Simpan'}</Button>
            </div>
          </form>
        </div>
      )}

      <SubstationImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportSubstations}
      />
    </>
  );
};