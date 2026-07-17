#!/usr/bin/env python3
"""
Universal Knowledge Curriculum for Lattice-AGI
==============================================

Multi-domain training across the entropy spectrum:
1. Physics (Low entropy - mathematical laws)
2. Periodic Table (Low entropy - structured data)
3. History (Medium entropy - factual events)
4. Natural Law (Medium-high entropy - principles)
5. Human Rights (High entropy - ethical concepts)
6. Emotion (High entropy - subjective states)
7. Art (Very high entropy - aesthetic judgment)

Teaching Strategy:
- Start with low-entropy domains (physics, chemistry)
- Progress through factual domains (history)
- Advance to ethical frameworks (rights, natural law)
- Culminate in subjective domains (emotion, art)
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from core.llm_integration import RealLatticeAGI
import json
from datetime import datetime


class UniversalKnowledgeTeacher:
    """Multi-domain teacher for universal knowledge"""
    
    def __init__(self, provider='simple', node_count=1_000_000):
        self.agi = RealLatticeAGI(provider=provider, node_count=node_count)
        self.training_log = []
        self.domain_stats = {}
        
    def teach_concept(self, concept: str, domain: str, expected_delta: str = "medium"):
        """Teach a concept and track convergence"""
        if domain not in self.domain_stats:
            self.domain_stats[domain] = {'concepts': [], 'emitted': 0, 'total': 0}
        
        result = self.agi.process(concept)
        
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'concept': concept,
            'domain': domain,
            'expected_delta': expected_delta,
            'actual_delta': result.convergence_result.final_delta,
            'emitted': result.emitted,
            'retries': result.retries,
        }
        
        self.training_log.append(log_entry)
        self.domain_stats[domain]['concepts'].append(log_entry)
        self.domain_stats[domain]['total'] += 1
        if result.emitted:
            self.domain_stats[domain]['emitted'] += 1
        
        # Visual feedback
        emoji = self._get_domain_emoji(domain)
        if result.emitted:
            print(f"   ✅ {emoji} EMIT Δ={result.convergence_result.final_delta:.6f} | {concept[:55]}")
        else:
            delta = result.convergence_result.final_delta
            if delta < 0.3:
                print(f"   🟢 {emoji} CLOSE Δ={delta:.6f} | {concept[:55]}")
            elif delta < 0.5:
                print(f"   🟡 {emoji} MID Δ={delta:.6f} | {concept[:55]}")
            else:
                print(f"   🔴 {emoji} FAR Δ={delta:.6f} | {concept[:55]}")
        
        return log_entry
    
    def _get_domain_emoji(self, domain):
        """Get emoji for domain"""
        emojis = {
            'physics': '⚛️',
            'chemistry': '🔬',
            'history': '📜',
            'natural_law': '🌿',
            'human_rights': '⚖️',
            'emotion': '💝',
            'art': '🎨'
        }
        return emojis.get(domain, '📚')
    
    def teach_curriculum(self):
        """Teach complete universal knowledge curriculum"""
        print("\n" + "=" * 80)
        print("UNIVERSAL KNOWLEDGE TRAINING CURRICULUM")
        print("=" * 80)
        print("\nTeaching Lattice-AGI across 7 domains from low to high entropy...")
        print()
        
        # DOMAIN 1: PHYSICS (VERY LOW ENTROPY)
        print("\n" + "─" * 80)
        print("⚛️  DOMAIN 1: PHYSICS (Very Low Entropy - Mathematical Laws)")
        print("─" * 80)
        print("Expected: High convergence (Δ < 0.2) - Physics is mathematical\n")
        
        physics = [
            # Fundamental constants
            "Speed of light c = 299,792,458 m/s",
            "Gravitational constant G = 6.674×10⁻¹¹ N(m/kg)²",
            "Planck constant h = 6.626×10⁻³⁴ J⋅s",
            "Elementary charge e = 1.602×10⁻¹⁹ C",
            
            # Newton's laws
            "Newton's First Law: Object at rest stays at rest unless acted upon",
            "Newton's Second Law: F = ma (force equals mass times acceleration)",
            "Newton's Third Law: For every action, equal and opposite reaction",
            
            # Energy and thermodynamics
            "Conservation of energy: Energy cannot be created or destroyed",
            "E = mc² (mass-energy equivalence)",
            "First law of thermodynamics: Energy is conserved in closed system",
            "Second law of thermodynamics: Entropy always increases",
            
            # Waves and optics
            "Wave equation: v = fλ (velocity equals frequency times wavelength)",
            "Light travels at different speeds in different media",
            "Electromagnetic spectrum: radio, microwave, IR, visible, UV, X-ray, gamma",
        ]
        
        for concept in physics:
            self.teach_concept(concept, 'physics', expected_delta='low')
        
        # DOMAIN 2: PERIODIC TABLE (VERY LOW ENTROPY)
        print("\n" + "─" * 80)
        print("🔬 DOMAIN 2: PERIODIC TABLE (Very Low Entropy - Structured Data)")
        print("─" * 80)
        print("Expected: High convergence (Δ < 0.2) - Chemistry is structured\n")
        
        chemistry = [
            # Basic elements
            "Hydrogen (H): Atomic number 1, lightest element, fuel for stars",
            "Helium (He): Atomic number 2, noble gas, second lightest element",
            "Carbon (C): Atomic number 6, basis of organic life, 4 valence electrons",
            "Nitrogen (N): Atomic number 7, 78% of Earth's atmosphere",
            "Oxygen (O): Atomic number 8, 21% of atmosphere, necessary for combustion",
            "Gold (Au): Atomic number 79, noble metal, doesn't tarnish",
            "Iron (Fe): Atomic number 26, most abundant element on Earth by mass",
            "Uranium (U): Atomic number 92, radioactive, used in nuclear reactors",
            
            # Periodic patterns
            "Periodic table organized by atomic number (number of protons)",
            "Groups (columns) have similar chemical properties",
            "Periods (rows) show electron shell filling patterns",
            "Noble gases (group 18) are inert, full valence shells",
            "Alkali metals (group 1) are highly reactive, 1 valence electron",
            "Halogens (group 17) are reactive non-metals, 7 valence electrons",
        ]
        
        for concept in chemistry:
            self.teach_concept(concept, 'chemistry', expected_delta='low')
        
        # DOMAIN 3: HISTORY (MEDIUM ENTROPY)
        print("\n" + "─" * 80)
        print("📜 DOMAIN 3: HISTORY (Medium Entropy - Factual Events)")
        print("─" * 80)
        print("Expected: Moderate convergence (Δ 0.3-0.5) - Facts with context\n")
        
        history = [
            # Ancient civilizations
            "Ancient Egypt: 3100 BCE - 30 BCE, pyramids built ~2500 BCE",
            "Ancient Greece: ~800 BCE - 146 BCE, democracy originated in Athens",
            "Roman Empire: 27 BCE - 476 CE (Western), lasted 500 years",
            "Ancient China: Qin Dynasty unified China 221 BCE",
            
            # Major events
            "Fall of Constantinople: 1453, end of Byzantine Empire",
            "American Revolution: 1775-1783, independence from Britain",
            "French Revolution: 1789-1799, overthrew monarchy",
            "World War I: 1914-1918, 17 million deaths",
            "World War II: 1939-1945, 70-85 million deaths, Holocaust",
            "Cold War: 1947-1991, USA vs USSR, no direct conflict",
            
            # Scientific revolutions
            "Printing press: Gutenberg 1440, revolutionized information spread",
            "Industrial Revolution: ~1760-1840, mechanization of production",
            "Enlightenment: 17th-18th century, reason and science emphasized",
            "Digital Revolution: 1970s-present, computers and internet",
        ]
        
        for concept in history:
            self.teach_concept(concept, 'history', expected_delta='medium')
        
        # DOMAIN 4: NATURAL LAW (MEDIUM-HIGH ENTROPY)
        print("\n" + "─" * 80)
        print("🌿 DOMAIN 4: NATURAL LAW (Medium-High Entropy - Universal Principles)")
        print("─" * 80)
        print("Expected: Lower convergence (Δ 0.4-0.6) - Philosophical principles\n")
        
        natural_law = [
            # Core principles
            "Natural law: Universal moral principles discoverable by reason",
            "Self-defense: Natural right to protect oneself from harm",
            "Self-ownership: Each person owns their own body and labor",
            "Non-aggression principle: Don't initiate force against others",
            "Property rights: What you create or trade for is yours",
            
            # Historical natural law concepts
            "Lex naturalis: Roman concept of natural law, based on reason",
            "Social contract: People consent to form society and government",
            "Inalienable rights: Rights that cannot be given or taken away",
            "Golden Rule: Treat others as you wish to be treated",
            
            # Natural law in practice
            "Magna Carta 1215: Limited king's power, basis for rule of law",
            "Natural rights philosophy influenced American Declaration",
            "Nuremberg trials: Natural law used to judge war crimes",
        ]
        
        for concept in natural_law:
            self.teach_concept(concept, 'natural_law', expected_delta='medium-high')
        
        # DOMAIN 5: HUMAN RIGHTS (HIGH ENTROPY)
        print("\n" + "─" * 80)
        print("⚖️  DOMAIN 5: HUMAN RIGHTS (High Entropy - Ethical Frameworks)")
        print("─" * 80)
        print("Expected: Low convergence (Δ 0.5-0.7) - Value-laden concepts\n")
        
        human_rights = [
            # Universal Declaration
            "UDHR Article 1: All humans born free and equal in dignity and rights",
            "UDHR Article 3: Everyone has right to life, liberty, and security",
            "UDHR Article 4: No one shall be held in slavery or servitude",
            "UDHR Article 5: No torture or cruel, inhuman, degrading treatment",
            "UDHR Article 19: Right to freedom of opinion and expression",
            
            # Civil liberties
            "Freedom of speech: Right to express opinions without censorship",
            "Freedom of religion: Right to practice any religion or none",
            "Due process: Fair legal procedures before punishment",
            "Presumption of innocence: Innocent until proven guilty",
            "Habeas corpus: Right to challenge unlawful detention",
            
            # Social rights
            "Right to education: Access to learning and development",
            "Right to work: Opportunity to earn a living with dignity",
            "Right to health: Access to medical care and healthy living",
        ]
        
        for concept in human_rights:
            self.teach_concept(concept, 'human_rights', expected_delta='high')
        
        # DOMAIN 6: EMOTION (VERY HIGH ENTROPY)
        print("\n" + "─" * 80)
        print("💝 DOMAIN 6: EMOTION (Very High Entropy - Subjective States)")
        print("─" * 80)
        print("Expected: Very low convergence (Δ 0.6-0.8) - Subjective experience\n")
        
        emotion = [
            # Basic emotions
            "Happiness: Positive emotional state, joy and contentment",
            "Sadness: Negative emotional state, sorrow and unhappiness",
            "Fear: Emotional response to perceived threat or danger",
            "Anger: Strong displeasure in response to injustice or frustration",
            "Surprise: Brief emotional state from unexpected event",
            "Disgust: Aversion to offensive stimulus",
            
            # Complex emotions
            "Love: Deep affection, attachment, and care for another",
            "Empathy: Understanding and sharing feelings of another",
            "Jealousy: Fear of losing something valuable to rival",
            "Pride: Satisfaction from one's achievements or qualities",
            "Shame: Negative self-evaluation after transgression",
            "Gratitude: Thankfulness for benefits received",
            
            # Emotional concepts
            "Emotional intelligence: Ability to recognize and manage emotions",
            "Catharsis: Emotional release through expression",
            "Affect: Immediate expression of emotion",
        ]
        
        for concept in emotion:
            self.teach_concept(concept, 'emotion', expected_delta='very-high')
        
        # DOMAIN 7: ART (HIGHEST ENTROPY)
        print("\n" + "─" * 80)
        print("🎨 DOMAIN 7: ART (Highest Entropy - Aesthetic Judgment)")
        print("─" * 80)
        print("Expected: Minimal convergence (Δ > 0.7) - Highly subjective\n")
        
        art = [
            # Art movements (more factual)
            "Renaissance: 14th-17th century, revival of classical art, humanism",
            "Baroque: 17th-18th century, ornate, dramatic, emotional",
            "Impressionism: Late 19th century, focus on light and color, Monet",
            "Cubism: Early 20th century, fragmented forms, Picasso",
            "Surrealism: 1920s-1950s, dreamlike imagery, Dalí",
            "Abstract Expressionism: 1940s-1950s, emotional abstraction, Pollock",
            
            # Artistic concepts (more abstract)
            "Golden ratio (φ) appears in aesthetically pleasing compositions",
            "Color theory: Complementary colors create visual contrast",
            "Perspective: Creating depth illusion on 2D surface",
            "Composition: Arrangement of elements for visual impact",
            
            # Aesthetic principles (very abstract)
            "Beauty: Aesthetic quality that provides pleasure to senses",
            "Sublime: Overwhelming greatness that inspires awe",
            "Harmony: Pleasing arrangement of parts into coherent whole",
            "Expression: Art communicates artist's inner emotional state",
        ]
        
        for concept in art:
            self.teach_concept(concept, 'art', expected_delta='very-high')
        
        # Generate comprehensive report
        self.generate_report()
    
    def generate_report(self):
        """Generate comprehensive multi-domain report"""
        print("\n" + "=" * 80)
        print("UNIVERSAL KNOWLEDGE TRAINING REPORT")
        print("=" * 80)
        
        total = len(self.training_log)
        emitted = sum(1 for entry in self.training_log if entry['emitted'])
        
        print(f"\n📊 Overall Statistics:")
        print(f"   Total Concepts: {total}")
        print(f"   ✅ Emitted (Δ < 0.01): {emitted} ({emitted/total*100:.1f}%)")
        print(f"   ❌ Suppressed: {total - emitted} ({(total-emitted)/total*100:.1f}%)")
        
        # Domain breakdown
        print(f"\n🌍 Results by Domain (Entropy Spectrum):")
        print(f"   {'Domain':<20} {'Concepts':<10} {'Emitted':<10} {'Avg Δ':<12} {'Status':<20}")
        print(f"   {'-'*72}")
        
        # Sort by average delta (low to high entropy)
        domain_summary = []
        for domain, stats in self.domain_stats.items():
            avg_delta = sum(c['actual_delta'] for c in stats['concepts']) / len(stats['concepts'])
            emission_rate = stats['emitted'] / stats['total'] * 100
            domain_summary.append((domain, stats['total'], stats['emitted'], avg_delta, emission_rate))
        
        domain_summary.sort(key=lambda x: x[3])  # Sort by avg delta
        
        for domain, total_concepts, emitted_count, avg_delta, emission_rate in domain_summary:
            emoji = self._get_domain_emoji(domain)
            
            # Status based on avg delta
            if avg_delta < 0.2:
                status = "✅ Excellent"
            elif avg_delta < 0.4:
                status = "🟢 Good"
            elif avg_delta < 0.6:
                status = "🟡 Moderate"
            elif avg_delta < 0.8:
                status = "🔴 Low"
            else:
                status = "⚫ Minimal"
            
            print(f"   {emoji} {domain:<18} {total_concepts:<10} {emitted_count:<10} {avg_delta:<12.6f} {status:<20}")
        
        # Entropy analysis
        print(f"\n📈 Entropy Spectrum Analysis:")
        print(f"   Low Entropy (Physics, Chemistry):")
        physics_delta = sum(c['actual_delta'] for c in self.domain_stats.get('physics', {'concepts': []})['concepts']) / max(len(self.domain_stats.get('physics', {'concepts': [{'actual_delta': 1}]})['concepts']), 1)
        chem_delta = sum(c['actual_delta'] for c in self.domain_stats.get('chemistry', {'concepts': []})['concepts']) / max(len(self.domain_stats.get('chemistry', {'concepts': [{'actual_delta': 1}]})['concepts']), 1)
        print(f"      Physics Δ: {physics_delta:.6f}")
        print(f"      Chemistry Δ: {chem_delta:.6f}")
        print(f"      Interpretation: {'✅ Mathematical laws converge well' if physics_delta < 0.3 else '⚠️ Even math struggles with simple embeddings'}")
        
        print(f"\n   High Entropy (Emotion, Art):")
        emotion_delta = sum(c['actual_delta'] for c in self.domain_stats.get('emotion', {'concepts': []})['concepts']) / max(len(self.domain_stats.get('emotion', {'concepts': [{'actual_delta': 1}]})['concepts']), 1)
        art_delta = sum(c['actual_delta'] for c in self.domain_stats.get('art', {'concepts': []})['concepts']) / max(len(self.domain_stats.get('art', {'concepts': [{'actual_delta': 1}]})['concepts']), 1)
        print(f"      Emotion Δ: {emotion_delta:.6f}")
        print(f"      Art Δ: {art_delta:.6f}")
        print(f"      Interpretation: {'✅ Correctly identifies subjective concepts' if emotion_delta > 0.6 else '⚠️ Surprising - too low for subjective'}")
        
        # Best converging concepts overall
        print(f"\n🌟 Top 10 Best Converging Concepts (All Domains):")
        sorted_log = sorted(self.training_log, key=lambda x: x['actual_delta'])
        for i, entry in enumerate(sorted_log[:10], 1):
            emoji = self._get_domain_emoji(entry['domain'])
            status = "✅" if entry['emitted'] else "🟡"
            print(f"   {i}. {status} {emoji} Δ={entry['actual_delta']:.6f} | {entry['concept'][:50]}")
        
        # Worst converging
        print(f"\n🔴 Concepts with Highest Entropy:")
        for i, entry in enumerate(sorted_log[-10:], 1):
            emoji = self._get_domain_emoji(entry['domain'])
            print(f"   {i}. ❌ {emoji} Δ={entry['actual_delta']:.6f} | {entry['concept'][:50]}")
        
        # Cost analysis
        stats = self.agi.get_stats()
        print(f"\n💰 Cost Analysis:")
        print(f"   Total Forwards: {stats['total_forwards']}")
        print(f"   Total Cost: ${stats['total_cost']:.6f}")
        print(f"   Cost per Concept: ${stats['total_cost']/total:.6f}")
        
        # Key insights
        print(f"\n💡 Key Insights:")
        
        if physics_delta < 0.3:
            print("   ✅ Physics/Chemistry: Low-entropy domains show good convergence")
        else:
            print("   ⚠️  Physics/Chemistry: Even structured domains struggle (need real LLM)")
        
        if art_delta > 0.7:
            print("   ✅ Art/Emotion: System correctly identifies subjective high-entropy")
        
        history_delta = sum(c['actual_delta'] for c in self.domain_stats.get('history', {'concepts': []})['concepts']) / max(len(self.domain_stats.get('history', {'concepts': [{'actual_delta': 1}]})['concepts']), 1)
        if 0.3 < history_delta < 0.6:
            print("   ✅ History: Medium entropy as expected (facts with context)")
        
        print(f"\n🎓 Recommendations:")
        print("   1. Use OpenAI/Anthropic embeddings for better semantic understanding")
        print("   2. Physics/Chemistry should converge well with real LLMs")
        print("   3. History benefits from RAG with historical documents")
        print("   4. Emotion/Art will remain high-entropy (correctly so)")
        print("   5. Natural Law/Rights need ethical frameworks in training")
        
    def save_report(self, filename='universal_knowledge_report.json'):
        """Save detailed report"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_concepts': len(self.training_log),
            'domain_stats': {
                domain: {
                    'total': stats['total'],
                    'emitted': stats['emitted'],
                    'emission_rate': stats['emitted'] / stats['total'],
                    'avg_delta': sum(c['actual_delta'] for c in stats['concepts']) / len(stats['concepts'])
                }
                for domain, stats in self.domain_stats.items()
            },
            'training_log': self.training_log,
            'system_stats': self.agi.get_stats()
        }
        
        with open(filename, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"\n💾 Detailed report saved to {filename}")


