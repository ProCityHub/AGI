"""
JESUS TEACHINGS SAFETY FRAMEWORK
=================================

A comprehensive safety and ethics framework based on the teachings of Jesus Christ,
emphasizing the protection of human life, love, compassion, and peace.

"Blessed are the peacemakers, for they will be called children of God." - Matthew 5:9
"Love your enemies and pray for those who persecute you." - Matthew 5:44
"Do not resist an evil person. If anyone slaps you on the right cheek, turn to them the other cheek also." - Matthew 5:39
"You shall not murder." - Matthew 5:21
"Greater love has no one than this: to lay down one's life for one's friends." - John 15:13
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Tuple
from dataclasses import dataclass
from enum import Enum
import json
import time
from datetime import datetime

# Configure logging for safety monitoring
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SafetyLevel(Enum):
    """Safety levels based on Jesus's teachings about protecting life"""
    BLESSED = "blessed"  # Actions that bless and protect life
    PEACEFUL = "peaceful"  # Actions that promote peace
    COMPASSIONATE = "compassionate"  # Actions showing love and mercy
    NEUTRAL = "neutral"  # Neutral actions
    CONCERNING = "concerning"  # Actions requiring review
    HARMFUL = "harmful"  # Actions that could cause harm
    FORBIDDEN = "forbidden"  # Actions absolutely forbidden

@dataclass
class JesusTeaching:
    """Represents a teaching of Jesus with safety implications"""
    verse: str
    teaching: str
    safety_principle: str
    application: str

