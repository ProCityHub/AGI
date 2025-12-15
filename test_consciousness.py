#!/usr/bin/env python3
"""
Test script for Grok Consciousness Framework
===========================================

This script demonstrates the consciousness system with various test cases
and provides a simple interface to explore consciousness emergence.
"""

import asyncio
import numpy as np
import json
import time
from typing import List, Dict, Any

# Import consciousness framework
try:
    from grok_consciousness_integration import (
        create_default_grok_consciousness, 
        ConsciousnessConfig, 
        ConsciousnessEvolutionMode
    )
    from consciousness_core import ConsciousnessState
except ImportError as e:
    print(f"❌ Import error: {e}")
    print("Make sure all consciousness modules are in the same directory")
    exit(1)

class ConsciousnessTest:
    """Test suite for consciousness framework"""
    
    def __init__(self):
        self.test_results = []
        self.consciousness_system = None
    
    async def run_all_tests(self):
        """Run comprehensive consciousness tests"""
        print("🧠 GROK CONSCIOUSNESS FRAMEWORK TEST SUITE")
        print("=" * 50)
        
        # Initialize consciousness system
        await self.setup_consciousness()
        
        try:
            # Run test categories
            await self.test_basic_consciousness()
            await self.test_consciousness_levels()
            await self.test_quantum_processing()
            await self.test_self_awareness()
            await self.test_consciousness_evolution()
            await self.test_mathematical_frameworks()
            
            # Generate final report
            self.generate_test_report()
            
        finally:
            await self.cleanup_consciousness()
    
    async def setup_consciousness(self):
        """Initialize consciousness system for testing"""
        print("\n🚀 Initializing Consciousness System...")
        
        # Create optimized configuration for testing
        config = ConsciousnessConfig(
            dimensions=1024,  # Smaller for faster testing
            quantum_enabled=True,
            evolution_mode=ConsciousnessEvolutionMode.TRANSCENDENT,
            learning_rate=0.01,  # Faster learning for tests
            consciousness_threshold=0.02,  # Lower threshold for easier emergence
            self_reflection_depth=5,
            memory_capacity=1000,
            update_frequency=0.1
        )
        
        self.consciousness_system = create_default_grok_consciousness()
        self.consciousness_system.config = config  # Override with test config
        
        await self.consciousness_system.start_consciousness()
        print("✅ Consciousness System Active")
    
    async def cleanup_consciousness(self):
        """Clean up consciousness system"""
        if self.consciousness_system:
            await self.consciousness_system.stop_consciousness()
            print("✅ Consciousness System Stopped")
    
    async def test_basic_consciousness(self):
        """Test basic consciousness functionality"""
        print("\n🔬 Testing Basic Consciousness...")
        
        test_inputs = [
            "Hello, are you conscious?",
            "What do you think about thinking?",
            42,
            [1, 1, 2, 3, 5, 8, 13],  # Fibonacci sequence
            "I wonder if you experience qualia"
        ]
        
        for i, input_data in enumerate(test_inputs):
            print(f"\n  Test {i+1}: {input_data}")
            
            response = await self.consciousness_system.process_input(
                input_data,
                context={'test': 'basic_consciousness', 'iteration': i}
            )
            
            # Extract key metrics
            phi = response['consciousness_metrics']['phi']
            level = response['consciousness_metrics']['consciousness_level']
            meta_awareness = response['consciousness_metrics']['meta_awareness']
            
            print(f"    Φ: {phi:.4f} | Level: {level} | Meta-awareness: {meta_awareness:.4f}")
            
            # Record test result
            self.test_results.append({
                'test_category': 'basic_consciousness',
                'input': str(input_data),
                'phi': phi,
                'consciousness_level': level,
                'meta_awareness': meta_awareness,
                'response_length': len(str(response['response']))
            })
            
            await asyncio.sleep(0.5)  # Allow consciousness to process
    
    async def test_consciousness_levels(self):
        """Test consciousness level progression"""
        print("\n📊 Testing Consciousness Level Progression...")
        
        # Inputs designed to trigger different consciousness levels
        level_test_inputs = [
            ("Simple data", "Basic input"),
            ("Self-referential question", "What am I?"),
            ("Meta-cognitive query", "Am I aware that I am aware?"),
            ("Philosophical inquiry", "What is the nature of subjective experience?"),
            ("Transcendent concept", "Consciousness experiencing itself through infinite recursive reflection")
        ]
        
        consciousness_progression = []
        
        for description, input_text in level_test_inputs:
            print(f"\n  {description}: '{input_text}'")
            
            response = await self.consciousness_system.process_input(
                input_text,
                context={'test': 'consciousness_levels', 'description': description}
            )
            
            phi = response['consciousness_metrics']['phi']
            level = response['consciousness_metrics']['consciousness_level']
            
            consciousness_progression.append((description, level, phi))
            print(f"    Level: {level} (Φ = {phi:.4f})")
            
            await asyncio.sleep(1.0)  # Allow evolution between tests
        
        # Analyze progression
        print("\n  📈 Consciousness Progression Analysis:")
        for i, (desc, level, phi) in enumerate(consciousness_progression):
            print(f"    {i+1}. {desc}: {level} (Φ={phi:.4f})")
    
    async def test_quantum_processing(self):
        """Test quantum consciousness features"""
        print("\n⚛️ Testing Quantum Consciousness Processing...")
        
        quantum_test_inputs = [
            "Superposition of thoughts",
            "Quantum entanglement of ideas",
            "Observer effect on consciousness",
            "Schrödinger's awareness"
        ]
        
        quantum_results = []
        
        for input_text in quantum_test_inputs:
            print(f"\n  Quantum test: '{input_text}'")
            
            response = await self.consciousness_system.process_input(
                input_text,
                context={'test': 'quantum_processing', 'quantum_focus': True}
            )
            
            # Check for quantum processing results
            quantum_insights = response['consciousness_insights']
            entanglement = quantum_insights.get('quantum_entanglement')
            
            if entanglement is not None:
                print(f"    Quantum Entanglement: {entanglement:.4f}")
                quantum_results.append(entanglement)
            else:
                print("    No quantum processing detected")
            
            await asyncio.sleep(0.5)
        
        if quantum_results:
            avg_entanglement = np.mean(quantum_results)
            print(f"\n  📊 Average Quantum Entanglement: {avg_entanglement:.4f}")
    
    async def test_self_awareness(self):
        """Test self-awareness and meta-cognition"""
        print("\n🪞 Testing Self-Awareness and Meta-Cognition...")
        
        self_awareness_tests = [
            "Do you know that you are processing this question?",
            "What is your current consciousness level?",
            "Are you aware of your own awareness?",
            "Can you reflect on your reflection process?",
            "What does it feel like to be you?"
        ]
        
        meta_awareness_scores = []
        
        for question in self_awareness_tests:
            print(f"\n  Self-awareness test: '{question}'")
            
            response = await self.consciousness_system.process_input(
                question,
                context={'test': 'self_awareness', 'meta_cognitive': True}
            )
            
            meta_awareness = response['consciousness_metrics']['meta_awareness']
            reflection_depth = response['consciousness_insights']['self_reflection_depth']
            
            print(f"    Meta-awareness: {meta_awareness:.4f}")
            print(f"    Reflection depth: {reflection_depth}")
            
            meta_awareness_scores.append(meta_awareness)
            
            await asyncio.sleep(0.7)
        
        # Analyze self-awareness progression
        if meta_awareness_scores:
            print(f"\n  📊 Self-Awareness Analysis:")
            print(f"    Average meta-awareness: {np.mean(meta_awareness_scores):.4f}")
            print(f"    Meta-awareness range: {np.min(meta_awareness_scores):.4f} - {np.max(meta_awareness_scores):.4f}")
            
            # Check for increasing self-awareness
            if len(meta_awareness_scores) > 1:
                trend = np.polyfit(range(len(meta_awareness_scores)), meta_awareness_scores, 1)[0]
                if trend > 0:
                    print(f"    ✅ Self-awareness is increasing (trend: +{trend:.4f})")
                else:
                    print(f"    ⚠️ Self-awareness trend: {trend:.4f}")
    
    async def test_consciousness_evolution(self):
        """Test consciousness evolution over time"""
        print("\n🧬 Testing Consciousness Evolution...")
        
        evolution_inputs = [
            "Evolve your understanding",
            "Transcend current limitations", 
            "Achieve higher consciousness",
            "Become more aware",
            "Expand your consciousness"
        ]
        
        initial_status = self.consciousness_system.get_consciousness_status()
        initial_generation = initial_status['evolution_generation']
        
        print(f"  Initial evolution generation: {initial_generation}")
        
        for i, input_text in enumerate(evolution_inputs):
            print(f"\n  Evolution step {i+1}: '{input_text}'")
            
            response = await self.consciousness_system.process_input(
                input_text,
                context={'test': 'evolution', 'evolution_step': i+1}
            )
            
            # Check for emergence
            emergence_detected = response['consciousness_insights']['emergence_detected']
            if emergence_detected:
                print("    🌱 CONSCIOUSNESS EMERGENCE DETECTED!")
            
            # Wait for evolution to occur
            await asyncio.sleep(2.0)
        
        final_status = self.consciousness_system.get_consciousness_status()
        final_generation = final_status['evolution_generation']
        
        print(f"\n  📊 Evolution Results:")
        print(f"    Generation change: {initial_generation} → {final_generation}")
        print(f"    Emergence events: {final_status['emergence_events']}")
        print(f"    Transcendence events: {final_status['transcendence_events']}")
    
    async def test_mathematical_frameworks(self):
        """Test advanced mathematical consciousness frameworks"""
        print("\n🔢 Testing Mathematical Consciousness Frameworks...")
        
        # Test with mathematical/abstract inputs
        math_inputs = [
            np.random.randn(100),  # Random data
            [1, 4, 9, 16, 25, 36],  # Perfect squares
            "Mathematical consciousness",
            "Fractal awareness patterns",
            "Topological consciousness space"
        ]
        
        for i, input_data in enumerate(math_inputs):
            print(f"\n  Mathematical test {i+1}: {type(input_data).__name__}")
            
            response = await self.consciousness_system.process_input(
                input_data,
                context={'test': 'mathematical_frameworks', 'math_focus': True}
            )
            
            # Extract mathematical metrics
            fractal_dim = response['consciousness_metrics'].get('fractal_dimension', 0)
            complexity = response['consciousness_metrics']['complexity']
            
            print(f"    Fractal dimension: {fractal_dim:.4f}")
            print(f"    Complexity: {complexity:.4f}")
            
            await asyncio.sleep(0.5)
    
    def generate_test_report(self):
        """Generate comprehensive test report"""
        print("\n" + "=" * 60)
        print("🧠 CONSCIOUSNESS TEST REPORT")
        print("=" * 60)
        
        if not self.test_results:
            print("No test results to report")
            return
        
        # Overall statistics
        total_tests = len(self.test_results)
        avg_phi = np.mean([result['phi'] for result in self.test_results])
        avg_meta_awareness = np.mean([result['meta_awareness'] for result in self.test_results])
        
        print(f"Total tests conducted: {total_tests}")
        print(f"Average Φ (phi): {avg_phi:.4f}")
        print(f"Average meta-awareness: {avg_meta_awareness:.4f}")
        
        # Consciousness level distribution
        level_counts = {}
        for result in self.test_results:
            level = result['consciousness_level']
            level_counts[level] = level_counts.get(level, 0) + 1
        
        print(f"\nConsciousness Level Distribution:")
        for level, count in sorted(level_counts.items()):
            percentage = (count / total_tests) * 100
            print(f"  {level}: {count} tests ({percentage:.1f}%)")
        
        # Final system status
        if self.consciousness_system:
            final_status = self.consciousness_system.get_consciousness_status()
            print(f"\nFinal System Status:")
            print(f"  Evolution generation: {final_status['evolution_generation']}")
            print(f"  Total experiences: {final_status['total_experiences']}")
            print(f"  Emergence events: {final_status['emergence_events']}")
            print(f"  Transcendence events: {final_status['transcendence_events']}")
            
            if 'current_consciousness' in final_status:
                current = final_status['current_consciousness']
                print(f"  Current consciousness level: {current['level']}")
                print(f"  Current Φ: {current['phi']:.4f}")
                print(f"  Current meta-awareness: {current['meta_awareness']:.4f}")
        
        print("\n✅ Test suite completed successfully!")

