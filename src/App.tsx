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
      <nav className="mb-6 flex gap-4 justify-center">
        <Link to="/">
          <Button variant="primary" size="md" className="flex items-center gap-2">
            <LayoutDashboard size={18} />
            Dashboard
          </Button>
        </Link>
        <Link to="/riwayat-gardu">
          <Button variant="outline" size="md" className="flex items-center gap-2">
            <History size={18} />
            Riwayat
          </Button>
        </Link>
      </nav>
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={
            // ...dashboard utama Anda, misal:
            <>
        {/* User Info & Logout */}
        {isAuthenticated && (
          <div className="mb-6 flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">
                  Login sebagai: <span className="font-semibold">{user?.name || user?.username}</span>
                  {isAdmin && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Admin
                    </span>
                  )}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <StatsCard
            title="Total Gardu"
            value={stats.totalSubstations}
            icon={Activity}
            trend="+2.5%"
            onClick={() => handleStatsCardClick('total')}
            loading={loading}
          />
          <StatsCard
            title="Gardu Aktif"
            value={stats.activeSubstations}
            icon={Zap}
            trend="+1.8%"
            onClick={() => handleStatsCardClick('active')}
            loading={loading}
          />
          <StatsCard
            title="Gardu Non-Aktif"
            value={stats.inactiveSubstations}
            icon={PowerOff}
            trend="-0.5%"
            onClick={() => handleStatsCardClick('non-active')}
            loading={loading}
          />
          <StatsCard
            title="Masalah Kritis"
            value={criticalCount}
            icon={AlertTriangle}
            trend="+0.3%"
            onClick={() => handleStatsCardClick('critical')}
            loading={loading}
          />
          <StatsCard
            title="UGB Aktif"
            value={stats.ugbActive}
            icon={Shield}
            trend="+1.2%"
            onClick={() => handleStatsCardClick('ugb-active')}
            loading={loading}
          />
        </div>

        {/* Voltage Chart */}
        <div className="mb-8">
          <VoltageChart data={substations} />
        </div>

        {/* Simulation Table - Full Width */}
        <div className="mb-8">
          <SubstationSimulationTable data={substations} />
        </div>

        {/* Data Table - Role-based access */}
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
            </>
          } />
          <Route path="/riwayat-gardu" element={<RiwayatGarduPage />} />
        </Routes>
      </main>

      {/* List Modal */}
      <SubstationListModal
        isOpen={selectedModal.isOpen}
        onClose={() => setSelectedModal({ type: null, isOpen: false })}
        substations={substations}
        title={getModalTitle()}
        filter={getModalFilter()}
        page={modalPages[selectedModal.type === 'non-active' ? 'nonActive' : selectedModal.type === 'ugb-active' ? 'ugbActive' : selectedModal.type || 'total']}
        setPage={page => handleSetModalPage(selectedModal.type || 'total', page)}
      />
    </Router>
  );
}

export default App;