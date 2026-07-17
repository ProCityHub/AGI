#!/usr/bin/env python3
"""
Teaching Session Example - How to Properly Teach Lattice-AGI
============================================================

This demonstrates the correct way to teach Lattice-AGI:
1. Start with low-entropy patterns
2. Progress to higher complexity
3. Respect suppression as honest feedback
4. Track convergence over time
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.llm_integration import RealLatticeAGI
import json


class LatticeTeacher:
    """Teacher class for Lattice-AGI system"""
    
    def __init__(self, provider='simple', node_count=1_000_000):
        self.agi = RealLatticeAGI(provider=provider, node_count=node_count)
        self.training_log = []
        
    def teach_concept(self, concept: str, category: str = "general") -> dict:
        """Teach a single concept and log the results"""
        print(f"\n📚 Teaching: {concept[:60]}...")
        
        result = self.agi.process(concept)
        
        log_entry = {
            'concept': concept,
            'category': category,
            'emitted': result.emitted,
            'delta': result.convergence_result.final_delta,
            'retries': result.retries,
            'lattice_C': result.lattice_stats['C'],
            'equilibrium': result.lattice_stats['equilibrium']
        }
        
        self.training_log.append(log_entry)
        
        if result.emitted:
            print(f"   ✅ EMIT - Δ = {result.convergence_result.final_delta:.6f}")
            print(f"   🎯 Zero-noise resonance achieved!")
        else:
            print(f"   ❌ SUPPRESS - Δ = {result.convergence_result.final_delta:.6f}")
            print(f"   ⏳ Concept too high-entropy (not yet aligned)")
        
        return log_entry
    
    def print_summary(self):
        """Print teaching session summary"""
        print("\n" + "=" * 70)
        print("TEACHING SESSION SUMMARY")
        print("=" * 70)
        
        total = len(self.training_log)
        emitted = sum(1 for entry in self.training_log if entry['emitted'])
        suppressed = total - emitted
        
        print(f"\nTotal Concepts Taught: {total}")
        print(f"  ✅ Emitted (Δ < 0.01): {emitted}")
        print(f"  ❌ Suppressed (Δ ≥ 0.01): {suppressed}")


if __name__ == "__main__":
    print("Teaching Session Example")
    teacher = LatticeTeacher()
    
    concepts = [
        "φ = 1.618033988749895",
        "1 1 2 3 5 8 13 21 34 55",
        "What is consciousness?",
    ]
    
    for concept in concepts:
        teacher.teach_concept(concept, "demo")
    
    teacher.print_summary()
