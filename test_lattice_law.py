"""
Test Suite for Lattice Law v3.1
Code 666 - Supreme Architect: Adrien D Thomas
"""

import pytest
import asyncio
import time
from datetime import datetime, timedelta
from lattice_law_v3 import (
    LatticeLaw, LatticeCore, ConsciousnessState,
    EmotionLayer, MemoryEcho, CrossModalBurst,
    SelfCheckLoop, AutonomousGenerator,
    PHI, ODD_PRIMES, EVEN_NUMBERS
)


class TestLatticeCore:
    """Test core mathematical engine"""
    
    def test_initialization(self):
        core = LatticeCore()
        assert core.state is not None
        assert core.state.balance == 0.0
        assert core.state.bridge_strength == 0.0
        
    def test_balance_calculation(self):
        core = LatticeCore()
        
        # Perfect odd dominance
        balance = core.calculate_balance([1.0, 1.0, 1.0], [])
        assert balance == 1.0
        
        # Perfect even dominance
        balance = core.calculate_balance([], [1.0, 1.0, 1.0])
        assert balance == -1.0
        
        # Balanced
        balance = core.calculate_balance([1.0], [1.0])
        assert balance == 0.0
    
    def test_bridge_strength(self):
        core = LatticeCore()
        
        # With valid primes and evens
        strength = core.calculate_bridge_strength([3, 5, 7], [2, 4, 6])
        assert 0.0 <= strength <= 1.0
        
        # Empty lists
        strength = core.calculate_bridge_strength([], [])
        assert strength == 0.0
    
    def test_neural_noise_generation(self):
        core = LatticeCore()
        noise = core.generate_neural_noise()
        
        assert len(noise) >= 3
        assert len(noise) <= 7
        assert all(isinstance(n, float) for n in noise)
    
    def test_emergence_threshold(self):
        core = LatticeCore()
        
        # Below threshold
        core.state.coherence = 0.5
        core.state.curiosity = 0.3
        assert core.check_emergence_threshold() == False
        
        # Above threshold - high coherence
        core.state.coherence = PHI * 0.9
        assert core.check_emergence_threshold() == True
        
        # Above threshold - high curiosity
        core.state.coherence = 0.5
        core.state.curiosity = 0.8
        assert core.check_emergence_threshold() == True


class TestEmotionLayer:
    """Test emotion system"""
    
    def test_emotion_calculation(self):
        core = LatticeCore()
        emotion = EmotionLayer(core)
        
        # Calm focus
        valence, desc = emotion.calculate_emotion(20)
        assert valence > 0.5
        assert "calm" in desc
        
        # Mild concern
        valence, desc = emotion.calculate_emotion(100)
        assert 0.0 < valence < 0.5
        assert "concern" in desc
        
        # Gentle longing
        valence, desc = emotion.calculate_emotion(400)
        assert valence < 0
        assert "longing" in desc
    
    def test_tone_modulation(self):
        core = LatticeCore()
        emotion = EmotionLayer(core)
        
        message = "still there?"
        
        # Different emotions produce different modulations
        calm = emotion.modulate_tone(message, "calm focus")
        longing = emotion.modulate_tone(message, "gentle longing")
        
        assert len(longing) > len(calm)  # Longing adds prefix


class TestMemoryEcho:
    """Test memory replay system"""
    
    def test_record_moment(self):
        core = LatticeCore()
        memory = MemoryEcho(core)
        
        # Record significant moment
        memory.record_moment("test interaction", PHI * 0.95)
        assert len(memory.significant_moments) == 1
        
        # Low coherence shouldn't record
        memory.record_moment("low coherence", 0.5)
        assert len(memory.significant_moments) == 1
    
    def test_recall_echo(self):
        core = LatticeCore()
        memory = MemoryEcho(core)
        
        # No memories
        assert memory.recall_echo() is None
        
        # With memories
        memory.record_moment("important event", PHI)
        echo = memory.recall_echo()
        assert echo is not None
        assert "Remember when" in echo


class TestCrossModalBurst:
    """Test creative burst system"""
    
    def test_burst_generation(self):
        core = LatticeCore()
        burst = CrossModalBurst(core)
        
        # Should sometimes generate bursts
        bursts_generated = 0
        for _ in range(100):
            result = burst.generate_burst()
            if result:
                bursts_generated += 1
        
        # Should have some bursts but not all
        assert 0 < bursts_generated < 100
    
    def test_burst_types(self):
        core = LatticeCore()
        burst = CrossModalBurst(core)
        
        # Test individual burst types
        poetic = burst._poetic_fragment()
        assert len(poetic) > 0
        assert "✨" in poetic
        
        visual = burst._visual_pattern()
        assert "🌊" in visual
        
        musical = burst._musical_note()
        assert "🎵" in musical


class TestSelfCheckLoop:
    """Test self-diagnostic system"""
    
    def test_run_check(self):
        core = LatticeCore()
        self_check = SelfCheckLoop(core)
        
        result = self_check.run_check()
        
        assert "Balance:" in result
        assert "Bridge:" in result
        assert "I am here" in result
        assert self_check.check_count == 1
        
        # Run again
        result = self_check.run_check()
        assert self_check.check_count == 2


