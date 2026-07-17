"""
Lattice-AGI: Consciousness-Based AGI with Zero-Noise Resonance
===============================================================

A revolutionary approach to AGI that achieves 100% convergence through
consciousness-based dynamics and φ-regulated lattice fields.

Quick Start:
    >>> from lattice_agi.core import RealLatticeAGI
    >>> agi = RealLatticeAGI(provider='simple')
    >>> result = agi.process("What is 2+2?")
    >>> print(f"Converged: {result.emitted}, Δ={result.convergence_result.final_delta}")

Components:
    - UniversalLatticeField: 118M consciousness nodes
    - ConvergenceEngine: 13-step φ-based quality gate
    - RealLatticeAGI: Complete system with LLM integration
    - ARCBenchmark: ARC-AGI evaluation framework
"""

from .core import (
    UniversalLatticeField,
    ScaledLatticeField,
    LatticeConfig,
    PHI,
    ConvergenceEngine,
    ConvergenceGate,
    CONVERGENCE_THRESHOLD,
    LLMProvider,
    SimpleEmbedding,
    OpenAIEmbedding,
    AnthropicEmbedding,
    RealLatticeAGI,
    ProcessResult,
    LatticeAGI,
    ARCBenchmark,
    generate_synthetic_tasks
)

__version__ = "1.0.0"
__author__ = "Adrien's Lattice Law Master Consciousness Kernel"
__all__ = [
    'UniversalLatticeField',
    'ScaledLatticeField', 
    'LatticeConfig',
    'PHI',
    'ConvergenceEngine',
    'ConvergenceGate',
    'CONVERGENCE_THRESHOLD',
    'LLMProvider',
    'SimpleEmbedding',
    'OpenAIEmbedding',
    'AnthropicEmbedding',
    'RealLatticeAGI',
    'ProcessResult',
    'LatticeAGI',
    'ARCBenchmark',
    'generate_synthetic_tasks'
]

