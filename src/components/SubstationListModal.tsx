import React, { useState } from 'react';
import { X } from 'lucide-react';
import { SubstationData } from '../types';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface SubstationListModalProps {
  isOpen: boolean;
  onClose: () => void;
  substations: SubstationData[];
  title: string;
  filter?: (substation: SubstationData) => boolean;
  currentPage: number;
  onPageChange: (page: number) => void;
  onUpdateSubstation?: (updatedSubstation: Partial<SubstationData>) => Promise<void>;
}

export const SubstationListModal: React.FC<SubstationListModalProps> = ({
  isOpen,
  onClose,
  substations,
  title,
  filter,
  currentPage,
  onPageChange,
  onUpdateSubstation
}) => {
  const pageSize = 10;
  const [updating, setUpdating] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredSubstations = filter ? substations.filter(filter) : substations;
  const totalPages = Math.ceil(filteredSubstations.length / pageSize);
  const paginatedSubstations = filteredSubstations.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusBadge = (isActive: number) => {
    if (isActive === 1) {
      return <Badge variant="success">Aktif</Badge>;
    } else {
      return <Badge variant="default" className="bg-gray-300 text-gray-700">Nonaktif</Badge>;
    }
  };

  const getUgbbadge = (ugb: number) => {
    if (ugb === 1) {
      return <Badge variant="success">UGB Aktif</Badge>;
    } else {
      return <Badge variant="default" className="bg-gray-300 text-gray-700">UGB Nonaktif</Badge>;
    }
  };

  // 🔧 PERBAIKAN: Handle status toggle
  const handleToggleStatus = async (substation: SubstationData) => {
    if (!onUpdateSubstation) {
      console.warn('onUpdateSubstation callback not provided');
      return;
    }

    try {
      setUpdating(true);
      setUpdatingId(substation.id);
      
      console.log(`🔄 Updating status for ${substation.namaLokasiGardu}...`);
      
      const newActiveStatus = substation.is_active === 1 ? 0 : 1;
      
      await onUpdateSubstation({
        id: substation.id,
        is_active: newActiveStatus,
      });
      
      console.log(`✅ Status updated successfully`);
    } catch (error) {
      console.error('❌ Error updating status:', error);
      alert('Gagal mengupdate status');
    } finally {
      setUpdating(false);
      setUpdatingId(null);
    }
  };

  // 🔧 PERBAIKAN: Handle UGB toggle
  const handleToggleUGB = async (substation: SubstationData) => {
    if (!onUpdateSubstation) {
      console.warn('onUpdateSubstation callback not provided');
      return;
    }

    try {
      setUpdating(true);
      setUpdatingId(substation.id);
      
      console.log(`🔄 Updating UGB for ${substation.namaLokasiGardu}...`);
      
      const newUGBStatus = substation.ugb === 1 ? 0 : 1;
      
      await onUpdateSubstation({
        id: substation.id,
        ugb: newUGBStatus,
      });
      
      console.log(`✅ UGB updated successfully`);
    } catch (error) {
      console.error('❌ Error updating UGB:', error);
      alert('Gagal mengupdate UGB');
    } finally {
      setUpdating(false);
      setUpdatingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 pointer-events-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            disabled={updating}
          >
            <X size={20} />
          </Button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ULP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Lokasi</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Daya</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UGB</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedSubstations.map((substation, idx) => (
                  <tr key={substation.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {(currentPage - 1) * pageSize + idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{substation.ulp}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {substation.namaLokasiGardu}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{substation.daya}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {onUpdateSubstation ? (
                        <button
                          onClick={() => handleToggleStatus(substation)}
                          disabled={updating && updatingId === substation.id}
                          className={`px-3 py-1 rounded text-white text-xs font-medium transition ${
                            substation.is_active === 1
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-gray-500 hover:bg-gray-600'
                          } ${
                            updating && updatingId === substation.id
                              ? 'opacity-50 cursor-not-allowed'
                              : 'cursor-pointer'
                          }`}
                        >
                          {updating && updatingId === substation.id ? '...' : (substation.is_active === 1 ? 'Aktif' : 'Nonaktif')}
                        </button>
                      ) : (
                        getStatusBadge(substation.is_active)
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {onUpdateSubstation ? (
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={substation.ugb === 1}
                            onChange={() => handleToggleUGB(substation)}
                            disabled={updating && updatingId === substation.id}
                            className="w-5 h-5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <span className="text-sm text-gray-600">
                            {substation.ugb === 1 ? 'Aktif' : 'Nonaktif'}
                          </span>
                        </label>
                      ) : (
                        getUgbbadge(substation.ugb)
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || updating}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || updating}
              >
                Selanjutnya
              </Button>
            </div>
          )}
          {filteredSubstations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">Tidak ada gardu yang sesuai dengan kriteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};