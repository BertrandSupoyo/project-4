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
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { SessionWarningDialog } from './components/SessionWarningDialog';
import { SessionTimeoutNotification } from './components/SessionTimeoutNotification';
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

  // 🔧 TAMBAH PROPERTY BARU UNTUK SESSION
  const { 
    user, 
    isAuthenticated, 
    loading: authLoading, 
    login, 
    loginViewer, 
    loginPetugas, 
    logout,
    sessionTimeRemaining,
    showSessionWarning,
    extendSession,
  } = useAuth();

  const [selectedModal, setSelectedModal] = useState<{
    type: 'total' | 'active' | 'non-active' | 'critical' | 'ugb-active' | 'normal' | 'warning' | null;
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
    normal: 1,
    warning: 1,
  });

  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);

  // 🔧 HANDLER UNTUK EXTEND SESSION
  const handleExtendSession = () => {
    extendSession();
  };

  // 🔧 PERBAIKAN: Handle update dengan auto refresh
  const handleUpdateSubstation = async (updatedSubstation: Partial<SubstationData>) => {
    try {
      if (!updatedSubstation.id) return;
      console.log('🔄 Updating substation in App.tsx:', updatedSubstation.id, updatedSubstation);
      await updateSubstation(updatedSubstation as SubstationData);
      console.log('✅ Substation updated, refreshing data...');
      
      await refreshData();
      console.log('✅ Data refreshed successfully');
      
      setSelectedModal({ type: null, isOpen: false });
      resetModalPages();
    } catch (error) {
      console.error('❌ Failed to update substation:', error);
    }
  };

  const handleAddSubstation = async (sub: Omit<SubstationData, 'id'>) => {
    try {
      await addSubstation(sub);
      await refreshData();
      console.log('✅ Substation added and data refreshed');
    } catch (error) {
      console.error('❌ Failed to add substation:', error);
    }
  };

  // 🔧 PERBAIKAN: Reset modal pages
  const resetModalPages = () => {
    setModalPages({
      total: 1,
      active: 1,
      nonActive: 1,
      critical: 1,
      ugbActive: 1,
      normal: 1,
      warning: 1,
    });
  };

  const handleStatsCardClick = (type: 'total' | 'active' | 'non-active' | 'critical' | 'ugb-active' | 'normal' | 'warning') => {
    setSelectedModal({
      type,
      isOpen: true
    });
  };

  const handleSetModalPage = (type: 'total' | 'active' | 'non-active' | 'critical' | 'ugb-active' | 'normal' | 'warning', page: number) => {
    setModalPages(prev => ({ 
      ...prev, 
      [type === 'non-active' ? 'nonActive' : type === 'ugb-active' ? 'ugbActive' : type]: page 
    }));
  };

  // 🔧 PERBAIKAN: Close modal dengan cleanup
  const handleCloseModal = () => {
    setSelectedModal({ type: null, isOpen: false });
    resetModalPages();
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
      case 'normal':
        return 'Daftar Gardu Normal';
      case 'warning':
        return 'Daftar Gardu Warning';
      default:
        return '';
    }
  };

  // 🔧 PERBAIKAN: Fixed getModalFilter dengan error handling dan critical logic fix
  const getModalFilter = () => {
    switch (selectedModal.type) {
      case 'total':
        return undefined;
      
      case 'active':
        return (substation: SubstationData) => {
          try {
            if (!substation) return false;
            return substation?.is_active === 1;
          } catch (e) {
            console.error('Error in active filter:', e);
            return false;
          }
        };
      
      case 'non-active':
        return (substation: SubstationData) => {
          try {
            if (!substation) return false;
            return substation?.is_active === 0;
          } catch (e) {
            console.error('Error in non-active filter:', e);
            return false;
          }
        };
      
      case 'critical':
        return (substation: SubstationData) => {
          try {
            if (!substation) return false;
            // Cek berdasarkan unbalanced > 80% (siang atau malam)
            const siang = substation.measurements_siang || [];
            const malam = substation.measurements_malam || [];
            const hasCriticalSiang = siang.some(m => m.unbalanced !== null && m.unbalanced !== undefined && Number(m.unbalanced) > 80);
            const hasCriticalMalam = malam.some(m => m.unbalanced !== null && m.unbalanced !== undefined && Number(m.unbalanced) > 80);
            return hasCriticalSiang || hasCriticalMalam;
          } catch (e) {
            console.error('Error in critical filter:', e);
            return false;
          }
        };
      
      case 'ugb-active':
        return (substation: SubstationData) => {
          try {
            if (!substation) return false;
            return substation?.ugb === 1;
          } catch (e) {
            console.error('Error in ugb-active filter:', e);
            return false;
          }
        };
      
      case 'normal':
        return (substation: SubstationData) => {
          try {
            if (!substation) return false;
            return substation?.status === 'normal';
          } catch (e) {
            console.error('Error in normal filter:', e);
            return false;
          }
        };
      
      case 'warning':
        return (substation: SubstationData) => {
          try {
            if (!substation) return false;
            return substation?.status === 'warning';
          } catch (e) {
            console.error('Error in warning filter:', e);
            return false;
          }
        };
      
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

  const handlePetugasLogin = () => {
    loginPetugas();
  };

  const handleLogout = () => {
    logout();
  };

  // Show login if not authenticated
  if (!isAuthenticated && !authLoading) {
    return (
      <>
        <SessionTimeoutNotification />
        <AdminLogin 
          onLogin={handleAdminLogin}
          onViewerLogin={handleViewerLogin}
          onPetugasLogin={handlePetugasLogin}
          loading={loginLoading}
          error={loginError || undefined}
        />
      </>
    );
  }

  // Show petugas dashboard if user is petugas
  if (user?.role === 'petugas') {
    return (
      <>
        <SessionWarningDialog
          isOpen={showSessionWarning}
          timeRemaining={sessionTimeRemaining}
          onExtend={handleExtendSession}
          onLogout={handleLogout}
        />
        <PetugasDashboard user={user} onLogout={handleLogout} />
      </>
    );
  }

  // Show super admin dashboard if user is superadmin
  if (user?.role === 'superadmin') {
    return (
      <>
        <SessionWarningDialog
          isOpen={showSessionWarning}
          timeRemaining={sessionTimeRemaining}
          onExtend={handleExtendSession}
          onLogout={handleLogout}
        />
        <SuperAdminDashboard
          onLogout={handleLogout}
          stats={stats}
        />
      </>
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
  console.log('isAdmin:', isAdmin, 'user:', user);

  return (
    <>
      {/* 🔧 TAMBAH SESSION WARNING DIALOG */}
      <SessionWarningDialog
        isOpen={showSessionWarning}
        timeRemaining={sessionTimeRemaining}
        onExtend={handleExtendSession}
        onLogout={handleLogout}
      />

      {/* 🔧 TAMBAH SESSION TIMEOUT NOTIFICATION */}
      <SessionTimeoutNotification />

      <Router>
        <Header />
        <div className="bg-white shadow-sm border-b">
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex flex-col gap-3 sm:gap-0 sm:flex-row sm:justify-between sm:items-center">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-4">
                <div className="flex items-center text-gray-600">
                  <Shield className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="text-xs sm:text-sm font-medium">
                    {user?.role === 'admin' ? 'Administrator' : user?.role === 'viewer' ? 'Viewer' : 'User'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-4">
                  <Link 
                    to="/"
                    className="flex items-center text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-1" />
                    Dashboard
                  </Link>
                  <Link 
                    to="/riwayat"
                    className="flex items-center text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium"
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
                className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto justify-center"
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
              {/* Stats Cards - ✅ TERHUBUNG KE DATABASE REAL-TIME */}
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
                  value={stats.inactiveSubstations}
                  icon={PowerOff}
                  color="gray"
                  trend="-0.8%"
                  onClick={() => handleStatsCardClick('non-active')}
                />
                <StatsCard
                  title="Issue Kritis"
                  value={stats.criticalIssues}
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
                    <div 
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                      onClick={() => handleStatsCardClick('normal')}
                    >
                      <span className="text-gray-600">Gardu Normal</span>
                      <span className="font-semibold text-green-600">
                        {substations.filter(s => s.status === 'normal').length}
                      </span>
                    </div>
                    <div 
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                      onClick={() => handleStatsCardClick('warning')}
                    >
                      <span className="text-gray-600">Gardu Warning</span>
                      <span className="font-semibold text-yellow-600">
                        {substations.filter(s => s.status === 'warning').length}
                      </span>
                    </div>
                    <div 
                      className="flex justify-between items-center cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors"
                      onClick={() => handleStatsCardClick('critical')}
                    >
                      <span className="text-gray-600">Gardu Critical</span>
                      <span className="font-semibold text-red-600">
                        {substations.filter(s => {
                          // Gunakan logika yang sama dengan filter critical
                          const siang = s.measurements_siang || [];
                          const malam = s.measurements_malam || [];
                          const hasCriticalSiang = siang.some(m => m.unbalanced !== null && m.unbalanced !== undefined && Number(m.unbalanced) > 80);
                          const hasCriticalMalam = malam.some(m => m.unbalanced !== null && m.unbalanced !== undefined && Number(m.unbalanced) > 80);
                          return hasCriticalSiang || hasCriticalMalam;
                        }).length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Substation Table */}
              <SubstationTable
                data={substations}
                onUpdateSubstation={isAdmin ? handleUpdateSubstation : async () => {}}
                loading={loading}
                onAddSubstation={isAdmin ? handleAddSubstation : async () => {}}
                isReadOnly={!isAdmin}
                currentUser={user ? { role: user.role } : undefined}
                adminToken={'admin_token'}
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
                onClose={handleCloseModal}
                title={getModalTitle()}
                substations={substations}
                filter={getModalFilter()}
                currentPage={modalPages[
                  selectedModal.type === 'non-active' ? 'nonActive' 
                  : selectedModal.type === 'ugb-active' ? 'ugbActive' 
                  : selectedModal.type || 'total'
                ]}
                onPageChange={(page) => handleSetModalPage(selectedModal.type!, page)}
                onUpdateSubstation={handleUpdateSubstation}
              />
            </main>
          } />
        </Routes>
      </Router>
    </>
  );
}

export default App;