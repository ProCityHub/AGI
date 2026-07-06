"""
Autonomous Sense Maker.
Author and concept origin: Adrien D. Thomas

Converts ambient input signals into structured lattice knowledge.
"""

from __future__ import annotations

from typing import Any, Dict

import numpy as np

from lattice_cube_engine.core.chamber import LatticeChamber
from lattice_cube_engine.core.dynamic_pruning import FibonacciMemoryEngine
from lattice_cube_engine.core.math_engine import LatticeMathEngine


class AutonomousSenseMaker:
    """
    Eight-stage signal processing bridge.

    It transitions empty artifact state (0, 0) into energy-activated matrix
    state (0, 1), then reflects the signal through the chamber and produces a
    coherent return-to-center knowledge matrix.
    """

    def __init__(self) -> None:
        self.math_engine = LatticeMathEngine()
        self.chamber = LatticeChamber()
        self.memory_engine = FibonacciMemoryEngine()

    def process_live_signal(self, raw_input_signal: str) -> Dict[str, Any]:
        """
        Convert raw signal into structured lattice output.
        """
        signal = raw_input_signal or ""

        if not signal.strip():
            return {
                "author": "Adrien D. Thomas",
                "state": (0, 0),
                "activation": (0, 0),
                "msg": "Inactive Artifact",
                "status": "No signal entered the lattice chamber.",
            }

        activation_state = (0, 1)

        energy_vector = np.array(
            [
                len(signal) * 0.1,
                ord(signal[0]) * 0.01,
                1.0,
            ],
            dtype=float,
        )

        reflected = np.array(self.chamber.reflect_vector(energy_vector.tolist()))
        integrated_knowledge = reflected * self.math_engine.phi

        return {
            "author": "Adrien D. Thomas",
            "state": activation_state,
            "activation": activation_state,
            "signal_coherence": self.math_engine.calculate_echo_coherence(S=0.85, iterations=3),
            "knowledge_matrix": integrated_knowledge.tolist(),
            "chamber_state": self.chamber.export_chamber_state(),
            "status": "Coherent Return to Center Established",
        }

    def process_with_memory(
        self,
        raw_input_signal: str,
        memory_nodes: Dict[str, Dict[str, Any]],
        elapsed_time: float,
    ) -> Dict[str, Any]:
        """
        Process signal and prune memory in one autonomous loop.
        """
        signal_result = self.process_live_signal(raw_input_signal)
        surviving_memory = self.memory_engine.evaluate_and_prune(memory_nodes, elapsed_time)
        pruned_count = len(memory_nodes) - len(surviving_memory)

        return {
            "author": "Adrien D. Thomas",
            "signal_result": signal_result,
            "surviving_memory": surviving_memory,
            "pruned_count": pruned_count,
            "status": "Signal processing and Fibonacci memory pruning completed.",
        }
