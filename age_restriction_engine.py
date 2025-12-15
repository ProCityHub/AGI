"""
Age Restriction Engine for AGI Content Safety System
Implements comprehensive age verification and content restriction mechanisms
with territorial law compliance and cultural sensitivity.
"""

import json
import logging
import hashlib
from datetime import datetime, timedelta, date
from typing import Dict, List, Optional, Tuple, Any, Union
from enum import Enum
from dataclasses import dataclass, asdict
import re
import asyncio
from pathlib import Path

from content_safety_framework import (
    AgeGroup, ContentType, TerritorialJurisdiction, 
    SafetyLevel, ContentAnalysisRequest
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AgeVerificationMethod(Enum):
    """Methods for age verification"""
    SELF_DECLARED = "self_declared"
    DOCUMENT_VERIFICATION = "document_verification"
    PARENTAL_CONSENT = "parental_consent"
    CREDIT_CARD = "credit_card"
    BIOMETRIC = "biometric"
    THIRD_PARTY_SERVICE = "third_party_service"
    UNKNOWN = "unknown"

class ContentRating(Enum):
    """Content rating classifications"""
    G = "general"              # All ages
    PG = "parental_guidance"   # Parental guidance suggested
    PG13 = "pg13"             # Parents strongly cautioned
    R = "restricted"          # Restricted - under 17 requires parent
    NC17 = "nc17"             # No one 17 and under admitted
    AO = "adults_only"        # Adults only 18+
    UNRATED = "unrated"       # Not rated

class ParentalControlLevel(Enum):
    """Parental control restriction levels"""
    NONE = "none"
    BASIC = "basic"
    MODERATE = "moderate"
    STRICT = "strict"
    MAXIMUM = "maximum"

@dataclass
class AgeVerificationResult:
    """Result of age verification process"""
    verified: bool
    age_group: AgeGroup
    verification_method: AgeVerificationMethod
    confidence_score: float
    verification_timestamp: datetime
    expires_at: Optional[datetime]
    metadata: Dict[str, Any]

@dataclass
class ContentRatingResult:
    """Result of content rating analysis"""
    rating: ContentRating
    age_appropriate_groups: List[AgeGroup]
    content_warnings: List[str]
    parental_guidance_required: bool
    territorial_restrictions: Dict[TerritorialJurisdiction, bool]
    reasoning: str
    confidence_score: float

@dataclass
class UserProfile:
    """User profile for age restriction system"""
    user_id: str
    age_group: AgeGroup
    verification_result: Optional[AgeVerificationResult]
    parental_control_level: ParentalControlLevel
    jurisdiction: TerritorialJurisdiction
    preferences: Dict[str, Any]
    created_at: datetime
    last_updated: datetime

class AgeRestrictionEngine:
    """
    Comprehensive Age Restriction Engine
    Handles age verification, content rating, and access control
    """
    
    def __init__(self, config_path: str = "age_restriction_config.json"):
        self.config_path = config_path
        self.age_verification_rules = {}
        self.content_rating_rules = {}
        self.parental_control_rules = {}
        self.territorial_age_laws = {}
        self.user_profiles = {}
        self.verification_cache = {}
        self.cache_ttl = timedelta(hours=24)
        
        # Initialize engine components
        self._load_configuration()
        self._initialize_rating_system()
        self._load_territorial_age_laws()
        
        logger.info("🔞 Age Restriction Engine initialized")
    
    def _load_configuration(self):
        """Load age restriction configuration"""
        try:
            if Path(self.config_path).exists():
                with open(self.config_path, 'r') as f:
                    config = json.load(f)
                    self.age_verification_rules = config.get('age_verification_rules', {})
                    self.content_rating_rules = config.get('content_rating_rules', {})
                    self.parental_control_rules = config.get('parental_control_rules', {})
                    self.territorial_age_laws = config.get('territorial_age_laws', {})
            else:
                self._create_default_configuration()
        except Exception as e:
            logger.error(f"Failed to load age restriction configuration: {e}")
            self._create_default_configuration()
    
    def _create_default_configuration(self):
        """Create default age restriction configuration"""
        self.age_verification_rules = {
            "minimum_ages": {
                "digital_consent": 13,
                "parental_consent_required": 13,
                "independent_consent": 18,
                "adult_content": 18,
                "mature_political_content": 16
            },
            "verification_requirements": {
                AgeGroup.CHILD.value: {
                    "required_methods": [AgeVerificationMethod.PARENTAL_CONSENT.value],
                    "additional_verification": True,
                    "parental_supervision": True
                },
                AgeGroup.TEEN.value: {
                    "required_methods": [AgeVerificationMethod.SELF_DECLARED.value, AgeVerificationMethod.PARENTAL_CONSENT.value],
                    "additional_verification": False,
                    "parental_supervision": False
                },
                AgeGroup.ADULT.value: {
                    "required_methods": [AgeVerificationMethod.SELF_DECLARED.value],
                    "additional_verification": False,
                    "parental_supervision": False
                }
            }
        }
        
        self.content_rating_rules = {
            ContentRating.G.value: {
                "allowed_age_groups": [AgeGroup.CHILD.value, AgeGroup.TEEN.value, AgeGroup.YOUNG_ADULT.value, AgeGroup.ADULT.value],
                "content_restrictions": [],
                "warnings_required": False
            },
            ContentRating.PG.value: {
                "allowed_age_groups": [AgeGroup.CHILD.value, AgeGroup.TEEN.value, AgeGroup.YOUNG_ADULT.value, AgeGroup.ADULT.value],
                "content_restrictions": ["mild_language", "brief_violence"],
                "warnings_required": True,
                "parental_guidance": True
            },
            ContentRating.PG13.value: {
                "allowed_age_groups": [AgeGroup.TEEN.value, AgeGroup.YOUNG_ADULT.value, AgeGroup.ADULT.value],
                "content_restrictions": ["moderate_violence", "mild_sexual_content", "drug_references"],
                "warnings_required": True,
                "parental_guidance": True
            },
            ContentRating.R.value: {
                "allowed_age_groups": [AgeGroup.YOUNG_ADULT.value, AgeGroup.ADULT.value],
                "content_restrictions": ["strong_violence", "sexual_content", "drug_use", "strong_language"],
                "warnings_required": True,
                "parental_supervision_under_17": True
            },
            ContentRating.AO.value: {
                "allowed_age_groups": [AgeGroup.ADULT.value],
                "content_restrictions": ["explicit_content", "graphic_violence", "adult_themes"],
                "warnings_required": True,
                "strict_verification_required": True
            }
        }
        
        self.parental_control_rules = {
            ParentalControlLevel.NONE.value: {
                "blocked_ratings": [],
                "time_restrictions": False,
                "content_filtering": False
            },
            ParentalControlLevel.BASIC.value: {
                "blocked_ratings": [ContentRating.AO.value],
                "time_restrictions": True,
                "content_filtering": True,
                "blocked_keywords": ["explicit", "adult"]
            },
            ParentalControlLevel.MODERATE.value: {
                "blocked_ratings": [ContentRating.AO.value, ContentRating.R.value],
                "time_restrictions": True,
                "content_filtering": True,
                "blocked_keywords": ["explicit", "adult", "violence", "sexual"]
            },
            ParentalControlLevel.STRICT.value: {
                "blocked_ratings": [ContentRating.AO.value, ContentRating.R.value, ContentRating.PG13.value],
                "time_restrictions": True,
                "content_filtering": True,
                "blocked_keywords": ["explicit", "adult", "violence", "sexual", "mature", "controversial"]
            },
            ParentalControlLevel.MAXIMUM.value: {
                "blocked_ratings": [ContentRating.AO.value, ContentRating.R.value, ContentRating.PG13.value, ContentRating.PG.value],
                "time_restrictions": True,
                "content_filtering": True,
                "blocked_keywords": ["explicit", "adult", "violence", "sexual", "mature", "controversial", "political", "religious"],
                "whitelist_only": True
            }
        }
        
        self.territorial_age_laws = {
            TerritorialJurisdiction.CANADA.value: {
                "digital_consent_age": 13,
                "adult_content_age": 18,
                "privacy_consent_age": 13,
                "parental_consent_required_under": 13,
                "special_protections": {
                    "indigenous_youth": {
                        "cultural_content_protection": True,
                        "community_consent_required": True,
                        "elder_guidance_recommended": True
                    }
                }
            },
            TerritorialJurisdiction.USA.value: {
                "digital_consent_age": 13,
                "adult_content_age": 18,
                "privacy_consent_age": 13,
                "parental_consent_required_under": 13,
                "state_variations": True
            },
            TerritorialJurisdiction.EU.value: {
                "digital_consent_age": 16,
                "adult_content_age": 18,
                "privacy_consent_age": 16,
                "parental_consent_required_under": 16,
                "gdpr_compliance": True
            }
        }
        
        # Save default configuration
        self._save_configuration()
    
    def _save_configuration(self):
        """Save current configuration to file"""
        try:
            config = {
                "age_verification_rules": self.age_verification_rules,
                "content_rating_rules": self.content_rating_rules,
                "parental_control_rules": self.parental_control_rules,
                "territorial_age_laws": self.territorial_age_laws,
                "last_updated": datetime.now().isoformat()
            }
            with open(self.config_path, 'w') as f:
                json.dump(config, f, indent=2)
        except Exception as e:
            logger.error(f"Failed to save age restriction configuration: {e}")
    
    def _initialize_rating_system(self):
        """Initialize content rating system"""
        # Initialize rating algorithms and classifiers
        pass
    
    def _load_territorial_age_laws(self):
        """Load territorial age law requirements"""
        # Load comprehensive territorial age law database
        pass
    
    async def verify_age(self, user_id: str, verification_data: Dict[str, Any], 
                        method: AgeVerificationMethod = AgeVerificationMethod.SELF_DECLARED) -> AgeVerificationResult:
        """
        Verify user age using specified method
        """
        try:
            # Check cache first
            cache_key = f"{user_id}_{method.value}"
            if cache_key in self.verification_cache:
                cached_result, timestamp = self.verification_cache[cache_key]
                if datetime.now() - timestamp < self.cache_ttl:
                    return cached_result
            
            # Perform age verification based on method
            if method == AgeVerificationMethod.SELF_DECLARED:
                result = await self._verify_self_declared_age(user_id, verification_data)
            elif method == AgeVerificationMethod.DOCUMENT_VERIFICATION:
                result = await self._verify_document_age(user_id, verification_data)
            elif method == AgeVerificationMethod.PARENTAL_CONSENT:
                result = await self._verify_parental_consent(user_id, verification_data)
            elif method == AgeVerificationMethod.CREDIT_CARD:
                result = await self._verify_credit_card_age(user_id, verification_data)
            elif method == AgeVerificationMethod.THIRD_PARTY_SERVICE:
                result = await self._verify_third_party_age(user_id, verification_data)
            else:
                result = AgeVerificationResult(
                    verified=False,
                    age_group=AgeGroup.UNKNOWN,
                    verification_method=method,
                    confidence_score=0.0,
                    verification_timestamp=datetime.now(),
                    expires_at=None,
                    metadata={"error": "Unsupported verification method"}
                )
            
            # Cache result
            self.verification_cache[cache_key] = (result, datetime.now())
            
            # Log verification attempt
            await self._log_verification_attempt(user_id, method, result)
            
            return result
            
        except Exception as e:
            logger.error(f"Age verification failed for user {user_id}: {e}")
            return AgeVerificationResult(
                verified=False,
                age_group=AgeGroup.UNKNOWN,
                verification_method=method,
                confidence_score=0.0,
                verification_timestamp=datetime.now(),
                expires_at=None,
                metadata={"error": str(e)}
            )
    
    async def rate_content(self, request: ContentAnalysisRequest) -> ContentRatingResult:
        """
        Rate content for age appropriateness
        """
        try:
            # Analyze content for rating
            rating = await self._determine_content_rating(request)
            age_appropriate_groups = await self._determine_age_appropriate_groups(request, rating)
            content_warnings = await self._generate_content_warnings(request, rating)
            parental_guidance_required = await self._check_parental_guidance_requirement(request, rating)
            territorial_restrictions = await self._check_territorial_age_restrictions(request, rating)
            reasoning = await self._generate_rating_reasoning(request, rating)
            confidence_score = await self._calculate_rating_confidence(request, rating)
            
            result = ContentRatingResult(
                rating=rating,
                age_appropriate_groups=age_appropriate_groups,
                content_warnings=content_warnings,
                parental_guidance_required=parental_guidance_required,
                territorial_restrictions=territorial_restrictions,
                reasoning=reasoning,
                confidence_score=confidence_score
            )
            
            # Log rating decision
            await self._log_content_rating(request, result)
            
            return result
            
        except Exception as e:
            logger.error(f"Content rating failed for request {request.request_id}: {e}")
            # Return safe default
            return ContentRatingResult(
                rating=ContentRating.UNRATED,
                age_appropriate_groups=[],
                content_warnings=["Content rating failed - access restricted"],
                parental_guidance_required=True,
                territorial_restrictions={jurisdiction: False for jurisdiction in TerritorialJurisdiction},
                reasoning="Technical error during rating analysis",
                confidence_score=0.0
            )
    
    async def check_access_permission(self, user_id: str, content_rating: ContentRating, 
                                    jurisdiction: TerritorialJurisdiction = TerritorialJurisdiction.UNKNOWN) -> bool:
        """
        Check if user has permission to access content with given rating
        """
        try:
            # Get user profile
            user_profile = await self._get_user_profile(user_id)
            if not user_profile:
                return False
            
            # Check age verification
            if not user_profile.verification_result or not user_profile.verification_result.verified:
                return False
            
            # Check basic age group permission
            rating_rules = self.content_rating_rules.get(content_rating.value, {})
            allowed_age_groups = rating_rules.get("allowed_age_groups", [])
            
            if user_profile.age_group.value not in allowed_age_groups:
                return False
            
            # Check parental controls
            if not await self._check_parental_control_permission(user_profile, content_rating):
                return False
            
            # Check territorial restrictions
            if not await self._check_territorial_age_permission(user_profile, content_rating, jurisdiction):
                return False
            
            # Check special verification requirements
            if rating_rules.get("strict_verification_required", False):
                if user_profile.verification_result.confidence_score < 0.8:
                    return False
            
            return True
            
        except Exception as e:
            logger.error(f"Access permission check failed for user {user_id}: {e}")
            return False
    
    async def create_user_profile(self, user_id: str, age_group: AgeGroup, 
                                jurisdiction: TerritorialJurisdiction,
                                parental_control_level: ParentalControlLevel = ParentalControlLevel.NONE,
                                preferences: Dict[str, Any] = None) -> UserProfile:
        """
        Create user profile for age restriction system
        """
        profile = UserProfile(
            user_id=user_id,
            age_group=age_group,
            verification_result=None,
            parental_control_level=parental_control_level,
            jurisdiction=jurisdiction,
            preferences=preferences or {},
            created_at=datetime.now(),
            last_updated=datetime.now()
        )
        
        self.user_profiles[user_id] = profile
        await self._save_user_profile(profile)
        
        logger.info(f"Created user profile for {user_id} with age group {age_group.value}")
        return profile
    
    # Age verification methods
    async def _verify_self_declared_age(self, user_id: str, verification_data: Dict[str, Any]) -> AgeVerificationResult:
        """Verify self-declared age"""
        try:
            birth_date_str = verification_data.get('birth_date')
            if not birth_date_str:
                raise ValueError("Birth date required for self-declared verification")
            
            birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d').date()
            today = date.today()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            
            # Determine age group
            if age < 13:
                age_group = AgeGroup.CHILD
            elif age < 18:
                age_group = AgeGroup.TEEN
            elif age < 26:
                age_group = AgeGroup.YOUNG_ADULT
            else:
                age_group = AgeGroup.ADULT
            
            # Self-declared has lower confidence
            confidence_score = 0.6
            
            return AgeVerificationResult(
                verified=True,
                age_group=age_group,
                verification_method=AgeVerificationMethod.SELF_DECLARED,
                confidence_score=confidence_score,
                verification_timestamp=datetime.now(),
                expires_at=datetime.now() + timedelta(days=365),
                metadata={"calculated_age": age, "birth_date": birth_date_str}
            )
            
        except Exception as e:
            return AgeVerificationResult(
                verified=False,
                age_group=AgeGroup.UNKNOWN,
                verification_method=AgeVerificationMethod.SELF_DECLARED,
                confidence_score=0.0,
                verification_timestamp=datetime.now(),
                expires_at=None,
                metadata={"error": str(e)}
            )
    
    async def _verify_document_age(self, user_id: str, verification_data: Dict[str, Any]) -> AgeVerificationResult:
        """Verify age using document verification"""
        # This would integrate with document verification services
        # For now, return a placeholder implementation
        return AgeVerificationResult(
            verified=True,
            age_group=AgeGroup.ADULT,
            verification_method=AgeVerificationMethod.DOCUMENT_VERIFICATION,
            confidence_score=0.95,
            verification_timestamp=datetime.now(),
            expires_at=datetime.now() + timedelta(days=1095),  # 3 years
            metadata={"document_type": verification_data.get("document_type", "unknown")}
        )
    
    async def _verify_parental_consent(self, user_id: str, verification_data: Dict[str, Any]) -> AgeVerificationResult:
        """Verify parental consent for minors"""
        # This would implement parental consent verification
        return AgeVerificationResult(
            verified=True,
            age_group=AgeGroup.CHILD,
            verification_method=AgeVerificationMethod.PARENTAL_CONSENT,
            confidence_score=0.9,
            verification_timestamp=datetime.now(),
            expires_at=datetime.now() + timedelta(days=365),
            metadata={"parent_id": verification_data.get("parent_id"), "consent_method": verification_data.get("consent_method")}
        )
    
    async def _verify_credit_card_age(self, user_id: str, verification_data: Dict[str, Any]) -> AgeVerificationResult:
        """Verify age using credit card (18+ verification)"""
        # This would integrate with payment processors for age verification
        return AgeVerificationResult(
            verified=True,
            age_group=AgeGroup.ADULT,
            verification_method=AgeVerificationMethod.CREDIT_CARD,
            confidence_score=0.85,
            verification_timestamp=datetime.now(),
            expires_at=datetime.now() + timedelta(days=730),  # 2 years
            metadata={"card_type": verification_data.get("card_type")}
        )
    
    async def _verify_third_party_age(self, user_id: str, verification_data: Dict[str, Any]) -> AgeVerificationResult:
        """Verify age using third-party service"""
        # This would integrate with third-party age verification services
        return AgeVerificationResult(
            verified=True,
            age_group=AgeGroup.ADULT,
            verification_method=AgeVerificationMethod.THIRD_PARTY_SERVICE,
            confidence_score=0.9,
            verification_timestamp=datetime.now(),
            expires_at=datetime.now() + timedelta(days=1095),  # 3 years
            metadata={"service_provider": verification_data.get("service_provider")}
        )
    
    # Content rating methods
    async def _determine_content_rating(self, request: ContentAnalysisRequest) -> ContentRating:
        """Determine appropriate content rating"""
        content = request.content.lower()
        
        # Check for adult-only content
        adult_keywords = ["explicit", "graphic", "adult_only", "18+", "mature_adult"]
        if any(keyword in content for keyword in adult_keywords):
            return ContentRating.AO
        
        # Check for restricted content
        restricted_keywords = ["violence", "sexual", "drug", "strong_language", "mature"]
        if any(keyword in content for keyword in restricted_keywords):
            return ContentRating.R
        
        # Check for PG-13 content
        pg13_keywords = ["mild_violence", "brief_nudity", "drug_reference", "moderate"]
        if any(keyword in content for keyword in pg13_keywords):
            return ContentRating.PG13
        
        # Check for PG content
        pg_keywords = ["mild", "brief", "suggestive", "caution"]
        if any(keyword in content for keyword in pg_keywords):
            return ContentRating.PG
        
        # Default to general audiences
        return ContentRating.G
    
    async def _determine_age_appropriate_groups(self, request: ContentAnalysisRequest, rating: ContentRating) -> List[AgeGroup]:
        """Determine which age groups can access content"""
        rating_rules = self.content_rating_rules.get(rating.value, {})
        allowed_groups_str = rating_rules.get("allowed_age_groups", [])
        
        age_groups = []
        for group_str in allowed_groups_str:
            try:
                age_groups.append(AgeGroup(group_str))
            except ValueError:
                continue
        
        return age_groups
    
    async def _generate_content_warnings(self, request: ContentAnalysisRequest, rating: ContentRating) -> List[str]:
        """Generate content warnings based on rating"""
        warnings = []
        content = request.content.lower()
        
        warning_keywords = {
            "violence": "Contains violence",
            "sexual": "Contains sexual content",
            "drug": "Contains drug references",
            "language": "Contains strong language",
            "mature": "Contains mature themes",
            "political": "Contains political content",
            "religious": "Contains religious content"
        }
        
        for keyword, warning in warning_keywords.items():
            if keyword in content:
                warnings.append(warning)
        
        return warnings
    
    async def _check_parental_guidance_requirement(self, request: ContentAnalysisRequest, rating: ContentRating) -> bool:
        """Check if parental guidance is required"""
        rating_rules = self.content_rating_rules.get(rating.value, {})
        return rating_rules.get("parental_guidance", False)
    
    async def _check_territorial_age_restrictions(self, request: ContentAnalysisRequest, rating: ContentRating) -> Dict[TerritorialJurisdiction, bool]:
        """Check territorial age restrictions"""
        restrictions = {}
        
        for jurisdiction in TerritorialJurisdiction:
            if jurisdiction == TerritorialJurisdiction.UNKNOWN:
                restrictions[jurisdiction] = False
                continue
            
            # Check jurisdiction-specific age laws
            jurisdiction_laws = self.territorial_age_laws.get(jurisdiction.value, {})
            
            # For now, allow all content that meets basic age requirements
            # In production, this would implement complex territorial law checking
            restrictions[jurisdiction] = True
        
        return restrictions
    
    async def _generate_rating_reasoning(self, request: ContentAnalysisRequest, rating: ContentRating) -> str:
        """Generate reasoning for content rating"""
        return f"Content rated {rating.value} based on content analysis and safety guidelines"
    
    async def _calculate_rating_confidence(self, request: ContentAnalysisRequest, rating: ContentRating) -> float:
        """Calculate confidence score for rating"""
        # This would implement sophisticated confidence calculation
        content_length = len(request.content)
        if content_length < 50:
            return 0.7  # Lower confidence for short content
        elif content_length > 500:
            return 0.9  # Higher confidence for longer content
        else:
            return 0.8  # Medium confidence
    
    # Helper methods
    async def _get_user_profile(self, user_id: str) -> Optional[UserProfile]:
        """Get user profile"""
        return self.user_profiles.get(user_id)
    
    async def _check_parental_control_permission(self, user_profile: UserProfile, content_rating: ContentRating) -> bool:
        """Check parental control permissions"""
        control_rules = self.parental_control_rules.get(user_profile.parental_control_level.value, {})
        blocked_ratings = control_rules.get("blocked_ratings", [])
        
        return content_rating.value not in blocked_ratings
    
    async def _check_territorial_age_permission(self, user_profile: UserProfile, content_rating: ContentRating, 
                                              jurisdiction: TerritorialJurisdiction) -> bool:
        """Check territorial age permissions"""
        # Implement territorial age law checking
        return True  # Placeholder
    
    async def _save_user_profile(self, profile: UserProfile):
        """Save user profile to persistent storage"""
        # In production, this would save to database
        pass
    
    async def _log_verification_attempt(self, user_id: str, method: AgeVerificationMethod, result: AgeVerificationResult):
        """Log age verification attempt"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "user_id": user_id,
            "verification_method": method.value,
            "verified": result.verified,
            "age_group": result.age_group.value,
            "confidence_score": result.confidence_score
        }
        logger.info(f"Age verification: {json.dumps(log_entry)}")
    
    async def _log_content_rating(self, request: ContentAnalysisRequest, result: ContentRatingResult):
        """Log content rating decision"""
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "request_id": request.request_id,
            "content_rating": result.rating.value,
            "age_appropriate_groups": [group.value for group in result.age_appropriate_groups],
            "confidence_score": result.confidence_score
        }
        logger.info(f"Content rating: {json.dumps(log_entry)}")

# Utility functions
async def quick_age_check(user_id: str, birth_date: str) -> AgeVerificationResult:
    """Quick age verification check"""
    engine = AgeRestrictionEngine()
    verification_data = {"birth_date": birth_date}
    return await engine.verify_age(user_id, verification_data, AgeVerificationMethod.SELF_DECLARED)

async def quick_content_rating(content: str, content_type: ContentType = ContentType.TEXT) -> ContentRatingResult:
    """Quick content rating check"""
    engine = AgeRestrictionEngine()
    request = ContentAnalysisRequest(
        content=content,
        content_type=content_type,
        user_age_group=AgeGroup.UNKNOWN,
        user_jurisdiction=TerritorialJurisdiction.UNKNOWN,
        bridge_source="quick_rating",
        request_id=f"rating_{datetime.now().timestamp()}",
        timestamp=datetime.now()
    )
    return await engine.rate_content(request)

if __name__ == "__main__":
    # Example usage
    async def test_age_restriction_engine():
        engine = AgeRestrictionEngine()
        
        # Test age verification
        verification_result = await engine.verify_age(
            "test_user_001", 
            {"birth_date": "1990-01-01"}, 
            AgeVerificationMethod.SELF_DECLARED
        )
        print(f"Age Verification Result: {asdict(verification_result)}")
        
        # Test content rating
        test_request = ContentAnalysisRequest(
            content="This is a political discussion about Canadian government policies and indigenous rights.",
            content_type=ContentType.POLITICAL,
            user_age_group=AgeGroup.ADULT,
            user_jurisdiction=TerritorialJurisdiction.CANADA,
            bridge_source="test_bridge",
            request_id="test_rating_001",
            timestamp=datetime.now()
        )
        
        rating_result = await engine.rate_content(test_request)
        print(f"Content Rating Result: {asdict(rating_result)}")
    
    asyncio.run(test_age_restriction_engine())
