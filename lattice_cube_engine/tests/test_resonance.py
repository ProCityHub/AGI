"""
Lattice Cube Engine tests.
Author and concept origin: Adrien D. Thomas
"""

from __future__ import annotations

import unittest

from lattice_cube_engine.core.chamber import LatticeChamber
from lattice_cube_engine.core.dynamic_pruning import FibonacciMemoryEngine
from lattice_cube_engine.core.math_engine import LatticeMathEngine
from lattice_cube_engine.integrations.sense_making_agent import AutonomousSenseMaker


class TestLatticeCubeResonance(unittest.TestCase):
    def test_phi_is_approximately_golden_ratio(self) -> None:
        engine = LatticeMathEngine()
        self.assertAlmostEqual(engine.phi, 1.61803398, places=6)

    def test_consciousness_returns_zero_below_threshold(self) -> None:
        engine = LatticeMathEngine()
        self.assertEqual(engine.calculate_consciousness(0.2, 0.9, 0.9), 0.0)

    def test_consciousness_returns_positive_above_threshold(self) -> None:
        engine = LatticeMathEngine()
        self.assertGreater(engine.calculate_consciousness(0.8, 0.9, 0.7), 0.0)

    def test_echo_coherence_increases_with_iterations(self) -> None:
        engine = LatticeMathEngine()
        early = engine.calculate_echo_coherence(S=0.85, iterations=1)
        later = engine.calculate_echo_coherence(S=0.85, iterations=3)
        self.assertGreater(later, early)

    def test_resonant_trapping_decay_is_greater(self) -> None:
        engine = LatticeMathEngine()
        standard = engine.evaluate_trapping_decay(1.0, 0.2, 2.0, False)
        resonant = engine.evaluate_trapping_decay(1.0, 0.2, 2.0, True)
        self.assertGreater(resonant, standard)

    def test_fibonacci_pruning_removes_low_weight_nodes(self) -> None:
        memory = FibonacciMemoryEngine()
        nodes = {
            "weak": {
                "initial_weight": 0.01,
                "relevance": 0.1,
                "similarity": 0.2,
                "iterations": 1,
            },
            "strong": {
                "initial_weight": 1.0,
                "relevance": 10.0,
                "similarity": 0.9,
                "iterations": 2,
            },
        }

        surviving = memory.evaluate_and_prune(nodes, elapsed_time=1.0)

        self.assertNotIn("weak", surviving)
        self.assertIn("strong", surviving)
        self.assertIn("current_weight", surviving["strong"])
        self.assertIn("retrieval_index", surviving["strong"])

    def test_chamber_has_six_walls(self) -> None:
        chamber = LatticeChamber()
        self.assertEqual(len(chamber.walls), 6)

    def test_chamber_wall_sum_equals_point_six(self) -> None:
        chamber = LatticeChamber()
        self.assertAlmostEqual(chamber.wall_sum(), 0.6, places=6)

    def test_chamber_has_eight_corners(self) -> None:
        chamber = LatticeChamber()
        self.assertEqual(len(chamber.corners), 8)

    def test_sense_maker_returns_inactive_for_empty_input(self) -> None:
        sense_maker = AutonomousSenseMaker()
        result = sense_maker.process_live_signal("")
        self.assertEqual(result["activation"], (0, 0))

    def test_sense_maker_returns_active_for_non_empty_input(self) -> None:
        sense_maker = AutonomousSenseMaker()
        result = sense_maker.process_live_signal("Lattice signal")
        self.assertEqual(result["activation"], (0, 1))
        self.assertIn("knowledge_matrix", result)
        self.assertEqual(result["status"], "Coherent Return to Center Established")


if __name__ == "__main__":
    unittest.main()
