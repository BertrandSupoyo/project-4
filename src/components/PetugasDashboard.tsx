import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Badge } from './ui/Badge';
import { SubstationData, DashboardStats, User } from '../types';
import { useSubstations } from '../hooks/useSubstations';
import { ApiService } from '../services/api';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { Camera, MapPin, Zap, Calendar, LogOut } from 'lucide-react';

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
    longitude: '',
    idPelanggan: '',
    nomorTelepon: '',
    nomorMeter: '',
    namaPetugas: user?.name || 'Petugas Lapangan'
  });

  // Photo states
  const [photos, setPhotos] = useState<{
    rumah: File | null;
    meter: File | null;
    petugas: File | null;
    ba: File | null;
  }>({
    rumah: null,
    meter: null,
    petugas: null,
    ba: null
  });

  const [photoPreviews, setPhotoPreviews] = useState<{
    rumah: string | null;
    meter: string | null;
    petugas: string | null;
    ba: string | null;
  }>({
    rumah: null,
    meter: null,
    petugas: null,
    ba: null
  });

  useEffect(() => {
    fetchStats();
  }, []);

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

  const handlePhotoChange = (type: 'rumah' | 'meter' | 'petugas' | 'ba') => (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotos(prev => ({ ...prev, [type]: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreviews(prev => ({ ...prev, [type]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Convert form data to SubstationData format
      const newSubstation: Omit<SubstationData, 'id'> = {
        ...formData,
        no: Date.now(), // Generate temporary number
        tanggal: new Date().toISOString().split('T')[0],
        measurements: [],
        status: 'normal' as const,
        lastUpdate: new Date().toISOString(),
        is_active: 1,
        ugb: 0,
        latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
        longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      };

      await ApiService.createSubstation(newSubstation);
      
      // Reset form
      setFormData({
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
        longitude: '',
        idPelanggan: '',
        nomorTelepon: '',
        nomorMeter: '',
        namaPetugas: user?.name || 'Petugas Lapangan'
      });

      // Reset photos
      setPhotos({ rumah: null, meter: null, petugas: null, ba: null });
      setPhotoPreviews({ rumah: null, meter: null, petugas: null, ba: null });

      alert('Gardu berhasil ditambahkan!');
      refreshData();
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
    
    return (
      <Badge className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Petugas</h1>
              <p className="text-gray-600">Selamat datang, {user?.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex space-x-2">
                <Button
                  variant={activeTab === 'dashboard' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('dashboard')}
                >
                  Dashboard
                </Button>
                <Button
                  variant={activeTab === 'add' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('add')}
                >
                  Tambah Gardu
                </Button>
                <Button
                  variant={activeTab === 'list' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('list')}
                >
                  List Gardu
                </Button>
              </div>
              <Button
                onClick={onLogout}
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
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
            {loading ? (
              <LoadingSpinner />
            ) : (
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
                        <div key={substation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-semibold text-gray-900">{substation.noGardu}</h3>
                            {getStatusBadge(substation.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">{substation.namaLokasiGardu}</p>
                          <p className="text-xs text-gray-500">ULP: {substation.ulp}</p>
                          <p className="text-xs text-gray-500">Daya: {substation.daya}</p>
                        </div>
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
                  {[
                    { key: 'rumah' as const, title: 'Rumah' },
                    { key: 'meter' as const, title: 'Meter' },
                    { key: 'petugas' as const, title: 'Petugas' },
                    { key: 'ba' as const, title: 'BA' }
                  ].map((item) => (
                    <div key={item.key} className="text-center">
                      <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center mb-2 overflow-hidden">
                        {photoPreviews[item.key] ? (
                          <img 
                            src={photoPreviews[item.key]!} 
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-400">
                            <Camera className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-xs">{item.title}</p>
                          </div>
                        )}
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange(item.key)}
                        className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data Pelanggan</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ID Pelanggan *
                      </label>
                      <Input
                        name="idPelanggan"
                        value={formData.idPelanggan}
                        onChange={handleInputChange}
                        placeholder="Masukkan ID pelanggan"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nomor Telepon Pelanggan *
                      </label>
                      <Input
                        name="nomorTelepon"
                        value={formData.nomorTelepon}
                        onChange={handleInputChange}
                        placeholder="Masukkan nomor telepon"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nomor Meter
                      </label>
                      <Input
                        name="nomorMeter"
                        value={formData.nomorMeter}
                        onChange={handleInputChange}
                        placeholder="Masukkan nomor meter"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Petugas *
                      </label>
                      <Input
                        name="namaPetugas"
                        value={formData.namaPetugas}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama petugas"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    Data Gardu
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        No. Gardu *
                      </label>
                      <Input
                        name="noGardu"
                        value={formData.noGardu}
                        onChange={handleInputChange}
                        placeholder="Masukkan nomor gardu"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Lokasi Gardu *
                      </label>
                      <Input
                        name="namaLokasiGardu"
                        value={formData.namaLokasiGardu}
                        onChange={handleInputChange}
                        placeholder="Masukkan nama lokasi"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        ULP *
                      </label>
                      <Input
                        name="ulp"
                        value={formData.ulp}
                        onChange={handleInputChange}
                        placeholder="Masukkan ULP"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jenis *
                      </label>
                      <Input
                        name="jenis"
                        value={formData.jenis}
                        onChange={handleInputChange}
                        placeholder="Masukkan jenis"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Merek *
                      </label>
                      <Input
                        name="merek"
                        value={formData.merek}
                        onChange={handleInputChange}
                        placeholder="Masukkan merek"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Daya *
                      </label>
                      <Input
                        name="daya"
                        value={formData.daya}
                        onChange={handleInputChange}
                        placeholder="Masukkan daya"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tahun *
                      </label>
                      <Input
                        name="tahun"
                        value={formData.tahun}
                        onChange={handleInputChange}
                        placeholder="Masukkan tahun"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phasa *
                      </label>
                      <Input
                        name="phasa"
                        value={formData.phasa}
                        onChange={handleInputChange}
                        placeholder="Masukkan phasa"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tap Trafo Max Tap
                      </label>
                      <Input
                        name="tap_trafo_max_tap"
                        value={formData.tap_trafo_max_tap}
                        onChange={handleInputChange}
                        placeholder="Masukkan tap trafo max tap"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Penyulang
                      </label>
                      <Input
                        name="penyulang"
                        value={formData.penyulang}
                        onChange={handleInputChange}
                        placeholder="Masukkan penyulang"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Arah Sequence
                      </label>
                      <Input
                        name="arahSequence"
                        value={formData.arahSequence}
                        onChange={handleInputChange}
                        placeholder="Masukkan arah sequence"
                      />
                    </div>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Latitude
                      </label>
                      <Input
                        name="latitude"
                        type="number"
                        step="any"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        placeholder="Masukkan latitude"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Longitude
                      </label>
                      <Input
                        name="longitude"
                        type="number"
                        step="any"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        placeholder="Masukkan longitude"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({
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
                      longitude: '',
                      idPelanggan: '',
                      nomorTelepon: '',
                      nomorMeter: '',
                      namaPetugas: user?.name || 'Petugas Lapangan'
                    });
                    setPhotos({ rumah: null, meter: null, petugas: null, ba: null });
                    setPhotoPreviews({ rumah: null, meter: null, petugas: null, ba: null });
                  }}
                >
                  Reset
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Menyimpan...' : 'Simpan Gardu'}
                </Button>
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
                {substationsLoading ? (
                  <LoadingSpinner />
                ) : (
                  <div className="space-y-4">
                    {substations.map((substation) => (
                      <div key={substation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
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
                            <div className="mt-2 text-xs text-gray-500">
                              Last Update: {new Date(substation.lastUpdate).toLocaleDateString('id-ID')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
