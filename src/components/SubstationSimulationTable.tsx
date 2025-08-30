import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardContent } from './ui/Card';
import { SubstationData } from '../types';
import { Calculator, X, Plus, Trash2 } from 'lucide-react';

interface SubstationSimulationTableProps {
  data: SubstationData[];
}

type SimRow = {
  daya: string;
  tegangan: string;
  jumlahPermohonan: string;
  dayaRequest: string;
  r: string;
  s: string;
  t: string;
};

type SimResult = {
  iNominal: number;
  iRata: number;
  persenTrafo: number;
  totalAmp: number;
  ampPerFasa: number;
  proyeksiTrafo: number;
};

const SQRT3 = Math.sqrt(3);
const parseNum = (v: string) => {
  if (!v) return 0;
  const n = Number(String(v).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

function calcRow(row: SimRow): SimResult {
  const daya = parseNum(row.daya);           // kVA
  const teg = parseNum(row.tegangan);        // V
  const jumlah = parseNum(row.jumlahPermohonan);
  const dayaReq = parseNum(row.dayaRequest); // VA
  const r = parseNum(row.r);
  const s = parseNum(row.s);
  const t = parseNum(row.t);

  const iNominal = teg > 0 ? (daya * 1000) / (teg * SQRT3) : 0;
  const iRata = (r + s + t) / 3;
  const persenTrafo = iNominal > 0 ? (iRata / iNominal) * 100 : 0;
  const totalAmp = (jumlah * dayaReq) / 220;
  const ampPerFasa = totalAmp / 3;
  const proyeksiTrafo = iNominal > 0 ? ((iRata + ampPerFasa) / iNominal) * 100 : 0;

  return { iNominal, iRata, persenTrafo, totalAmp, ampPerFasa, proyeksiTrafo };
}

const statusClass = (p: number) =>
  p > 80 ? 'bg-red-200 text-red-700' : p < 30 ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-700';

export const SubstationSimulationTable: React.FC<SubstationSimulationTableProps> = () => {
  const [simRows, setSimRows] = useState<SimRow[]>([
    { daya: '', tegangan: '', jumlahPermohonan: '', dayaRequest: '', r: '', s: '', t: '' },
  ]);
  const results = useMemo(() => simRows.map(calcRow), [simRows]);
  const [showLoadModal, setShowLoadModal] = useState(false);

  const handleSimInput = <K extends keyof SimRow>(rowIdx: number, field: K, value: string) => {
    setSimRows(prev => prev.map((row, idx) => (idx === rowIdx ? { ...row, [field]: value } : row)));
  };
  const addRow = () =>
    setSimRows(prev => [...prev, { daya: '', tegangan: '', jumlahPermohonan: '', dayaRequest: '', r: '', s: '', t: '' }]);
  const removeRow = (idx: number) => setSimRows(prev => prev.filter((_, i) => i !== idx));

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Simulasi Pengukuran Gardu</h3>
          <div className="text-sm text-gray-500">Isi nilai, lalu klik <b>Hitung</b> untuk melihat hasil</div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-base font-bold text-gray-900">INPUT SIMULASI</h4>
            <button
              onClick={addRow}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700"
            >
              <Plus size={16} /> Tambah Baris
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th rowSpan={2} className="border-2 border-black px-3 py-2 text-sm font-bold bg-yellow-300 text-center">DAYA (kVA)</th>
                  <th rowSpan={2} className="border-2 border-black px-3 py-2 text-sm font-bold bg-yellow-300 text-center">TEG SEKUNDER (V)</th>
                  <th colSpan={3} className="border-2 border-black px-3 py-2 text-sm font-bold bg-yellow-300 text-center">HASIL PEMERIKSAAN ARUS (A)</th>
                  <th rowSpan={2} className="border-2 border-black px-3 py-2 text-sm font-bold bg-yellow-300 text-center">JUMLAH PERMOHONAN</th>
                  <th rowSpan={2} className="border-2 border-black px-3 py-2 text-sm font-bold bg-yellow-300 text-center">DAYA REQUEST (VA)</th>
                  <th rowSpan={2} className="border-2 border-black px-3 py-2 text-sm font-bold bg-yellow-300 text-center">AKSI</th>
                </tr>
                <tr>
                  <th className="border-2 border-black px-3 py-2 text-xs font-bold bg-yellow-300 text-center">R</th>
                  <th className="border-2 border-black px-3 py-2 text-xs font-bold bg-yellow-300 text-center">S</th>
                  <th className="border-2 border-black px-3 py-2 text-xs font-bold bg-yellow-300 text-center">T</th>
                </tr>
              </thead>
              <tbody>
                {simRows.map((row, rowIdx) => (
                  <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="border-2 border-black px-3 py-2 text-sm text-center">
                      <input type="number" className="w-full px-2 py-1 text-sm text-center border-0 bg-transparent"
                        value={row.daya} onChange={e => handleSimInput(rowIdx, 'daya', e.target.value)} placeholder="kVA" />
                    </td>
                    <td className="border-2 border-black px-3 py-2 text-sm text-center">
                      <input type="number" className="w-full px-2 py-1 text-sm text-center border-0 bg-transparent"
                        value={row.tegangan} onChange={e => handleSimInput(rowIdx, 'tegangan', e.target.value)} placeholder="Volt" />
                    </td>
                    <td className="border-2 border-black px-3 py-2 text-sm text-center">
                      <input type="number" className="w-full px-2 py-1 text-sm text-center border-0 bg-transparent"
                        value={row.r} onChange={e => handleSimInput(rowIdx, 'r', e.target.value)} placeholder="R (A)" />
                    </td>
                    <td className="border-2 border-black px-3 py-2 text-sm text-center">
                      <input type="number" className="w-full px-2 py-1 text-sm text-center border-0 bg-transparent"
                        value={row.s} onChange={e => handleSimInput(rowIdx, 's', e.target.value)} placeholder="S (A)" />
                    </td>
                    <td className="border-2 border-black px-3 py-2 text-sm text-center">
                      <input type="number" className="w-full px-2 py-1 text-sm text-center border-0 bg-transparent"
                        value={row.t} onChange={e => handleSimInput(rowIdx, 't', e.target.value)} placeholder="T (A)" />
                    </td>
                    <td className="border-2 border-black px-3 py-2 text-sm text-center">
                      <input type="number" className="w-full px-2 py-1 text-sm text-center border-0 bg-transparent"
                        value={row.jumlahPermohonan} onChange={e => handleSimInput(rowIdx, 'jumlahPermohonan', e.target.value)} placeholder="Unit" />
                    </td>
                    <td className="border-2 border-black px-3 py-2 text-sm text-center">
                      <input type="number" className="w-full px-2 py-1 text-sm text-center border-0 bg-transparent"
                        value={row.dayaRequest} onChange={e => handleSimInput(rowIdx, 'dayaRequest', e.target.value)} placeholder="VA" />
                    </td>
                    <td className="border-2 border-black px-3 py-2 text-sm text-center">
                      <button
                        onClick={() => removeRow(rowIdx)}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded bg-red-100 text-red-700 hover:bg-red-200"
                        disabled={simRows.length === 1}
                        title={simRows.length === 1 ? 'Minimal 1 baris' : 'Hapus baris'}
                      >
                        <Trash2 size={14} /> Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tombol Hitung */}
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

      {/* Modal Hasil */}
      {showLoadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900">Hasil Perhitungan Simulasi</h2>
              <button onClick={() => setShowLoadModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full border border-black">
                  <thead>
                    <tr>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center" rowSpan={2}>DAYA (kVA)</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center" rowSpan={2}>FASA</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center" rowSpan={2}>TEG SEKUNDER (V)</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center" rowSpan={2}>√3</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center" rowSpan={2}>I NOMINAL (A)</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center" colSpan={4}>HASIL PEMERIKSAAN</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center" rowSpan={2}>% TRAFO</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center" rowSpan={2}>JUMLAH PERMOHONAN</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center" rowSpan={2}>DAYA REQUEST (VA)</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center" rowSpan={2}>TOTAL AMP</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center" rowSpan={2}>AMP / FASA</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center" rowSpan={2}>PROYEKSI % TRAFO</th>
                    </tr>
                    <tr>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center">R</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center">S</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center">T</th>
                      <th className="border-2 border-black px-3 py-2 text-xs font-bold text-center">I RATA-RATA (A)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {simRows.map((row, idx) => {
                      const res = results[idx];
                      return (
                        <tr key={idx}>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center">{row.daya || '-'}</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center">3 FASA</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center">{row.tegangan || '-'}</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center">{SQRT3.toFixed(2)}</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center">{res.iNominal.toFixed(2)}</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center">{row.r || '-'}</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center">{row.s || '-'}</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center">{row.t || '-'}</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center">{res.iRata.toFixed(2)}</td>
                          <td className={`border-2 border-black px-3 py-2 text-sm text-center ${statusClass(res.persenTrafo)}`}>
                            {res.persenTrafo.toFixed(2)}%
                          </td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center">{row.jumlahPermohonan || '-'}</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center">{row.dayaRequest || '-'}</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center">{res.totalAmp.toFixed(2)}</td>
                          <td className="border-2 border-black px-3 py-2 text-sm text-center">{res.ampPerFasa.toFixed(2)}</td>
                          <td className={`border-2 border-black px-3 py-2 text-sm text-center ${statusClass(res.proyeksiTrafo)}`}>
                            {res.proyeksiTrafo.toFixed(2)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between mt-6 pt-4 border-t">
                <p className="text-sm text-gray-600">Status: Hasil dihitung dari input terbaru.</p>
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
