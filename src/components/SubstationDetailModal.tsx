import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, Ambulance as Cancel, MapPin, Zap, Activity, Calculator } from 'lucide-react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { SubstationData } from '../types';
import { createMeasurementSiang, createMeasurementMalam } from '../services/api';
import { SubstationMaps } from './SubstationMaps';
// HAPUS: import { exportSubstationToExcel } from './ExportSubstationExcel';
import { ApiService } from '../services/api';

interface SubstationDetailModalProps {
  substation: SubstationData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePower: (id: string, newPower: string) => void;
  onUpdateSubstation: (substation: Partial<SubstationData>) => void;
  onFetchSubstationDetail?: (id: string) => Promise<void>; // Tambah prop baru
  isReadOnly?: boolean; // Tambah prop isReadOnly
}

export const SubstationDetailModal: React.FC<SubstationDetailModalProps> = ({
  substation,
  isOpen,
  onClose,
  onUpdatePower,
  onUpdateSubstation,
  onFetchSubstationDetail, // Tambah prop baru
  isReadOnly = false // Default false
}) => {
  const [isEditingPower, setIsEditingPower] = useState(false);
  const [editedPower, setEditedPower] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [siangMeasurements, setSiangMeasurements] = useState<any[]>([]);
  const [malamMeasurements, setMalamMeasurements] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingTanggal, setIsEditingTanggal] = useState(false);
  const [editedTanggal, setEditedTanggal] = useState('');

  // Backup state measurement sebelum update (checkpoint)
  // Hapus state checkpoint yang tidak digunakan

  // Ganti useEffect untuk sinkronisasi measurement
  useEffect(() => {
    if (substation) {
      let siang = substation.measurements_siang || [];
      let malam = substation.measurements_malam || [];
      const rowNames = ['induk', '1', '2', '3', '4'];

      // SIANG - Gunakan data yang sebenarnya dari database
      const siangResults = rowNames.map(rowName => {
        return siang.find(x => x.row_name?.toLowerCase() === rowName.toLowerCase() && String(x.substationId) === String(substation.id)) || null;
      }).filter(m => m !== null); // Hanya tampilkan data yang benar-benar ada
      setSiangMeasurements(siangResults);

      // MALAM - Gunakan data yang sebenarnya dari database
      const malamResults = rowNames.map(rowName => {
        return malam.find(x => x.row_name?.toLowerCase() === rowName.toLowerCase() && String(x.substationId) === String(substation.id)) || null;
      }).filter(m => m !== null); // Hanya tampilkan data yang benar-benar ada
      console.log('Substation ID:', substation.id);
      console.log('Raw malam data:', malam);
      console.log('Processed malam measurements:', malamResults);
      setMalamMeasurements(malamResults);

    } else {
      setSiangMeasurements([]);
      setMalamMeasurements([]);
    }
  }, [substation]);

  if (!isOpen || !substation) return null;

  const handleEditPower = () => {
    setEditedPower(String(substation.daya));
    setIsEditingPower(true);
  };

  const handleSavePower = async () => {
    try {
      setIsUpdating(true);
      await onUpdatePower(substation.id, editedPower);
      setIsEditingPower(false);
    } catch (error) {
      console.error('Failed to update power:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedPower('');
    setIsEditingPower(false);
  };

  const handleEditTanggal = () => {
    setEditedTanggal(substation.tanggal ? substation.tanggal.slice(0, 10) : '');
    setIsEditingTanggal(true);
  };

  const handleSaveTanggal = async () => {
    try {
      setIsUpdating(true);
      // Kirim tanggal dalam format ISO agar diterima backend (Prisma DateTime)
      const isoTanggal = new Date(editedTanggal + 'T00:00:00').toISOString();
      await onUpdateSubstation({ id: substation.id, tanggal: isoTanggal });
      setIsEditingTanggal(false);
    } catch (error) {
      console.error('Failed to update tanggal:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelEditTanggal = () => {
    setEditedTanggal('');
    setIsEditingTanggal(false);
  };

  const handleUpdateCoordinates = async (latitude: number, longitude: number) => {
    if (!substation) return;
    try {
      const sanitized = sanitizeSubstation({ ...substation, latitude, longitude });
      await onUpdateSubstation(sanitized);
    } catch (err) {
      window.alert('Gagal mengupdate koordinat lokasi!');
    }
  };

  // Helper untuk sanitasi data substation
  function sanitizeSubstation(sub: Partial<SubstationData>): SubstationData {
    const allowedStatus = ['normal', 'warning', 'critical', 'non-active'] as const;
    const status: typeof allowedStatus[number] = allowedStatus.includes(sub.status as any) ? sub.status as any : 'normal';
    return {
      ...sub,
      no: Number(sub.no ?? 0),
      ulp: String(sub.ulp || ''),
      noGardu: String(sub.noGardu || ''),
      namaLokasiGardu: String(sub.namaLokasiGardu || ''),
      jenis: String(sub.jenis || ''),
      merek: String(sub.merek || ''),
      daya: String(sub.daya || ''),
      tahun: String(sub.tahun || ''),
      phasa: String(sub.phasa || ''),
      tap_trafo_max_tap: String((sub.tap_trafo_max_tap || '')),
      penyulang: String(sub.penyulang || ''),
      arahSequence: String(sub.arahSequence || ''),
      tanggal: sub.tanggal ? String(sub.tanggal) : '',
      status,
      is_active: typeof sub.is_active === 'number' ? sub.is_active : 1,
      ugb: typeof sub.ugb === 'number' ? sub.ugb : 0,
      latitude: typeof sub.latitude === 'number' ? sub.latitude : undefined,
      longitude: typeof sub.longitude === 'number' ? sub.longitude : undefined,
      id: String(sub.id || ''),
      lastUpdate: sub.lastUpdate ? String(sub.lastUpdate) : new Date().toISOString(),
      measurements: sub.measurements || [],
    };
  }



  const getStatusBadge = (isActive: number) => {
    if (isActive === 1) {
      return <Badge variant="success">Aktif</Badge>;
    } else {
      return <Badge variant="default" className="bg-gray-300 text-gray-700">Nonaktif</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    // Ambil tanggal dalam format YYYY-MM-DD
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const latestMeasurement = (substation.measurements && substation.measurements.length > 0)
    ? substation.measurements[substation.measurements.length - 1]
    : { r: '', s: '', t: '', n: '', rn: '', sn: '', tn: '', pp: '', pn: '' };

  // Helper untuk mengambil data pengukuran sesuai baris dan kolom, berdasarkan row_name dan substationId
  const getMeasurementByRow = (measurements: any[], substationId: string, rowName: string) => {
    return (
      measurements.find(
        m => m.row_name?.toLowerCase() === rowName.toString().toLowerCase() && String(m.substationId) === String(substationId)
      ) || { id: null, r: '', s: '', t: '', n: '', rn: '', sn: '', tn: '', pp: '', pn: '', rata2: undefined, kva: undefined, persen: undefined, unbalanced: undefined }
    );
  };

  // Handler untuk perubahan input hanya update state lokal (TIDAK auto-save ke backend)
  const handleCellChangeSiang = (measurementId: number | null, field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setSiangMeasurements(prev =>
      prev.map(m => m.id === measurementId ? { ...m, [field]: numValue } : m)
    );
    // Dihilangkan: auto-save ke backend
    // if (measurementId && measurementId !== null) {
    //   ApiService.patchMeasurementSiang(measurementId, { [field]: numValue })
    //     .then(() => {
    //       console.log(`Auto-saved ${field} = ${numValue} for SIANG measurement ID ${measurementId}`);
    //     })
    //     .catch((err) => {
    //       console.error('Auto-save failed (siang):', err);
    //       window.alert(`Gagal menyimpan ${field} (siang).`);
    //     });
    // }
  };
  // Handler malam: only update malamMeasurements (TIDAK auto-save ke backend)
  const handleCellChangeMalam = (measurementId: number | null, field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setMalamMeasurements(prev => prev.map(m => {
      if (m.id === measurementId) {
        return { ...m, [field]: numValue };
      }
      return m;
    }));
  };

  // Ubah signature patchMeasurementsSiangBulk agar mengembalikan any (bukan void)
  // Pada import ApiService, tambahkan komentar:
  // ApiService.patchMeasurementsSiangBulk: Promise<any>

  // Fungsi untuk membaca data langsung dari input fields di UI
  const getDataFromUI = () => {
    const siangData: any[] = [];
    const malamData: any[] = [];

    // Baca data SIANG dari input fields
    ['induk', '1', '2', '3', '4'].forEach((rowName) => {
      const rowData: any = {
        substationId: substation?.id,
        row_name: rowName,
        month: substation?.tanggal ? new Date(substation.tanggal).toISOString().slice(0, 7) : '',
      };

      // Ambil nilai dari input fields berdasarkan row dan field
      const getInputValue = (field: string) => {
        const input = document.querySelector(`input[data-row="${rowName}"][data-field="${field}"]`) as HTMLInputElement;
        return input ? Number(input.value) || 0 : 0;
      };

      rowData.r = getInputValue('r');
      rowData.s = getInputValue('s');
      rowData.t = getInputValue('t');
      rowData.n = getInputValue('n');
      rowData.rn = getInputValue('rn');
      rowData.sn = getInputValue('sn');
      rowData.tn = getInputValue('tn');
      rowData.pp = getInputValue('pp');
      rowData.pn = getInputValue('pn');

      siangData.push(rowData);
    });

    // Baca data MALAM dari input fields
    ['induk', '1', '2', '3', '4'].forEach((rowName) => {
      const rowData: any = {
        substationId: substation?.id,
        row_name: rowName,
        month: substation?.tanggal ? new Date(substation.tanggal).toISOString().slice(0, 7) : '',
      };

      // Ambil nilai dari input fields berdasarkan row dan field
      const getInputValue = (field: string) => {
        const input = document.querySelector(`input[data-row="${rowName}"][data-field="${field}"]`) as HTMLInputElement;
        return input ? Number(input.value) || 0 : 0;
      };

      rowData.r = getInputValue('r');
      rowData.s = getInputValue('s');
      rowData.t = getInputValue('t');
      rowData.n = getInputValue('n');
      rowData.rn = getInputValue('rn');
      rowData.sn = getInputValue('sn');
      rowData.tn = getInputValue('tn');
      rowData.pp = getInputValue('pp');
      rowData.pn = getInputValue('pn');

      malamData.push(rowData);
    });

    return { siangData, malamData };
  };

  // Ganti onFetchSubstationDetail dengan getSubstationById agar update state React tanpa reload
  const handleSaveAllMeasurements = async () => {
    setIsSaving(true);
    try {
      // Baca data langsung dari UI input fields
      const { siangData, malamData } = getDataFromUI();

      // Kirim PATCH bulk untuk Siang dan Malam secara paralel via ApiService
      const [siangResult, malamResult] = await Promise.all([
        ApiService.patchMeasurementsSiangBulk(siangData),
        ApiService.patchMeasurementsMalamBulk(malamData),
      ]);

      const messages = [];
      if (siangResult && siangResult.length > 0) {
        setSiangMeasurements(siangResult);
        messages.push('Data SIANG berhasil disimpan.');
      } else {
        messages.push('Gagal menyimpan data SIANG.');
      }
      if (malamResult && malamResult.length > 0) {
        setMalamMeasurements(malamResult);
        messages.push('Data MALAM berhasil disimpan.');
      } else {
        messages.push('Gagal menyimpan data MALAM.');
      }

      window.alert(messages.join('\n\n'));
      // Fetch ulang data substation detail setelah save (pakai GET, tanpa reload)
      if (substation?.id && typeof onFetchSubstationDetail === 'function') {
        await onFetchSubstationDetail(substation.id);
      }
    } catch (err) {
      console.error('Save all error:', err);
      window.alert('Terjadi kesalahan saat menyimpan data!');
    } finally {
      setIsSaving(false);
    }
  };

  // Hitung status performa berdasarkan unbalance tertinggi
  const allUnbalances = [
    ...(siangMeasurements?.map(m => Number(m.unbalanced) || 0) || []),
    ...(malamMeasurements?.map(m => Number(m.unbalanced) || 0) || [])
  ];
  const maxUnbalance = allUnbalances.length > 0 ? Math.max(...allUnbalances) : 0;
  let performaStatus: 'normal' | 'warning' | 'critical' = 'normal';
  if (maxUnbalance >= 20) performaStatus = 'critical';
  else if (maxUnbalance >= 10) performaStatus = 'warning';
  // Badge warna
  const performaBadge = (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold
      ${performaStatus === 'normal' ? 'bg-green-100 text-green-800 border border-green-300' : ''}
      ${performaStatus === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' : ''}
      ${performaStatus === 'critical' ? 'bg-red-100 text-red-800 border border-red-300' : ''}
    `}>
      {performaStatus.toUpperCase()} (Unbalance: {maxUnbalance.toFixed(2)})
    </span>
  );

  const handleExportExcel = async () => {
    if (!substation?.id) return;
    try {
      const response = await fetch(`/api/export/substation/${substation.id}`);
      if (!response.ok) throw new Error('Gagal mengunduh file Excel');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `RekapGardu_${substation.noGardu || substation.id}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      window.alert('Gagal mengunduh file Excel!');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Detail Gardu Distribusi</h2>
            <p className="text-sm text-gray-600">{substation.noGardu} - {substation.namaLokasiGardu}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Informasi Dasar</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">ULP</label>
                  <p className="text-lg font-semibold text-gray-900">{substation.ulp}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">No. Gardu</label>
                  <p className="text-lg font-semibold text-gray-900">{substation.noGardu}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">{getStatusBadge(substation.is_active)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Jenis</label>
                  <p className="text-lg font-semibold text-gray-900">{substation.jenis}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Merek</label>
                  <p className="text-lg font-semibold text-gray-900">{substation.merek}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Daya (kVA)</label>
                  <div className="flex items-center space-x-2">
                    {!isReadOnly && isEditingPower ? (
                      <>
                        <input
                          type="text"
                          value={editedPower}
                          onChange={(e) => setEditedPower(e.target.value)}
                          className="text-lg font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1 w-20"
                        />
                        <Button 
                          size="sm" 
                          onClick={handleSavePower}
                          disabled={isUpdating}
                        >
                          <Save size={14} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleCancelEdit}
                        >
                          <Cancel size={14} />
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-semibold text-gray-900">{String(substation.daya)}</p>
                        {!isReadOnly && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={handleEditPower}
                        >
                          <Edit2 size={14} />
                        </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tahun</label>
                  <p className="text-lg font-semibold text-gray-900">{String(substation.tahun)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phasa</label>
                  <p className="text-lg font-semibold text-gray-900">{substation.phasa}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tap Trafo (Max Tap)</label>
                  <p className="text-lg font-semibold text-gray-900">{String(substation.tap_trafo_max_tap)}</p>
                </div>

                <div className="col-span-full">
                  <label className="text-sm font-medium text-gray-500">Status Performa (berdasarkan Unbalance Tertinggi Siang/Malam)</label>
                  <div className="mt-1">{performaBadge}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Network Information */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Informasi Jaringan</h3>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="text-sm font-medium text-gray-500">Penyulang</label>
                  <p className="text-lg font-semibold text-gray-900">{substation.penyulang}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Arah Sequence</label>
                  <p className="text-lg font-semibold text-gray-900">{substation.arahSequence}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Tanggal</label>
                  <div className="flex items-center space-x-2">
                    {!isReadOnly && isEditingTanggal ? (
                      <>
                        <input
                          type="date"
                          value={editedTanggal || ""}
                          onChange={e => setEditedTanggal(e.target.value)}
                          className="text-lg font-semibold text-gray-900 border border-gray-300 rounded px-2 py-1 w-40"
                        />
                        <Button size="sm" onClick={handleSaveTanggal} disabled={isUpdating}>
                          <Save size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleCancelEditTanggal}>
                          <Cancel size={14} />
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-semibold text-gray-900">{formatDate(substation.tanggal)}</p>
                        {!isReadOnly && (
                          <Button variant="ghost" size="sm" onClick={handleEditTanggal}>
                            <Edit2 size={14} />
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Map */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-red-600" />
                <h3 className="text-lg font-semibold text-gray-900">Lokasi Gardu</h3>
              </div>
            </CardHeader>
            <CardContent>
              <SubstationMaps
                substation={substation}
                onUpdateCoordinates={handleUpdateCoordinates}
                isReadOnly={isReadOnly}
              />
            </CardContent>
          </Card>

          {/* Current Measurements */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Pengukuran Terkini</h3>
                </div>
                <div className="text-sm text-gray-500">
                  Terakhir update: {formatDate(substation.lastUpdate)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{latestMeasurement.r}</div>
                  <div className="text-sm text-gray-600">R (V)</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{latestMeasurement.s}</div>
                  <div className="text-sm text-gray-600">S (V)</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{latestMeasurement.t}</div>
                  <div className="text-sm text-gray-600">T (V)</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{latestMeasurement.pp}</div>
                  <div className="text-sm text-gray-600">P-P (V)</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{latestMeasurement.pn}</div>
                  <div className="text-sm text-gray-600">P-N (V)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons - Hanya tampilkan jika bukan read-only */}
          {!isReadOnly && (
          <div className="flex justify-end space-x-3">
            <Button onClick={onClose}>
              Tutup
            </Button>
            <Button onClick={handleExportExcel} className="ml-2" variant="outline">Export Excel</Button>
          </div>
          )}

          {/* Simulation Section - Hanya tampilkan jika bukan read-only */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Simulasi Pengukuran</h3>
              </div>
            </CardHeader>
            <CardContent>
              {/* Day Measurement Section - Classic UI */}
              <div className="mb-2 mt-4 text-lg font-bold text-yellow-800 text-center">Pengukuran Siang</div>
              <div className="border border-yellow-300 rounded-lg overflow-x-auto mb-2">
                <table className="min-w-max w-full text-center border-collapse">
                  <colgroup>
                    <col style={{ width: '80px' }} />
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '90px' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th rowSpan={2} className="bg-green-200 border border-green-400 text-gray-900 font-bold align-middle">JURUSAN</th>
                      <th colSpan={4} className="bg-yellow-100 border border-yellow-400 text-gray-900 font-bold">ARUS</th>
                      <th colSpan={3} className="bg-yellow-100 border border-yellow-400 text-gray-900 font-bold">P-N</th>
                      <th rowSpan={2} className="bg-yellow-100 border border-yellow-400 text-gray-900 font-bold">P-P</th>
                      <th rowSpan={2} className="bg-yellow-100 border border-yellow-400 text-gray-900 font-bold">UJUNG</th>
                    </tr>
                    <tr>
                      <th className="bg-yellow-200 border border-yellow-400 text-gray-900 font-bold">R</th>
                      <th className="bg-yellow-200 border border-yellow-400 text-gray-900 font-bold">S</th>
                      <th className="bg-yellow-200 border border-yellow-400 text-gray-900 font-bold">T</th>
                      <th className="bg-yellow-200 border border-yellow-400 text-gray-900 font-bold">N</th>
                      <th className="bg-yellow-200 border border-yellow-400 text-gray-900 font-bold">R-N</th>
                      <th className="bg-yellow-200 border border-yellow-400 text-gray-900 font-bold">S-N</th>
                      <th className="bg-yellow-200 border border-yellow-400 text-gray-900 font-bold">T-N</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['induk', '1', '2', '3', '4'].map((rowName) => {
                      const m = getMeasurementByRow(siangMeasurements, substation.id, rowName);
                      return (
                        <tr key={rowName}>
                          <td className={rowName === 'induk' ? "bg-green-100 border border-green-300 font-semibold" : "bg-green-50 border border-green-200"}>{rowName.toUpperCase()}</td>
                          {/* ARUS */}
                          <td className="bg-white border border-yellow-100"><input className="w-full text-center bg-transparent" type="number" value={m.r ?? ''} onChange={e => handleCellChangeSiang(m.id, 'r', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="r" /></td>
                          <td className="bg-white border border-yellow-100"><input className="w-full text-center bg-transparent" type="number" value={m.s ?? ''} onChange={e => handleCellChangeSiang(m.id, 's', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="s" /></td>
                          <td className="bg-white border border-yellow-100"><input className="w-full text-center bg-transparent" type="number" value={m.t ?? ''} onChange={e => handleCellChangeSiang(m.id, 't', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="t" /></td>
                          <td className="bg-white border border-yellow-100"><input className="w-full text-center bg-transparent" type="number" value={m.n ?? ''} onChange={e => handleCellChangeSiang(m.id, 'n', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="n" /></td>
                          {/* P-N */}
                          <td className="bg-white border border-yellow-100"><input className="w-full text-center bg-transparent" type="number" value={m.rn ?? ''} onChange={e => handleCellChangeSiang(m.id, 'rn', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="rn" /></td>
                          <td className="bg-white border border-yellow-100"><input className="w-full text-center bg-transparent" type="number" value={m.sn ?? ''} onChange={e => handleCellChangeSiang(m.id, 'sn', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="sn" /></td>
                          <td className="bg-white border border-yellow-100"><input className="w-full text-center bg-transparent" type="number" value={m.tn ?? ''} onChange={e => handleCellChangeSiang(m.id, 'tn', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="tn" /></td>
                          {/* P-P */}
                          <td className="bg-white border border-yellow-100"><input className="w-full text-center bg-transparent" type="number" value={m.pp ?? ''} onChange={e => handleCellChangeSiang(m.id, 'pp', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="pp" /></td>
                          {/* UJUNG (P=N) */}
                          <td className="bg-white border border-yellow-100"><input className="w-full text-center bg-transparent" type="number" value={m.pn ?? ''} onChange={e => handleCellChangeSiang(m.id, 'pn', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="pn" /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* BEBAN SIANG - hasil semua baris */}
              <div className="mb-6 flex justify-center">
                <table className="min-w-max w-auto border border-black text-center bg-white rounded-lg">
                  <thead className="bg-yellow-100">
                    <tr>
                      <th className="px-4 py-2 border border-black">BEBAN SIANG</th>
                      <th className="px-4 py-2 border border-black">RATA2</th>
                      <th className="px-4 py-2 border border-black">KVA</th>
                      <th className="px-4 py-2 border border-black">%</th>
                      <th className="px-4 py-2 border border-black">UNBALANCED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['induk', '1', '2', '3', '4'].map((rowName) => {
                      const m = getMeasurementByRow(siangMeasurements, substation.id, rowName);
                      return (
                        <tr key={rowName} className="bg-white">
                          <td className="px-4 py-2 font-semibold border border-black">{rowName.toUpperCase()}</td>
                          <td className="px-4 py-2 border border-black">{m.rata2 !== undefined ? Number(m.rata2).toFixed(2) : '-'}</td>
                          <td className="px-4 py-2 border border-black">{m.kva !== undefined ? Number(m.kva).toFixed(2) : '-'}</td>
                          <td className="px-4 py-2 border border-black">{m.persen !== undefined ? Number(m.persen).toFixed(1) + '%' : '-'}</td>
                          <td className="px-4 py-2 border border-black">{m.unbalanced !== undefined ? Number(m.unbalanced).toFixed(1) + '%' : '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Night Measurement Section - Classic UI */}
              <div className="mb-2 mt-8 text-lg font-bold text-blue-800 text-center">Pengukuran Malam</div>
              <div className="border border-blue-300 rounded-lg overflow-x-auto mb-2">
                <table className="min-w-max w-full text-center border-collapse">
                  <colgroup>
                    <col style={{ width: '80px' }} />
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '90px' }} />
                    <col style={{ width: '90px' }} />
                  </colgroup>
                  <thead>
                    <tr>
                      <th rowSpan={2} className="bg-green-200 border border-green-400 text-gray-900 font-bold align-middle">JURUSAN</th>
                      <th colSpan={4} className="bg-blue-100 border border-blue-400 text-gray-900 font-bold">ARUS</th>
                      <th colSpan={3} className="bg-blue-100 border border-blue-400 text-gray-900 font-bold">P-N</th>
                      <th rowSpan={2} className="bg-blue-100 border border-blue-400 text-gray-900 font-bold">P-P</th>
                      <th rowSpan={2} className="bg-blue-100 border border-blue-400 text-gray-900 font-bold">UJUNG</th>
                    </tr>
                    <tr>
                      <th className="bg-blue-200 border border-blue-400 text-gray-900 font-bold">R</th>
                      <th className="bg-blue-200 border border-blue-400 text-gray-900 font-bold">S</th>
                      <th className="bg-blue-200 border border-blue-400 text-gray-900 font-bold">T</th>
                      <th className="bg-blue-200 border border-blue-400 text-gray-900 font-bold">N</th>
                      <th className="bg-blue-200 border border-blue-400 text-gray-900 font-bold">R-N</th>
                      <th className="bg-blue-200 border border-blue-400 text-gray-900 font-bold">S-N</th>
                      <th className="bg-blue-200 border border-blue-400 text-gray-900 font-bold">T-N</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['induk', '1', '2', '3', '4'].map((rowName) => {
                      const m = getMeasurementByRow(malamMeasurements, substation.id, rowName);
                      return (
                        <tr key={rowName}>
                          <td className={rowName === 'induk' ? "bg-green-100 border border-green-300 font-semibold" : "bg-green-50 border border-green-200"}>{rowName.toUpperCase()}</td>
                          {/* ARUS */}
                          <td className="bg-white border border-blue-100"><input className="w-full text-center bg-transparent" type="number" value={m.r ?? ''} onChange={e => handleCellChangeMalam(m.id, 'r', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="r" /></td>
                          <td className="bg-white border border-blue-100"><input className="w-full text-center bg-transparent" type="number" value={m.s ?? ''} onChange={e => handleCellChangeMalam(m.id, 's', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="s" /></td>
                          <td className="bg-white border border-blue-100"><input className="w-full text-center bg-transparent" type="number" value={m.t ?? ''} onChange={e => handleCellChangeMalam(m.id, 't', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="t" /></td>
                          <td className="bg-white border border-blue-100"><input className="w-full text-center bg-transparent" type="number" value={m.n ?? ''} onChange={e => handleCellChangeMalam(m.id, 'n', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="n" /></td>
                          {/* P-N */}
                          <td className="bg-white border border-blue-100"><input className="w-full text-center bg-transparent" type="number" value={m.rn ?? ''} onChange={e => handleCellChangeMalam(m.id, 'rn', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="rn" /></td>
                          <td className="bg-white border border-blue-100"><input className="w-full text-center bg-transparent" type="number" value={m.sn ?? ''} onChange={e => handleCellChangeMalam(m.id, 'sn', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="sn" /></td>
                          <td className="bg-white border border-blue-100"><input className="w-full text-center bg-transparent" type="number" value={m.tn ?? ''} onChange={e => handleCellChangeMalam(m.id, 'tn', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="tn" /></td>
                          {/* P-P */}
                          <td className="bg-white border border-blue-100"><input className="w-full text-center bg-transparent" type="number" value={m.pp ?? ''} onChange={e => handleCellChangeMalam(m.id, 'pp', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="pp" /></td>
                          {/* UJUNG (P=N) */}
                          <td className="bg-white border border-blue-100"><input className="w-full text-center bg-transparent" type="number" value={m.pn ?? ''} onChange={e => handleCellChangeMalam(m.id, 'pn', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="pn" /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {/* BEBAN MALAM - hasil semua baris */}
              <div className="mb-6 flex justify-center">
                <table className="min-w-max w-auto border border-black text-center bg-white rounded-lg">
                  <thead className="bg-blue-100">
                    <tr>
                      <th className="px-4 py-2 border border-black">BEBAN MALAM</th>
                      <th className="px-4 py-2 border border-black">RATA2</th>
                      <th className="px-4 py-2 border border-black">KVA</th>
                      <th className="px-4 py-2 border border-black">%</th>
                      <th className="px-4 py-2 border border-black">UNBALANCED</th>
                    </tr>
                  </thead>
                  <tbody>
                    {['induk', '1', '2', '3', '4'].map((rowName) => {
                      const m = getMeasurementByRow(malamMeasurements, substation.id, rowName);
                      return (
                        <tr key={rowName} className="bg-white">
                          <td className="px-4 py-2 font-semibold border border-black">{rowName.toUpperCase()}</td>
                          <td className="px-4 py-2 border border-black">{m.rata2 !== undefined ? Number(m.rata2).toFixed(2) : '-'}</td>
                          <td className="px-4 py-2 border border-black">{m.kva !== undefined ? Number(m.kva).toFixed(2) : '-'}</td>
                          <td className="px-4 py-2 border border-black">{m.persen !== undefined ? Number(m.persen).toFixed(1) + '%' : '-'}</td>
                          <td className="px-4 py-2 border border-black">{m.unbalanced !== undefined ? Number(m.unbalanced).toFixed(1) + '%' : '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {!isReadOnly && (
          <div className="flex justify-end mt-4">
            <Button size="md" onClick={handleSaveAllMeasurements} disabled={isSaving}>
              {isSaving ? 'Menyimpan...' : 'Save Data'}
            </Button>
          </div>
          )}

          {/* Tombol Tutup untuk user read-only */}
          {isReadOnly && (
            <div className="flex justify-end mt-4">
              <Button onClick={onClose}>
                Tutup
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};