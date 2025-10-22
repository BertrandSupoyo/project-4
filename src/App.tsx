import { useState } from 'react';
import { Header } from './components/Header';
import { StatsCard } from './components/StatsCard';
import { VoltageChart } from './components/VoltageChart';
import { SubstationTable } from './components/SubstationTable';
import { SubstationSimulationTable } from './components/SubstationSimulationTable';
import { SubstationListModal } from './components/SubstationListModal';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { AdminLogin } from './components/AdminLogin';
import { PetugasDashboard } from './components/PetugasDashboard';
import { PekerjaDashboard } from './components/PekerjaDashboard';
import { Activity, Zap, AlertTriangle, PowerOff, Shield, LogOut, LayoutDashboard, History } from 'lucide-react';
import { useSubstations } from './hooks/useSubstations';
import { useAuth } from './hooks/useAuth';
import { SubstationData } from './types';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import RiwayatGarduPage from './pages/RiwayatGarduPage';
import { Button } from './components/ui/Button';

function App() {
  const {
    substations,
    loading,
    error,
    stats,
    updateSubstation,
    refreshData,
    addSubstation,
    getSubstationById
  } = useSubstations();

  const { user, isAuthenticated, loading: authLoading, login, loginViewer, logout } = useAuth();

  const [selectedModal, setSelectedModal] = useState<{
    type: 'total' | 'active' | 'non-active' | 'critical' | 'ugb-active' | null;
    isOpen: boolean;
  }>({
    type: null,
    isOpen: false
  });

  const [modalPages, setModalPages] = useState({
    total: 1,
    active: 1,
    nonActive: 1,
    critical: 1,
    ugbActive: 1,
  });

  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  const handleUpdateSubstation = async (updatedSubstation: Partial<SubstationData>) => {
    try {
      if (!updatedSubstation.id) return;
      console.log('🔄 Updating substation in App.tsx:', updatedSubstation.id, updatedSubstation);
      await updateSubstation(updatedSubstation as SubstationData);
      console.log('✅ Substation updated, refreshing data...');
      await refreshData();
      console.log('✅ Data refreshed successfully');
    } catch (error) {
      console.error('❌ Failed to update substation:', error);
    }
  };

  const handleAddSubstation = async (sub: Omit<SubstationData, 'id'>) => {
    await addSubstation(sub);
    await refreshData();
  };

  const handleStatsCardClick = (type: 'total' | 'active' | 'non-active' | 'critical' | 'ugb-active') => {
    setSelectedModal({
      type,
      isOpen: true
    });
  };

  // Tambahkan fungsi untuk set page per tipe
  const handleSetModalPage = (type: 'total' | 'active' | 'non-active' | 'critical' | 'ugb-active', page: number) => {
    setModalPages(prev => ({ 
      ...prev, 
      [type === 'non-active' ? 'nonActive' : type === 'ugb-active' ? 'ugbActive' : type]: page 
    }));
  };

  const getModalTitle = () => {
    switch (selectedModal.type) {
      case 'total':
        return 'Daftar Semua Gardu';
      case 'active':
        return 'Daftar Gardu Aktif';
      case 'non-active':
        return 'Daftar Gardu Non-Aktif';
      case 'critical':
        return 'Daftar Gardu dengan Masalah Kritis';
      case 'ugb-active':
        return 'Daftar Gardu UGB Aktif';
      default:
        return '';
    }
  };

  const getModalFilter = () => {
    switch (selectedModal.type) {
      case 'total':
        return undefined;
      case 'active':
        return (substation: SubstationData) => substation.is_active === 1;
      case 'non-active':
        return (substation: SubstationData) => substation.is_active === 0;
      case 'critical':
        return (substation: SubstationData) => {
          const siang = substation.measurements_siang || [];
          const malam = substation.measurements_malam || [];
          const hasUnstableSiang = siang.length > 0 && siang.some(m => 'unbalanced' in m && Number(m.unbalanced) > 80);
          const hasUnstableMalam = malam.length > 0 && malam.some(m => 'unbalanced' in m && Number(m.unbalanced) > 80);
          return hasUnstableSiang || hasUnstableMalam;
        };
      case 'ugb-active':
        return (substation: SubstationData) => substation.ugb === 1;
      default:
        return undefined;
    }
  };

  const handleAdminLogin = async (username: string, password: string) => {
    setLoginLoading(true);
    setLoginError(null);
    
    const result = await login(username, password);
    
    if (!result.success) {
      setLoginError(result.error || 'Login gagal');
    }
    
    setLoginLoading(false);
  };

  const handleViewerLogin = () => {
    loginViewer();
  };


  const handleLogout = () => {
    logout();
  };

  // Show login if not authenticated
  if (!isAuthenticated && !authLoading) {
    return (
      <AdminLogin 
        onLogin={handleAdminLogin}
        onViewerLogin={handleViewerLogin}
        loading={loginLoading}
        error={loginError || undefined}
      />
    );
  }

  // Show petugas dashboard if user is petugas
  if (user?.role === 'petugas') {
    return <PetugasDashboard user={user} onLogout={handleLogout} />;
  }

  // Show pekerja dashboard if user is pekerja
  if (user?.role === 'pekerja') {
    return <PekerjaDashboard user={user} onLogout={handleLogout} />;
  }

  // Tampilkan loading spinner jika sedang memuat data
  if (loading && substations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" text="Memuat data gardu distribusi..." />
        </main>
      </div>
    );
  }

  // Tampilkan error message jika terjadi error
  if (error && substations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <ErrorMessage 
            message={error} 
            onRetry={refreshData}
          />
        </main>
      </div>
    );
  }

  // Check if user is admin
  const isAdmin = user?.role === 'admin';
  console.log('isAdmin:', isAdmin, 'user:', user); // DEBUG LOG

  // Hitung jumlah gardu kritis (unbalance > 80%)
  const criticalCount = substations.filter(substation => {
    const siang = substation.measurements_siang || [];
    const malam = substation.measurements_malam || [];
    const hasUnstableSiang = siang.length > 0 && siang.some(m => 'unbalanced' in m && Number(m.unbalanced) > 80);
    const hasUnstableMalam = malam.length > 0 && malam.some(m => 'unbalanced' in m && Number(m.unbalanced) > 80);
    return hasUnstableSiang || hasUnstableMalam;
  }).length;

  return (
    <Router>
      <Header />
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-600">
                <Shield className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">
                  {user?.role === 'admin' ? 'Administrator' : user?.role === 'viewer' ? 'Viewer' : user?.role === 'pekerja' ? 'Pekerja' : 'User'}
                </span>
              </div>
              <div className="flex space-x-4">
                <Link 
                  to="/"
                  className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <LayoutDashboard className="w-4 h-4 mr-1" />
                  Dashboard
                </Link>
                <Link 
                  to="/riwayat"
                  className="flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  <History className="w-4 h-4 mr-1" />
                  Riwayat Gardu
                </Link>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <Routes>
        <Route path="/riwayat" element={<RiwayatGarduPage />} />
        <Route path="/" element={
          <main className="container mx-auto px-4 py-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <StatsCard
                title="Total Gardu"
                value={stats.totalSubstations}
                icon={Activity}
                color="blue"
                trend="+2.5%"
                onClick={() => handleStatsCardClick('total')}
              />
              <StatsCard
                title="Gardu Aktif"
                value={stats.activeSubstations}
                icon={Zap}
                color="green"
                trend="+1.2%"
                onClick={() => handleStatsCardClick('active')}
              />
              <StatsCard
                title="Gardu Non-Aktif"
                value={stats.totalSubstations - stats.activeSubstations}
                icon={PowerOff}
                color="gray"
                trend="-0.8%"
                onClick={() => handleStatsCardClick('non-active')}
              />
              <StatsCard
                title="Issue Kritis"
                value={criticalCount}
                icon={AlertTriangle}
                color="red"
                trend="-5.2%"
                onClick={() => handleStatsCardClick('critical')}
              />
              <StatsCard
                title="UGB Aktif"
                value={stats.ugbActive}
                icon={Shield}
                color="purple"
                trend="+3.1%"
                onClick={() => handleStatsCardClick('ugb-active')}
              />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <VoltageChart data={substations} />
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Status Distribusi</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Gardu Normal</span>
                    <span className="font-semibold text-green-600">
                      {substations.filter(s => s.status === 'normal').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Gardu Warning</span>
                    <span className="font-semibold text-yellow-600">
                      {substations.filter(s => s.status === 'warning').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Gardu Critical</span>
                    <span className="font-semibold text-red-600">
                      {substations.filter(s => s.status === 'critical').length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Substation Table */}
            <SubstationTable
              data={substations}
              onUpdateSubstation={isAdmin ? handleUpdateSubstation : async () => {}} // Only admin can update
              loading={loading}
              onAddSubstation={isAdmin ? handleAddSubstation : async () => {}} // Only admin can add
              isReadOnly={!isAdmin} // Pass read-only flag
              currentUser={user ? { role: user.role } : undefined} // Kirim hanya role, undefined jika null
              adminToken={'admin_token'} // Tambahkan ini, ganti jika pakai JWT
              onFetchSubstationDetail={async (id: string) => { await getSubstationById(id); }}
            />

            {/* Simulation Table - hanya tampil jika admin */}
            {isAdmin && (
              <div className="mt-8">
                <SubstationSimulationTable data={substations} />
              </div>
            )}

            {/* Modal for displaying substation lists */}
            <SubstationListModal
              isOpen={selectedModal.isOpen}
              onClose={() => setSelectedModal({ type: null, isOpen: false })}
              title={getModalTitle()}
              substations={substations}
              filter={getModalFilter()}
              currentPage={modalPages[selectedModal.type === 'non-active' ? 'nonActive' : selectedModal.type === 'ugb-active' ? 'ugbActive' : selectedModal.type || 'total']}
              onPageChange={(page) => handleSetModalPage(selectedModal.type!, page)}
            />
          </main>
        } />
      </Routes>
    </Router>
  );
}

export default App;
