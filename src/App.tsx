import { useState, useEffect, useCallback } from 'react';
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
import { Activity, Zap, AlertTriangle, PowerOff, Shield, LogOut, LayoutDashboard, History, Users, Plus, Edit, Trash2 } from 'lucide-react';
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
  
  // User management states
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users'>('dashboard');
  const [users, setUsers] = useState<any[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'viewer',
    name: ''
  });

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

  // User management functions
  const fetchUsers = useCallback(async () => {
    try {
      setUserLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      } else {
        setUserError(data.error || 'Failed to fetch users');
      }
    } catch (err) {
      setUserError('Failed to fetch users');
    } finally {
      setUserLoading(false);
    }
  }, []);

  const createUser = async () => {
    try {
      setUserLoading(true);
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsers([...users, data.user]);
        setNewUser({ username: '', password: '', role: 'viewer', name: '' });
        setShowUserForm(false);
        setUserError(null);
      } else {
        setUserError(data.error || 'Failed to create user');
      }
    } catch (err) {
      setUserError('Failed to create user');
    } finally {
      setUserLoading(false);
    }
  };

  const updateUser = async (userId: string, userData: any) => {
    try {
      setUserLoading(true);
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: userId, ...userData }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(users.map(u => u.id === userId ? data.user : u));
        setEditingUser(null);
        setUserError(null);
      } else {
        setUserError(data.error || 'Failed to update user');
      }
    } catch (err) {
      setUserError('Failed to update user');
    } finally {
      setUserLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setUserLoading(true);
      const response = await fetch(`/api/admin/users?id=${userId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(users.filter(u => u.id !== userId));
        setUserError(null);
      } else {
        setUserError(data.error || 'Failed to delete user');
      }
    } catch (err) {
      setUserError('Failed to delete user');
    } finally {
      setUserLoading(false);
    }
  };

  // Fetch users when switching to users tab
  useEffect(() => {
    if (activeTab === 'users' && isAdmin) {
      fetchUsers();
    }
  }, [activeTab, isAdmin, fetchUsers]);

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
                {isAdmin && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className={`flex items-center px-3 py-1 rounded text-sm font-medium ${
                        activeTab === 'dashboard'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-blue-700'
                      }`}
                    >
                      <LayoutDashboard className="w-4 h-4 mr-1" />
                      Dashboard
                    </button>
                    <button
                      onClick={() => setActiveTab('users')}
                      className={`flex items-center px-3 py-1 rounded text-sm font-medium ${
                        activeTab === 'users'
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-blue-700'
                      }`}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Kelola User
                    </button>
                  </div>
                )}
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
            {/* Admin User Management Tab */}
            {isAdmin && activeTab === 'users' ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">Kelola User</h2>
                  <Button onClick={() => setShowUserForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah User
                  </Button>
                </div>

                {userError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-red-600 text-sm">{userError}</p>
                  </div>
                )}

                {/* User Form Modal */}
                {showUserForm && (
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      {editingUser ? 'Edit User' : 'Tambah User Baru'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Username
                        </label>
                        <input
                          type="text"
                          value={editingUser ? editingUser.username : newUser.username}
                          onChange={(e) => editingUser 
                            ? setEditingUser({...editingUser, username: e.target.value})
                            : setNewUser({...newUser, username: e.target.value})
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Masukkan username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          value={editingUser ? editingUser.name : newUser.name}
                          onChange={(e) => editingUser 
                            ? setEditingUser({...editingUser, name: e.target.value})
                            : setNewUser({...newUser, name: e.target.value})
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Masukkan nama lengkap"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Role
                        </label>
                        <select
                          value={editingUser ? editingUser.role : newUser.role}
                          onChange={(e) => editingUser 
                            ? setEditingUser({...editingUser, role: e.target.value})
                            : setNewUser({...newUser, role: e.target.value})
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="admin">Admin</option>
                          <option value="petugas">Petugas</option>
                          <option value="pekerja">Pekerja</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      </div>
                      {!editingUser && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                          </label>
                          <input
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Masukkan password"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-3">
                      <Button 
                        onClick={editingUser ? () => updateUser(editingUser.id, editingUser) : createUser}
                        disabled={userLoading}
                      >
                        {userLoading ? 'Menyimpan...' : editingUser ? 'Update User' : 'Buat User'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setShowUserForm(false);
                          setEditingUser(null);
                          setNewUser({ username: '', password: '', role: 'viewer', name: '' });
                        }}
                      >
                        Batal
                      </Button>
                    </div>
                  </div>
                )}

                {/* Users Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dibuat</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((user) => (
                          <tr key={user.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                user.role === 'admin' ? 'bg-red-100 text-red-800' : 
                                user.role === 'petugas' ? 'bg-orange-100 text-orange-800' :
                                user.role === 'pekerja' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {user.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => {
                                    setEditingUser(user);
                                    setShowUserForm(true);
                                  }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => deleteUser(user.id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </main>
        } />
      </Routes>
    </Router>
  );
}

export default App;
