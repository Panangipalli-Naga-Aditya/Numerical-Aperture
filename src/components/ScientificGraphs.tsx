/**
 * ScientificGraphs.tsx
 * Interactive scientific charts displaying:
 * 1. Spot Diameter D vs. Distance L (Linear Cone Divergence)
 * 2. Numerical Aperture NA vs. Distance L (Fundamental Invariance Principle)
 */

import React, { useMemo } from 'react';
import { TrialResult } from '../types/lab';
import { TrendingUp, Activity, Info } from 'lucide-react';

interface ScientificGraphsProps {
  currentL: number;
  currentD: number;
  currentNA: number;
  theoreticalNA: number;
  trials: TrialResult[];
}

export const ScientificGraphs: React.FC<ScientificGraphsProps> = ({
  currentL,
  currentD,
  currentNA,
  theoreticalNA,
  trials
}) => {
  // Chart dimensions & scaling
  const width = 560;
  const height = 230;
  const padding = { top: 30, right: 30, bottom: 42, left: 55 };

  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;

  // Max scales
  const maxL = 70; // mm
  const maxD = 35; // mm
  const maxNA = 0.40;

  // Coordinate transforms
  const scaleX = (l: number) => padding.left + (l / maxL) * plotWidth;
  const scaleYD = (d: number) => padding.top + plotHeight - (d / maxD) * plotHeight;
  const scaleYNA = (na: number) => padding.top + plotHeight - (na / maxNA) * plotHeight;

  // Theoretical line for D vs L
  const theoreticalLineD = useMemo(() => {
    const tanTheta = theoreticalNA / Math.sqrt(1 - (theoreticalNA ** 2));
    const p1 = { x: scaleX(0), y: scaleYD(0) };
    const p2 = { x: scaleX(maxL), y: scaleYD(2 * maxL * tanTheta) };
    return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
  }, [theoreticalNA, plotWidth, plotHeight]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* ---------------- GRAPH 1: Spot Diameter D vs. Distance L ---------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-cyan-500/10 rounded-lg text-cyan-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200">1. Spot Diameter (D) vs. Distance (L)</h3>
              <p className="text-[10px] text-slate-400">Linear cone divergence: slope = 2·tan(θ)</p>
            </div>
          </div>
          <div className="text-[11px] font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
            D = {currentD.toFixed(2)} mm
          </div>
        </div>

        {/* SVG Canvas for D vs L */}
        <div className="relative w-full aspect-[560/230] bg-slate-950/70 rounded-lg border border-slate-800/80 overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
            {/* Grid lines */}
            {[10, 20, 30, 40, 50, 60].map((l) => (
              <line
                key={`grid-x-${l}`}
                x1={scaleX(l)}
                y1={padding.top}
                x2={scaleX(l)}
                y2={padding.top + plotHeight}
                stroke="#1e293b"
                strokeDasharray="3 3"
              />
            ))}
            {[5, 10, 15, 20, 25, 30].map((d) => (
              <line
                key={`grid-y-${d}`}
                x1={padding.left}
                y1={scaleYD(d)}
                x2={padding.left + plotWidth}
                y2={scaleYD(d)}
                stroke="#1e293b"
                strokeDasharray="3 3"
              />
            ))}

            {/* Axes */}
            <line
              x1={padding.left}
              y1={padding.top + plotHeight}
              x2={padding.left + plotWidth}
              y2={padding.top + plotHeight}
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + plotHeight}
              stroke="#64748b"
              strokeWidth="1.5"
            />

            {/* X Axis Labels */}
            {[0, 15, 30, 45, 60].map((l) => (
              <text
                key={`label-x-${l}`}
                x={scaleX(l)}
                y={padding.top + plotHeight + 18}
                fill="#94a3b8"
                fontSize="10"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {l}
              </text>
            ))}
            <text
              x={padding.left + plotWidth / 2}
              y={height - 8}
              fill="#94a3b8"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
            >
              Screen Distance L (mm)
            </text>

            {/* Y Axis Labels */}
            {[0, 10, 20, 30].map((d) => (
              <text
                key={`label-y-${d}`}
                x={padding.left - 8}
                y={scaleYD(d) + 3}
                fill="#94a3b8"
                fontSize="10"
                textAnchor="end"
                fontFamily="monospace"
              >
                {d}
              </text>
            ))}
            <text
              transform={`rotate(-90 ${16} ${padding.top + plotHeight / 2})`}
              x={16}
              y={padding.top + plotHeight / 2}
              fill="#94a3b8"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
            >
              Spot Diameter D (mm)
            </text>

            {/* Theoretical Line */}
            <path d={theoreticalLineD} stroke="#38bdf8" strokeWidth="2" strokeDasharray="5 3" />

            {/* Trial Points */}
            {trials.map((t, idx) => (
              <g key={t.id || idx}>
                <circle
                  cx={scaleX(t.L)}
                  cy={scaleYD(t.D)}
                  r="4.5"
                  fill="#f43f5e"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              </g>
            ))}

            {/* Current Active Distance Marker */}
            <line
              x1={scaleX(currentL)}
              y1={padding.top}
              x2={scaleX(currentL)}
              y2={padding.top + plotHeight}
              stroke="#facc15"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
            <circle
              cx={scaleX(currentL)}
              cy={scaleYD(currentD)}
              r="6.5"
              fill="#facc15"
              stroke="#0f172a"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-cyan-400 inline-block"></span> Theoretical Linear Cone
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span> Logged Trials
            </span>
          </div>
          <span className="text-amber-400 font-mono">Current L={currentL.toFixed(1)}mm</span>
        </div>
      </div>

      {/* ---------------- GRAPH 2: Numerical Aperture NA vs. Distance L ---------------- */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-200">2. Numerical Aperture (NA) Invariance</h3>
              <p className="text-[10px] text-slate-400">Theoretical NA is independent of screen distance L</p>
            </div>
          </div>
          <div className="text-[11px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            NA = {currentNA.toFixed(4)}
          </div>
        </div>

        {/* SVG Canvas for NA vs L */}
        <div className="relative w-full aspect-[560/230] bg-slate-950/70 rounded-lg border border-slate-800/80 overflow-hidden">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full select-none">
            {/* Grid lines */}
            {[10, 20, 30, 40, 50, 60].map((l) => (
              <line
                key={`grid-na-x-${l}`}
                x1={scaleX(l)}
                y1={padding.top}
                x2={scaleX(l)}
                y2={padding.top + plotHeight}
                stroke="#1e293b"
                strokeDasharray="3 3"
              />
            ))}
            {[0.1, 0.2, 0.3].map((na) => (
              <line
                key={`grid-na-y-${na}`}
                x1={padding.left}
                y1={scaleYNA(na)}
                x2={padding.left + plotWidth}
                y2={scaleYNA(na)}
                stroke="#1e293b"
                strokeDasharray="3 3"
              />
            ))}

            {/* Axes */}
            <line
              x1={padding.left}
              y1={padding.top + plotHeight}
              x2={padding.left + plotWidth}
              y2={padding.top + plotHeight}
              stroke="#64748b"
              strokeWidth="1.5"
            />
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={padding.top + plotHeight}
              stroke="#64748b"
              strokeWidth="1.5"
            />

            {/* X Axis Labels */}
            {[0, 15, 30, 45, 60].map((l) => (
              <text
                key={`label-na-x-${l}`}
                x={scaleX(l)}
                y={padding.top + plotHeight + 18}
                fill="#94a3b8"
                fontSize="10"
                textAnchor="middle"
                fontFamily="monospace"
              >
                {l}
              </text>
            ))}
            <text
              x={padding.left + plotWidth / 2}
              y={height - 8}
              fill="#94a3b8"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
            >
              Screen Distance L (mm)
            </text>

            {/* Y Axis Labels */}
            {[0.0, 0.1, 0.2, 0.3, 0.4].map((na) => (
              <text
                key={`label-na-y-${na}`}
                x={padding.left - 8}
                y={scaleYNA(na) + 3}
                fill="#94a3b8"
                fontSize="10"
                textAnchor="end"
                fontFamily="monospace"
              >
                {na.toFixed(1)}
              </text>
            ))}
            <text
              transform={`rotate(-90 ${16} ${padding.top + plotHeight / 2})`}
              x={16}
              y={padding.top + plotHeight / 2}
              fill="#94a3b8"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
            >
              Numerical Aperture (NA)
            </text>

            {/* Invariant Constant Horizontal Line for Theoretical NA */}
            <line
              x1={padding.left}
              y1={scaleYNA(theoreticalNA)}
              x2={padding.left + plotWidth}
              y2={scaleYNA(theoreticalNA)}
              stroke="#10b981"
              strokeWidth="2.5"
            />

            {/* Trial Points */}
            {trials.map((t, idx) => (
              <g key={`na-${t.id || idx}`}>
                <circle
                  cx={scaleX(t.L)}
                  cy={scaleYNA(t.NA)}
                  r="4.5"
                  fill="#a855f7"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              </g>
            ))}

            {/* Current Active Marker */}
            <line
              x1={scaleX(currentL)}
              y1={padding.top}
              x2={scaleX(currentL)}
              y2={padding.top + plotHeight}
              stroke="#facc15"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
            <circle
              cx={scaleX(currentL)}
              cy={scaleYNA(currentNA)}
              r="6.5"
              fill="#facc15"
              stroke="#0f172a"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-3 h-0.5 bg-emerald-400 inline-block"></span> Invariant NA = {theoreticalNA.toFixed(2)}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-purple-500 inline-block"></span> Trial Records
            </span>
          </div>
          <span className="text-emerald-400 font-mono font-medium">Constant for fiber</span>
        </div>
      </div>
    </div>
  );
};
