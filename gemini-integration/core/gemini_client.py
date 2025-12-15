"""
Gemini Integration Client
Unified interface for Google Gemini AI models integration
"""

import os
import json
import asyncio
import logging
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from enum import Enum

try:
    import google.generativeai as genai
    from google.generativeai.types import HarmCategory, HarmBlockThreshold
except ImportError:
    print("Warning: google-generativeai not installed. Install with: pip install google-generativeai")
    genai = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class GeminiModel(Enum):
    """Available Gemini models"""
    GEMINI_2_0_FLASH_EXP = "gemini-2.0-flash-exp"
    GEMINI_1_5_PRO = "gemini-1.5-pro"
    GEMINI_1_5_FLASH = "gemini-1.5-flash"
    GEMINI_1_0_PRO = "gemini-1.0-pro"

@dataclass
class GeminiConfig:
    """Configuration for Gemini client"""
    api_key: str
    model: GeminiModel = GeminiModel.GEMINI_2_0_FLASH_EXP
    temperature: float = 0.7
    max_tokens: int = 8192
    top_p: float = 0.8
    top_k: int = 40
    safety_settings: Optional[Dict] = None

@dataclass
class GeminiResponse:
    """Response from Gemini API"""
    text: str
    model: str
    usage: Dict[str, int]
    safety_ratings: List[Dict]
    finish_reason: str
    raw_response: Any

