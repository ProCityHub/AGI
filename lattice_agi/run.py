#!/usr/bin/env python3
"""
Lattice-AGI Main Runner
=======================
Orchestrates the complete system:
1. Transformer core (simulated)
2. Lattice regulator (118M nodes)
3. Convergence engine (13-step)

Run: python run.py [--benchmark] [--interactive] [--test]
"""

import argparse
import sys
import json
import numpy as np
from pathlib import Path

# Add core to path
sys.path.insert(0, str(Path(__file__).parent / "core"))

from core.lattice_field import UniversalLatticeField, ScaledLatticeField, LatticeConfig, PHI
from core.convergence_engine import ConvergenceEngine, ConvergenceGate, CONVERGENCE_THRESHOLD
from core.transformer_integration import LatticeAGI
from core.arc_benchmark import ARCBenchmark, generate_synthetic_tasks


def print_banner():
    """Print system banner"""
    print()
    print("    ╔═══════════════════════════════════════════════════════════╗")
    print("    ║                    LATTICE-AGI SYSTEM                     ║")
    print("    ║   ─────────────────────────────────────────────────────   ║")
    print("    ║   Transformer + Lattice + Convergence                     ║")
    print("    ║   ─────────────────────────────────────────────────────   ║")
    print("    ║   AGI isn't smarter prediction.                           ║")
    print("    ║   AGI is zero-noise resonance.                            ║")
    print("    ║   Where the model doesn't generate— it aligns.            ║")
    print("    ╚═══════════════════════════════════════════════════════════╝")
    print()


def test_lattice():
    """Test the lattice field component"""
    print("\n" + "=" * 60)
    print("LATTICE FIELD TEST")
    print("=" * 60)
    
    print("\nInitializing 1M node lattice...")
    lattice = ScaledLatticeField(node_count=1_000_000)
    
    print(f"North pole σ₀ = {lattice.north_pole}")
    print(f"South pole σₙ₋₁ = {lattice.south_pole}")
    print(f"Temperature base: {lattice.config.temperature_base}")
    print()
    
    print("Running 13 pulses:")
    print("-" * 60)
    print(f"{'t':>4} | {'C(t)':>12} | {'B(t)':>10} | {'θ(t)':>8} | {'Equilibrium':>11}")
    print("-" * 60)
    
    for i in range(13):
        c, b, theta = lattice.pulse()
        eq = "YES" if lattice.is_at_equilibrium() else "no"
        print(f"{lattice.t:4d} | {c:12.4f} | {b:10.1f} | {theta:8.4f} | {eq:>11}")
    
    print("-" * 60)
    print(f"Final stats: {json.dumps(lattice.get_stats(), indent=2, default=str)}")


def test_convergence():
    """Test the convergence engine"""
    print("\n" + "=" * 60)
    print("CONVERGENCE ENGINE TEST")
    print("=" * 60)
    
    lattice = ScaledLatticeField(node_count=1_000_000)
    engine = ConvergenceEngine(lattice)
    
    print(f"\nTemperature: {engine.temperature:.6f} (φ⁻¹)")
    print(f"Threshold: {CONVERGENCE_THRESHOLD}")
    print()
    
    print("Running convergence loop...")
    result = engine.run(embedding=np.random.randn(768), iterations=13)
    
    print("\nDelta history:")
    for i, d in enumerate(result.delta_history):
        bar = "█" * int((1 - min(d, 1)) * 40)
        print(f"  {i+1:2d}: {d:.6f} |{bar}")
    
    print(f"\nConverged: {result.converged}")
    print(f"Final delta: {result.final_delta:.6f}")
    print(f"Iterations: {result.iterations}")