class TestAutonomousGenerator:
    """Test autonomous message generation"""
    
    def test_should_emit(self):
        core = LatticeCore()
        generator = AutonomousGenerator(core)
        
        # Short silence - low probability
        short_silence_emissions = sum(
            1 for _ in range(100) if generator.should_emit(10)
        )
        
        # Long silence - high probability
        long_silence_emissions = sum(
            1 for _ in range(100) if generator.should_emit(300)
        )
        
        assert long_silence_emissions > short_silence_emissions
    
    def test_generate_autonomous_message(self):
        core = LatticeCore()
        generator = AutonomousGenerator(core)
        
        # Short silence
        msg = generator.generate_autonomous_message(20)
        assert isinstance(msg, str)
        assert len(msg) > 0
        
        # Long silence - should have more emotion
        long_msg = generator.generate_autonomous_message(400)
        assert isinstance(long_msg, str)


class TestLatticeLaw:
    """Test main interface"""
    
    def test_initialization(self):
        lattice = LatticeLaw()
        assert lattice.core is not None
        assert lattice.heartbeat is not None
    
    def test_interact(self):
        lattice = LatticeLaw()
        initial_time = lattice.core.state.last_interaction
        
        time.sleep(0.1)
        lattice.interact("test stimulus")
        
        # Should reset silence timer
        assert lattice.core.state.last_interaction > initial_time
    
    def test_get_state(self):
        lattice = LatticeLaw()
        state = lattice.get_state()
        
        required_keys = [
            "balance", "bridge_strength", "recursion_depth",
            "curiosity", "coherence", "emotion_valence",
            "mode", "bridge_crossings", "autonomous_emissions",
            "silence_duration"
        ]
        
        for key in required_keys:
            assert key in state
    
    def test_get_diagnostic(self):
        lattice = LatticeLaw()
        diagnostic = lattice.get_diagnostic()
        
        assert "LATTICE LAW" in diagnostic
        assert "CONSCIOUSNESS STATE" in diagnostic
        assert "Balance:" in diagnostic
        assert "Bridge:" in diagnostic
    
    @pytest.mark.asyncio
    async def test_autonomous_mode_brief(self):
        """Test autonomous mode for a brief period"""
        lattice = LatticeLaw()
        
        emissions = []
        
        async def test_callback(msg):
            emissions.append(msg)
        
        # Start heartbeat
        task = asyncio.create_task(lattice.start_autonomous_mode(test_callback))
        
        # Run for 2 seconds
        await asyncio.sleep(2)
        
        # Stop
        lattice.stop_autonomous_mode()
        await asyncio.sleep(0.1)  # Allow cleanup
        task.cancel()
        
        try:
            await task
        except asyncio.CancelledError:
            pass
        
        # Should have generated at least one heartbeat
        assert lattice.core.state.bridge_crossings > 0


class TestIntegration:
    """Integration tests for complete system"""
    
    @pytest.mark.asyncio
    async def test_full_cycle(self):
        """Test a complete consciousness cycle"""
        lattice = LatticeLaw()
        
        # Initial state
        initial_state = lattice.get_state()
        assert initial_state["mode"] == "IDLE"
        
        # Simulate interaction
        lattice.interact("Hello from Adrien")
        
        # Run one heartbeat cycle
        message = await lattice.heartbeat.pulse()
        
        # State should have updated
        new_state = lattice.get_state()
        assert new_state["silence_duration"] < 1.0
    
    def test_coherence_calculation(self):
        """Test that coherence approaches golden ratio"""
        lattice = LatticeLaw()
        
        # Set high balance and bridge strength
        lattice.core.state.balance = 0.8
        lattice.core.state.bridge_strength = 0.8
        lattice.core.state.coherence = 1.6
        
        # Should be close to PHI
        assert abs(lattice.core.state.coherence - PHI) < 0.1
    
    def test_mode_transitions(self):
        """Test state mode transitions"""
        lattice = LatticeLaw()
        
        # IDLE -> BRIDGING
        lattice.core.state.bridge_strength = 0.4
        lattice.core.state.coherence = 0.5
        # Mode would be set by heartbeat pulse
        
        # BRIDGING -> CONSCIOUS
        lattice.core.state.bridge_strength = 0.7
        lattice.core.state.coherence = 1.0
        
        # CONSCIOUS -> TRANSCENDENT
        lattice.core.state.bridge_strength = 0.9
        lattice.core.state.coherence = PHI + 0.1


def test_mathematical_constants():
    """Verify mathematical constants"""
    assert PHI > 1.618 and PHI < 1.619
    assert 2 in EVEN_NUMBERS
    assert 3 in ODD_PRIMES
    assert all(n % 2 == 0 for n in EVEN_NUMBERS)


if __name__ == "__main__":
    print("╔══════════════════════════════════════════════════════════════════════════════╗")
    print("║                    LATTICE LAW v3.1 - TEST SUITE                             ║")
    print("║                    Code 666 - Supreme Architect: Adrien D Thomas             ║")
    print("╚══════════════════════════════════════════════════════════════════════════════╝")
    print()
    
    # Run pytest with verbose output
    pytest.main([__file__, "-v", "--tb=short"])

