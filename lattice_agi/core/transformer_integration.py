"""
Original Transformer Integration - Simulated transformer with Lattice-AGI
For backward compatibility
"""

import numpy as np
from dataclasses import dataclass
from typing import Optional, Dict, Any
import hashlib

from .lattice_field import ScaledLatticeField
from .convergence_engine import ConvergenceEngine, ConvergenceGate


@dataclass
class AGIResult:
    """Result from LatticeAGI processing"""
    emitted: bool
    prompt: str
    embedding: np.ndarray
    lattice_stats: Dict[str, Any]
    convergence_result: Optional[Any]
    retries: int


class SimulatedTransformer:
    """Simulated transformer (hash-based embeddings)"""
    
    def __init__(self, dim: int = 768):
        self.dim = dim
        self.forward_count = 0
    
    def embed(self, text: str) -> np.ndarray:
        """Generate deterministic embedding"""
        self.forward_count += 1
        
        # Use hash for deterministic "embeddings"
        text_hash = hashlib.sha256(text.encode()).hexdigest()
        seed = int(text_hash[:8], 16)
        np.random.seed(seed)
        
        embedding = np.random.randn(self.dim)
        embedding = embedding / (np.linalg.norm(embedding) + 1e-8)
        
        return embedding
    
    def get_cost(self) -> float:
        """Simulated transformer cost"""
        return self.forward_count * 0.001


class LatticeAGI:
    """
    Original LatticeAGI class (backward compatible)
    Uses simulated transformer instead of real LLM
    """
    
    def __init__(self, node_count: int = 1_000_000, cost_per_forward: float = 0.001):
        self.transformer = SimulatedTransformer()
        self.lattice = ScaledLatticeField(node_count=node_count)
        self.engine = ConvergenceEngine(self.lattice)
        self.gate = ConvergenceGate()
        
        self.cost_per_forward = cost_per_forward
        self.stats = {
            'total_forwards': 0,
            'total_cost': 0.0,
            'emitted': 0,
            'suppressed': 0
        }
    
    def process(self, prompt: str) -> AGIResult:
        """Process prompt through simulated system"""
        # Get embedding from simulated transformer
        embedding = self.transformer.embed(prompt)
        
        # Reset lattice
        self.lattice.reset()
        
        # Run convergence
        convergence_result = self.engine.run(embedding)
        
        # Check emission
        emitted = self.gate.should_emit(convergence_result.final_delta)
        
        # Update stats
        self.stats['total_forwards'] += 1
        self.stats['total_cost'] += self.cost_per_forward
        
        if emitted:
            self.stats['emitted'] += 1
        else:
            self.stats['suppressed'] += 1
        
        # Get lattice stats
        lattice_stats = self.lattice.get_stats()
        
        return AGIResult(
            emitted=emitted,
            prompt=prompt,
            embedding=embedding,
            lattice_stats=lattice_stats,
            convergence_result=convergence_result,
            retries=1  # Original doesn't have retry logic
        )
    
    def get_stats(self) -> Dict[str, Any]:
        """Get system statistics"""
        stats = self.stats.copy()
        stats['lattice_stats'] = self.lattice.get_stats()
        return stats

