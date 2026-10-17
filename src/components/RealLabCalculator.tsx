/**
 * RealLabCalculator.tsx
 * Independent Physical Laboratory Manual Measurement Calculator.
 * Acceptance Angle: theta = arcsin(NA).
 * Solid angle calculation removed.
 */

import React, { useState } from 'react';
import { calculateNumericalAperture } from '../utils/calculations';
import { TrialResult } from '../types/lab';
import { Calculator, Download, Plus, Trash2, CheckCircle, FileText } from 'lucide-react';

export const RealLabCalculator: React.FC = () => {
  const [L, setL] = useState<string>('30.0');
  const [D1, setD1] = useState<string>('12.2');
  const [D2, setD2] = useState<string>('12.4');
  const [nominalNA, setNominalNA] = useState<string>('0.20');
  const [unit, setUnit] = useState<'mm' | 'cm'>('mm');

  const [realTrials, setRealTrials] = useState<TrialResult[]>([
    {
      id: 'trial-1',
      timestamp: Date.now() - 300000,
      L: 20.0,
      D1: 8.15,
      D2: 8.25,
      D: 8.20,
      NA: 0.2009,
      thetaRad: 0.2023,
      thetaDeg: 11.59,
      isSimulated: false,
      notes: 'Initial alignment trial'
    },
    {
      id: 'trial-2',
      timestamp: Date.now() - 200000,
      L: 30.0,
      D1: 12.2,
      D2: 12.4,
      D: 12.30,
      NA: 0.2008,
      thetaRad: 0.2021,
      thetaDeg: 11.58,
      isSimulated: false
    },
    {
      id: 'trial-3',
      timestamp: Date.now() - 100000,
      L: 40.0,
      D1: 16.3,
      D2: 16.5,
      D: 16.40,
      NA: 0.2007,
      thetaRad: 0.2021,
      thetaDeg: 11.58,
      isSimulated: false
    }
  ]);

  const [currentEval, setCurrentEval] = useState<TrialResult | null>(() => {
    try {
      return calculateNumericalAperture(30.0, 12.2, 12.4, false);
    } catch {
      return null;
    }
  });

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCalculate = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const numL = parseFloat(L);
    const numD1 = parseFloat(D1);
    const numD2 = parseFloat(D2);

    if (isNaN(numL) || numL <= 0) {
      setErrorMsg('Please enter a valid positive screen distance L.');
      return;
    }
    if (isNaN(numD1) || numD1 <= 0 || isNaN(numD2) || numD2 <= 0) {
      setErrorMsg('Please enter valid positive spot diameters D1 and D2.');
      return;
    }

    const multiplier = unit === 'cm' ? 10.0 : 1.0;
    const finalL = numL * multiplier;
    const finalD1 = numD1 * multiplier;
    const finalD2 = numD2 * multiplier;

    try {
      const res = calculateNumericalAperture(finalL, finalD1, finalD2, false);
      setCurrentEval(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Calculation error occurred.');
    }
  };

  const handleAddTrial = () => {
    if (!currentEval) return;
    setRealTrials((prev) => [
      ...prev,
      { ...currentEval, id: `real-${Date.now()}` }
    ]);
  };

  const handleDeleteTrial = (id: string) => {
    setRealTrials((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearAll = () => {
    setRealTrials([]);
  };

  const stats = React.useMemo(() => {
    if (realTrials.length === 0) return null;
    const naList = realTrials.map((t) => t.NA);
    const meanNA = naList.reduce((acc, v) => acc + v, 0) / naList.length;

    let stdDev = 0;
    if (naList.length > 1) {
      const variance = naList.reduce((acc, v) => acc + Math.pow(v - meanNA, 2), 0) / (naList.length - 1);
      stdDev = Math.sqrt(variance);
    }

    // Acceptance angle: theta = arcsin(NA)
    const meanTheta = (Math.asin(Math.min(1.0, meanNA)) * 180) / Math.PI;

    const nom = parseFloat(nominalNA);
    let percentError: number | null = null;
    if (!isNaN(nom) && nom > 0) {
      percentError = (Math.abs(meanNA - nom) / nom) * 100;
    }

    return {
      count: realTrials.length,
      meanNA,
      stdDev,
      meanTheta,
      percentError
    };
  }, [realTrials, nominalNA]);

  const exportToCSV = () => {
    if (realTrials.length === 0) return;

    const headers = [
      'Trial',
      'Distance_L_mm',
      'Diameter_D1_mm',
      'Diameter_D2_mm',
      'Average_D_mm',
      'Numerical_Aperture_NA',
      'Acceptance_Angle_deg'
    ];

    const rows = realTrials.map((t, idx) => [
      idx + 1,
      t.L,
      t.D1,
      t.D2,
      t.D,
      t.NA,
      t.thetaDeg
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'optical_fiber_lab_measurements.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-5 p-1">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-900/50 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-slate-100">REAL PHYSICAL MEASUREMENTS CALCULATOR</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Input physical readings measured on your college optical bench. Formula: θ = sin⁻¹(NA).
          </p>
        </div>

        <button
          onClick={exportToCSV}
          disabled={realTrials.length === 0}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-2 transition-all cursor-pointer self-start md:self-auto"
        >
          <Download className="w-4 h-4" /> Export CSV Lab Report
        </button>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Form & Result Card */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <form onSubmit={handleCalculate} className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-slate-200">Enter Bench Readings</span>
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded border border-slate-800 text-[11px]">
                <button
                  type="button"
                  onClick={() => setUnit('mm')}
                  className={`px-2 py-0.5 rounded font-mono ${unit === 'mm' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  mm
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('cm')}
                  className={`px-2 py-0.5 rounded font-mono ${unit === 'cm' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'}`}
                >
                  cm
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-3 p-2 bg-rose-950/60 border border-rose-800 rounded text-rose-300 text-xs">
                {errorMsg}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1">
                  <span>Distance from Fiber End to Screen (<span className="text-amber-400 font-mono">L</span>):</span>
                  <span className="text-[10px] text-slate-500">{unit}</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={L}
                  onChange={(e) => setL(e.target.value)}
                  placeholder="e.g. 30.0"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded text-sm text-slate-100 font-mono focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1">
                  <span>Horizontal Spot Diameter (<span className="text-rose-400 font-mono">D1</span>):</span>
                  <span className="text-[10px] text-slate-500">{unit}</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={D1}
                  onChange={(e) => setD1(e.target.value)}
                  placeholder="e.g. 12.20"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded text-sm text-slate-100 font-mono focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1">
                  <span>Vertical Spot Diameter (<span className="text-rose-400 font-mono">D2</span>):</span>
                  <span className="text-[10px] text-slate-500">{unit}</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={D2}
                  onChange={(e) => setD2(e.target.value)}
                  placeholder="e.g. 12.40"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded text-sm text-slate-100 font-mono focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between mb-1">
                  <span>Nominal NA from Fiber Datasheet (Optional):</span>
                  <span className="text-[10px] text-slate-500">spec</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={nominalNA}
                  onChange={(e) => setNominalNA(e.target.value)}
                  placeholder="0.20"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded text-sm text-slate-100 font-mono focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Calculator className="w-3.5 h-3.5" /> Calculate NA
                </button>

                <button
                  type="button"
                  onClick={handleAddTrial}
                  disabled={!currentEval}
                  className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add to Table
                </button>
              </div>
            </div>
          </form>

          {/* Current Evaluation Card */}
          {currentEval && (
            <div className="bg-slate-900 border border-emerald-900/40 rounded-xl p-4 shadow-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Current Calculation
                </span>
                <span className="text-[10px] text-slate-400 font-mono">θ = sin⁻¹(NA)</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Average Diameter D:</span>
                  <span className="font-mono font-bold text-slate-100 text-sm">{currentEval.D.toFixed(3)} mm</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Numerical Aperture NA:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{currentEval.NA.toFixed(4)}</span>
                </div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 col-span-2">
                  <span className="text-slate-400 block text-[10px]">Acceptance Angle (θ = sin⁻¹(NA)):</span>
                  <span className="font-mono font-bold text-sky-400 text-sm">{currentEval.thetaDeg.toFixed(2)}°</span>
                  <span className="text-[10px] text-slate-400 ml-2 font-mono">({currentEval.thetaRad.toFixed(4)} rad)</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Observation Table */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <h3 className="text-xs font-bold text-slate-200">PHYSICAL OBSERVATION TABLE</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-mono">{realTrials.length} trials logged</span>
                <button
                  onClick={handleClearAll}
                  disabled={realTrials.length === 0}
                  className="text-[11px] text-rose-400 hover:text-rose-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                  <tr>
                    <th className="p-2 text-center">#</th>
                    <th className="p-2">L (mm)</th>
                    <th className="p-2">D1 (mm)</th>
                    <th className="p-2">D2 (mm)</th>
                    <th className="p-2">D (mm)</th>
                    <th className="p-2 text-emerald-400">NA</th>
                    <th className="p-2 text-sky-400">θ = sin⁻¹(NA)</th>
                    <th className="p-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono text-slate-200 text-[11px]">
                  {realTrials.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-500 font-sans">
                        No physical trials recorded yet. Enter readings on the left and click "Add to Table".
                      </td>
                    </tr>
                  ) : (
                    realTrials.map((t, idx) => (
                      <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-2 text-center text-slate-400 font-bold">{idx + 1}</td>
                        <td className="p-2 text-amber-300 font-semibold">{t.L.toFixed(2)}</td>
                        <td className="p-2">{t.D1.toFixed(2)}</td>
                        <td className="p-2">{t.D2.toFixed(2)}</td>
                        <td className="p-2 text-rose-300 font-semibold">{t.D.toFixed(3)}</td>
                        <td className="p-2 text-emerald-400 font-bold">{t.NA.toFixed(4)}</td>
                        <td className="p-2 text-sky-300">{t.thetaDeg.toFixed(2)}°</td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => handleDeleteTrial(t.id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {stats && (
              <div className="mt-4 p-3 bg-slate-950/80 rounded-lg border border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Mean NA:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    {stats.meanNA.toFixed(4)}
                  </span>
                  <span className="text-[10px] text-slate-500 block">± {stats.stdDev.toFixed(4)}</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Mean Acceptance Angle:</span>
                  <span className="font-mono font-bold text-sky-400 text-sm">
                    {stats.meanTheta.toFixed(2)}°
                  </span>
                  <span className="text-[10px] text-slate-500 block">θ = sin⁻¹(NA)</span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Nominal Spec NA:</span>
                  <span className="font-mono font-bold text-slate-200 text-sm">
                    {nominalNA || 'N/A'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-400 block text-[10px]">Percentage Error:</span>
                  <span className={`font-mono font-bold text-sm ${stats.percentError !== null && stats.percentError < 5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {stats.percentError !== null ? `${stats.percentError.toFixed(2)}%` : '--'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
