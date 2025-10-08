import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { SubstationData, DashboardStats, User } from '../types';
import { useSubstations } from '../hooks/useSubstations';
import { ApiService } from '../services/api';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { Camera, MapPin, Calendar, LogOut } from 'lucide-react';
import { SubstationDetailModal } from './SubstationDetailModal';

interface PetugasDashboardProps {
  user: User;
  onLogout: () => void;
}

export const PetugasDashboard: React.FC<PetugasDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'add' | 'list'>('dashboard');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { substations, loading: substationsLoading, refreshData } = useSubstations();

  // Modal detail
  const [selectedSubstation, setSelectedSubstation] = useState<SubstationData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // search
  const [search, setSearch] = useState('');
  const filteredSubstations = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return substations;
    return substations.filter(s => (
      s.noGardu?.toLowerCase().includes(q) ||
      s.namaLokasiGardu?.toLowerCase().includes(q) ||
      s.ulp?.toLowerCase().includes(q) ||
      s.jenis?.toLowerCase().includes(q)
    ));
  }, [search, substations]);

  // Form state for adding new substation
  const [formData, setFormData] = useState({
    noGardu: '',
    namaLokasiGardu: '',
    ulp: '',
    jenis: '',
    merek: '',
    daya: '',
    tahun: '',
    phasa: '',
    tap_trafo_max_tap: '',
    penyulang: '',
    arahSequence: '',
    latitude: '',
    longitude: ''
  });

  // Measurement input - Siang
  const [jurusanSiang, setJurusanSiang] = useState<'induk' | '1' | '2' | '3' | '4'>('induk');
  const [measSiang, setMeasSiang] = useState({ r: '', s: '', t: '', n: '', rn: '', sn: '', tn: '', pp: '', pn: '' });

  // Measurement input - Malam
  const [jurusanMalam, setJurusanMalam] = useState<'induk' | '1' | '2' | '3' | '4'>('induk');
  const [measMalam, setMeasMalam] = useState({ r: '', s: '', t: '', n: '', rn: '', sn: '', tn: '', pp: '', pn: '' });

  // Photo previews
  const [photoPreviews, setPhotoPreviews] = useState<{ rumah: string | null; meter: string | null; petugas: string | null; ba: string | null; }>({ rumah: null, meter: null, petugas: null, ba: null });

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await ApiService.getDashboardStats();
      setStats(response);
    } catch (err) {
      setError('Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenDetail = async (sub: SubstationData) => {
    setSelectedSubstation(sub);
    setIsDetailOpen(true);
    try {
      const full = await ApiService.getSubstationById(sub.id);
      setSelectedSubstation(full);
    } catch (e) {
      console.error('Failed to load substation detail:', e);
    }
  };

  const handleMeasChange = (setter: React.Dispatch<React.SetStateAction<any>>) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setter((prev: any) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (type: 'rumah' | 'meter' | 'petugas' | 'ba') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPhotoPreviews(prev => ({ ...prev, [type]: reader.result as string }));
      reader.readAsDataURL(file);
    }
  };

  const hasAny = (obj: Record<string, string>) => Object.values(obj).some(v => v !== '' && v != null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const safeNo = Math.floor(Date.now() / 1000) % 2000000000;
      const newSubstation: Omit<SubstationData, 'id'> = {
        ...formData,
        no: safeNo,
        tanggal: new Date().toISOString().split('T')[0],
        measurements: [],
        status: 'normal' as const,
        lastUpdate: new Date().toISOString(),
        is_active: 1,
        ugb: 0,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      };

      const created = await ApiService.createSubstation(newSubstation);

      if (created?.id) {
        const month = new Date().toISOString().slice(0, 7);
        const tasks: Promise<any>[] = [];
        if (hasAny(measSiang)) {
          tasks.push(ApiService.patchMeasurementsSiangBulk([{
            substationId: created.id,
            row_name: jurusanSiang,
            month,
            r: Number(measSiang.r) || 0,
            s: Number(measSiang.s) || 0,
            t: Number(measSiang.t) || 0,
            n: Number(measSiang.n) || 0,
            rn: Number(measSiang.rn) || 0,
            sn: Number(measSiang.sn) || 0,
            tn: Number(measSiang.tn) || 0,
            pp: Number(measSiang.pp) || 0,
            pn: Number(measSiang.pn) || 0,
          }]));
        }
        if (hasAny(measMalam)) {
          tasks.push(ApiService.patchMeasurementsMalamBulk([{
            substationId: created.id,
            row_name: jurusanMalam,
            month,
            r: Number(measMalam.r) || 0,
            s: Number(measMalam.s) || 0,
            t: Number(measMalam.t) || 0,
            n: Number(measMalam.n) || 0,
            rn: Number(measMalam.rn) || 0,
            sn: Number(measMalam.sn) || 0,
            tn: Number(measMalam.tn) || 0,
            pp: Number(measMalam.pp) || 0,
            pn: Number(measMalam.pn) || 0,
          }]));
        }
        if (tasks.length) await Promise.all(tasks);
      }

      // reset
      setFormData({ noGardu: '', namaLokasiGardu: '', ulp: '', jenis: '', merek: '', daya: '', tahun: '', phasa: '', tap_trafo_max_tap: '', penyulang: '', arahSequence: '', latitude: '', longitude: '' });
      setJurusanSiang('induk');
      setMeasSiang({ r: '', s: '', t: '', n: '', rn: '', sn: '', tn: '', pp: '', pn: '' });
      setJurusanMalam('induk');
      setMeasMalam({ r: '', s: '', t: '', n: '', rn: '', sn: '', tn: '', pp: '', pn: '' });
      setPhotoPreviews({ rumah: null, meter: null, petugas: null, ba: null });

      alert('Gardu berhasil ditambahkan!');
      await refreshData();
      setActiveTab('list');
    } catch (err) {
      setError('Gagal menambahkan gardu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'normal': { color: 'bg-green-100 text-green-800', label: 'Normal' },
      'warning': { color: 'bg-yellow-100 text-yellow-800', label: 'Warning' },
      'critical': { color: 'bg-red-100 text-red-800', label: 'Critical' },
      'non-active': { color: 'bg-gray-100 text-gray-800', label: 'Non-Active' }
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap['normal'];
    return (<Badge className={statusInfo.color}>{statusInfo.label}</Badge>);
  };

  const handleUseCurrentLocation = () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation tidak didukung di perangkat ini.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFormData(prev => ({ ...prev, latitude: String(latitude), longitude: String(longitude) }));
        setLoading(false);
      },
      (err) => {
        console.error('Geolocation error:', err);
        alert('Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.');
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-4">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dashboard Petugas</h1>
              <p className="text-gray-600 text-sm md:text-base">Selamat datang, {user?.name}</p>
            </div>
              <div className="flex items-center space-x-2 md:space-x-4">
              <div className="flex space-x-2 overflow-x-auto whitespace-nowrap no-scrollbar">
                <Button variant={activeTab === 'dashboard' ? 'primary' : 'outline'} onClick={() => setActiveTab('dashboard')} className="px-3 py-2 text-sm md:px-4 md:py-2 md:text-sm">
                  Dashboard
                </Button>
                <Button variant={activeTab === 'add' ? 'primary' : 'outline'} onClick={() => setActiveTab('add')} className="px-3 py-2 text-sm md:px-4 md:py-2 md:text-sm">
                  Tambah Gardu
                </Button>
                <Button variant={activeTab === 'list' ? 'primary' : 'outline'} onClick={() => setActiveTab('list')} className="px-3 py-2 text-sm md:px-4 md:py-2 md:text-sm">
                  List Gardu
                </Button>
              </div>
              <Button onClick={onLogout} variant="outline" className="px-3 py-2 text-sm md:px-4 md:py-2 md:text-sm text-red-600 hover:text-red-700 hover:bg-red-50">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {loading ? <LoadingSpinner /> : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Total Gardu
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {stats?.totalSubstations || 0}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Gardu Aktif
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {stats?.activeSubstations || 0}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        Issue Kritis
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {stats?.criticalIssues || 0}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        UGB Aktif
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        {stats?.ugbActive || 0}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Substations */}
                <Card>
                  <CardHeader>
                    <CardTitle>Gardu Terbaru</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {substations.slice(0, 6).map((substation) => (
                        <button key={substation.id} onClick={() => handleOpenDetail(substation)} className="text-left border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900">{substation.noGardu}</h3>
                            {getStatusBadge(substation.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{substation.namaLokasiGardu}</p>
                          <p className="text-xs text-gray-500">ULP: {substation.ulp}</p>
                          <p className="text-xs text-gray-500">Daya: {substation.daya}</p>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Add Gardu Tab */}
        {activeTab === 'add' && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="w-5 h-5 mr-2" />
                  Dokumentasi Foto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {([ { key: 'rumah' as const, title: 'Rumah' }, { key: 'meter' as const, title: 'Meter' }, { key: 'petugas' as const, title: 'Petugas' }, { key: 'ba' as const, title: 'BA' }]).map((item) => (
                    <div key={item.key} className="text-center">
                      <div className="w-full h-40 md:h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-2 overflow-hidden">
                        {photoPreviews[item.key] ? (
                          <img src={photoPreviews[item.key]!} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-gray-400">
                            <Camera className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-xs">{item.title}</p>
                          </div>
                        )}
                      </div>
                      <input type="file" accept="image/*" onChange={handlePhotoChange(item.key)} className="block w-full text-xs text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Gardu</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {([
                      { name: 'noGardu', label: 'No. Gardu *' },
                      { name: 'namaLokasiGardu', label: 'Nama Lokasi Gardu *' },
                      { name: 'ulp', label: 'ULP *' },
                      { name: 'jenis', label: 'Jenis *' },
                      { name: 'merek', label: 'Merek *' },
                      { name: 'daya', label: 'Daya *' },
                      { name: 'tahun', label: 'Tahun *' },
                      { name: 'phasa', label: 'Phasa *' },
                      { name: 'tap_trafo_max_tap', label: 'Tap Trafo Max Tap' },
                      { name: 'penyulang', label: 'Penyulang' },
                      { name: 'arahSequence', label: 'Arah Sequence' },
                    ] as const).map((f) => (
                      <div key={f.name}>
                        <label className="block text-base md:text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                        <Input name={f.name} value={(formData as any)[f.name]} onChange={handleInputChange} placeholder={`Masukkan ${f.label.replace('*','').trim()}`} required={f.label.includes('*')} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Siang Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Input Pengukuran Siang</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-base md:text-sm font-medium text-gray-700 mb-1">Pilihan Jurusan (Siang)</label>
                    <select value={jurusanSiang} onChange={(e) => setJurusanSiang(e.target.value as any)} className="w-full border rounded-lg px-4 py-3 text-lg md:py-2 md:text-sm">
                      <option value="induk">Induk</option>
                      <option value="1">Jurusan 1</option>
                      <option value="2">Jurusan 2</option>
                      <option value="3">Jurusan 3</option>
                      <option value="4">Jurusan 4</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {([
                      { key: 'r', label: 'R' },
                      { key: 's', label: 'S' },
                      { key: 't', label: 'T' },
                      { key: 'n', label: 'N' },
                      { key: 'rn', label: 'RN' },
                      { key: 'sn', label: 'SN' },
                      { key: 'tn', label: 'TN' },
                      { key: 'pp', label: 'Phasa-Phasa' },
                      { key: 'pn', label: 'Ujung' },
                    ] as const).map((f) => (
                      <div key={`siang-${f.key}`}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                        <Input name={f.key} value={(measSiang as any)[f.key]} onChange={handleMeasChange(setMeasSiang)} placeholder={f.label} type="number" step="any" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Malam Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Input Pengukuran Malam</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-base md:text-sm font-medium text-gray-700 mb-1">Pilihan Jurusan (Malam)</label>
                    <select value={jurusanMalam} onChange={(e) => setJurusanMalam(e.target.value as any)} className="w-full border rounded-lg px-4 py-3 text-lg md:py-2 md:text-sm">
                      <option value="induk">Induk</option>
                      <option value="1">Jurusan 1</option>
                      <option value="2">Jurusan 2</option>
                      <option value="3">Jurusan 3</option>
                      <option value="4">Jurusan 4</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {([
                      { key: 'r', label: 'R' },
                      { key: 's', label: 'S' },
                      { key: 't', label: 'T' },
                      { key: 'n', label: 'N' },
                      { key: 'rn', label: 'RN' },
                      { key: 'sn', label: 'SN' },
                      { key: 'tn', label: 'TN' },
                      { key: 'pp', label: 'Phasa-Phasa' },
                      { key: 'pn', label: 'Ujung' },
                    ] as const).map((f) => (
                      <div key={`malam-${f.key}`}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                        <Input name={f.key} value={(measMalam as any)[f.key]} onChange={handleMeasChange(setMeasMalam)} placeholder={f.label} type="number" step="any" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Koordinat Lokasi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-base md:text-sm font-medium text-gray-700 mb-1">Latitude</label>
                      <Input name="latitude" type="number" step="any" value={formData.latitude} onChange={handleInputChange} placeholder="Masukkan latitude" />
                    </div>
                    <div>
                      <label className="block text-base md:text-sm font-medium text-gray-700 mb-1">Longitude</label>
                      <Input name="longitude" type="number" step="any" value={formData.longitude} onChange={handleInputChange} placeholder="Masukkan longitude" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <Button type="button" variant="outline" onClick={handleUseCurrentLocation} disabled={loading}>
                      {loading ? 'Mengambil lokasi…' : 'Gunakan lokasi saya'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => {
                  setFormData({ noGardu: '', namaLokasiGardu: '', ulp: '', jenis: '', merek: '', daya: '', tahun: '', phasa: '', tap_trafo_max_tap: '', penyulang: '', arahSequence: '', latitude: '', longitude: '' });
                  setJurusanSiang('induk'); setMeasSiang({ r: '', s: '', t: '', n: '', rn: '', sn: '', tn: '', pp: '', pn: '' });
                  setJurusanMalam('induk'); setMeasMalam({ r: '', s: '', t: '', n: '', rn: '', sn: '', tn: '', pp: '', pn: '' });
                  setPhotoPreviews({ rumah: null, meter: null, petugas: null, ba: null });
                }}>Reset</Button>
                <Button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Gardu'}</Button>
              </div>
            </form>
          </div>
        )}

        {/* List Gardu Tab */}
        {activeTab === 'list' && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Daftar Gardu Tercatat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari no gardu / lokasi / ULP / jenis" />
                </div>
                {substationsLoading ? <LoadingSpinner /> : (
                  <div className="space-y-4">
                    {filteredSubstations.map((substation) => (
                      <button key={substation.id} onClick={() => handleOpenDetail(substation)} className="text-left w-full border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="font-semibold text-gray-900">{substation.noGardu}</h3>
                              {getStatusBadge(substation.status)}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                              <div>
                                <p><span className="font-medium">Lokasi:</span> {substation.namaLokasiGardu}</p>
                                <p><span className="font-medium">ULP:</span> {substation.ulp}</p>
                              </div>
                              <div>
                                <p><span className="font-medium">Jenis:</span> {substation.jenis}</p>
                                <p><span className="font-medium">Merek:</span> {substation.merek}</p>
                              </div>
                              <div>
                                <p><span className="font-medium">Daya:</span> {substation.daya}</p>
                                <p><span className="font-medium">Tahun:</span> {substation.tahun}</p>
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-gray-500">Last Update: {new Date(substation.lastUpdate).toLocaleDateString('id-ID')}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <SubstationDetailModal
        substation={selectedSubstation}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        onUpdatePower={() => {}}
        onUpdateSubstation={() => {}}
        onFetchSubstationDetail={async (id: string) => {
          const full = await ApiService.getSubstationById(id);
          setSelectedSubstation(full);
        }}
        isReadOnly={true}
      />
    </div>
  );
};
