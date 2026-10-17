/**
 * EducationalManual.tsx
 * Complete B.Tech Engineering Physics Laboratory Manual & Theory.
 * Formula: Acceptance Angle theta = sin^-1(NA)
 * Solid angle calculation removed.
 */

import React, { useState } from 'react';
import { BookOpen, Target, Cpu, Flame, Layers, AlertCircle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const EducationalManual: React.FC = () => {
  const [openVivaIdx, setOpenVivaIdx] = useState<number | null>(0);

  const vivaQuestions = [
    {
      q: 'What is the formula for Acceptance Angle (θ)?',
      a: 'Acceptance Angle is given by: θ = sin⁻¹(NA), where NA is the Numerical Aperture of the optical fiber.'
    },
    {
      q: 'What does Numerical Aperture (NA) physically represent in an optical fiber?',
      a: 'Numerical Aperture is a dimensionless figure of merit that quantifies the light-gathering capability of the optical fiber. A higher NA indicates that the fiber can accept rays entering at larger angles with respect to the core axis.'
    },
    {
      q: 'What is the mathematical relation connecting NA to core and cladding refractive indices?',
      a: 'NA = sin(θ) = √(n₁² - n₂²), where n₁ is the refractive index of the fiber core and n₂ is the refractive index of the cladding (with n₁ > n₂).'
    },
    {
      q: 'How are spot diameters D1 and D2 measured using the laboratory concentric circle card?',
      a: 'The target card has precision etched concentric circles with calibrated diameters (4, 8, 12, 16, 20... up to 80 mm). By observing the illuminated circular red spot boundary on the scale, the horizontal diameter (D1) and vertical diameter (D2) are read directly and averaged: D = (D1 + D2)/2.'
    },
    {
      q: 'Why does theoretical NA remain constant as distance L changes?',
      a: 'As the screen distance L increases, the emerging light spot diameter D increases proportionally in a cone (D ∝ L). Because NA = D / √(D² + 4L²), the ratio remains constant, proving that NA is an invariant physical parameter of the fiber.'
    }
  ];

  return (
    <div className="flex flex-col gap-6 text-slate-200">
      {/* Experiment Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-cyan-500/10 rounded-lg text-cyan-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider font-mono">
              B.Tech Engineering Physics Lab Manual
            </span>
            <h1 className="text-base font-bold text-slate-100">
              DETERMINATION OF NUMERICAL APERTURE (NA) AND ACCEPTANCE ANGLE OF AN OPTICAL FIBER
            </h1>
          </div>
        </div>
      </div>

      {/* Grid of Theory Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Aim & Apparatus */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
          <div>
            <h2 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide mb-1.5">
              <Target className="w-4 h-4" /> 1. Aim of the Experiment
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              To measure the output circular laser spot diameter at various distances from the end of a step-index optical fiber, and to calculate the <strong>Numerical Aperture (NA)</strong> and <strong>Acceptance Angle (θ = sin⁻¹(NA))</strong>.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800">
            <h2 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide mb-1.5">
              <Cpu className="w-4 h-4" /> 2. Apparatus Required
            </h2>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              <li>Semiconductor Laser Diode Source & Power Supply Unit with toggle switch</li>
              <li>Step-Index Multimode Optical Fiber patch cable with polished ends</li>
              <li>Dual-rail chrome optical bench with millimeter scale rule and arched foot supports</li>
              <li>Fiber launch chuck mount & output chuck barrel</li>
              <li>Movable target screen with etched millimeter concentric circles (4 to 80 mm)</li>
            </ul>
          </div>
        </div>

        {/* Optical Principle */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-col gap-2.5">
          <h2 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide">
            <Flame className="w-4 h-4" /> 3. Principle & Optical Theory
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Light propagates through an optical fiber by <strong>Total Internal Reflection (TIR)</strong> at the core-cladding interface. The critical angle is determined by the core refractive index <code className="text-cyan-300">n₁</code> and cladding <code className="text-cyan-300">n₂</code>.
          </p>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center font-mono text-cyan-300 text-xs">
            NA = sin(θ) = √(n₁² - n₂²)
          </div>
          <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center font-mono text-sky-400 text-xs">
            Acceptance Angle: θ = sin⁻¹(NA)
          </div>
        </div>
      </div>

      {/* Formulas Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <h2 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide mb-3">
          <Layers className="w-4 h-4" /> 4. Formulas
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 mb-1">Average Spot Diameter (D)</div>
            <div className="font-mono text-sm font-bold text-rose-400 mb-1">
              D = (D₁ + D₂) / 2
            </div>
            <p className="text-[10px] text-slate-400">
              Average of horizontal (D₁) and vertical (D₂) diameters.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 mb-1">Numerical Aperture (NA)</div>
            <div className="font-mono text-sm font-bold text-emerald-400 mb-1">
              NA = D / √(D² + 4L²)
            </div>
            <p className="text-[10px] text-slate-400">
              Dimensionless light-gathering metric.
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="text-[11px] font-semibold text-slate-400 mb-1">Acceptance Angle (θ)</div>
            <div className="font-mono text-sm font-bold text-sky-400 mb-1">
              θ = sin⁻¹(NA)
            </div>
            <p className="text-[10px] text-slate-400">
              In degrees: θ = arcsin(NA) × (180° / π).
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-Step Procedure */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <h2 className="text-xs font-bold text-cyan-400 flex items-center gap-1.5 uppercase tracking-wide mb-3">
          5. Laboratory Procedure
        </h2>
        <div className="space-y-2 text-xs text-slate-300">
          <p>1. Mount the laser source and connect the optical fiber cable.</p>
          <p>2. Align the fiber output chuck perpendicular to the target screen.</p>
          <p>3. Set distance L from fiber tip to screen (e.g. 15 mm) on the bench scale.</p>
          <p>4. Observe the circular red spot on the concentric circles (Photo 2) and record D1 and D2.</p>
          <p>5. Calculate D = (D1+D2)/2, NA = D/√(D²+4L²), and Acceptance Angle θ = sin⁻¹(NA).</p>
          <p>6. Repeat for distances L = 20, 25, 30, 35, 40, 45, 50 mm.</p>
        </div>
      </div>

      {/* Viva Voce Questions Accordion */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <h2 className="text-xs font-bold text-purple-400 flex items-center gap-1.5 uppercase tracking-wide mb-3">
          <HelpCircle className="w-4 h-4" /> 6. Viva Voce Questions & Answers
        </h2>
        <div className="space-y-2">
          {vivaQuestions.map((item, idx) => {
            const isOpen = openVivaIdx === idx;
            return (
              <div
                key={idx}
                className="bg-slate-950/80 rounded-lg border border-slate-800 overflow-hidden"
              >
                <button
                  onClick={() => setOpenVivaIdx(isOpen ? null : idx)}
                  className="w-full px-4 py-2.5 text-left text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-purple-400 font-mono">Q{idx + 1}:</span>
                    {item.q}
                  </span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-3 pt-1 text-xs text-slate-300 border-t border-slate-800/80 leading-relaxed bg-slate-900/40">
                    <strong className="text-emerald-400">Answer: </strong>
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
