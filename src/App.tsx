/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Header, ActiveTab } from './components/Header';
import { Apparatus3D } from './components/Apparatus3D';
import { ResultsPanel } from './components/ResultsPanel';
import { ScientificGraphs } from './components/ScientificGraphs';
import { RealLabCalculator } from './components/RealLabCalculator';
import { EducationalManual } from './components/EducationalManual';

import { TrialResult } from './types/lab';
import { generateSimulatedTrial } from './utils/calculations';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('apparatus');

  // Single primary editable experimental parameter: L
  const [currentL, setCurrentL] = useState<number>(30.0);
  const [theoreticalNA, setTheoreticalNA] = useState<number>(0.20);
  const [simulateNoise, setSimulateNoise] = useState<boolean>(false);

  // Recorded trial history
  const [trials, setTrials] = useState<TrialResult[]>(() => {
    return [
      generateSimulatedTrial(15.0, 0.20, false),
      generateSimulatedTrial(25.0, 0.20, false),
      generateSimulatedTrial(35.0, 0.20, false),
      generateSimulatedTrial(45.0, 0.20, false)
    ];
  });

  // Real-time calculation for active distance L
  const currentEvaluation = useMemo(() => {
    return generateSimulatedTrial(currentL, theoreticalNA, simulateNoise);
  }, [currentL, theoreticalNA, simulateNoise]);

  const handleRecordTrial = () => {
    setTrials((prev) => [...prev, currentEvaluation]);
  };

  const handleReset = () => {
    setCurrentL(30.0);
    setTrials([
      generateSimulatedTrial(15.0, 0.20, false),
      generateSimulatedTrial(25.0, 0.20, false),
      generateSimulatedTrial(35.0, 0.20, false),
      generateSimulatedTrial(45.0, 0.20, false)
    ]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Laboratory Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentL={currentL}
        theoreticalNA={theoreticalNA}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {activeTab === 'apparatus' && (
          <div className="flex flex-col gap-6">
            {/* ---------------- 1. CENTRAL INTERACTIVE 3D APPARATUS ---------------- */}
            <div className="w-full h-[510px] rounded-2xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900/60">
              <Apparatus3D
                L={currentL}
                na={theoreticalNA}
                spotDiameter={currentEvaluation.D}
                thetaDeg={currentEvaluation.thetaDeg}
              />
            </div>

            {/* ---------------- 2. BOTTOM SECTION: CONTROLS, RESULTS & LIVE GRAPHS ---------------- */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Left Column: Experimental Controls & Calculated Metrics */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <ResultsPanel
                  currentL={currentL}
                  onDistanceChange={setCurrentL}
                  theoreticalNA={theoreticalNA}
                  latestResult={currentEvaluation}
                  onRecordTrial={handleRecordTrial}
                  onReset={handleReset}
                  simulateNoise={simulateNoise}
                  onToggleNoise={setSimulateNoise}
                />
              </div>

              {/* Right Column: Dynamic Live Graphs & Observation Table */}
              <div className="lg:col-span-8 flex flex-col gap-4">
                <ScientificGraphs
                  currentL={currentL}
                  currentD={currentEvaluation.D}
                  currentNA={currentEvaluation.NA}
                  theoreticalNA={theoreticalNA}
                  trials={trials}
                />

                {/* Observation Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
                      Simulated Trials Observation Table (NA = {theoreticalNA.toFixed(2)})
                    </h3>
                    <span className="text-[10px] text-sky-400 font-mono">θ = sin⁻¹(NA)</span>
                  </div>
                  <div className="overflow-x-auto rounded-lg border border-slate-800">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                        <tr>
                          <th className="p-2.5">Trial</th>
                          <th className="p-2.5">Distance L (mm)</th>
                          <th className="p-2.5">D1 (mm)*</th>
                          <th className="p-2.5">D2 (mm)*</th>
                          <th className="p-2.5">Average D (mm)*</th>
                          <th className="p-2.5 text-emerald-400">NA*</th>
                          <th className="p-2.5 text-sky-400">θ = sin⁻¹(NA)*</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 font-mono text-slate-200 text-xs">
                        {trials.map((t, idx) => (
                          <tr key={t.id || idx} className="hover:bg-slate-800/40">
                            <td className="p-2.5 text-slate-500">{idx + 1}</td>
                            <td className="p-2.5 text-amber-300 font-bold">{t.L.toFixed(2)}</td>
                            <td className="p-2.5">{t.D1.toFixed(2)}</td>
                            <td className="p-2.5">{t.D2.toFixed(2)}</td>
                            <td className="p-2.5 text-rose-300 font-bold">{t.D.toFixed(3)}</td>
                            <td className="p-2.5 text-emerald-400 font-bold">{t.NA.toFixed(4)}</td>
                            <td className="p-2.5 text-sky-300">{t.thetaDeg.toFixed(2)}°</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'graphs' && (
          <div className="flex flex-col gap-5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
              <div>
                <h2 className="text-sm font-bold text-slate-100">SCIENTIFIC GRAPHS & OBSERVATION LOG</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Visual demonstration that Numerical Aperture (NA) is invariant while spot diameter D expands linearly.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentL((prev) => Math.min(65, prev + 5))}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 cursor-pointer"
                >
                  +5mm Distance
                </button>
                <button
                  onClick={handleRecordTrial}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg shadow-md cursor-pointer"
                >
                  Record Trial (L={currentL.toFixed(1)}mm)
                </button>
              </div>
            </div>

            <ScientificGraphs
              currentL={currentL}
              currentD={currentEvaluation.D}
              currentNA={currentEvaluation.NA}
              theoreticalNA={theoreticalNA}
              trials={trials}
            />

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide mb-3">
                Observation Table (NA = {theoreticalNA.toFixed(2)})
              </h3>
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Trial</th>
                      <th className="p-2.5">Distance L (mm)</th>
                      <th className="p-2.5">D1 (mm)*</th>
                      <th className="p-2.5">D2 (mm)*</th>
                      <th className="p-2.5">Average D (mm)*</th>
                      <th className="p-2.5 text-emerald-400">NA*</th>
                      <th className="p-2.5 text-sky-400">θ = sin⁻¹(NA)*</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono text-slate-200 text-xs">
                    {trials.map((t, idx) => (
                      <tr key={t.id || idx} className="hover:bg-slate-800/40">
                        <td className="p-2.5 text-slate-500">{idx + 1}</td>
                        <td className="p-2.5 text-amber-300 font-bold">{t.L.toFixed(2)}</td>
                        <td className="p-2.5">{t.D1.toFixed(2)}</td>
                        <td className="p-2.5">{t.D2.toFixed(2)}</td>
                        <td className="p-2.5 text-rose-300 font-bold">{t.D.toFixed(3)}</td>
                        <td className="p-2.5 text-emerald-400 font-bold">{t.NA.toFixed(4)}</td>
                        <td className="p-2.5 text-sky-300">{t.thetaDeg.toFixed(2)}°</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'real_calc' && <RealLabCalculator />}

        {activeTab === 'manual' && <EducationalManual />}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 border-t border-slate-800/80 px-4 py-3 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            First-Year B.Tech Physics Laboratory • Determination of Numerical Aperture (NA)
          </span>
          <span className="text-[11px] text-slate-500">
            Formulas: D = (D1+D2)/2 • NA = D/√(D²+4L²) • Acceptance Angle θ = sin⁻¹(NA)
          </span>
        </div>
      </footer>
    </div>
  );
}
