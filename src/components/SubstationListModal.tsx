import React from 'react';
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
}

export const SubstationListModal: React.FC<SubstationListModalProps> = ({
  isOpen,
  onClose,
  substations,
  title,
  filter,
  currentPage,
  onPageChange
}) => {
  const pageSize = 10;

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4 pointer-events-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl z-10">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
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
                      {getStatusBadge(substation.is_active)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getUgbbadge(substation.ugb)}
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
                disabled={currentPage === 1}
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
                disabled={currentPage === totalPages}
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