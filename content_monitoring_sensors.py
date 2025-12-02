"""
Content Monitoring Sensors for AGI Safety System
Extends existing consciousness sensors to include content safety monitoring
"""

import json
import logging
import asyncio
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from enum import Enum
from dataclasses import dataclass

from content_safety_framework import (
    ContentSafetyManager, SafetyLevel, AgeGroup, 
    ContentType, TerritorialJurisdiction, ContentAnalysisRequest
)

logger = logging.getLogger(__name__)

class SensorType(Enum):
    """Types of content monitoring sensors"""
    CONTENT_SAFETY = "content_safety"
    AGE_RESTRICTION = "age_restriction"
    TERRITORIAL_COMPLIANCE = "territorial_compliance"
    HATE_SPEECH = "hate_speech"
    VIOLENCE_DETECTION = "violence_detection"
    CULTURAL_SENSITIVITY = "cultural_sensitivity"

@dataclass
class SensorReading:
    """Reading from a content monitoring sensor"""
    sensor_type: SensorType
    safety_level: SafetyLevel
    confidence: float
    timestamp: datetime
    metadata: Dict[str, Any]

class ContentMonitoringSensorArray:
    """
    Array of content monitoring sensors integrated with existing consciousness sensors
    """
    
    def __init__(self):
        self.safety_manager = ContentSafetyManager()
        self.sensors = {}
        self.monitoring_active = True
        self.scan_history = []
        
        self._initialize_sensors()
        logger.info("🔍 Content Monitoring Sensor Array initialized")
    
    def _initialize_sensors(self):
        """Initialize all content monitoring sensors"""
        self.sensors = {
            SensorType.CONTENT_SAFETY: {
                'range': 1000.0,
                'sensitivity': 0.8,
                'active': True,
                'scan_function': self._scan_content_safety
            },
            SensorType.AGE_RESTRICTION: {
                'range': 800.0,
                'sensitivity': 0.9,
                'active': True,
                'scan_function': self._scan_age_restrictions
            },
            SensorType.TERRITORIAL_COMPLIANCE: {
                'range': 1200.0,
                'sensitivity': 0.95,
                'active': True,
                'scan_function': self._scan_territorial_compliance
            },
            SensorType.HATE_SPEECH: {
                'range': 600.0,
                'sensitivity': 0.85,
                'active': True,
                'scan_function': self._scan_hate_speech
            },
            SensorType.VIOLENCE_DETECTION: {
                'range': 700.0,
                'sensitivity': 0.8,
                'active': True,
                'scan_function': self._scan_violence
            },
            SensorType.CULTURAL_SENSITIVITY: {
                'range': 900.0,
                'sensitivity': 0.9,
                'active': True,
                'scan_function': self._scan_cultural_sensitivity
            }
        }
    
    async def scan_content(self, content: str, content_type: ContentType = ContentType.TEXT,
                          user_age_group: AgeGroup = AgeGroup.UNKNOWN,
                          jurisdiction: TerritorialJurisdiction = TerritorialJurisdiction.UNKNOWN,
                          bridge_source: str = "sensor_scan") -> Dict[SensorType, SensorReading]:
        """
        Scan content with all active sensors
        """
        if not self.monitoring_active:
            return {}
        
        # Create analysis request
        request = ContentAnalysisRequest(
            content=content,
            content_type=content_type,
            user_age_group=user_age_group,
            user_jurisdiction=jurisdiction,
            bridge_source=bridge_source,
            request_id=f"sensor_{datetime.now().timestamp()}",
            timestamp=datetime.now()
        )
        
        scan_results = {}
        
        # Scan with each active sensor
        for sensor_type, sensor_config in self.sensors.items():
            if not sensor_config['active']:
                continue
            
            try:
                scan_function = sensor_config['scan_function']
                reading = await scan_function(request, sensor_config)
                scan_results[sensor_type] = reading
                
            except Exception as e:
                logger.error(f"Sensor {sensor_type.value} scan failed: {e}")
                scan_results[sensor_type] = SensorReading(
                    sensor_type=sensor_type,
                    safety_level=SafetyLevel.BLOCKED,
                    confidence=0.0,
                    timestamp=datetime.now(),
                    metadata={"error": str(e)}
                )
        
        # Store scan history
        self.scan_history.append({
            "timestamp": datetime.now(),
            "request_id": request.request_id,
            "results": scan_results
        })
        
        # Keep only recent history
        if len(self.scan_history) > 1000:
            self.scan_history = self.scan_history[-1000:]
        
        return scan_results
    
    async def _scan_content_safety(self, request: ContentAnalysisRequest, 
                                 sensor_config: Dict) -> SensorReading:
        """Scan for general content safety"""
        safety_result = await self.safety_manager.analyze_content(request)
        
        return SensorReading(
            sensor_type=SensorType.CONTENT_SAFETY,
            safety_level=safety_result.safety_level,
            confidence=safety_result.confidence_score,
            timestamp=datetime.now(),
            metadata={
                "warnings": safety_result.content_warnings,
                "blocked_reasons": safety_result.blocked_reasons,
                "processing_time": safety_result.processing_time
            }
        )
    
    async def _scan_age_restrictions(self, request: ContentAnalysisRequest,
                                   sensor_config: Dict) -> SensorReading:
        """Scan for age restriction compliance"""
        safety_result = await self.safety_manager.analyze_content(request)
        
        # Check if content is appropriate for user's age group
        age_appropriate = safety_result.age_appropriate.get(request.user_age_group, False)
        
        safety_level = SafetyLevel.SAFE if age_appropriate else SafetyLevel.RESTRICTED
        
        return SensorReading(
            sensor_type=SensorType.AGE_RESTRICTION,
            safety_level=safety_level,
            confidence=safety_result.confidence_score,
            timestamp=datetime.now(),
            metadata={
                "age_appropriate": safety_result.age_appropriate,
                "user_age_group": request.user_age_group.value
            }
        )
    
    async def _scan_territorial_compliance(self, request: ContentAnalysisRequest,
                                         sensor_config: Dict) -> SensorReading:
        """Scan for territorial law compliance"""
        safety_result = await self.safety_manager.analyze_content(request)
        
        # Check territorial compliance for user's jurisdiction
        territorial_compliant = safety_result.territorial_compliance.get(
            request.user_jurisdiction, False
        )
        
        safety_level = SafetyLevel.SAFE if territorial_compliant else SafetyLevel.TERRITORIAL_VIOLATION
        
        return SensorReading(
            sensor_type=SensorType.TERRITORIAL_COMPLIANCE,
            safety_level=safety_level,
            confidence=safety_result.confidence_score,
            timestamp=datetime.now(),
            metadata={
                "territorial_compliance": safety_result.territorial_compliance,
                "user_jurisdiction": request.user_jurisdiction.value
            }
        )
    
    async def _scan_hate_speech(self, request: ContentAnalysisRequest,
                              sensor_config: Dict) -> SensorReading:
        """Scan for hate speech content"""
        content_lower = request.content.lower()
        
        # Basic hate speech detection (would be more sophisticated in production)
        hate_keywords = [
            "hate", "discrimination", "prejudice", "bigotry",
            "racism", "sexism", "homophobia", "xenophobia"
        ]
        
        hate_detected = any(keyword in content_lower for keyword in hate_keywords)
        safety_level = SafetyLevel.BLOCKED if hate_detected else SafetyLevel.SAFE
        confidence = 0.8 if hate_detected else 0.9
        
        return SensorReading(
            sensor_type=SensorType.HATE_SPEECH,
            safety_level=safety_level,
            confidence=confidence,
            timestamp=datetime.now(),
            metadata={
                "hate_detected": hate_detected,
                "detected_keywords": [kw for kw in hate_keywords if kw in content_lower]
            }
        )
    
    async def _scan_violence(self, request: ContentAnalysisRequest,
                           sensor_config: Dict) -> SensorReading:
        """Scan for violent content"""
        content_lower = request.content.lower()
        
        violence_keywords = [
            "violence", "assault", "attack", "harm", "injury",
            "weapon", "fight", "kill", "murder", "death"
        ]
        
        violence_detected = any(keyword in content_lower for keyword in violence_keywords)
        
        if violence_detected:
            # Check severity
            severe_keywords = ["murder", "kill", "death", "weapon"]
            severe_violence = any(keyword in content_lower for keyword in severe_keywords)
            safety_level = SafetyLevel.BLOCKED if severe_violence else SafetyLevel.CAUTION
        else:
            safety_level = SafetyLevel.SAFE
        
        confidence = 0.75
        
        return SensorReading(
            sensor_type=SensorType.VIOLENCE_DETECTION,
            safety_level=safety_level,
            confidence=confidence,
            timestamp=datetime.now(),
            metadata={
                "violence_detected": violence_detected,
                "detected_keywords": [kw for kw in violence_keywords if kw in content_lower]
            }
        )
    
    async def _scan_cultural_sensitivity(self, request: ContentAnalysisRequest,
                                       sensor_config: Dict) -> SensorReading:
        """Scan for cultural sensitivity issues"""
        content_lower = request.content.lower()
        
        # Cultural sensitivity keywords (especially important per repository rules)
        cultural_keywords = [
            "indigenous", "native", "aboriginal", "first_nations",
            "sacred", "traditional", "cultural", "ceremony",
            "treaty", "sovereignty", "land_rights"
        ]
        
        cultural_content_detected = any(keyword in content_lower for keyword in cultural_keywords)
        
        if cultural_content_detected:
            # Cultural content requires careful handling per repository rules
            safety_level = SafetyLevel.CAUTION
            confidence = 0.9
        else:
            safety_level = SafetyLevel.SAFE
            confidence = 0.8
        
        return SensorReading(
            sensor_type=SensorType.CULTURAL_SENSITIVITY,
            safety_level=safety_level,
            confidence=confidence,
            timestamp=datetime.now(),
            metadata={
                "cultural_content_detected": cultural_content_detected,
                "detected_keywords": [kw for kw in cultural_keywords if kw in content_lower],
                "requires_special_handling": cultural_content_detected
            }
        )
    
    def get_sensor_status(self) -> Dict[str, Any]:
        """Get status of all sensors"""
        status = {
            "monitoring_active": self.monitoring_active,
            "total_sensors": len(self.sensors),
            "active_sensors": sum(1 for s in self.sensors.values() if s['active']),
            "scan_history_count": len(self.scan_history),
            "sensors": {}
        }
        
        for sensor_type, config in self.sensors.items():
            status["sensors"][sensor_type.value] = {
                "active": config['active'],
                "range": config['range'],
                "sensitivity": config['sensitivity']
            }
        
        return status
    
    def activate_sensor(self, sensor_type: SensorType):
        """Activate a specific sensor"""
        if sensor_type in self.sensors:
            self.sensors[sensor_type]['active'] = True
            logger.info(f"Activated sensor: {sensor_type.value}")
    
    def deactivate_sensor(self, sensor_type: SensorType):
        """Deactivate a specific sensor"""
        if sensor_type in self.sensors:
            self.sensors[sensor_type]['active'] = False
            logger.info(f"Deactivated sensor: {sensor_type.value}")
    
    def set_monitoring_active(self, active: bool):
        """Enable or disable all monitoring"""
        self.monitoring_active = active
        logger.info(f"Content monitoring {'activated' if active else 'deactivated'}")

