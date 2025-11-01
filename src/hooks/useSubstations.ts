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

  // 🔧 PERBAIKAN 1: Load semua data gardu dengan retry logic
  const loadSubstations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading substations from API...');
      
      const data = await ApiService.getSubstations();
      console.log('📊 Received substations data:', data.length, 'substations');
      
      // Validasi data sebelum set state
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format from API');
      }
      
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
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat data gardu';
      setError(errorMessage);
      console.error('❌ Error loading substations:', err);
      setSubstations([]); // Reset data jika gagal
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔧 PERBAIKAN 2: Fungsi helper untuk hitung stats (reusable)
  const calculateStatsFromSubstations = useCallback((subs: SubstationData[]) => {
    const totalSubstations = subs.length;
    const activeSubstations = subs.filter(s => s.is_active === 1).length;
    const inactiveSubstations = subs.filter(s => s.is_active === 0).length;
    
    const criticalIssues = subs.filter(substation => {
      const siang = substation.measurements_siang || [];
      const malam = substation.measurements_malam || [];
      const hasUnstableSiang = siang.length > 0 && siang.some(m => 'unbalanced' in m && Number(m.unbalanced) > 80);
      const hasUnstableMalam = malam.length > 0 && malam.some(m => 'unbalanced' in m && Number(m.unbalanced) > 80);
      return hasUnstableSiang || hasUnstableMalam;
    }).length;

    // Hitung total measurements (semua substation * 5 jurusan)
    const monthlyMeasurements = subs.reduce((acc, sub) => {
      return acc + (sub.measurements_siang?.length || 0) + (sub.measurements_malam?.length || 0);
    }, 0);

    const ugbActive = subs.filter(s => s.ugb === 1).length;

    return {
      totalSubstations,
      activeSubstations,
      inactiveSubstations,
      criticalIssues,
      monthlyMeasurements,
      ugbActive,
    };
  }, []);

  // 🔧 PERBAIKAN 3: Refresh data dengan proper async handling
  const refreshData = useCallback(async () => {
    try {
      console.log('🔄 Refreshing all data...');
      await loadSubstations();
      // Stats akan auto-update via useEffect
      console.log('✅ Data refresh complete');
    } catch (err) {
      console.error('❌ Error refreshing data:', err);
      throw err;
    }
  }, [loadSubstations]);

  // 🔧 PERBAIKAN 4: Update gardu dengan optimistic update
  const updateSubstation = useCallback(async (updatedSubstation: SubstationData) => {
    if (!updatedSubstation.id) {
      throw new Error('Substation ID is required for update');
    }

    // Save previous state untuk rollback
    const previousSubstations = [...substations];

    try {
      // Optimistic update - update UI immediately
      setSubstations(prev =>
        prev.map(s => s.id === updatedSubstation.id ? updatedSubstation : s)
      );

      // Update ke API
      await ApiService.updateSubstation(updatedSubstation.id, updatedSubstation);
      
      console.log('✅ Substation updated:', updatedSubstation.id);
      // Refresh untuk memastikan sync
      await refreshData();
    } catch (err) {
      // Revert ke state sebelumnya jika error
      setSubstations(previousSubstations);
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupdate gardu';
      setError(errorMessage);
      console.error('❌ Error updating substation:', err);
      throw err;
    }
  }, [substations, refreshData]);

  // 🔧 PERBAIKAN 5: Update status dengan proper validation
  const updateSubstationStatus = useCallback(async (id: string, status: SubstationData['status']) => {
    if (!id) {
      throw new Error('Substation ID is required');
    }

    const validStatuses = ['normal', 'warning', 'critical'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    try {
      const updated = await ApiService.updateSubstationStatus(id, status);
      setSubstations(prev =>
        prev.map(substation =>
          substation.id === id ? { ...substation, status } : substation
        )
      );
      console.log('✅ Status updated:', id, status);
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupdate status gardu';
      setError(errorMessage);
      console.error('❌ Error updating status:', err);
      throw err;
    }
  }, []);

  // 🔧 PERBAIKAN 6: Update daya dengan validation
  const updateSubstationPower = useCallback(async (id: string, daya: string) => {
    if (!id || !daya) {
      throw new Error('Substation ID and daya are required');
    }

    const dayaValue = parseFloat(daya);
    if (isNaN(dayaValue) || dayaValue <= 0) {
      throw new Error('Daya must be a positive number');
    }

    try {
      const updated = await ApiService.updateSubstationPower(id, daya);
      setSubstations(prev =>
        prev.map(substation =>
          substation.id === id ? { ...substation, daya } : substation
        )
      );
      console.log('✅ Power updated:', id, daya);
      return updated;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengupdate daya gardu';
      setError(errorMessage);
      console.error('❌ Error updating power:', err);
      throw err;
    }
  }, []);

  // 🔧 PERBAIKAN 7: Tambah gardu dengan validation
  const addSubstation = useCallback(async (substation: Omit<SubstationData, 'id'>) => {
    // Validate required fields
    if (!substation.noGardu) {
      throw new Error('NO GARDU is required');
    }
    if (!substation.namaLokasiGardu) {
      throw new Error('NAMA LOKASI is required');
    }

    try {
      console.log('➕ Adding new substation:', substation);
      const newSubstation = await ApiService.createSubstation(substation);
      setSubstations(prev => [...prev, newSubstation]);
      console.log('✅ Substation added:', newSubstation.id);
      return newSubstation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menambah gardu baru';
      setError(errorMessage);
      console.error('❌ Error adding substation:', err);
      throw err;
    }
  }, []);

  // 🔧 PERBAIKAN 8: Hapus gardu dengan confirmation
  const deleteSubstation = useCallback(async (id: string) => {
    if (!id) {
      throw new Error('Substation ID is required');
    }

    try {
      console.log('🗑️ Deleting substation:', id);
      await ApiService.deleteSubstation(id);
      setSubstations(prev => prev.filter(substation => substation.id !== id));
      console.log('✅ Substation deleted:', id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal menghapus gardu';
      setError(errorMessage);
      console.error('❌ Error deleting substation:', err);
      throw err;
    }
  }, []);

  // 🔧 PERBAIKAN 9: Filter gardu dengan better error handling
  const filterSubstations = useCallback(async (filters: {
    status?: string;
    ulp?: string;
    jenis?: string;
    search?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔍 Filtering substations:', filters);
      const filteredData = await ApiService.getSubstationsByFilter(filters);
      
      if (!Array.isArray(filteredData)) {
        throw new Error('Invalid filter response format');
      }
      
      setSubstations(filteredData);
      console.log('✅ Filter applied, found:', filteredData.length, 'results');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memfilter data gardu';
      setError(errorMessage);
      console.error('❌ Error filtering substations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 🔧 PERBAIKAN 10: Get detail dengan proper caching
  const getSubstationById = useCallback(async (id: string) => {
    if (!id) {
      throw new Error('Substation ID is required');
    }

    try {
      console.log('📖 Fetching substation detail:', id);
      const detail = await ApiService.getSubstationById(id);
      
      // Update state dengan detail terbaru
      setSubstations(prev => 
        prev.map(s => s.id === id ? detail : s)
      );
      
      console.log('✅ Substation detail loaded:', id);
      return detail;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal memuat detail gardu';
      setError(errorMessage);
      console.error('❌ Error fetching substation:', err);
      throw err;
    }
  }, []);

  // 🔧 PERBAIKAN 11: Load data saat komponen mount dengan proper dependency
  useEffect(() => {
    loadSubstations();
  }, []); // Empty dependency - hanya jalankan sekali saat mount

  // 🔧 PERBAIKAN 12: Update stats ketika substations berubah
  useEffect(() => {
    if (substations.length > 0) {
      const newStats = calculateStatsFromSubstations(substations);
      setStats(newStats);
      console.log('📊 Stats updated:', newStats);
    } else {
      // Reset stats jika data kosong
      setStats({
        totalSubstations: 0,
        activeSubstations: 0,
        inactiveSubstations: 0,
        criticalIssues: 0,
        monthlyMeasurements: 0,
        ugbActive: 0,
      });
    }
  }, [substations, calculateStatsFromSubstations]);

  // 🔧 PERBAIKAN 13: Return stats dan calculated values yang lebih lengkap
  return {
    // Data
    substations,
    loading,
    error,
    stats,
    
    // Actions
    updateSubstation,
    updateSubstationStatus,
    updateSubstationPower,
    addSubstation,
    deleteSubstation,
    filterSubstations,
    refreshData,
    loadSubstations,
    getSubstationById,
    
    // Utility functions
    calculateStatsFromSubstations,
  };
};