class GeminiClient:
    """
    Unified Gemini AI client for AGI integration
    """
    
    def __init__(self, config: Optional[GeminiConfig] = None):
        """Initialize Gemini client"""
        if genai is None:
            raise ImportError("google-generativeai package is required. Install with: pip install google-generativeai")
        
        # Load configuration
        self.config = config or self._load_default_config()
        
        # Configure Gemini
        genai.configure(api_key=self.config.api_key)
        
        # Initialize model
        self.model = genai.GenerativeModel(
            model_name=self.config.model.value,
            generation_config=self._get_generation_config(),
            safety_settings=self._get_safety_settings()
        )
        
        # Initialize chat session
        self.chat_session = None
        
        logger.info(f"Gemini client initialized with model: {self.config.model.value}")
    
    def _load_default_config(self) -> GeminiConfig:
        """Load default configuration from environment"""
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash-exp")
        model = GeminiModel(model_name)
        
        return GeminiConfig(
            api_key=api_key,
            model=model,
            temperature=float(os.getenv("GEMINI_TEMPERATURE", "0.7")),
            max_tokens=int(os.getenv("GEMINI_MAX_TOKENS", "8192")),
            top_p=float(os.getenv("GEMINI_TOP_P", "0.8")),
            top_k=int(os.getenv("GEMINI_TOP_K", "40"))
        )
    
    def _get_generation_config(self) -> Dict:
        """Get generation configuration"""
        return {
            "temperature": self.config.temperature,
            "top_p": self.config.top_p,
            "top_k": self.config.top_k,
            "max_output_tokens": self.config.max_tokens,
        }
    
    def _get_safety_settings(self) -> Dict:
        """Get safety settings"""
        if self.config.safety_settings:
            return self.config.safety_settings
        
        return {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        }
    
    def generate_text(self, prompt: str, **kwargs) -> GeminiResponse:
        """Generate text response from Gemini"""
        try:
            response = self.model.generate_content(prompt, **kwargs)
            
            return GeminiResponse(
                text=response.text,
                model=self.config.model.value,
                usage=self._extract_usage(response),
                safety_ratings=self._extract_safety_ratings(response),
                finish_reason=self._extract_finish_reason(response),
                raw_response=response
            )
        
        except Exception as e:
            logger.error(f"Error generating text: {e}")
            raise
    
    async def generate_text_async(self, prompt: str, **kwargs) -> GeminiResponse:
        """Generate text response asynchronously"""
        try:
            response = await self.model.generate_content_async(prompt, **kwargs)
            
            return GeminiResponse(
                text=response.text,
                model=self.config.model.value,
                usage=self._extract_usage(response),
                safety_ratings=self._extract_safety_ratings(response),
                finish_reason=self._extract_finish_reason(response),
                raw_response=response
            )
        
        except Exception as e:
            logger.error(f"Error generating text async: {e}")
            raise
    
    def start_chat(self, history: Optional[List[Dict]] = None) -> 'GeminiChat':
        """Start a chat session"""
        self.chat_session = self.model.start_chat(history=history or [])
        return GeminiChat(self.chat_session, self.config)
    
    def generate_wii_sports_strategy(self, sport: str, player_skill: float, 
                                   game_situation: str, opponent_personality: str) -> Dict:
        """Generate Wii Sports AI strategy"""
        prompt = f"""
        Generate an AI strategy for Wii Sports {sport} with the following parameters:
        - Player skill level: {player_skill} (0.0 to 1.0)
        - Game situation: {game_situation}
        - Opponent personality: {opponent_personality}
        
        Provide a JSON response with:
        - strategy_type: The type of strategy to use
        - difficulty_adjustment: How to adjust difficulty (-0.2 to +0.2)
        - specific_actions: List of specific actions the AI should take
        - behavioral_traits: Personality traits to emphasize
        - adaptation_rules: How to adapt based on player performance
        
        Focus on creating engaging, balanced gameplay that matches the player's skill level.
        """
        
        response = self.generate_text(prompt)
        
        try:
            # Try to parse JSON from response
            strategy_data = json.loads(response.text)
            return strategy_data
        except json.JSONDecodeError:
            # Fallback to structured response
            return {
                "strategy_type": "adaptive",
                "difficulty_adjustment": 0.0,
                "specific_actions": ["analyze_player_patterns", "adjust_timing", "vary_shot_placement"],
                "behavioral_traits": [opponent_personality],
                "adaptation_rules": ["increase_difficulty_on_success", "provide_coaching_hints_on_failure"],
                "raw_response": response.text
            }
    
    def generate_coaching_advice(self, sport: str, weaknesses: List[str], 
                               skill_level: float) -> List[str]:
        """Generate personalized coaching advice"""
        prompt = f"""
        Generate coaching advice for Wii Sports {sport} player with:
        - Skill level: {skill_level} (0.0 to 1.0)
        - Identified weaknesses: {', '.join(weaknesses)}
        
        Provide 3-5 specific, actionable tips that are:
        - Appropriate for the skill level
        - Focused on addressing the weaknesses
        - Easy to understand and implement
        - Encouraging and positive in tone
        
        Format as a simple list of tips.
        """
        
        response = self.generate_text(prompt)
        
        # Extract tips from response
        tips = []
        for line in response.text.split('\n'):
            line = line.strip()
            if line and (line.startswith('-') or line.startswith('•') or line.startswith('*')):
                tips.append(line.lstrip('-•* '))
            elif line and len(line) > 20:  # Likely a tip without bullet
                tips.append(line)
        
        return tips[:5]  # Return max 5 tips
    
    def analyze_player_patterns(self, input_history: List[Dict], 
                              performance_data: Dict) -> Dict:
        """Analyze player behavior patterns"""
        prompt = f"""
        Analyze player behavior patterns from the following data:
        
        Input History (last 10 actions):
        {json.dumps(input_history[-10:], indent=2)}
        
        Performance Data:
        {json.dumps(performance_data, indent=2)}
        
        Provide analysis in JSON format with:
        - skill_assessment: Current skill level (0.0 to 1.0)
        - play_style: Identified play style (aggressive, defensive, balanced, erratic)
        - strengths: List of identified strengths
        - weaknesses: List of areas for improvement
        - patterns: Notable behavioral patterns
        - recommendations: Suggestions for AI adaptation
        - confidence: Confidence in analysis (0.0 to 1.0)
        """
        
        response = self.generate_text(prompt)
        
        try:
            analysis = json.loads(response.text)
            return analysis
        except json.JSONDecodeError:
            # Fallback analysis
            return {
                "skill_assessment": 0.5,
                "play_style": "balanced",
                "strengths": ["consistent_timing"],
                "weaknesses": ["accuracy_under_pressure"],
                "patterns": ["tends_to_rush_shots"],
                "recommendations": ["provide_timing_assistance", "reduce_pressure_situations"],
                "confidence": 0.3,
                "raw_response": response.text
            }
    
    def generate_dynamic_content(self, content_type: str, context: Dict) -> Dict:
        """Generate dynamic game content"""
        prompt = f"""
        Generate dynamic {content_type} content for Wii gaming with context:
        {json.dumps(context, indent=2)}
        
        Provide creative, engaging content that:
        - Matches the game context and player skill level
        - Is appropriate for family-friendly gaming
        - Enhances the gaming experience
        - Is technically feasible to implement
        
        Return as JSON with appropriate structure for {content_type}.
        """
        
        response = self.generate_text(prompt)
        
        try:
            content = json.loads(response.text)
            return content
        except json.JSONDecodeError:
            return {
                "content_type": content_type,
                "generated_content": response.text,
                "context": context
            }
    
    def _extract_usage(self, response) -> Dict[str, int]:
        """Extract usage information from response"""
        try:
            if hasattr(response, 'usage_metadata'):
                return {
                    "prompt_tokens": response.usage_metadata.prompt_token_count,
                    "completion_tokens": response.usage_metadata.candidates_token_count,
                    "total_tokens": response.usage_metadata.total_token_count
                }
        except:
            pass
        
        return {"prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0}
    
    def _extract_safety_ratings(self, response) -> List[Dict]:
        """Extract safety ratings from response"""
        try:
            if hasattr(response, 'candidates') and response.candidates:
                candidate = response.candidates[0]
                if hasattr(candidate, 'safety_ratings'):
                    return [
                        {
                            "category": rating.category.name,
                            "probability": rating.probability.name
                        }
                        for rating in candidate.safety_ratings
                    ]
        except:
            pass
        
        return []
    
    def _extract_finish_reason(self, response) -> str:
        """Extract finish reason from response"""
        try:
            if hasattr(response, 'candidates') and response.candidates:
                candidate = response.candidates[0]
                if hasattr(candidate, 'finish_reason'):
                    return candidate.finish_reason.name
        except:
            pass
        
        return "UNKNOWN"

class GeminiChat:
    """Chat session with Gemini"""
    
    def __init__(self, chat_session, config: GeminiConfig):
        self.chat_session = chat_session
        self.config = config
    
    def send_message(self, message: str) -> GeminiResponse:
        """Send message in chat session"""
        try:
            response = self.chat_session.send_message(message)
            
            return GeminiResponse(
                text=response.text,
                model=self.config.model.value,
                usage={},  # Chat sessions don't provide usage info
                safety_ratings=[],
                finish_reason="STOP",
                raw_response=response
            )
        
        except Exception as e:
            logger.error(f"Error sending chat message: {e}")
            raise
    
    async def send_message_async(self, message: str) -> GeminiResponse:
        """Send message asynchronously"""
        try:
            response = await self.chat_session.send_message_async(message)
            
            return GeminiResponse(
                text=response.text,
                model=self.config.model.value,
                usage={},
                safety_ratings=[],
                finish_reason="STOP",
                raw_response=response
            )
        
        except Exception as e:
            logger.error(f"Error sending chat message async: {e}")
            raise

# Convenience functions
def create_gemini_client(api_key: Optional[str] = None) -> GeminiClient:
    """Create a Gemini client with default configuration"""
    if api_key:
        config = GeminiConfig(api_key=api_key)
        return GeminiClient(config)
    return GeminiClient()

def quick_generate(prompt: str, api_key: Optional[str] = None) -> str:
    """Quick text generation"""
    client = create_gemini_client(api_key)
    response = client.generate_text(prompt)
    return response.text

# Example usage
if __name__ == "__main__":
    async def main():
        # Initialize client
        client = GeminiClient()
        
        # Test basic generation
        response = client.generate_text("Explain how AI can enhance Wii Sports gaming")
        print(f"Response: {response.text}")
        
        # Test Wii Sports strategy generation
        strategy = client.generate_wii_sports_strategy(
            sport="tennis",
            player_skill=0.7,
            game_situation="serving_at_match_point",
            opponent_personality="aggressive"
        )
        print(f"Strategy: {json.dumps(strategy, indent=2)}")
        
        # Test coaching advice
        advice = client.generate_coaching_advice(
            sport="bowling",
            weaknesses=["accuracy", "power_control"],
            skill_level=0.4
        )
        print(f"Coaching advice: {advice}")
        
        # Test chat session
        chat = client.start_chat()
        chat_response = chat.send_message("How can I improve my Wii Tennis game?")
        print(f"Chat response: {chat_response.text}")
    
    asyncio.run(main())
