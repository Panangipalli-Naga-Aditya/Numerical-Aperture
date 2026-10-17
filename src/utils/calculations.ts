/**
 * calculations.ts
 * Exact scientific calculation functions matching calculations.py.
 * Acceptance Angle: theta = arcsin(NA)
 */

import { TrialResult } from '../types/lab';

/**
 * Calculates theoretical spot diameter D for a given distance L and numerical aperture NA.
 * Formula: D = 2 * L * NA / sqrt(1 - NA^2)
 */
export function calculateSimulatedSpotDiameter(L: number, na: number = 0.20): number {
  if (L <= 0) {
    throw new Error('Distance L must be strictly positive.');
  }
  if (na <= 0 || na >= 1) {
    throw new Error('Numerical aperture NA must be between 0 and 1.');
  }
  const tanTheta = na / Math.sqrt(1 - (na ** 2));
  return 2 * L * tanTheta;
}

/**
 * Calculates D_avg, NA, and acceptance angle theta from measurements L, D1, D2.
 * D = (D1 + D2) / 2
 * NA = D / sqrt(D^2 + 4 * L^2)
 * theta = arcsin(NA) [in degrees: arcsin(NA) * 180 / PI]
 */
export function calculateNumericalAperture(
  L: number,
  D1: number,
  D2: number,
  isSimulated: boolean = false
): TrialResult {
  if (L <= 0) throw new Error('Distance L must be greater than 0.');
  if (D1 <= 0 || D2 <= 0) throw new Error('Diameters must be greater than 0.');

  const D = (D1 + D2) / 2.0;
  const denominator = Math.sqrt((D ** 2) + 4.0 * (L ** 2));
  const na = D / denominator;

  // Formula as requested: theta = arcsin(NA)
  const clampedNA = Math.min(1.0, Math.max(0.0, na));
  const thetaRad = Math.asin(clampedNA);
  const thetaDeg = (thetaRad * 180.0) / Math.PI;

  return {
    id: `${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    timestamp: Date.now(),
    L: Number(L.toFixed(2)),
    D1: Number(D1.toFixed(2)),
    D2: Number(D2.toFixed(2)),
    D: Number(D.toFixed(3)),
    NA: Number(na.toFixed(4)),
    thetaRad: Number(thetaRad.toFixed(4)),
    thetaDeg: Number(thetaDeg.toFixed(2)),
    isSimulated
  };
}

/**
 * Generates an idealized simulated trial where D1 = D2 = D.
 */
export function generateSimulatedTrial(
  L: number,
  na: number = 0.20,
  addNoise: boolean = false,
  noiseFactor: number = 0.015
): TrialResult {
  const idealD = calculateSimulatedSpotDiameter(L, na);
  let d1 = idealD;
  let d2 = idealD;

  if (addNoise) {
    d1 = idealD * (1 + (Math.random() * 2 - 1) * noiseFactor);
    d2 = idealD * (1 + (Math.random() * 2 - 1) * noiseFactor);
  }

  return calculateNumericalAperture(L, d1, d2, true);
}