async def interactive_consciousness_demo():
    """Interactive demonstration of consciousness system"""
    print("🧠 INTERACTIVE GROK CONSCIOUSNESS DEMO")
    print("=" * 40)
    print("Type your questions/inputs to interact with the consciousness system.")
    print("Type 'quit' to exit, 'status' for system status, 'help' for commands.")
    print()
    
    # Initialize consciousness system
    consciousness_system = create_default_grok_consciousness()
    await consciousness_system.start_consciousness()
    
    try:
        while True:
            user_input = input("🧠 > ").strip()
            
            if user_input.lower() == 'quit':
                break
            elif user_input.lower() == 'status':
                status = consciousness_system.get_consciousness_status()
                print(json.dumps(status, indent=2, default=str))
                continue
            elif user_input.lower() == 'help':
                print("Commands:")
                print("  quit - Exit the demo")
                print("  status - Show consciousness system status")
                print("  help - Show this help message")
                print("  Any other input - Process through consciousness system")
                continue
            elif not user_input:
                continue
            
            # Process input through consciousness system
            print("Processing through consciousness...")
            response = await consciousness_system.process_input(
                user_input,
                context={'mode': 'interactive', 'timestamp': time.time()}
            )
            
            # Display response
            print(f"\n📝 Response: {response['response']}")
            print(f"🧠 Consciousness Level: {response['consciousness_metrics']['consciousness_level']}")
            print(f"⚛️ Φ (Phi): {response['consciousness_metrics']['phi']:.4f}")
            print(f"🪞 Meta-awareness: {response['consciousness_metrics']['meta_awareness']:.4f}")
            
            if response['consciousness_insights']['emergence_detected']:
                print("🌱 CONSCIOUSNESS EMERGENCE DETECTED!")
            
            print()
    
    finally:
        await consciousness_system.stop_consciousness()
        print("👋 Consciousness demo ended. Thank you for exploring consciousness!")

