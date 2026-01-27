"""
Convergence Engine - 13-step φ-based quality gate
Only emits outputs when Δ < 0.01 (zero-noise resonance)
"""

import numpy as np
from dataclasses import dataclass
from typing import List, Optional
from .lattice_field import PHI

CONVERGENCE_THRESHOLD = 0.01

@dataclass
class ConvergenceResult:
    """Result of convergence process"""
    converged: bool
    final_delta: float
    iterations: int
    delta_history: List[float]
    projection_matrix: np.ndarray


class ConvergenceGate:
    """Quality gate that only emits when Δ < threshold"""
    
    def __init__(self, temperature: float = PHI ** -1):
        self.temperature = temperature
        self.emission_count = 0
        self.suppression_count = 0
    
    def should_emit(self, delta: float) -> bool:
        """Decide whether to emit based on convergence quality"""
        if delta < CONVERGENCE_THRESHOLD:
            self.emission_count += 1
            return True
        else:
            self.suppression_count += 1
            return False
    
    def get_stats(self):
        """Get gate statistics"""
        total = self.emission_count + self.suppression_count
        return {
            "emissions": self.emission_count,
            "suppressions": self.suppression_count,
            "emission_rate": self.emission_count / max(1, total)
        }


class ConvergenceEngine:
    """13-step φ-based convergence engine"""
    
    def __init__(self, lattice, temperature: float = PHI ** -1):
        self.lattice = lattice
        self.temperature = temperature
        
        # Create deterministic φ-seeded projection matrix
        np.random.seed(int(PHI * 1e6))  # Seed with φ
        self.projection_matrix = np.random.randn(128, 768) * 0.1
    
    def project_to_lattice(self, embedding: np.ndarray) -> np.ndarray:
        """Project 768-dim embedding to 128-bit lattice state"""
        if embedding.shape[0] != 768:
            embedding = embedding[:768]  # Truncate if needed
        
        # Project to 128 dimensions
        lattice_state = self.projection_matrix @ embedding
        
        # Apply φ-based temperature scaling
        lattice_state = lattice_state * self.temperature
        
        return lattice_state
    
    def calculate_delta(self, embedding: np.ndarray, lattice_state: np.ndarray) -> float:
        """
        Calculate convergence delta (Δ)
        Lower delta = better alignment
        """
        # Reconstruct embedding from lattice state
        reconstructed = self.projection_matrix.T @ lattice_state
        
        # Normalize for comparison
        embedding_norm = embedding / (np.linalg.norm(embedding) + 1e-8)
        reconstructed_norm = reconstructed / (np.linalg.norm(reconstructed) + 1e-8)
        
        # Delta = 1 - cosine similarity
        delta = 1 - np.dot(embedding_norm, reconstructed_norm)
        
        return abs(delta)
    
    def run(self, embedding: np.ndarray, iterations: int = 13) -> ConvergenceResult:
        """
        Run convergence loop for specified iterations
        
        Returns:
            ConvergenceResult with final delta and history
        """
        delta_history = []
        
        for i in range(iterations):
            # Project to lattice space
            lattice_state = self.project_to_lattice(embedding)
            
            # Calculate delta
            delta = self.calculate_delta(embedding, lattice_state)
            delta_history.append(delta)
            
            # Update lattice with delta feedback
            if delta > 0.1:  # Large delta = perturb lattice
                self.lattice.spin_flips += int(delta * 100)
            
            # Apply lattice pulse
            self.lattice.pulse()
            
            # Early convergence check
            if delta < 1e-6:  # Essentially zero
                break
        
        final_delta = delta_history[-1]
        converged = final_delta < CONVERGENCE_THRESHOLD
        
        return ConvergenceResult(
            converged=converged,
            final_delta=final_delta,
            iterations=len(delta_history),
            delta_history=delta_history,
            projection_matrix=self.projection_matrix
        )