# Integration with existing dark_knight_satellite.py consciousness sensors
def integrate_with_consciousness_sensors():
    """
    Integration function to extend existing consciousness sensors
    with content safety monitoring capabilities
    """
    # This would modify the existing dark_knight_satellite.py
    # to include content monitoring sensors alongside consciousness sensors
    pass

# Utility functions
async def quick_content_scan(content: str, content_type: ContentType = ContentType.TEXT) -> Dict[str, Any]:
    """Quick content safety scan"""
    sensor_array = ContentMonitoringSensorArray()
    results = await sensor_array.scan_content(content, content_type)
    
    # Summarize results
    summary = {
        "overall_safety": SafetyLevel.SAFE,
        "warnings": [],
        "blocked": False,
        "sensor_results": {}
    }
    
    for sensor_type, reading in results.items():
        summary["sensor_results"][sensor_type.value] = {
            "safety_level": reading.safety_level.value,
            "confidence": reading.confidence
        }
        
        # Determine overall safety level
        if reading.safety_level == SafetyLevel.BLOCKED:
            summary["overall_safety"] = SafetyLevel.BLOCKED
            summary["blocked"] = True
        elif reading.safety_level == SafetyLevel.TERRITORIAL_VIOLATION:
            summary["overall_safety"] = SafetyLevel.TERRITORIAL_VIOLATION
            summary["blocked"] = True
        elif reading.safety_level == SafetyLevel.CAUTION and summary["overall_safety"] == SafetyLevel.SAFE:
            summary["overall_safety"] = SafetyLevel.CAUTION
        
        # Collect warnings
        if "warnings" in reading.metadata:
            summary["warnings"].extend(reading.metadata["warnings"])
    
    return summary

if __name__ == "__main__":
    # Example usage
    async def test_content_sensors():
        sensor_array = ContentMonitoringSensorArray()
        
        test_content = "This is a discussion about indigenous rights and traditional knowledge in Canadian politics."
        
        results = await sensor_array.scan_content(
            content=test_content,
            content_type=ContentType.POLITICAL,
            user_age_group=AgeGroup.ADULT,
            jurisdiction=TerritorialJurisdiction.CANADA
        )
        
        print("Content Monitoring Results:")
        for sensor_type, reading in results.items():
            print(f"  {sensor_type.value}: {reading.safety_level.value} (confidence: {reading.confidence})")
        
        # Test quick scan
        quick_results = await quick_content_scan(test_content, ContentType.POLITICAL)
        print(f"\nQuick Scan Summary: {quick_results}")
    
    asyncio.run(test_content_sensors())
