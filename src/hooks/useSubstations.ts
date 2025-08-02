import { useState, useEffect, useCallback } from 'react';
import { SubstationData } from '../types';
import { ApiService } from '../services/api';

export const useSubstations = () => {
  const [substations, setSubstations] = useState<SubstationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalSubstations: 0,
    activeSubstations: 0,
    inactiveSubstations: 0,
    criticalIssues: 0,
    monthlyMeasurements: 0,
    ugbActive: 0,
  });

  // Load semua data gardu
  const loadSubstations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading substations from API...');
      const data = await ApiService.getSubstations();
      console.log('📊 Received substations data:', data.length, 'substations');
      
      // Debug: Log measurements data for first few substations
      data.slice(0, 3).forEach((sub, index) => {
        console.log(`📋 Substation ${index + 1} (${sub.noGardu}):`, {
          id: sub.id,
          siang_count: sub.measurements_siang?.length || 0,
          malam_count: sub.measurements_malam?.length || 0,
          siang_data: sub.measurements_siang?.slice(0, 2) || [],
          malam_data: sub.measurements_malam?.slice(0, 2) || []
        });
      });
      
      setSubstations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat data gardu');
      console.error('❌ Error loading substations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load statistik dashboard
  const loadStats = useCallback(async () => {
    try {
      const data = await ApiService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error loading stats:', err);
      // Fallback ke perhitungan manual jika API gagal
      setStats({
        totalSubstations: substations.length,
        activeSubstations: substations.filter(s => s.is_active === 1).length,
        inactiveSubstations: substations.filter(s => s.is_active === 0).length,
        criticalIssues: substations.filter(s => {
          const siang = s.measurements_siang || [];
          const malam = s.measurements_malam || [];
          const hasUnstableSiang = siang.length > 0 && siang.some(m => 'unbalanced' in m && Number(m.unbalanced) > 80);
          const hasUnstableMalam = malam.length > 0 && malam.some(m => 'unbalanced' in m && Number(m.unbalanced) > 80);
          return hasUnstableSiang || hasUnstableMalam;
        }).length,
        monthlyMeasurements: substations.length * 5,
        ugbActive: substations.filter(s => s.ugb === 1).length,
      });
    }
  }, [substations.length]);

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadSubstations();
    await loadStats();
  }, [loadSubstations, loadStats]);

  // Update gardu
  const updateSubstation = useCallback(async (updatedSubstation: SubstationData) => {
    try {
      await ApiService.updateSubstation(updatedSubstation.id, updatedSubstation);
      // Setelah update berhasil, panggil refreshData untuk sinkronisasi
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengupdate gardu');
      throw err;
    }
  }, [refreshData]);

  // Update status gardu
  const updateSubstationStatus = useCallback(async (id: string, status: SubstationData['status']) => {
    try {
      const updated = await ApiService.updateSubstationStatus(id, status);
      setSubstations(prev => 
        prev.map(substation => 
          substation.id === id ? updated : substation
        )
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengupdate status gardu');
      throw err;
    }
  }, []);

  // Update daya gardu
  const updateSubstationPower = useCallback(async (id: string, daya: string) => {
    try {
      const updated = await ApiService.updateSubstationPower(id, daya);
      setSubstations(prev => 
        prev.map(substation => 
          substation.id === id ? updated : substation
        )
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengupdate daya gardu');
      throw err;
    }
  }, []);

  // Tambah gardu baru
  const addSubstation = useCallback(async (substation: Omit<SubstationData, 'id'>) => {
    try {
      const newSubstation = await ApiService.createSubstation(substation);
      setSubstations(prev => [...prev, newSubstation]);
      return newSubstation;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menambah gardu baru');
      console.error('Error addSubstation:', err);
      throw err;
    }
  }, []);

  // Hapus gardu
  const deleteSubstation = useCallback(async (id: string) => {
    try {
      await ApiService.deleteSubstation(id);
      setSubstations(prev => prev.filter(substation => substation.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menghapus gardu');
      throw err;
    }
  }, []);

  // Filter gardu
  const filterSubstations = useCallback(async (filters: {
    status?: string;
    ulp?: string;
    jenis?: string;
    search?: string;
  }) => {
    try {
      setLoading(true);
      const filteredData = await ApiService.getSubstationsByFilter(filters);
      setSubstations(filteredData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memfilter data gardu');
      console.error('Error filtering substations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch detail substation by id dan update state substations
  const getSubstationById = useCallback(async (id: string) => {
    try {
      const detail = await ApiService.getSubstationById(id);
      setSubstations(prev => prev.map(s => s.id === id ? detail : s));
      return detail;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat detail gardu');
      throw err;
    }
  }, []);

  // Load data saat komponen mount
  useEffect(() => {
    loadSubstations();
  }, [loadSubstations]);

  // Update stats ketika data berubah
  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    substations,
    loading,
    error,
    stats,
    updateSubstation,
    updateSubstationStatus,
    updateSubstationPower,
    addSubstation,
    deleteSubstation,
    filterSubstations,
    refreshData,
    loadSubstations,
    getSubstationById, // expose fungsi baru
  };
}; 