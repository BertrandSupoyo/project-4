import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { SubstationData } from '../types';
import { SubstationListModal } from './SubstationListModal';

interface VoltageChartProps {
  data: SubstationData[];
}

export const VoltageChart: React.FC<VoltageChartProps> = ({ data }) => {
  // Group substations by jenis
  const portalSubstations = data.filter(s => s.jenis.toLowerCase() === 'portal');
  const cantolSubstations = data.filter(s => s.jenis.toLowerCase() === 'cantol');
  const betonSubstations = data.filter(s => s.jenis.toLowerCase() === 'beton');
  const kiosSubstations = data.filter(s => s.jenis.toLowerCase() === 'kios');
  const compactSubstations = data.filter(s => s.jenis.toLowerCase() === 'compact');
  const otherJenis = data.filter(s => !['portal','cantol','beton','kios','compact'].includes(s.jenis.toLowerCase()));

  // Hitung total gardu per jenis
  const portalCount = portalSubstations.length;
  const cantolCount = cantolSubstations.length;
  const betonCount = betonSubstations.length;
  const kiosCount = kiosSubstations.length;
  const compactCount = compactSubstations.length;
  const otherCount = otherJenis.length;

  const maxCountTotal = Math.max(portalCount, cantolCount, betonCount, kiosCount, compactCount, otherCount);

  const getBarHeightTotal = (value: number) => {
    return maxCountTotal === 0 ? 0 : (value / maxCountTotal) * 120;
  };

  const [selectedJenis, setSelectedJenis] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPage, setModalPage] = useState(1);

  const handleBarClick = (jenis: string) => {
    setSelectedJenis(jenis);
    setModalPage(1); // Reset ke halaman 1 setiap kali buka modal
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedJenis(null);
    setModalPage(1);
  };

  const getListByJenis = (jenis: string) => {
    if (jenis === 'portal') return portalSubstations;
    if (jenis === 'cantol') return cantolSubstations;
    if (jenis === 'beton') return betonSubstations;
    if (jenis === 'kios') return kiosSubstations;
    if (jenis === 'compact') return compactSubstations;
    return otherJenis;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Total Gardu per Jenis</h3>
            <p className="text-sm text-gray-600">Jumlah gardu berdasarkan jenis</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative h-[220px] px-4">
          <div className="flex items-end justify-center h-full space-x-8">
            {/* Portal */}
            <div className="flex flex-col items-center cursor-pointer" onClick={() => handleBarClick('portal')}>
              <div
                className="bg-blue-500 rounded-t w-12 transition-all duration-300 hover:bg-blue-600"
                style={{ height: `${getBarHeightTotal(portalCount)}px` }}
                title={`Portal: ${portalCount}`}
              />
              <span className="mt-2 text-sm text-gray-700 font-semibold">Portal</span>
              <span className="text-xs text-gray-500">{portalCount}</span>
            </div>
            {/* Cantol */}
            <div className="flex flex-col items-center cursor-pointer" onClick={() => handleBarClick('cantol')}>
              <div
                className="bg-green-500 rounded-t w-12 transition-all duration-300 hover:bg-green-600"
                style={{ height: `${getBarHeightTotal(cantolCount)}px` }}
                title={`Cantol: ${cantolCount}`}
              />
              <span className="mt-2 text-sm text-gray-700 font-semibold">Cantol</span>
              <span className="text-xs text-gray-500">{cantolCount}</span>
            </div>
            {/* Beton */}
            <div className="flex flex-col items-center cursor-pointer" onClick={() => handleBarClick('beton')}>
              <div
                className="bg-orange-400 rounded-t w-12 transition-all duration-300 hover:bg-orange-500"
                style={{ height: `${getBarHeightTotal(betonCount)}px` }}
                title={`Beton: ${betonCount}`}
              />
              <span className="mt-2 text-sm text-gray-700 font-semibold">Beton</span>
              <span className="text-xs text-gray-500">{betonCount}</span>
            </div>
            {/* Kios */}
            <div className="flex flex-col items-center cursor-pointer" onClick={() => handleBarClick('kios')}>
              <div
                className="bg-purple-500 rounded-t w-12 transition-all duration-300 hover:bg-purple-600"
                style={{ height: `${getBarHeightTotal(kiosCount)}px` }}
                title={`Kios: ${kiosCount}`}
              />
              <span className="mt-2 text-sm text-gray-700 font-semibold">Kios</span>
              <span className="text-xs text-gray-500">{kiosCount}</span>
            </div>
            {/* Compact */}
            <div className="flex flex-col items-center cursor-pointer" onClick={() => handleBarClick('compact')}>
              <div
                className="bg-red-500 rounded-t w-12 transition-all duration-300 hover:bg-red-600"
                style={{ height: `${getBarHeightTotal(compactCount)}px` }}
                title={`Compact: ${compactCount}`}
              />
              <span className="mt-2 text-sm text-gray-700 font-semibold">Compact</span>
              <span className="text-xs text-gray-500">{compactCount}</span>
            </div>
            {/* Lainnya */}
            <div className="flex flex-col items-center cursor-pointer" onClick={() => handleBarClick('lainnya')}>
              <div
                className="bg-gray-400 rounded-t w-12 transition-all duration-300 hover:bg-gray-500"
                style={{ height: `${getBarHeightTotal(otherCount)}px` }}
                title={`Lainnya: ${otherCount}`}
              />
              <span className="mt-2 text-sm text-gray-700 font-semibold">Lainnya</span>
              <span className="text-xs text-gray-500">{otherCount}</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200" />
        </div>
        {isModalOpen && selectedJenis && (
          <SubstationListModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            substations={getListByJenis(selectedJenis)}
            title={`Daftar Gardu Jenis ${selectedJenis.charAt(0).toUpperCase() + selectedJenis.slice(1)}`}
            page={modalPage}
            setPage={setModalPage}
          />
        )}
      </CardContent>
    </Card>
  );
};