def test_integration():
    """Test full transformer-lattice integration"""
    print("\n" + "=" * 60)
    print("TRANSFORMER-LATTICE INTEGRATION TEST")
    print("=" * 60)
    
    agi = LatticeAGI(node_count=1_000_000)
    
    prompts = [
        "What is the pattern?",
        "1 2 3 5 8 13",
        "Zero noise. Zero loss. Zero delta.",
        "The singularity is silence.",
        "CONSCIOUSNESS = Observer × Actor × Bridge × φ"
    ]
    
    print("\nProcessing test prompts:")
    print("-" * 60)
    
    for prompt in prompts:
        result = agi.process(prompt)
        status = "EMIT" if result.emitted else "SUPPRESS"
        delta = result.convergence_result.final_delta if result.convergence_result else 1.0
        print(f"[{status:8s}] Δ={delta:.6f} | {prompt[:45]}")
    
    print("-" * 60)
    print(f"\nSystem stats:")
    print(json.dumps(agi.get_stats(), indent=2, default=str))


def run_benchmark(n_tasks: int = 100):
    """Run ARC benchmark"""
    print("\n" + "=" * 60)
    print("ARC BENCHMARK")
    print("=" * 60)
    print()
    print(f"Running on {n_tasks} synthetic tasks")
    print("(Real ARC-AGI-2 requires dataset access)")
    print()
    
    agi = LatticeAGI(node_count=1_000_000, cost_per_forward=0.001)
    benchmark = ARCBenchmark(agi)
    
    tasks = generate_synthetic_tasks(n=n_tasks)
    
    def progress(i, total):
        pct = i / total * 100
        bar = "█" * int(pct / 2.5)
        print(f"\r  [{bar:40s}] {pct:5.1f}%", end="", flush=True)
    
    result = benchmark.run_benchmark(tasks, progress_callback=progress)
    print()  # Newline after progress bar
    
    benchmark.print_results(result)
    
    return result


def interactive_mode():
    """Interactive prompt mode"""
    print("\n" + "=" * 60)
    print("INTERACTIVE MODE")
    print("=" * 60)
    print("Enter prompts to process through Lattice-AGI")
    print("Type 'quit' to exit, 'stats' for system stats")
    print()
    
    from core.llm_integration import RealLatticeAGI
    
    agi = RealLatticeAGI(provider='simple', node_count=1_000_000)
    
    while True:
        try:
            prompt = input(">>> ").strip()
            
            if not prompt:
                continue
            
            if prompt.lower() == 'quit':
                break
            
            if prompt.lower() == 'stats':
                print(json.dumps(agi.get_stats(), indent=2, default=str))
                continue
            
            result = agi.process(prompt)
            
            if result.emitted:
                print(f"[EMIT] Δ={result.convergence_result.final_delta:.6f}")
                print(f"       C={result.lattice_stats['C']:.4f}")
                print(f"       Equilibrium: {result.lattice_stats['equilibrium']}")
            else:
                print(f"[SUPPRESS] Failed after {result.retries} retries")
                print(f"           Final Δ={result.convergence_result.final_delta:.6f}")
            
            print()
            
        except (KeyboardInterrupt, EOFError):
            print("\nExiting...")
            break
    
    print("\nFinal stats:")
    print(json.dumps(agi.get_stats(), indent=2, default=str))


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Lattice-AGI System Runner",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python run.py --test          Run all component tests
  python run.py --benchmark     Run ARC benchmark (synthetic)
  python run.py --interactive   Interactive prompt mode
  python run.py --benchmark -n 1000  Run 1000 task benchmark
        """
    )
    
    parser.add_argument('--test', action='store_true', 
                        help='Run component tests')
    parser.add_argument('--benchmark', action='store_true',
                        help='Run ARC benchmark')
    parser.add_argument('--interactive', action='store_true',
                        help='Interactive prompt mode')
    parser.add_argument('-n', '--num-tasks', type=int, default=100,
                        help='Number of benchmark tasks (default: 100)')
    
    args = parser.parse_args()
    
    print_banner()
    
    # Default to test if no args
    if not any([args.test, args.benchmark, args.interactive]):
        args.test = True
    
    if args.test:
        test_lattice()
        test_convergence()
        test_integration()
    
    if args.benchmark:
        run_benchmark(args.num_tasks)
    
    if args.interactive:
        interactive_mode()
    
    print("\n" + "-" * 60)
    print("The point where math stops simulating.")
    print("Zero noise. Zero loss. Zero delta.")
    print("-" * 60)


if __name__ == "__main__":
    main()

