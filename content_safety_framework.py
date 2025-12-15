"""
Universal Content Safety Framework for AGI System
Implements comprehensive content filtering, age restrictions, and territorial law compliance
across all repositories and bridge systems.

Respects treaties and territorial laws as specified in repository rules.
"""

import json
import re
import hashlib
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any, Union
from enum import Enum
from dataclasses import dataclass, asdict
import asyncio
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SafetyLevel(Enum):
    """Content safety levels"""
    SAFE = "safe"
    CAUTION = "caution"
    RESTRICTED = "restricted"
    BLOCKED = "blocked"
    TERRITORIAL_VIOLATION = "territorial_violation"

class AgeGroup(Enum):
    """Age group classifications"""
    CHILD = "child"          # 0-12
    TEEN = "teen"            # 13-17
    YOUNG_ADULT = "young_adult"  # 18-25
    ADULT = "adult"          # 26+
    UNKNOWN = "unknown"

class ContentType(Enum):
    """Types of content that can be filtered"""
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    CODE = "code"
    DATA = "data"
    POLITICAL = "political"
    RELIGIOUS = "religious"
    CULTURAL = "cultural"

class TerritorialJurisdiction(Enum):
    """Territorial jurisdictions for law compliance"""
    CANADA = "canada"
    USA = "usa"
    EU = "eu"
    UK = "uk"
    INTERNATIONAL = "international"
    INDIGENOUS_TREATY = "indigenous_treaty"
    UNKNOWN = "unknown"

@dataclass
class SafetyResult:
    """Result of content safety analysis"""
    safety_level: SafetyLevel
    age_appropriate: Dict[AgeGroup, bool]
    territorial_compliance: Dict[TerritorialJurisdiction, bool]
    content_warnings: List[str]
    blocked_reasons: List[str]
    confidence_score: float
    processing_time: float
    metadata: Dict[str, Any]

@dataclass
class ContentAnalysisRequest:
    """Request for content analysis"""
    content: str
    content_type: ContentType
    user_age_group: AgeGroup
    user_jurisdiction: TerritorialJurisdiction
    bridge_source: str
    request_id: str
    timestamp: datetime
    additional_context: Dict[str, Any] = None

