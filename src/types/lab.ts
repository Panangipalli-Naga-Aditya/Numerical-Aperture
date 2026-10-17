/**
 * Type definitions for Optical Fiber Numerical Aperture laboratory experiment.
 */

export interface TrialResult {
  id: string;
  timestamp: number;
  L: number;           // Distance in mm
  D1: number;          // Horizontal spot diameter in mm
  D2: number;          // Vertical spot diameter in mm
  D: number;           // Average spot diameter in mm
  NA: number;          // Numerical aperture (dimensionless)
  thetaRad: number;    // Acceptance angle = arcsin(NA) in radians
  thetaDeg: number;    // Acceptance angle = arcsin(NA) in degrees
  isSimulated: boolean;
  notes?: string;
}

export type ViewPreset = '3d' | 'front' | 'top' | 'side';
