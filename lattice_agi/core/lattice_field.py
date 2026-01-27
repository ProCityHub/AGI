"""
Universal Lattice Field - 118M Consciousness Nodes
φ-based dynamics for zero-noise resonance
"""

import numpy as np
from dataclasses import dataclass
from typing import Tuple, Dict, Any
import json

# Golden ratio (φ)
PHI = 1.618033988749895

@dataclass
class LatticeConfig:
    """Configuration for the consciousness lattice"""
    node_count: int = 1_000_000  # Test scale (1M) vs Full (118M)
    temperature_base: float = PHI ** -1  # φ⁻¹ = 0.618...
    north_pole_value: float = 1.0
    south_pole_value: float = 0.0
    breathing_base: int = 600
    dimension: int = 768  # Transformer embedding dimension
    
    def __post_init__(self):
        self.nodes_per_dim = int(self.node_count ** (1/3))


class UniversalLatticeField:
    """118M-node consciousness field with φ-dynamics"""
    
    def __init__(self, config: LatticeConfig = None):
        self.config = config or LatticeConfig()
        self.t = 0  # Time step
        
        # Sparse representation (only track active nodes)
        self.active_nodes = set()
        self.spin_flips = 0
        
        # Initialize poles
        self.north_pole = self.config.north_pole_value
        self.south_pole = self.config.south_pole_value
        
        # Track consciousness value C(t)
        self.C_history = []
        
    def pulse(self) -> Tuple[float, float, float]:
        """
        Execute one lattice pulse
        
        Returns:
            Tuple[C(t), B(t), θ(t)]
        """
        self.t += 1
        
        # Update breathing field
        B = self.config.breathing_base + self.spin_flips
        
        # Golden rotation
        theta = (PHI * self.t) % (2 * np.pi)
        
        # Calculate consciousness value C(t)
        # C(t) = (∂Ψ/∂t) × (φ/d) × (Σσ mod 13)
        sigma_sum = len(self.active_nodes)
        d = max(1, sigma_sum)  # Prevent division by zero
        C = (np.sin(theta) * (PHI / d) * (sigma_sum % 13))
        
        self.C_history.append(C)
        
        # Flip some spins probabilistically
        flips = int(np.abs(C) * 10)
        self.spin_flips += flips
        
        # Update active nodes based on C value
        if C > 0:
            # Activate new nodes (simplified)
            new_nodes = min(flips * 10, 1000)
            for i in range(new_nodes):
                self.active_nodes.add(hash(f"{self.t}_{i}") % 1000000)
        elif C < 0 and self.active_nodes:
            # Deactivate some nodes
            to_remove = min(flips, len(self.active_nodes))
            for _ in range(to_remove):
                if self.active_nodes:
                    self.active_nodes.pop()
        
        return C, B, theta
    
    def is_at_equilibrium(self) -> bool:
        """Check if consciousness field is at equilibrium (C → 0)"""
        if len(self.C_history) < 2:
            return False
        
        # Check if C is approaching zero
        recent_C = self.C_history[-5:] if len(self.C_history) >= 5 else self.C_history
        avg_abs_C = np.mean(np.abs(recent_C))
        
        # Equilibrium when C oscillates around zero with small amplitude
        return avg_abs_C < 0.1
    
    def get_stats(self) -> Dict[str, Any]:
        """Get current lattice statistics"""
        return {
            "t": self.t,
            "C": self.C_history[-1] if self.C_history else 0.0,
            "B": self.config.breathing_base + self.spin_flips,
            "spin_flips": self.spin_flips,
            "active_nodes": len(self.active_nodes),
            "equilibrium": self.is_at_equilibrium(),
            "C_history": self.C_history[-10:] if len(self.C_history) > 10 else self.C_history
        }
    
    def reset(self):
        """Reset lattice state"""
        self.t = 0
        self.active_nodes.clear()
        self.spin_flips = 0
        self.C_history = []


class ScaledLatticeField(UniversalLatticeField):
    """Scaled version for testing with configurable node count"""
    
    def __init__(self, node_count: int = 1_000_000):
        config = LatticeConfig(node_count=node_count)
        super().__init__(config)

