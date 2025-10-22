import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Button } from './ui/Button';
import { StatsCard } from './StatsCard';
import { SubstationTable } from './SubstationTable';
import { SubstationDetailModal } from './SubstationDetailModal';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { useSubstations } from '../hooks/useSubstations';
import { 
  Home, 
  LogOut, 
  Eye, 
  MapPin, 
  Activity,
  Users,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface PekerjaDashboardProps {
  user: User;
  onLogout: () => void;
}

export const PekerjaDashboard: React.FC<PekerjaDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'list'>('dashboard');
  const [stats, setStats] = useState({
    totalSubstations: 0,
    normalSubstations: 0,
    criticalIssues: 0,
    recentSubstations: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubstation, setSelectedSubstation] = useState<any>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { 
    substations, 
    loading: substationsLoading, 
    error: substationsError,
    refreshData 
  } = useSubstations();

  // Fetch dashboard stats
  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        setError(data.error || 'Failed to load stats');
      }
    } catch (err) {
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleViewDetails = (substation: any) => {
    setSelectedSubstation(substation);
    setIsDetailOpen(true);
  };

  const handleCloseDetail = () => {
    setIsDetailOpen(false);
    setSelectedSubstation(null);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      normal: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      warning: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
      critical: { color: 'bg-red-100 text-red-800', icon: AlertTriangle },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.normal;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 md:py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Dashboard Pekerja
                </h1>
                <p className="text-sm md:text-base text-gray-600">
                  Selamat datang, {user.name || user.username}
                </p>
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="px-3 py-2 text-sm md:px-4 md:py-2 md:text-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-2 overflow-x-auto whitespace-nowrap no-scrollbar">
            <Button
              onClick={() => setActiveTab('dashboard')}
              variant={activeTab === 'dashboard' ? 'primary' : 'outline'}
              className="px-3 py-2 text-sm md:px-4 md:py-2 md:text-sm"
            >
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button
              onClick={() => setActiveTab('list')}
              variant={activeTab === 'list' ? 'primary' : 'outline'}
              className="px-3 py-2 text-sm md:px-4 md:py-2 md:text-sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              List Gardu
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <StatsCard
                title="Total Gardu"
                value={stats.totalSubstations}
                icon={MapPin}
                color="blue"
              />
              <StatsCard
                title="Gardu Normal"
                value={stats.normalSubstations}
                icon={CheckCircle}
                color="green"
              />
              <StatsCard
                title="Masalah Kritis"
                value={stats.criticalIssues}
                icon={AlertTriangle}
                color="red"
              />
              <StatsCard
                title="Status Sistem"
                value="Aktif"
                icon={Activity}
                color="green"
              />
            </div>

            {/* Recent Substations */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Gardu Terbaru</h3>
              </CardHeader>
              <CardContent>
                {stats.recentSubstations.length > 0 ? (
                  <div className="space-y-3">
                    {stats.recentSubstations.map((substation: any) => (
                      <div
                        key={substation.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleViewDetails(substation)}
                      >
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">
                            {substation.namaLokasiGardu}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {substation.ulp} - {substation.noGardu}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(substation.status)}
                          <Eye className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Tidak ada data gardu</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* List Tab */}
        {activeTab === 'list' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900">Daftar Gardu</h3>
                <p className="text-sm text-gray-600">
                  Klik "Lihat Detail" untuk melihat informasi lengkap gardu
                </p>
              </CardHeader>
              <CardContent>
                {substationsLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : substationsError ? (
                  <ErrorMessage message={substationsError} />
                ) : (
                  <SubstationTable
                    substations={substations}
                    onViewDetails={handleViewDetails}
                    onUpdateSubstation={async () => {}} // Pekerja tidak bisa update
                    onAddSubstation={async () => {}} // Pekerja tidak bisa add
                    onFetchSubstationDetail={async (id: string) => {
                      const response = await fetch(`/api/substations/${id}`);
                      const data = await response.json();
                      return data.success ? data.data : null;
                    }}
                    isAdmin={false}
                    showActions={false} // Hanya tampilkan tombol "Lihat Detail"
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailOpen && selectedSubstation && (
        <SubstationDetailModal
          substation={selectedSubstation}
          onClose={handleCloseDetail}
          onUpdateSubstation={async () => {}} // Pekerja tidak bisa update
          isAdmin={false}
        />
      )}
    </div>
  );
};
