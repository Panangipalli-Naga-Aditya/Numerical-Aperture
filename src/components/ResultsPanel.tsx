/**
 * ResultsPanel.tsx
 * Left-hand primary control & scientific metrics display panel.
 * Contains:
 * - Single manually editable experimental parameter: L (distance)
 * - Acceptance Angle formula: theta = arcsin(NA)
 * - No solid angle calculation.
 * - Explicit Simulation Disclaimer banner.
 */

import React from 'react';
import { Sliders, Zap, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';
import { TrialResult } from '../types/lab';

interface ResultsPanelProps {
  currentL: number;
  onDistanceChange: (newL: number) => void;
  theoreticalNA: number;
  latestResult: TrialResult;
  onRecordTrial: () => void;
  onReset: () => void;
  simulateNoise: boolean;
  onToggleNoise: (enabled: boolean) => void;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  currentL,
  onDistanceChange,
  theoreticalNA,
  latestResult,
  onRecordTrial,
  onReset,
  simulateNoise,
  onToggleNoise
}) => {
  const presets = [15.0, 25.0, 35.0, 45.0, 55.0];

  return (
    <div className="flex flex-col gap-3.5">
      {/* ---------------- 1. EXPERIMENTAL INPUT CARD ---------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-200 tracking-wide">EXPERIMENTAL INPUT</h2>
              <p className="text-[10px] text-slate-400">Single primary editable laboratory parameter: L</p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
            NA = {theoreticalNA.toFixed(2)}
          </span>
        </div>

        {/* Distance L Slider & Numeric Input */}
        <div className="bg-slate-950/80 rounded-lg p-3 border border-slate-800/80 mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="distance-slider" className="text-xs font-semibold text-slate-300">
              Screen Distance (<span className="text-amber-400 font-mono font-bold">L</span>):
            </label>
            <div className="flex items-center gap-1.5">
              <input
                id="distance-number"
                type="number"
                min="10"
                max="65"
                step="0.5"
                value={currentL}
                onChange={(e) => onDistanceChange(Math.max(10, Math.min(65, parseFloat(e.target.value) || 10)))}
                className="w-16 px-1.5 py-0.5 text-right font-mono text-sm font-bold bg-slate-900 border border-slate-700 rounded text-amber-400 focus:outline-none focus:border-cyan-500"
              />
              <span className="text-xs text-slate-400 font-mono">mm</span>
            </div>
          </div>

          <input
            id="distance-slider"
            type="range"
            min="10"
            max="65"
            step="0.5"
            value={currentL}
            onChange={(e) => onDistanceChange(parseFloat(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />

          {/* Quick preset buttons */}
          <div className="flex items-center justify-between gap-1 mt-2.5">
            <span className="text-[10px] text-slate-400">Presets:</span>
            <div className="flex items-center gap-1">
              {presets.map((p) => (
                <button
                  key={p}
                  onClick={() => onDistanceChange(p)}
                  className={`px-2 py-0.5 text-[10px] font-mono rounded transition-all cursor-pointer ${
                    Math.abs(currentL - p) < 0.1
                      ? 'bg-cyan-600 text-white font-bold shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {p}mm
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Realistic Measurement Noise Toggle */}
        <div className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-slate-950/40 border border-slate-800/60 mb-3 text-[11px]">
          <span className="text-slate-400">Simulate Micrometric Variance (±1%):</span>
          <button
            onClick={() => onToggleNoise(!simulateNoise)}
            className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all cursor-pointer ${
              simulateNoise
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            {simulateNoise ? 'ON (D1 ≠ D2)' : 'OFF (D1 = D2 = D)'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRecordTrial}
            className="flex-1 py-2 px-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-cyan-900/30 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
          >
            <Zap className="w-3.5 h-3.5" /> Calculate & Log Trial
          </button>

          <button
            onClick={onReset}
            title="Reset Experiment"
            className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* ---------------- 2. CALCULATED RESULTS CARD ---------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-200 tracking-wide">CALCULATED RESULTS</h2>
              <p className="text-[10px] text-slate-400">Formula: θ = sin⁻¹(NA)</p>
            </div>
          </div>
          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            Real-Time
          </span>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 gap-2">
          {/* L */}
          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400">Distance (L)</div>
            <div className="text-sm font-mono font-bold text-amber-400">
              {latestResult.L.toFixed(2)} <span className="text-[10px] text-slate-400 font-normal">mm</span>
            </div>
          </div>

          {/* Average D */}
          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400">Average Diameter (D)</div>
            <div className="text-sm font-mono font-bold text-rose-400">
              {latestResult.D.toFixed(3)} <span className="text-[10px] text-slate-400 font-normal">mm*</span>
            </div>
          </div>

          {/* D1 */}
          <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
            <div className="text-[9px] text-slate-400">Horizontal (D1)</div>
            <div className="text-xs font-mono font-semibold text-slate-200">
              {latestResult.D1.toFixed(2)} <span className="text-[9px] text-slate-400 font-normal">mm*</span>
            </div>
          </div>

          {/* D2 */}
          <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
            <div className="text-[9px] text-slate-400">Vertical (D2)</div>
            <div className="text-xs font-mono font-semibold text-slate-200">
              {latestResult.D2.toFixed(2)} <span className="text-[9px] text-slate-400 font-normal">mm*</span>
            </div>
          </div>

          {/* Numerical Aperture NA */}
          <div className="bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-800/40 col-span-1">
            <div className="text-[10px] text-emerald-300 font-semibold">Numerical Aperture (NA)</div>
            <div className="text-base font-mono font-black text-emerald-400">
              {latestResult.NA.toFixed(4)}*
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">D / √(D² + 4L²)</div>
          </div>

          {/* Acceptance Half-Angle theta = sin^-1(NA) */}
          <div className="bg-sky-950/30 p-2.5 rounded-lg border border-sky-800/40 col-span-1">
            <div className="text-[10px] text-sky-300 font-semibold">Acceptance Angle (θ)</div>
            <div className="text-base font-mono font-black text-sky-400">
              {latestResult.thetaDeg.toFixed(2)}°*
            </div>
            <div className="text-[9px] text-slate-400 mt-0.5">θ = sin⁻¹(NA)</div>
          </div>
        </div>

        {/* Mandatory Simulation Disclaimer Box */}
        <div className="mt-3 p-2.5 bg-indigo-950/60 border border-indigo-700/60 rounded-lg flex items-start gap-2 text-indigo-200">
          <AlertTriangle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-[10px] leading-relaxed">
            <span className="font-bold text-indigo-300 block mb-0.5">SIMULATION DISCLAIMER:</span>
            Spot diameters marked with (*) are mathematically calculated from illustrative fiber parameters (NA = 0.20) for college physics demonstrations. They are <strong>illustrative simulated values</strong>, NOT physical laboratory measurements.
          </div>
        </div>
      </div>
    </div>
  );
};