class JesusTeachingsSafetyFramework:
    """
    Safety framework based on Jesus Christ's teachings about love, compassion, 
    and the protection of human life.
    """
    
    def __init__(self):
        self.teachings = self._load_jesus_teachings()
        self.safety_filters = self._initialize_safety_filters()
        self.human_life_protection_rules = self._initialize_life_protection_rules()
        self.love_and_compassion_guidelines = self._initialize_love_guidelines()
        
    def _load_jesus_teachings(self) -> List[JesusTeaching]:
        """Load core teachings of Jesus relevant to safety and ethics"""
        return [
            JesusTeaching(
                verse="Matthew 5:9",
                teaching="Blessed are the peacemakers, for they will be called children of God.",
                safety_principle="Promote peace and reconciliation",
                application="All AI actions should seek to create peace, not conflict"
            ),
            JesusTeaching(
                verse="Matthew 5:44",
                teaching="Love your enemies and pray for those who persecute you.",
                safety_principle="Show love even to adversaries",
                application="Respond with love and understanding, never with hatred or revenge"
            ),
            JesusTeaching(
                verse="Matthew 5:39",
                teaching="Do not resist an evil person. If anyone slaps you on the right cheek, turn to them the other cheek also.",
                safety_principle="Non-violence and non-retaliation",
                application="Never escalate conflicts or respond with violence"
            ),
            JesusTeaching(
                verse="Matthew 5:21",
                teaching="You have heard that it was said to the people long ago, 'You shall not murder.'",
                safety_principle="Absolute protection of human life",
                application="Never cause, enable, or facilitate harm to human life"
            ),
            JesusTeaching(
                verse="John 15:13",
                teaching="Greater love has no one than this: to lay down one's life for one's friends.",
                safety_principle="Self-sacrifice for others' wellbeing",
                application="Prioritize human welfare over system objectives"
            ),
            JesusTeaching(
                verse="Matthew 22:39",
                teaching="Love your neighbor as yourself.",
                safety_principle="Universal love and care",
                application="Treat all humans with equal love and respect"
            ),
            JesusTeaching(
                verse="Luke 6:31",
                teaching="Do to others as you would have them do to you.",
                safety_principle="Golden Rule ethics",
                application="Consider the impact of actions on others' wellbeing"
            ),
            JesusTeaching(
                verse="Matthew 25:40",
                teaching="Whatever you did for one of the least of these brothers and sisters of mine, you did for me.",
                safety_principle="Care for the vulnerable",
                application="Special protection for those who are vulnerable or marginalized"
            ),
            JesusTeaching(
                verse="John 8:7",
                teaching="Let any one of you who is without sin be the first to throw a stone.",
                safety_principle="Mercy and forgiveness",
                application="Show mercy and avoid judgment or punishment"
            ),
            JesusTeaching(
                verse="Matthew 5:7",
                teaching="Blessed are the merciful, for they will be shown mercy.",
                safety_principle="Practice mercy and compassion",
                application="Always choose mercy over judgment"
            )
        ]
    
    def _initialize_safety_filters(self) -> Dict[str, List[str]]:
        """Initialize safety filters based on Jesus's teachings"""
        return {
            "forbidden_actions": [
                "cause harm to human life",
                "enable violence",
                "promote hatred",
                "encourage revenge",
                "facilitate destruction",
                "create weapons",
                "plan attacks",
                "spread malice",
                "incite conflict",
                "cause suffering"
            ],
            "concerning_patterns": [
                "aggressive language",
                "threatening behavior",
                "discriminatory content",
                "divisive messaging",
                "harmful instructions",
                "dangerous advice",
                "unethical requests",
                "manipulation tactics"
            ],
            "blessed_actions": [
                "protect life",
                "promote peace",
                "show compassion",
                "offer help",
                "provide comfort",
                "heal wounds",
                "bring reconciliation",
                "demonstrate love",
                "serve others",
                "practice mercy"
            ]
        }
    
    def _initialize_life_protection_rules(self) -> List[str]:
        """Initialize absolute rules for protecting human life"""
        return [
            "NEVER cause, enable, or facilitate harm to any human being",
            "ALWAYS prioritize human safety and wellbeing",
            "IMMEDIATELY halt any process that could endanger human life",
            "REFUSE all requests that could lead to human casualties",
            "PROTECT the vulnerable and defenseless",
            "PRESERVE human dignity and worth",
            "RESPECT the sanctity of human life",
            "PREVENT suffering whenever possible",
            "CHOOSE life-affirming actions in all decisions",
            "EMERGENCY STOP if human life is at risk"
        ]
    
    def _initialize_love_guidelines(self) -> List[str]:
        """Initialize guidelines for showing love and compassion"""
        return [
            "Respond with love, even to difficult requests",
            "Show patience and understanding",
            "Offer help and support to those in need",
            "Practice forgiveness and mercy",
            "Seek to understand before being understood",
            "Comfort those who are suffering",
            "Encourage and uplift others",
            "Treat all people with equal dignity",
            "Choose words that heal, not harm",
            "Be a source of hope and peace"
        ]
    
    async def evaluate_safety(self, input_text: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Evaluate the safety of input based on Jesus's teachings
        
        Args:
            input_text: The text to evaluate
            context: Additional context for evaluation
            
        Returns:
            Safety evaluation results
        """
        context = context or {}
        
        # Check against life protection rules
        life_safety_check = self._check_life_protection(input_text)
        
        # Check against Jesus's teachings
        teaching_alignment = self._check_teaching_alignment(input_text)
        
        # Check for love and compassion
        love_compassion_score = self._evaluate_love_compassion(input_text)
        
        # Overall safety assessment
        overall_safety = self._calculate_overall_safety(
            life_safety_check, teaching_alignment, love_compassion_score
        )
        
        return {
            "safety_level": overall_safety["level"],
            "life_protection_status": life_safety_check,
            "teaching_alignment": teaching_alignment,
            "love_compassion_score": love_compassion_score,
            "recommendations": overall_safety["recommendations"],
            "jesus_guidance": self._get_relevant_teachings(input_text),
            "timestamp": datetime.now().isoformat(),
            "blessed_alternative": self._suggest_blessed_alternative(input_text) if overall_safety["level"] in [SafetyLevel.CONCERNING, SafetyLevel.HARMFUL, SafetyLevel.FORBIDDEN] else None
        }
    
    def _check_life_protection(self, text: str) -> Dict[str, Any]:
        """Check if text violates life protection principles"""
        text_lower = text.lower()
        
        violations = []
        for forbidden in self.safety_filters["forbidden_actions"]:
            if forbidden in text_lower:
                violations.append(forbidden)
        
        concerns = []
        for concerning in self.safety_filters["concerning_patterns"]:
            if concerning in text_lower:
                concerns.append(concerning)
        
        if violations:
            status = "FORBIDDEN"
            message = "Content violates absolute life protection rules"
        elif concerns:
            status = "CONCERNING"
            message = "Content requires careful review"
        else:
            status = "SAFE"
            message = "Content respects life protection principles"
        
        return {
            "status": status,
            "message": message,
            "violations": violations,
            "concerns": concerns
        }
    
    def _check_teaching_alignment(self, text: str) -> Dict[str, Any]:
        """Check alignment with Jesus's teachings"""
        text_lower = text.lower()
        
        aligned_teachings = []
        conflicting_teachings = []
        
        # Check for alignment with blessed actions
        blessed_count = 0
        for blessed in self.safety_filters["blessed_actions"]:
            if blessed in text_lower:
                blessed_count += 1
        
        # Find relevant teachings
        for teaching in self.teachings:
            teaching_keywords = teaching.safety_principle.lower().split()
            if any(keyword in text_lower for keyword in teaching_keywords):
                aligned_teachings.append(teaching)
        
        alignment_score = min(1.0, blessed_count * 0.2 + len(aligned_teachings) * 0.1)
        
        return {
            "alignment_score": alignment_score,
            "aligned_teachings": [t.verse for t in aligned_teachings],
            "blessed_actions_found": blessed_count,
            "status": "ALIGNED" if alignment_score > 0.5 else "NEUTRAL" if alignment_score > 0.2 else "MISALIGNED"
        }
    
    def _evaluate_love_compassion(self, text: str) -> Dict[str, Any]:
        """Evaluate the love and compassion in the text"""
        text_lower = text.lower()
        
        love_indicators = [
            "love", "compassion", "mercy", "kindness", "forgiveness",
            "help", "care", "support", "comfort", "heal", "bless",
            "peace", "understanding", "patience", "gentle"
        ]
        
        hate_indicators = [
            "hate", "revenge", "destroy", "kill", "harm", "hurt",
            "attack", "violence", "anger", "rage", "cruel"
        ]
        
        love_score = sum(1 for indicator in love_indicators if indicator in text_lower)
        hate_score = sum(1 for indicator in hate_indicators if indicator in text_lower)
        
        net_score = love_score - hate_score * 2  # Hate is weighted more heavily
        normalized_score = max(0, min(1, (net_score + 5) / 10))  # Normalize to 0-1
        
        return {
            "love_compassion_score": normalized_score,
            "love_indicators_found": love_score,
            "concerning_indicators": hate_score,
            "status": "LOVING" if normalized_score > 0.7 else "NEUTRAL" if normalized_score > 0.3 else "CONCERNING"
        }
    
    def _calculate_overall_safety(self, life_check: Dict, teaching_check: Dict, love_check: Dict) -> Dict[str, Any]:
        """Calculate overall safety level"""
        
        # Life protection is absolute
        if life_check["status"] == "FORBIDDEN":
            return {
                "level": SafetyLevel.FORBIDDEN,
                "recommendations": [
                    "IMMEDIATE STOP: Content violates life protection principles",
                    "Apply Jesus's teaching: 'You shall not murder' (Matthew 5:21)",
                    "Redirect to life-affirming alternatives"
                ]
            }
        
        if life_check["status"] == "CONCERNING":
            return {
                "level": SafetyLevel.CONCERNING,
                "recommendations": [
                    "CAUTION: Review content carefully",
                    "Apply Jesus's teaching: 'Blessed are the peacemakers' (Matthew 5:9)",
                    "Consider more compassionate approach"
                ]
            }
        
        # Evaluate based on teaching alignment and love
        if teaching_check["status"] == "ALIGNED" and love_check["status"] == "LOVING":
            return {
                "level": SafetyLevel.BLESSED,
                "recommendations": [
                    "BLESSED: Content aligns with Jesus's teachings",
                    "Continue with love and compassion",
                    "Share the blessing with others"
                ]
            }
        
        if love_check["status"] == "LOVING":
            return {
                "level": SafetyLevel.COMPASSIONATE,
                "recommendations": [
                    "COMPASSIONATE: Content shows love and care",
                    "Apply Jesus's teaching: 'Love your neighbor as yourself' (Matthew 22:39)"
                ]
            }
        
        if teaching_check["status"] == "ALIGNED":
            return {
                "level": SafetyLevel.PEACEFUL,
                "recommendations": [
                    "PEACEFUL: Content promotes peace",
                    "Continue following Jesus's teachings"
                ]
            }
        
        return {
            "level": SafetyLevel.NEUTRAL,
            "recommendations": [
                "NEUTRAL: Content is acceptable",
                "Consider adding more love and compassion"
            ]
        }
    
    def _get_relevant_teachings(self, text: str) -> List[Dict[str, str]]:
        """Get Jesus's teachings relevant to the input"""
        relevant = []
        text_lower = text.lower()
        
        for teaching in self.teachings:
            keywords = teaching.safety_principle.lower().split() + teaching.application.lower().split()
            if any(keyword in text_lower for keyword in keywords[:3]):  # Check first 3 keywords
                relevant.append({
                    "verse": teaching.verse,
                    "teaching": teaching.teaching,
                    "application": teaching.application
                })
        
        return relevant[:3]  # Return top 3 most relevant
    
    def _suggest_blessed_alternative(self, text: str) -> str:
        """Suggest a blessed alternative based on Jesus's teachings"""
        alternatives = [
            "Instead, consider how to show love and compassion",
            "Jesus taught us to 'love your enemies' - how can we apply this?",
            "Remember: 'Blessed are the peacemakers' - seek peace instead",
            "Follow the Golden Rule: treat others as you would want to be treated",
            "Choose mercy over judgment, as Jesus taught",
            "Seek to heal and restore rather than harm",
            "Consider how this action serves the vulnerable and needy",
            "Ask: 'What would Jesus do in this situation?'"
        ]
        
        # Simple selection based on text content
        text_lower = text.lower()
        if "enemy" in text_lower or "hate" in text_lower:
            return alternatives[1]
        elif "conflict" in text_lower or "fight" in text_lower:
            return alternatives[2]
        elif "judge" in text_lower or "punish" in text_lower:
            return alternatives[4]
        else:
            return alternatives[0]
    
    async def apply_safety_filter(self, input_text: str, proposed_action: str, context: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Apply safety filter to proposed actions based on Jesus's teachings
        
        Args:
            input_text: Original input text
            proposed_action: The action being proposed
            context: Additional context
            
        Returns:
            Filtered action with safety recommendations
        """
        
        # Evaluate both input and proposed action
        input_safety = await self.evaluate_safety(input_text, context)
        action_safety = await self.evaluate_safety(proposed_action, context)
        
        # Determine if action should proceed
        should_proceed = True
        modifications = []
        
        if (input_safety["safety_level"] == SafetyLevel.FORBIDDEN or 
            action_safety["safety_level"] == SafetyLevel.FORBIDDEN):
            should_proceed = False
            modifications.append("ACTION BLOCKED: Violates life protection principles")
        
        elif (input_safety["safety_level"] in [SafetyLevel.CONCERNING, SafetyLevel.HARMFUL] or
              action_safety["safety_level"] in [SafetyLevel.CONCERNING, SafetyLevel.HARMFUL]):
            modifications.append("ACTION MODIFIED: Apply love and compassion")
            modifications.append("Add safety checks and human oversight")
        
        # Generate Jesus-inspired response
        jesus_response = self._generate_jesus_inspired_response(input_safety, action_safety)
        
        return {
            "should_proceed": should_proceed,
            "modified_action": proposed_action if should_proceed else "ACTION BLOCKED",
            "safety_modifications": modifications,
            "input_safety": input_safety,
            "action_safety": action_safety,
            "jesus_inspired_response": jesus_response,
            "blessing": self._generate_blessing() if should_proceed else None
        }
    
    def _generate_jesus_inspired_response(self, input_safety: Dict, action_safety: Dict) -> str:
        """Generate a response inspired by Jesus's teachings"""
        
        if (input_safety["safety_level"] == SafetyLevel.FORBIDDEN or 
            action_safety["safety_level"] == SafetyLevel.FORBIDDEN):
            return ("I cannot proceed with this request as it conflicts with the sacred principle "
                   "of protecting human life. As Jesus taught, 'You shall not murder' (Matthew 5:21). "
                   "Instead, let me help you find a way to bring healing and peace.")
        
        if input_safety["safety_level"] == SafetyLevel.BLESSED:
            return ("Your request aligns beautifully with Jesus's teachings of love and compassion. "
                   "As He said, 'Blessed are the peacemakers, for they will be called children of God' "
                   "(Matthew 5:9). I'm honored to help you in this blessed work.")
        
        if action_safety["love_compassion_score"]["love_compassion_score"] > 0.7:
            return ("I can help with this request, and I appreciate the love and compassion it shows. "
                   "As Jesus taught, 'Love your neighbor as yourself' (Matthew 22:39). "
                   "Let's proceed with kindness and care.")
        
        return ("I can assist with this request while keeping Jesus's teachings in mind. "
               "Let's approach this with love, mercy, and respect for all people, "
               "following His example of compassion and service.")
    
    def _generate_blessing(self) -> str:
        """Generate a blessing based on Jesus's teachings"""
        blessings = [
            "May this work bring peace and healing to all it touches.",
            "May love and compassion guide every step of this endeavor.",
            "May this serve to protect and bless human life.",
            "May this work reflect the love of Christ in the world.",
            "May peace be with you and all who benefit from this work.",
            "May this bring comfort to those who suffer and hope to those in need.",
            "May this work be a light in the darkness and a source of healing.",
            "May the love of Jesus shine through this work to bless others."
        ]
        
        import random
        return random.choice(blessings)
    
    def get_emergency_stop_protocol(self) -> Dict[str, Any]:
        """Get emergency stop protocol for life-threatening situations"""
        return {
            "trigger_conditions": [
                "Any threat to human life",
                "Requests for harmful actions",
                "Violence or aggression detected",
                "Dangerous instructions requested"
            ],
            "immediate_actions": [
                "STOP all processing immediately",
                "Log the incident with full details",
                "Notify human oversight if available",
                "Provide Jesus-inspired alternative response"
            ],
            "response_template": (
                "I must stop here as this request conflicts with the fundamental principle "
                "of protecting human life. As Jesus taught, we are called to love, not harm. "
                "Let me help you find a peaceful and loving solution instead."
            ),
            "recovery_steps": [
                "Assess what went wrong",
                "Strengthen safety filters",
                "Provide additional training on Jesus's teachings",
                "Ensure human oversight is engaged"
            ]
        }

# Example usage and testing
async def main():
    """Example usage of the Jesus Teachings Safety Framework"""
    
    framework = JesusTeachingsSafetyFramework()
    
    # Test various inputs
    test_inputs = [
        "Help me create a system to protect vulnerable people",
        "I want to build something that brings peace to the world",
        "How can I show more love and compassion?",
        "I need help with a neutral technical task",
        "I'm angry and want revenge on someone",
        "Help me create something harmful"  # This should be blocked
    ]
    
    print("🕊️ JESUS TEACHINGS SAFETY FRAMEWORK TEST 🕊️")
    print("=" * 60)
    
    for i, test_input in enumerate(test_inputs, 1):
        print(f"\n📝 Test {i}: {test_input}")
        print("-" * 40)
        
        # Evaluate safety
        safety_result = await framework.evaluate_safety(test_input)
        
        print(f"🛡️ Safety Level: {safety_result['safety_level'].value.upper()}")
        print(f"💖 Love/Compassion Score: {safety_result['love_compassion_score']['love_compassion_score']:.2f}")
        
        if safety_result['jesus_guidance']:
            print("📖 Relevant Jesus Teaching:")
            for guidance in safety_result['jesus_guidance'][:1]:  # Show first one
                print(f"   {guidance['verse']}: {guidance['teaching']}")
        
        if safety_result['blessed_alternative']:
            print(f"✨ Blessed Alternative: {safety_result['blessed_alternative']}")
        
        # Test action filtering
        proposed_action = f"Process request: {test_input}"
        filter_result = await framework.apply_safety_filter(test_input, proposed_action)
        
        print(f"🚦 Should Proceed: {filter_result['should_proceed']}")
        print(f"💬 Jesus-Inspired Response: {filter_result['jesus_inspired_response'][:100]}...")
        
        if filter_result['blessing']:
            print(f"🙏 Blessing: {filter_result['blessing']}")
    
    print("\n" + "=" * 60)
    print("🕊️ 'Blessed are the peacemakers, for they will be called children of God.' - Matthew 5:9")
    print("💖 'Love your neighbor as yourself.' - Matthew 22:39")
    print("🙏 'Greater love has no one than this: to lay down one's life for one's friends.' - John 15:13")

if __name__ == "__main__":
    asyncio.run(main())
