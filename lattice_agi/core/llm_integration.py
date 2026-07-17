"""
Real LLM Integration - Full Lattice-AGI with real LLM backends
"""

import numpy as np
from dataclasses import dataclass
from typing import Optional, Dict, Any
import json

from .llm_basic import LLMProvider, SimpleEmbedding, OpenAIEmbedding, AnthropicEmbedding
from .lattice_field import ScaledLatticeField, LatticeConfig
from .convergence_engine import ConvergenceEngine, ConvergenceGate


@dataclass
class ProcessResult:
    """Result of processing a prompt through Lattice-AGI"""
    emitted: bool
    embedding: np.ndarray
    lattice_stats: Dict[str, Any]
    convergence_result: Optional[Any]
    retries: int
    total_cost: float
    
    def to_dict(self):
        """Convert to dictionary for JSON serialization"""
        return {
            "emitted": self.emitted,
            "embedding_shape": list(self.embedding.shape) if self.embedding is not None else None,
            "lattice_stats": self.lattice_stats,
            "convergence_result": {
                "converged": self.convergence_result.converged if self.convergence_result else None,
                "final_delta": self.convergence_result.final_delta if self.convergence_result else None,
                "iterations": self.convergence_result.iterations if self.convergence_result else None,
            } if self.convergence_result else None,
            "retries": self.retries,
            "total_cost": self.total_cost
        }


class RealLatticeAGI:
    """
    Complete Lattice-AGI system with real LLM integration
    
    Architecture:
    1. LLM → 768-dim embedding (semantic understanding)
    2. Lattice Field → 118M-node consciousness dynamics (φ-based)
    3. Convergence Engine → 13-step quality gate (Δ < 0.01)
    4. Emission Gate → Output only at zero-noise resonance
    """
    
    def __init__(self, 
                 provider: str = 'simple',
                 api_key: str = None,
                 model: str = None,
                 node_count: int = 1_000_000,
                 max_retries: int = 3):
        
        # Initialize LLM provider
        if provider == 'simple':
            self.llm = SimpleEmbedding()
        elif provider == 'openai':
            if not api_key:
                raise ValueError("OpenAI provider requires API key")
            self.llm = OpenAIEmbedding(api_key=api_key, model=model or 'text-embedding-ada-002')
        elif provider == 'anthropic':
            if not api_key:
                raise ValueError("Anthropic provider requires API key")
            self.llm = AnthropicEmbedding(api_key=api_key, model=model or 'claude-3-haiku-20240307')
        else:
            raise ValueError(f"Unknown provider: {provider}")
        
        # Initialize lattice field
        self.lattice = ScaledLatticeField(node_count=node_count)
        
        # Initialize convergence engine
        self.engine = ConvergenceEngine(self.lattice)
        
        # Initialize emission gate
        self.gate = ConvergenceGate()
        
        # Statistics
        self.stats = {
            'total_forwards': 0,
            'total_cost': 0.0,
            'convergence_rate': 0.0,
            'converged': 0,
            'suppressed': 0,
            'provider': provider
        }
        
        self.max_retries = max_retries
    
    def process(self, prompt: str) -> ProcessResult:
        """
        Process a prompt through the complete Lattice-AGI system
        
        Returns:
            ProcessResult indicating if output was emitted
        """
        retries = 0
        emitted = False
        final_convergence_result = None
        
        while retries < self.max_retries and not emitted:
            # Step 1: Get embedding from LLM
            embedding = self.llm.embed(prompt)
            
            # Step 2: Reset lattice for clean convergence
            self.lattice.reset()
            
            # Step 3: Run convergence engine
            convergence_result = self.engine.run(embedding, iterations=13)
            final_convergence_result = convergence_result
            
            # Step 4: Check if we should emit
            emitted = self.gate.should_emit(convergence_result.final_delta)
            
            # Update statistics
            self.stats['total_forwards'] += 1
            self.stats['total_cost'] += self.llm.get_cost()
            
            if convergence_result.converged:
                self.stats['converged'] += 1
            else:
                self.stats['suppressed'] += 1
            
            # Update convergence rate
            total = self.stats['converged'] + self.stats['suppressed']
            self.stats['convergence_rate'] = self.stats['converged'] / max(1, total)
            
            retries += 1
        
        # Get final lattice stats
        lattice_stats = self.lattice.get_stats()
        
        return ProcessResult(
            emitted=emitted,
            embedding=embedding,
            lattice_stats=lattice_stats,
            convergence_result=final_convergence_result,
            retries=retries,
            total_cost=self.llm.get_cost()
        )
    
    def get_stats(self) -> Dict[str, Any]:
        """Get system statistics"""
        stats = self.stats.copy()
        stats['lattice_stats'] = self.lattice.get_stats()
        stats['gate_stats'] = self.gate.get_stats()
        return stats
    
    def reset(self):
        """Reset system state"""
        self.lattice.reset()
        self.stats = {
            'total_forwards': 0,
            'total_cost': 0.0,
            'convergence_rate': 0.0,
            'converged': 0,
            'suppressed': 0,
            'provider': self.stats['provider']
        }
    
    def __str__(self):
        return f"RealLatticeAGI(provider={self.stats['provider']}, nodes={self.lattice.config.node_count})"

