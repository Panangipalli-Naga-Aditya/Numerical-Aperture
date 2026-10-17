"""
test_calculations.py
====================
Unit test suite validating theta = arcsin(NA) and spot diameter simulation.
"""

import unittest
import math
from calculations import (
    calculate_spot_diameter_simulated,
    calculate_numerical_aperture,
    simulate_experiment_trial
)


class TestNumericalApertureCalculations(unittest.TestCase):

    def test_theta_arcsin_formula(self):
        """Test theta = arcsin(NA) in radians and degrees."""
        res = calculate_numerical_aperture(30.0, 12.0, 12.0)
        expected_na = 12.0 / math.sqrt(12.0**2 + 4.0 * 30.0**2)
        self.assertAlmostEqual(res["NA"], expected_na, places=4)
        expected_theta_rad = math.asin(expected_na)
        expected_theta_deg = math.degrees(expected_theta_rad)
        self.assertAlmostEqual(res["theta_rad"], expected_theta_rad, places=4)
        self.assertAlmostEqual(res["theta_deg"], expected_theta_deg, places=3)

    def test_idealized_consistency(self):
        """Test that simulated diameter yields the same NA and theta."""
        for na_in in [0.15, 0.20, 0.25]:
            D = calculate_spot_diameter_simulated(25.0, na=na_in)
            res = calculate_numerical_aperture(25.0, D, D)
            self.assertAlmostEqual(res["NA"], na_in, places=4)
            self.assertAlmostEqual(res["theta_deg"], math.degrees(math.asin(na_in)), places=3)

    def test_invalid_inputs(self):
        with self.assertRaises(ValueError):
            calculate_numerical_aperture(-5.0, 10.0, 10.0)
        with self.assertRaises(ValueError):
            calculate_spot_diameter_simulated(0.0)


if __name__ == "__main__":
    unittest.main()