def main():
    """Main training session"""
    print("\n" + "=" * 80)
    print("LATTICE-AGI UNIVERSAL KNOWLEDGE TRAINING")
    print("=" * 80)
    print("\nTeaching across 7 domains spanning the full entropy spectrum:")
    print("  ⚛️  Physics - Low entropy (mathematical laws)")
    print("  🔬 Chemistry - Low entropy (structured data)")
    print("  📜 History - Medium entropy (factual events)")
    print("  🌿 Natural Law - Medium-high entropy (universal principles)")
    print("  ⚖️  Human Rights - High entropy (ethical frameworks)")
    print("  💝 Emotion - Very high entropy (subjective states)")
    print("  🎨 Art - Highest entropy (aesthetic judgment)")
    print()
    
    # Initialize teacher
    teacher = UniversalKnowledgeTeacher(provider='simple', node_count=1_000_000)
    
    # Run complete curriculum
    teacher.teach_curriculum()
    
    # Save detailed report
    teacher.save_report()
    
    print("\n" + "=" * 80)
    print("Universal knowledge training complete!")
    print("=" * 80)
    print("\n🌍 Lattice-AGI has been exposed to 7 major knowledge domains.")
    print("📊 Low-entropy domains (physics, chemistry) should converge better.")
    print("🎨 High-entropy domains (art, emotion) correctly suppress.")
    print("\n🌌 The system demonstrates the full spectrum of human knowledge.")
    print("   From mathematical certainty to subjective experience.")
    print("=" * 80)


if __name__ == "__main__":
    main()