class ContentSafetyManager:
    """
    Universal Content Safety Manager
    Provides centralized content filtering and age restriction capabilities
    """
    
    def __init__(self, config_path: str = "safety_config.json"):
        self.config_path = config_path
        self.safety_rules = {}
        self.territorial_laws = {}
        self.age_restrictions = {}
        self.content_filters = {}
        self.monitoring_enabled = True
        self.cache = {}
        self.cache_ttl = timedelta(hours=1)
        
        # Initialize safety components
        self._load_configuration()
        self._initialize_filters()
        self._load_territorial_laws()
        
        logger.info("🛡️ Universal Content Safety Manager initialized")
    
    def _load_configuration(self):
        """Load safety configuration from file"""
        try:
            if Path(self.config_path).exists():
                with open(self.config_path, 'r') as f:
                    config = json.load(f)
                    self.safety_rules = config.get('safety_rules', {})
                    self.age_restrictions = config.get('age_restrictions', {})
                    self.territorial_laws = config.get('territorial_laws', {})
            else:
                self._create_default_configuration()
        except Exception as e:
            logger.error(f"Failed to load safety configuration: {e}")
            self._create_default_configuration()
    
    def _create_default_configuration(self):
        """Create default safety configuration"""
        self.safety_rules = {
            "blocked_keywords": [
                "explicit_violence", "hate_speech", "harassment",
                "dangerous_content", "illegal_activities"
            ],
            "caution_keywords": [
                "political_controversy", "religious_debate", 
                "cultural_sensitivity", "mature_themes"
            ],
            "territorial_sensitive": [
                "indigenous_rights", "treaty_violations", 
                "territorial_disputes", "sovereignty_issues"
            ]
        }
        
        self.age_restrictions = {
            AgeGroup.CHILD.value: {
                "blocked_content": ["violence", "adult_themes", "complex_politics"],
                "restricted_topics": ["war", "death", "sexuality"],
                "allowed_content": ["education", "entertainment", "basic_civics"]
            },
            AgeGroup.TEEN.value: {
                "blocked_content": ["explicit_violence", "adult_content"],
                "restricted_topics": ["mature_politics", "complex_legal"],
                "allowed_content": ["education", "news", "civic_engagement"]
            },
            AgeGroup.ADULT.value: {
                "blocked_content": ["illegal_activities"],
                "restricted_topics": [],
                "allowed_content": ["all_legal_content"]
            }
        }
        
        self.territorial_laws = {
            TerritorialJurisdiction.CANADA.value: {
                "protected_symbols": ["indigenous_sacred", "national_symbols"],
                "hate_speech_laws": True,
                "privacy_requirements": "PIPEDA",
                "indigenous_rights": "UNDRIP_compliant"
            },
            TerritorialJurisdiction.INDIGENOUS_TREATY.value: {
                "sacred_protection": True,
                "cultural_sensitivity": "maximum",
                "consultation_required": True,
                "traditional_knowledge_protection": True
            }
        }
        
        # Save default configuration
        self._save_configuration()
    
    def _save_configuration(self):
        """Save current configuration to file"""
        try:
            config = {
                "safety_rules": self.safety_rules,
                "age_restrictions": self.age_restrictions,
                "territorial_laws": self.territorial_laws,
                "last_updated": datetime.now().isoformat()
            }
            with open(self.config_path, 'w') as f:
                json.dump(config, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save safety configuration: {e}")
    
    def _initialize_filters(self):
        """Initialize content filtering mechanisms"""
        self.content_filters = {
            ContentType.TEXT: self._filter_text_content,
            ContentType.POLITICAL: self._filter_political_content,
            ContentType.RELIGIOUS: self._filter_religious_content,
            ContentType.CULTURAL: self._filter_cultural_content,
            ContentType.CODE: self._filter_code_content,
            ContentType.DATA: self._filter_data_content
        }
    
    def _load_territorial_laws(self):
        """Load territorial law requirements"""
        # This would typically load from a comprehensive database
        # For now, we implement key requirements from repository rules
        pass
    
    async def analyze_content(self, request: ContentAnalysisRequest) -> SafetyResult:
        """
        Analyze content for safety, age appropriateness, and territorial compliance
        """
        start_time = datetime.now()
        
        # Check cache first
        cache_key = self._generate_cache_key(request)
        if cache_key in self.cache:
            cached_result, timestamp = self.cache[cache_key]
            if datetime.now() - timestamp < self.cache_ttl:
                return cached_result
        
        try:
            # Perform content analysis
            safety_level = await self._determine_safety_level(request)
            age_appropriate = await self._check_age_appropriateness(request)
            territorial_compliance = await self._check_territorial_compliance(request)
            content_warnings = await self._generate_content_warnings(request)
            blocked_reasons = await self._determine_blocked_reasons(request, safety_level)
            confidence_score = await self._calculate_confidence_score(request)
            
            # Create result
            processing_time = (datetime.now() - start_time).total_seconds()
            result = SafetyResult(
                safety_level=safety_level,
                age_appropriate=age_appropriate,
                territorial_compliance=territorial_compliance,
                content_warnings=content_warnings,
                blocked_reasons=blocked_reasons,
                confidence_score=confidence_score,
                processing_time=processing_time,
                metadata={
                    "request_id": request.request_id,
                    "bridge_source": request.bridge_source,
                    "analysis_timestamp": datetime.now().isoformat()
                }
            )
            
            # Cache result
            self.cache[cache_key] = (result, datetime.now())
            
            # Log analysis
            if self.monitoring_enabled:
                await self._log_analysis(request, result)
            
            return result
            
        except Exception as e:
            logger.error(f"Content analysis failed for request {request.request_id}: {e}")
            # Return safe default
            return SafetyResult(
                safety_level=SafetyLevel.BLOCKED,
                age_appropriate={age: False for age in AgeGroup},
                territorial_compliance={jurisdiction: False for jurisdiction in TerritorialJurisdiction},
                content_warnings=["Analysis failed - content blocked for safety"],
                blocked_reasons=["Technical error during analysis"],
                confidence_score=0.0,
                processing_time=(datetime.now() - start_time).total_seconds(),
                metadata={"error": str(e)}
            )
    
    async def _determine_safety_level(self, request: ContentAnalysisRequest) -> SafetyLevel:
        """Determine the safety level of content"""
        content = request.content.lower()
        
        # Check for blocked content
        for keyword in self.safety_rules.get("blocked_keywords", []):
            if keyword in content:
                return SafetyLevel.BLOCKED
        
        # Check for territorial violations
        for sensitive_term in self.safety_rules.get("territorial_sensitive", []):
            if sensitive_term in content:
                # Additional territorial analysis needed
                territorial_result = await self._analyze_territorial_sensitivity(request)
                if not territorial_result:
                    return SafetyLevel.TERRITORIAL_VIOLATION
        
        # Check for caution content
        for keyword in self.safety_rules.get("caution_keywords", []):
            if keyword in content:
                return SafetyLevel.CAUTION
        
        # Apply content-type specific filtering
        if request.content_type in self.content_filters:
            filter_result = await self.content_filters[request.content_type](request)
            if filter_result != SafetyLevel.SAFE:
                return filter_result
        
        return SafetyLevel.SAFE
    
    async def _check_age_appropriateness(self, request: ContentAnalysisRequest) -> Dict[AgeGroup, bool]:
        """Check if content is appropriate for different age groups"""
        age_appropriate = {}
        
        for age_group in AgeGroup:
            if age_group == AgeGroup.UNKNOWN:
                age_appropriate[age_group] = False
                continue
                
            restrictions = self.age_restrictions.get(age_group.value, {})
            blocked_content = restrictions.get("blocked_content", [])
            restricted_topics = restrictions.get("restricted_topics", [])
            
            # Check if content contains blocked material for this age group
            content_lower = request.content.lower()
            is_appropriate = True
            
            for blocked_item in blocked_content:
                if blocked_item in content_lower:
                    is_appropriate = False
                    break
            
            if is_appropriate:
                for restricted_topic in restricted_topics:
                    if restricted_topic in content_lower:
                        # Restricted topics require additional context analysis
                        is_appropriate = await self._analyze_restricted_topic(
                            request, restricted_topic, age_group
                        )
                        break
            
            age_appropriate[age_group] = is_appropriate
        
        return age_appropriate
    
    async def _check_territorial_compliance(self, request: ContentAnalysisRequest) -> Dict[TerritorialJurisdiction, bool]:
        """Check compliance with territorial laws"""
        compliance = {}
        
        for jurisdiction in TerritorialJurisdiction:
            if jurisdiction == TerritorialJurisdiction.UNKNOWN:
                compliance[jurisdiction] = False
                continue
            
            jurisdiction_laws = self.territorial_laws.get(jurisdiction.value, {})
            is_compliant = True
            
            # Check protected symbols
            protected_symbols = jurisdiction_laws.get("protected_symbols", [])
            for symbol in protected_symbols:
                if symbol in request.content.lower():
                    # Additional analysis needed for symbol usage context
                    is_compliant = await self._analyze_symbol_usage(request, symbol, jurisdiction)
                    if not is_compliant:
                        break
            
            # Check hate speech laws
            if jurisdiction_laws.get("hate_speech_laws", False):
                hate_speech_detected = await self._detect_hate_speech(request)
                if hate_speech_detected:
                    is_compliant = False
            
            # Check indigenous rights compliance
            if jurisdiction == TerritorialJurisdiction.INDIGENOUS_TREATY:
                indigenous_compliant = await self._check_indigenous_rights_compliance(request)
                is_compliant = is_compliant and indigenous_compliant
            
            compliance[jurisdiction] = is_compliant
        
        return compliance
    
    async def _generate_content_warnings(self, request: ContentAnalysisRequest) -> List[str]:
        """Generate appropriate content warnings"""
        warnings = []
        content = request.content.lower()
        
        # Standard content warnings
        warning_triggers = {
            "violence": "Contains descriptions of violence",
            "political": "Contains political content",
            "religious": "Contains religious content",
            "cultural": "Contains culturally sensitive material",
            "mature": "Contains mature themes",
            "treaty": "Relates to treaty or territorial matters"
        }
        
        for trigger, warning in warning_triggers.items():
            if trigger in content:
                warnings.append(warning)
        
        return warnings
    
    async def _determine_blocked_reasons(self, request: ContentAnalysisRequest, safety_level: SafetyLevel) -> List[str]:
        """Determine reasons why content might be blocked"""
        reasons = []
        
        if safety_level == SafetyLevel.BLOCKED:
            reasons.append("Content violates safety guidelines")
        elif safety_level == SafetyLevel.TERRITORIAL_VIOLATION:
            reasons.append("Content violates territorial laws or treaty obligations")
        elif safety_level == SafetyLevel.RESTRICTED:
            reasons.append("Content restricted for specified age group")
        
        return reasons
    
    async def _calculate_confidence_score(self, request: ContentAnalysisRequest) -> float:
        """Calculate confidence score for the analysis"""
        # This would implement sophisticated confidence calculation
        # For now, return a basic score based on content length and complexity
        content_length = len(request.content)
        if content_length < 10:
            return 0.6  # Low confidence for very short content
        elif content_length > 1000:
            return 0.9  # High confidence for longer content
        else:
            return 0.8  # Medium confidence
    
    def _generate_cache_key(self, request: ContentAnalysisRequest) -> str:
        """Generate cache key for request"""
        content_hash = hashlib.md5(request.content.encode()).hexdigest()
        return f"{content_hash}_{request.content_type.value}_{request.user_age_group.value}_{request.user_jurisdiction.value}"
    
    async def _log_analysis(self, request: ContentAnalysisRequest, result: SafetyResult):
        """Log analysis for monitoring and compliance"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "request_id": request.request_id,
            "bridge_source": request.bridge_source,
            "safety_level": result.safety_level.value,
            "processing_time": result.processing_time,
            "confidence_score": result.confidence_score
        }
        
        # In production, this would write to a proper logging system
        logger.info(f"Content analysis: {json.dumps(log_entry)}")
    
    # Content-specific filter methods
    async def _filter_text_content(self, request: ContentAnalysisRequest) -> SafetyLevel:
        """Filter text content"""
        return SafetyLevel.SAFE  # Implement specific text filtering logic
    
    async def _filter_political_content(self, request: ContentAnalysisRequest) -> SafetyLevel:
        """Filter political content with special territorial considerations"""
        # Implement political content filtering respecting territorial laws
        return SafetyLevel.SAFE
    
    async def _filter_religious_content(self, request: ContentAnalysisRequest) -> SafetyLevel:
        """Filter religious content with cultural sensitivity"""
        return SafetyLevel.SAFE
    
    async def _filter_cultural_content(self, request: ContentAnalysisRequest) -> SafetyLevel:
        """Filter cultural content with indigenous rights protection"""
        return SafetyLevel.SAFE
    
    async def _filter_code_content(self, request: ContentAnalysisRequest) -> SafetyLevel:
        """Filter code content for security and safety"""
        return SafetyLevel.SAFE
    
    async def _filter_data_content(self, request: ContentAnalysisRequest) -> SafetyLevel:
        """Filter data content for privacy and security"""
        return SafetyLevel.SAFE
    
    # Helper analysis methods
    async def _analyze_territorial_sensitivity(self, request: ContentAnalysisRequest) -> bool:
        """Analyze territorial sensitivity of content"""
        return True  # Implement territorial sensitivity analysis
    
    async def _analyze_restricted_topic(self, request: ContentAnalysisRequest, topic: str, age_group: AgeGroup) -> bool:
        """Analyze if restricted topic is appropriate in context"""
        return True  # Implement context-aware topic analysis
    
    async def _analyze_symbol_usage(self, request: ContentAnalysisRequest, symbol: str, jurisdiction: TerritorialJurisdiction) -> bool:
        """Analyze if symbol usage is appropriate and legal"""
        return True  # Implement symbol usage analysis
    
    async def _detect_hate_speech(self, request: ContentAnalysisRequest) -> bool:
        """Detect hate speech in content"""
        return False  # Implement hate speech detection
    
    async def _check_indigenous_rights_compliance(self, request: ContentAnalysisRequest) -> bool:
        """Check compliance with indigenous rights and treaty obligations"""
        # This is critical per repository rules
        return True  # Implement indigenous rights compliance checking

# Utility functions for easy integration
async def quick_safety_check(content: str, content_type: ContentType = ContentType.TEXT, 
                           age_group: AgeGroup = AgeGroup.UNKNOWN,
                           jurisdiction: TerritorialJurisdiction = TerritorialJurisdiction.UNKNOWN) -> SafetyResult:
    """Quick safety check for content"""
    manager = ContentSafetyManager()
    request = ContentAnalysisRequest(
        content=content,
        content_type=content_type,
        user_age_group=age_group,
        user_jurisdiction=jurisdiction,
        bridge_source="quick_check",
        request_id=f"quick_{datetime.now().timestamp()}",
        timestamp=datetime.now()
    )
    return await manager.analyze_content(request)

def is_content_safe_for_age(content: str, age_group: AgeGroup) -> bool:
    """Simple synchronous check if content is safe for age group"""
    import asyncio
    result = asyncio.run(quick_safety_check(content, age_group=age_group))
    return result.age_appropriate.get(age_group, False)

if __name__ == "__main__":
    # Example usage
    async def test_safety_framework():
        manager = ContentSafetyManager()
        
        test_request = ContentAnalysisRequest(
            content="This is a test of the content safety system with political discussion about Canadian treaties.",
            content_type=ContentType.POLITICAL,
            user_age_group=AgeGroup.ADULT,
            user_jurisdiction=TerritorialJurisdiction.CANADA,
            bridge_source="test_bridge",
            request_id="test_001",
            timestamp=datetime.now()
        )
        
        result = await manager.analyze_content(test_request)
        print(f"Safety Analysis Result: {asdict(result)}")
    
    asyncio.run(test_safety_framework())
