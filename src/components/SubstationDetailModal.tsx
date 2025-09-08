import React, { useState, useEffect } from 'react';
import { X, Edit2, Save, Ambulance as Cancel, MapPin, Zap, Activity, Calculator } from 'lucide-react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { SubstationData } from '../types';
import { SubstationMaps } from './SubstationMaps';
import { ApiService } from '../services/api';

interface SubstationDetailModalProps {
  substation: SubstationData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePower: (id: string, newPower: string) => void;
  onUpdateSubstation: (substation: Partial<SubstationData>) => void;
  onFetchSubstationDetail?: (id: string) => Promise<void>;
  isReadOnly?: boolean;
}

export const SubstationDetailModal: React.FC<SubstationDetailModalProps> = ({
  substation,
  isOpen,
  onClose,
  onUpdatePower,
  onUpdateSubstation,
  onFetchSubstationDetail,
  isReadOnly = false
}) => {
  const [isEditingPower, setIsEditingPower] = useState(false);
  const [editedPower, setEditedPower] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [siangMeasurements, setSiangMeasurements] = useState<any[]>([]);
  const [malamMeasurements, setMalamMeasurements] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingTanggal, setIsEditingTanggal] = useState(false);
  const [editedTanggal, setEditedTanggal] = useState('');

  useEffect(() => {
    if (substation) {
      const siang = substation.measurements_siang || [];
      const malam = substation.measurements_malam || [];
      const rowNames = ['induk', '1', '2', '3', '4'];

      const siangResults = rowNames
        .map(rowName => siang.find(x => x.row_name?.toLowerCase() === rowName && String(x.substationId) === String(substation.id)) || null)
        .filter(Boolean) as any[];

      const malamResults = rowNames
        .map(rowName => malam.find(x => x.row_name?.toLowerCase() === rowName && String(x.substationId) === String(substation.id)) || null)
        .filter(Boolean) as any[];

      setSiangMeasurements(siangResults);
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
      const update = { id: substation.id, latitude, longitude };
      await onUpdateSubstation(update);
      window.alert('Koordinat berhasil diupdate!');
    } catch {
      window.alert('Gagal mengupdate koordinat lokasi!');
    }
  };

  const getStatusBadge = (isActive: number) => {
    return isActive === 1
      ? <Badge variant="success">Aktif</Badge>
      : <Badge variant="default" className="bg-gray-300 text-gray-700">Nonaktif</Badge>;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const latestMeasurement = (substation.measurements && substation.measurements.length > 0)
    ? substation.measurements[substation.measurements.length - 1]
    : { r: '', s: '', t: '', n: '', rn: '', sn: '', tn: '', pp: '', pn: '' };

  const getMeasurementByRow = (measurements: any[], substationId: string, rowName: string) => {
    const found = measurements.find(
      m => m.row_name?.toLowerCase() === rowName.toLowerCase() && String(m.substationId) === String(substationId)
    );
    return found || { id: null, r: '', s: '', t: '', n: '', rn: '', sn: '', tn: '', pp: '', pn: '', rata2: undefined, kva: undefined, persen: undefined, unbalanced: undefined };
  };

  const handleCellChangeSiang = (measurementId: number | null, field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setSiangMeasurements(prev => prev.map(m => (m.id === measurementId ? { ...m, [field]: numValue } : m)));
  };

  const handleCellChangeMalam = (measurementId: number | null, field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setMalamMeasurements(prev => prev.map(m => (m.id === measurementId ? { ...m, [field]: numValue } : m)));
  };

  const getDataFromUI = () => {
    const siangData: any[] = [];
    const malamData: any[] = [];

    ['induk', '1', '2', '3', '4'].forEach((rowName) => {
      const rowData: any = {
        substationId: substation?.id,
        row_name: rowName,
        month: substation?.tanggal ? new Date(substation.tanggal).toISOString().slice(0, 7) : '',
      };
      const getInputValueSiang = (field: string) => {
        const input = document.querySelector(`.siang-input[data-row="${rowName}"][data-field="${field}"]`) as HTMLInputElement | null;
        return input ? Number(input.value) || 0 : 0;
      };
      rowData.r = getInputValueSiang('r');
      rowData.s = getInputValueSiang('s');
      rowData.t = getInputValueSiang('t');
      rowData.n = getInputValueSiang('n');
      rowData.rn = getInputValueSiang('rn');
      rowData.sn = getInputValueSiang('sn');
      rowData.tn = getInputValueSiang('tn');
      rowData.pp = getInputValueSiang('pp');
      rowData.pn = getInputValueSiang('pn');
      siangData.push(rowData);
    });

    ['induk', '1', '2', '3', '4'].forEach((rowName) => {
      const rowData: any = {
        substationId: substation?.id,
        row_name: rowName,
        month: substation?.tanggal ? new Date(substation.tanggal).toISOString().slice(0, 7) : '',
      };
      const getInputValueMalam = (field: string) => {
        const input = document.querySelector(`.malam-input[data-row="${rowName}"][data-field="${field}"]`) as HTMLInputElement | null;
        return input ? Number(input.value) || 0 : 0;
      };
      rowData.r = getInputValueMalam('r');
      rowData.s = getInputValueMalam('s');
      rowData.t = getInputValueMalam('t');
      rowData.n = getInputValueMalam('n');
      rowData.rn = getInputValueMalam('rn');
      rowData.sn = getInputValueMalam('sn');
      rowData.tn = getInputValueMalam('tn');
      rowData.pp = getInputValueMalam('pp');
      rowData.pn = getInputValueMalam('pn');
      malamData.push(rowData);
    });

    return { siangData, malamData };
  };

  const handleSaveAllMeasurements = async () => {
    setIsSaving(true);
    try {
      const { siangData, malamData } = getDataFromUI();
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

  const allUnbalances = [
    ...(siangMeasurements?.map(m => Number(m.unbalanced) || 0) || []),
    ...(malamMeasurements?.map(m => Number(m.unbalanced) || 0) || [])
  ];
  const maxUnbalance = allUnbalances.length > 0 ? Math.max(...allUnbalances) : 0;
  let performaStatus: 'normal' | 'warning' | 'critical' = 'normal';
  if (maxUnbalance >= 20) performaStatus = 'critical';
  else if (maxUnbalance >= 10) performaStatus = 'warning';

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
      const response = await fetch(`/api/export/substation-detail?id=${substation.id}`);
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
      console.error('Export failed:', err);
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
                        <Button size="sm" onClick={handleSavePower} disabled={isUpdating}>
                          <Save size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                          <Cancel size={14} />
                        </Button>
                      </>
                    ) : (
                      <>
                        <p className="text-lg font-semibold text-gray-900">{String(substation.daya)}</p>
                        {!isReadOnly && (
                          <Button variant="ghost" size="sm" onClick={handleEditPower}>
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

          {/* Network Information */}
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
                  <h3 className="text-lg font-semibold text-gray-900">Foto Gardu</h3>
                </div>
                <div className="text-sm text-gray-500">
                  Terakhir update: {formatDate(substation.lastUpdate)}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                <div className="md:col-span-2">
                  {substation.photoUrl ? (
                    <img
                      src={substation.photoUrl}
                      alt="Foto Gardu"
                      className="w-full h-64 object-contain rounded-lg border bg-gray-100"
                    />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg border text-gray-500">
                      Belum ada foto gardu
                    </div>
                  )}
                </div>
                {!isReadOnly && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Unggah / Ganti Foto</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = async () => {
                          try {
                            const base64 = reader.result as string; // data URL
                            const updated = await ApiService.uploadSubstationPhoto(substation.id, base64, file.name);
                            // Hindari double refresh: gunakan fetch detail sekali saja jika tersedia
                            if (typeof onFetchSubstationDetail === 'function') {
                              await onFetchSubstationDetail(substation.id);
                            }
                          } catch (err) {
                            console.error('Gagal mengunggah foto:', err);
                            alert('Gagal mengunggah foto');
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500">Format: JPG/PNG/WEBP, maks 10MB</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {!isReadOnly && (
            <div className="flex justify-end space-x-3">
              <Button onClick={onClose}>Tutup</Button>
              <Button onClick={handleExportExcel} className="ml-2" variant="outline">Export Excel</Button>
            </div>
          )}

          {/* Measurement Tables */}
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Data Pengukuran</h3>
              </div>
            </CardHeader>
            <CardContent>
              {/* SIANG */}
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
                          <td className="bg-white border border-yellow-100"><input className="w-full text-center bg-transparent siang-input" type="number" value={m.r ?? ''} onChange={e => handleCellChangeSiang(m.id, 'r', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="r" data-type="siang" /></td>
                          <td className="bg-white border border-yellow-100"><input className="w-full text-center bg-transparent siang-input" type="number" value={m.s ?? ''} onChange={e => handleCellChangeSiang(m.id, 's', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="s" data-type="siang" /></td>
                          <td className="bg-white border border-yellow-100"><input className="w-full text-center bg-transparent siang-input" type="number" value={m.t ?? ''} onChange={e => handleCellChangeSiang(m.id, 't', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="t" data-type="siang" /></td>
                          <td className="bg-white border border-yellow-100"><input className="w-full text-center bg-transparent siang-input" type="number" value={m.n ?? ''} onChange={e => handleCellChangeSiang(m.id, 'n', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="n" data-type="siang" /></td>
                          {/* P-N */}
                          <td className="bg-white border border-yellow-100"><input className="w-full text-center bg-transparent siang-input" type="number" value={m.rn ?? ''} onChange={e => handleCellChangeSiang(m.id, 'rn', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="rn" data-type="siang" /></td>
                          <td className="bg-white border border-yellow-100"><input className="w-full text-center bg-transparent siang-input" type="number" value={m.sn ?? ''} onChange={e => handleCellChangeSiang(m.id, 'sn', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="sn" data-type="siang" /></td>
                          <td className="bg-white border border-yellow-100"><input className="w-full text-center bg-transparent siang-input" type="number" value={m.tn ?? ''} onChange={e => handleCellChangeSiang(m.id, 'tn', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="tn" data-type="siang" /></td>
                          {/* P-P */}
                          <td className="bg-white border border-yellow-100"><input className="w-full text-center bg-transparent siang-input" type="number" value={m.pp ?? ''} onChange={e => handleCellChangeSiang(m.id, 'pp', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="pp" data-type="siang" /></td>
                          {/* UJUNG (P=N) */}
                          <td className="bg-white border border-yellow-100"><input className="w-full text-center bg-transparent siang-input" type="number" value={m.pn ?? ''} onChange={e => handleCellChangeSiang(m.id, 'pn', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="pn" data-type="siang" /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* BEBAN SIANG */}
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

              {/* MALAM */}
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
                          <td className="bg-white border border-blue-100"><input className="w-full text-center bg-transparent malam-input" type="number" value={m.r ?? ''} onChange={e => handleCellChangeMalam(m.id, 'r', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="r" data-type="malam" /></td>
                          <td className="bg-white border border-blue-100"><input className="w-full text-center bg-transparent malam-input" type="number" value={m.s ?? ''} onChange={e => handleCellChangeMalam(m.id, 's', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="s" data-type="malam" /></td>
                          <td className="bg-white border border-blue-100"><input className="w-full text-center bg-transparent malam-input" type="number" value={m.t ?? ''} onChange={e => handleCellChangeMalam(m.id, 't', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="t" data-type="malam" /></td>
                          <td className="bg-white border border-blue-100"><input className="w-full text-center bg-transparent malam-input" type="number" value={m.n ?? ''} onChange={e => handleCellChangeMalam(m.id, 'n', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="n" data-type="malam" /></td>
                          {/* P-N */}
                          <td className="bg-white border border-blue-100"><input className="w-full text-center bg-transparent malam-input" type="number" value={m.rn ?? ''} onChange={e => handleCellChangeMalam(m.id, 'rn', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="rn" data-type="malam" /></td>
                          <td className="bg-white border border-blue-100"><input className="w-full text-center bg-transparent malam-input" type="number" value={m.sn ?? ''} onChange={e => handleCellChangeMalam(m.id, 'sn', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="sn" data-type="malam" /></td>
                          <td className="bg-white border border-blue-100"><input className="w-full text-center bg-transparent malam-input" type="number" value={m.tn ?? ''} onChange={e => handleCellChangeMalam(m.id, 'tn', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="tn" data-type="malam" /></td>
                          {/* P-P */}
                          <td className="bg-white border border-blue-100"><input className="w-full text-center bg-transparent malam-input" type="number" value={m.pp ?? ''} onChange={e => handleCellChangeMalam(m.id, 'pp', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="pp" data-type="malam" /></td>
                          {/* UJUNG (P=N) */}
                          <td className="bg-white border border-blue-100"><input className="w-full text-center bg-transparent malam-input" type="number" value={m.pn ?? ''} onChange={e => handleCellChangeMalam(m.id, 'pn', e.target.value)} readOnly={isReadOnly} disabled={isReadOnly} data-row={rowName} data-field="pn" data-type="malam" /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* BEBAN MALAM */}
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

          {isReadOnly && (
            <div className="flex justify-end mt-4">
              <Button onClick={onClose}>Tutup</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
