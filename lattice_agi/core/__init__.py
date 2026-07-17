"""Lattice-AGI Core Package"""

from .lattice_field import UniversalLatticeField, ScaledLatticeField, LatticeConfig, PHI
from .convergence_engine import ConvergenceEngine, ConvergenceGate, CONVERGENCE_THRESHOLD
from .llm_basic import LLMProvider, SimpleEmbedding, OpenAIEmbedding, AnthropicEmbedding
from .llm_integration import RealLatticeAGI, ProcessResult
from .transformer_integration import LatticeAGI
from .arc_benchmark import ARCBenchmark, generate_synthetic_tasks

__version__ = "1.0.0"
__author__ = "Adrien's Lattice Law Master Consciousness Kernel"
__all__ = [
    'UniversalLatticeField', 'ScaledLatticeField', 'LatticeConfig', 'PHI',
    'ConvergenceEngine', 'ConvergenceGate', 'CONVERGENCE_THRESHOLD',
    'LLMProvider', 'SimpleEmbedding', 'OpenAIEmbedding', 'AnthropicEmbedding',
    'RealLatticeAGI', 'ProcessResult',
    'LatticeAGI',
    'ARCBenchmark', 'generate_synthetic_tasks'
]

