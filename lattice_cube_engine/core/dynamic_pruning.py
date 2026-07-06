"""
Fibonacci Memory Engine.
Author and concept origin: Adrien D. Thomas

Dynamic memory attenuation and pruning for Lattice Cube runtime.
"""

from __future__ import annotations

import math
from typing import Any, Dict


class FibonacciMemoryEngine:
    """
    Implements Fibonacci attenuation memory.

    Nodes below tau = 13 / 144 are pruned.
    Surviving nodes retain current_weight and retrieval_index.
    """

    def __init__(self) -> None:
        self.phi = (1 + 5 ** 0.5) / 2
        self.pruning_threshold = 13 / 144

    def calculate_attenuation(
        self,
        initial_memory: float,
        relevance: float,
        elapsed_time: float,
    ) -> float:
        """
        Compute memory attenuation:

        M(t) = M0 * e^(-lambda * t)

        lambda = (1 / phi) / relevance
        """
        safe_initial = max(0.0, float(initial_memory))
        safe_relevance = float(relevance)
        safe_elapsed = max(0.0, float(elapsed_time))

        if safe_relevance <= 0:
            return 0.0

        attenuation_constant = (1 / self.phi) / safe_relevance
        return float(safe_initial * math.exp(-attenuation_constant * safe_elapsed))

    def evaluate_and_prune(
        self,
        memory_nodes: Dict[str, Dict[str, Any]],
        elapsed_time: float,
    ) -> Dict[str, Dict[str, Any]]:
        """
        Autonomous memory loop:
        update node weights and remove nodes that fall below tau.
        """
        surviving_nodes: Dict[str, Dict[str, Any]] = {}

        for node_id, data in memory_nodes.items():
            initial_weight = float(data.get("initial_weight", 0.0))
            relevance = float(data.get("relevance", 0.0))
            similarity = float(data.get("similarity", 0.0))
            iterations = int(data.get("iterations", 0))

            current_weight = self.calculate_attenuation(
                initial_memory=initial_weight,
                relevance=relevance,
                elapsed_time=elapsed_time,
            )

            if current_weight >= self.pruning_threshold:
                surviving_nodes[node_id] = {
                    **data,
                    "current_weight": current_weight,
                    "retrieval_index": similarity * (self.phi ** max(0, iterations)),
                }

        return surviving_nodes