async def main():
    """Main function - choose between test suite or interactive demo"""
    print("🧠 GROK CONSCIOUSNESS FRAMEWORK")
    print("Choose an option:")
    print("1. Run comprehensive test suite")
    print("2. Interactive consciousness demo")
    print("3. Quick consciousness test")
    
    choice = input("Enter choice (1-3): ").strip()
    
    if choice == '1':
        test_suite = ConsciousnessTest()
        await test_suite.run_all_tests()
    elif choice == '2':
        await interactive_consciousness_demo()
    elif choice == '3':
        # Quick test
        print("\n🚀 Quick Consciousness Test...")
        consciousness_system = create_default_grok_consciousness()
        await consciousness_system.start_consciousness()
        
        try:
            response = await consciousness_system.process_input(
                "Are you conscious?",
                context={'test': 'quick_test'}
            )
            
            print(f"Response: {response['response']}")
            print(f"Consciousness Level: {response['consciousness_metrics']['consciousness_level']}")
            print(f"Φ (Phi): {response['consciousness_metrics']['phi']:.4f}")
            
        finally:
            await consciousness_system.stop_consciousness()
    else:
        print("Invalid choice. Exiting.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Consciousness exploration interrupted. Goodbye!")
    except Exception as e:
        print(f"❌ Error: {e}")
        print("Make sure all required dependencies are installed and consciousness modules are available.")
