import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { SubstationData } from '../types';
import { Calculator, X } from 'lucide-react';

interface SubstationSimulationTableProps {
  data: SubstationData[];
}

interface MeasurementData {
  r: number;
  s: number;
  t: number;
  n: number;
  rn: number;
  sn: number;
  tn: number;
  pp: number;
  pn: number;
}

interface LoadData {
  dayRata2: number;
  dayKva: number;
  dayPercent: number;
  nightRata2: number;
  nightKva: number;
  nightPercent: number;
  unbalancedSiang: number;
  unbalancedMalam: number;
}

const initialMeasurement = { r: 0, s: 0, t: 0, n: 0, rn: 0, sn: 0, tn: 0, pp: 0, pn: 0 };

export const SubstationSimulationTable: React.FC<SubstationSimulationTableProps> = ({ data }) => {
  // Initialize simulation data with the latest measurements
  const [daySimulationData, setDaySimulationData] = useState<MeasurementData[]>(() => {
    const initialDayData: MeasurementData[] = new Array(5).fill(null).map(() => ({ ...initialMeasurement }));
    return initialDayData;
  });
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [calculatedLoadData, setCalculatedLoadData] = useState<LoadData[]>([]);

  // Tambahkan state untuk input simulasi
  const [simRows, setSimRows] = useState([
    { 
      daya: '', 
      tegangan: '', 
      jumlahPermohonan: '', 
      dayaRequest: '', 
      r: '', 
      s: '', 
      t: '' 
    }
  ]);

  const handleMeasurementChange = (rowIndex: number, field: keyof MeasurementData, value: string) => {
    const numValue = parseFloat(value) || 0;
    setDaySimulationData(prev =>
      prev.map((row, index) =>
        index === rowIndex ? { ...row, [field]: numValue } : row
      )
    );
  };

  // Fungsi perhitungan sesuai rumus user
  const getCalc = (row: typeof simRows[0]) => {
    const daya = parseFloat(row.daya) || 0;
    const teg = parseFloat(row.tegangan) || 0;
    const jumlah = parseFloat(row.jumlahPermohonan) || 0;
    const dayaReq = parseFloat(row.dayaRequest) || 0;
    const r = parseFloat(row.r) || 0;
    const s = parseFloat(row.s) || 0;
    const t = parseFloat(row.t) || 0;
    const fasa = 1.73; // Nilai tetap

    // 1. I Nominal = (Daya * 1000) / (Tegangan * 1.73)
    const iNominal = teg && daya ? (daya * 1000) / (teg * fasa) : 0;

    // 2. I Rata-rata = (R + S + T) / 3
    const iRata = (r + s + t) / 3;

    // 3. % Trafo = (I Rata-rata / I Nominal) * 100
    const persenTrafo = iNominal ? (iRata / iNominal) * 100 : 0;

    // 4. Total AMP = (Jumlah Permohonan * Daya Request) / 220
    const totalAmp = (jumlah * dayaReq) / 220;

    // 5. AMP per fasa = Total AMP / 3
    const ampPerFasa = totalAmp / 3;

    // 6. Proyeksi % Trafo = ((I Rata-rata + AMP per fasa) / I Nominal) * 100
    const proyeksiTrafo = iNominal ? ((iRata + ampPerFasa) / iNominal) * 100 : 0;

    return {
      iNominal,
      iRata,
      persenTrafo,
      totalAmp,
      ampPerFasa,
      proyeksiTrafo,
    };
  };

  // Handler input
  const handleSimInput = (rowIdx: number, field: string, value: string) => {
    setSimRows(prev => prev.map((row, idx) => idx === rowIdx ? { ...row, [field]: value } : row));
  };

  const calculateAllMeasurements = () => {
    // Existing measurement calculations
    setDaySimulationData(prev =>
      prev.map(row => {
        const rn = row.r - row.n;
        const sn = row.s - row.n;
        const tn = row.t - row.n;
        const pp = Math.max(row.r, row.s, row.t) - Math.min(row.r, row.s, row.t);
        const pn = (row.r + row.s + row.t) / 3 - row.n;

        return {
          ...row,
          rn,
          sn,
          tn,
          pp,
          pn
        };
      })
    );

    // Calculate Load Data
    const newLoadData: LoadData[] = new Array(5).fill(null).map((_, index) => {
      const dayMeas = daySimulationData[index];
      const currentSubstationData = data[0]; // Assuming substation.daya is only relevant for the INDUK row.

      const dayRata2 = (dayMeas.r + dayMeas.s + dayMeas.t) / 3;
      const dayKva = (dayMeas.r * dayMeas.rn + dayMeas.s * dayMeas.sn + dayMeas.t * dayMeas.tn) / 1000;
      const dayPercent = index === 0 && currentSubstationData?.daya ? (dayKva / parseFloat(currentSubstationData.daya)) * 100 : 0;
      const avgDayCurrent = (dayMeas.r + dayMeas.s + dayMeas.t) / 3;
      const unbalancedSiang = avgDayCurrent ? ((Math.max(dayMeas.r, dayMeas.s, dayMeas.t) - avgDayCurrent) / avgDayCurrent) * 100 : 0;

      return {
        dayRata2: parseFloat(dayRata2.toFixed(2)),
        dayKva: parseFloat(dayKva.toFixed(2)),
        dayPercent: parseFloat(dayPercent.toFixed(2)),
        nightRata2: 0,
        nightKva: 0,
        nightPercent: 0,
        unbalancedSiang: parseFloat(unbalancedSiang.toFixed(2)),
        unbalancedMalam: 0
      };
    });

    setCalculatedLoadData(newLoadData);
    setShowLoadModal(true); // Open the modal after calculations
  };

  // Helper untuk cek apakah baris input kosong
  const isRowFilled = (row: typeof simRows[0]) => {
    return Object.values(row).some(val => val && val !== '' && !isNaN(Number(val)) && Number(val) !== 0);
  };

  // Helper untuk status kapasitas
  const getKapasitasStatus = (persen: number) => {
    if (persen > 80) return { label: 'Overload', color: 'bg-red-500', text: 'text-red-700' };
    if (persen < 30) return { label: 'Under Volt', color: 'bg-yellow-400', text: 'text-yellow-800' };
    return { label: 'Normal', color: 'bg-green-500', text: 'text-green-800' };
  };

  // Fungsi untuk menghitung hasil simulasi
  const calculateResults = (row: typeof simRows[0]) => {
    const iNominal = (parseFloat(row.daya) * 1000) / (parseFloat(row.tegangan) * 1.73);
    const iRataRata = (parseFloat(row.r) + parseFloat(row.s) + parseFloat(row.t)) / 3;
    const persenTrafo = (iRataRata / iNominal) * 100;
    const totalAmp = (parseFloat(row.jumlahPermohonan) * parseFloat(row.dayaRequest)) / 220;
    const ampPerFasa = totalAmp / 3;
    const proyeksiPersenTrafo = ((iRataRata + ampPerFasa) / iNominal) * 100;

    return {
      iNominal: iNominal.toFixed(2),
      iRataRata: iRataRata.toFixed(2),
      persenTrafo: persenTrafo.toFixed(2),
      totalAmp: totalAmp.toFixed(2),
      ampPerFasa: ampPerFasa.toFixed(2),
      proyeksiPersenTrafo: proyeksiPersenTrafo.toFixed(2),
      status: proyeksiPersenTrafo > 80 ? 'Overload' : 'Normal'
    };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Simulasi Pengukuran Gardu</h3>
          <div className="text-sm text-gray-500">
            Edit nilai dasar dan klik tombol hitung untuk memperbarui semua nilai tegangan
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day Measurement Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <h4 className="text-center font-bold text-gray-900 mb-4 text-base">SIMULASI PENGUKURAN GARDU</h4>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th rowSpan={2} className="border-2 border-black px-3 py-2 text-base font-bold text-gray-900 bg-yellow-300 text-center align-middle">DAYA</th>
                  <th rowSpan={2} className="border-2 border-black px-3 py-2 text-base font-bold text-gray-900 bg-yellow-300 text-center align-middle">TEG SEKUNDER</th>
                  <th colSpan={3} className="border-2 border-black px-3 py-2 text-base font-bold text-gray-900 bg-yellow-300 text-center">HASIL PEMERIKSAAN</th>
                  <th rowSpan={2} className="border-2 border-black px-3 py-2 text-base font-bold text-gray-900 bg-yellow-300 text-center align-middle">JUMLAH PERMOHONAN</th>
                  <th rowSpan={2} className="border-2 border-black px-3 py-2 text-base font-bold text-gray-900 bg-yellow-300 text-center align-middle">DAYA REQUEST</th>
                </tr>
                <tr>
                  <th className="border-2 border-black px-3 py-2 text-sm font-bold text-gray-900 bg-yellow-300 text-center">R</th>
                  <th className="border-2 border-black px-3 py-2 text-sm font-bold text-gray-900 bg-yellow-300 text-center">S</th>
                  <th className="border-2 border-black px-3 py-2 text-sm font-bold text-gray-900 bg-yellow-300 text-center">T</th>
                </tr>
              </thead>
              <tbody>
                {simRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border-2 border-black px-3 py-2 text-sm font-medium text-center align-middle bg-white">
                      <input type="number" className="w-full px-2 py-1 text-sm text-center border-0 bg-transparent" value={row.daya} onChange={e => handleSimInput(rowIdx, 'daya', e.target.value)} />
                    </td>
                    <td className="border-2 border-black px-3 py-2 text-sm font-medium text-center align-middle bg-white">
                      <input type="number" className="w-full px-2 py-1 text-sm text-center border-0 bg-transparent" value={row.tegangan} onChange={e => handleSimInput(rowIdx, 'tegangan', e.target.value)} />
                    </td>
                    <td className="border-2 border-black px-3 py-2 text-sm font-medium text-center align-middle bg-white">
                      <input type="number" className="w-full px-2 py-1 text-sm text-center border-0 bg-transparent" value={row.r} onChange={e => handleSimInput(rowIdx, 'r', e.target.value)} placeholder="R" />
                    </td>
                    <td className="border-2 border-black px-3 py-2 text-sm font-medium text-center align-middle bg-white">
                      <input type="number" className="w-full px-2 py-1 text-sm text-center border-0 bg-transparent" value={row.s} onChange={e => handleSimInput(rowIdx, 's', e.target.value)} placeholder="S" />
                    </td>
                    <td className="border-2 border-black px-3 py-2 text-sm font-medium text-center align-middle bg-white">
                      <input type="number" className="w-full px-2 py-1 text-sm text-center border-0 bg-transparent" value={row.t} onChange={e => handleSimInput(rowIdx, 't', e.target.value)} placeholder="T" />
                    </td>
                    <td className="border-2 border-black px-3 py-2 text-sm font-medium text-center align-middle bg-white">
                      <input type="number" className="w-full px-2 py-1 text-sm text-center border-0 bg-transparent" value={row.jumlahPermohonan} onChange={e => handleSimInput(rowIdx, 'jumlahPermohonan', e.target.value)} />
                    </td>
                    <td className="border-2 border-black px-3 py-2 text-sm font-medium text-center align-middle bg-white">
                      <input type="number" className="w-full px-2 py-1 text-sm text-center border-0 bg-transparent" value={row.dayaRequest} onChange={e => handleSimInput(rowIdx, 'dayaRequest', e.target.value)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Calculate All Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowLoadModal(true)}
            className="px-6 py-3 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center space-x-2 transition-colors duration-200"
          >
            <Calculator size={20} />
            <span>Hitung Semua Pengukuran</span>
          </button>
        </div>
      </CardContent>

      {/* Load Calculation Modal */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900">Hasil Perhitungan Simulasi</h2>
              <button onClick={() => setShowLoadModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            {/* Modal Content: Tabel Hasil Simulasi */}
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full border border-black">
                  <thead>
                    <tr>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center align-middle" rowSpan={2}>DAYA</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center align-middle" rowSpan={2}>FASA</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center align-middle" rowSpan={2}>TEG SEKUNDER</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center align-middle" rowSpan={2}>FASA</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center align-middle" rowSpan={2}>I NOMINAL</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center align-middle" colSpan={4}>HASIL PEMERIKSAAN</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center align-middle" rowSpan={2}>% TRAFO</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center align-middle" rowSpan={2}>JUMLAH PERMOHONAN</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center align-middle" rowSpan={2}>DAYA REQUEST</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center align-middle" rowSpan={2}>TOTAL AMP</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center align-middle" rowSpan={2}>AMP PER FASA</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center align-middle" rowSpan={2}>PROYEKSI % TRAFO</th>
                    </tr>
                    <tr>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center">R</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center">S</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center">T</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center">I RATA-RATA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simRows.map((row, idx) => {
                      const calc = getCalc(row);
                      return (
                        <tr key={idx}>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center align-middle">{row.daya || '-'}</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center align-middle">3 FASA</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center align-middle">{row.tegangan || '-'}</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center align-middle">1,73</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center align-middle">{calc.iNominal.toFixed(2)}</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center align-middle">{row.r || '-'}</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center align-middle">{row.s || '-'}</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center align-middle">{row.t || '-'}</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center align-middle">{calc.iRata.toFixed(2)}</td>
                          <td className={`border-2 border-black px-3 py-2 text-sm text-center align-middle ${calc.persenTrafo > 80 ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'}`}>{calc.persenTrafo.toFixed(2)}%</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center align-middle">{row.jumlahPermohonan || '-'}</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center align-middle">{row.dayaRequest || '-'}</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center align-middle">{calc.totalAmp.toFixed(2)}</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center align-middle">{calc.ampPerFasa.toFixed(2)}</td>
                          <td className={`border-2 border-black px-3 py-2 text-sm text-center align-middle ${calc.proyeksiTrafo > 80 ? 'bg-red-200 text-red-700' : 'bg-green-200 text-green-700'}`}>{calc.proyeksiTrafo.toFixed(2)}%</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-gray-600">Status: Data siap untuk perhitungan</p>
                <div className="flex gap-3">
                  <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                    Export PDF
                  </button>
                  <button
                    onClick={() => setShowLoadModal(false)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}; 