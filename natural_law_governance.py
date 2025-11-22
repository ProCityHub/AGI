#!/usr/bin/env python3
"""
Natural Law Governance Framework
Implements fundamental natural law principles for citizen-first governance
Ensures territorial sovereignty and citizen rights precedence
"""

import json
import logging
from typing import Dict, List, Optional, Tuple, Any
from enum import Enum
from dataclasses import dataclass
from datetime import datetime
import hashlib

class CitizenshipStatus(Enum):
    """Defines citizenship status hierarchy according to natural law"""
    NATURAL_BORN_CITIZEN = "natural_born_citizen"
    NATURALIZED_CITIZEN = "naturalized_citizen"
    PERMANENT_RESIDENT = "permanent_resident"
    TEMPORARY_RESIDENT = "temporary_resident"
    VISITOR = "visitor"
    ILLEGAL_IMMIGRANT = "illegal_immigrant"

class TerritorialJurisdiction(Enum):
    """Defines territorial jurisdiction levels"""
    SOVEREIGN_NATION = "sovereign_nation"
    PROVINCE_STATE = "province_state"
    MUNICIPALITY = "municipality"
    TRIBAL_TERRITORY = "tribal_territory"

@dataclass
class NaturalLawPrinciple:
    """Core natural law principle definition"""
    principle_id: str
    name: str
    description: str
    priority: int  # 1 = highest priority
    territorial_scope: TerritorialJurisdiction
    citizen_rights: List[str]
    immigrant_restrictions: List[str]
    enforcement_mechanism: str

@dataclass
class CitizenProfile:
    """Citizen profile with natural law status"""
    citizen_id: str
    citizenship_status: CitizenshipStatus
    birth_territory: str
    naturalization_date: Optional[datetime]
    territorial_jurisdiction: TerritorialJurisdiction
    rights_level: int  # 1-10, citizens always > immigrants
    verified: bool

class NaturalLawGovernance:
    """
    Core Natural Law Governance System
    Implements citizen-first principles and territorial sovereignty
    """
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.principles = self._initialize_natural_law_principles()
        self.citizen_registry = {}
        self.territorial_laws = {}
        self.treaties = {}
        
    def _initialize_natural_law_principles(self) -> Dict[str, NaturalLawPrinciple]:
        """Initialize fundamental natural law principles"""
        principles = {
            "citizen_supremacy": NaturalLawPrinciple(
                principle_id="NL001",
                name="Citizen Rights Supremacy",
                description="Natural born and naturalized citizens have absolute precedence over non-citizens in all territorial matters",
                priority=1,
                territorial_scope=TerritorialJurisdiction.SOVEREIGN_NATION,
                citizen_rights=[
                    "voting_rights",
                    "property_ownership",
                    "employment_priority",
                    "social_services_access",
                    "legal_representation",
                    "territorial_protection"
                ],
                immigrant_restrictions=[
                    "no_voting_rights",
                    "limited_property_rights",
                    "employment_secondary_to_citizens",
                    "conditional_social_services",
                    "deportation_subject_to_law"
                ],
                enforcement_mechanism="constitutional_law"
            ),
            
            "territorial_sovereignty": NaturalLawPrinciple(
                principle_id="NL002",
                name="Territorial Sovereignty",
                description="Each sovereign territory has absolute right to control immigration and protect citizen interests",
                priority=2,
                territorial_scope=TerritorialJurisdiction.SOVEREIGN_NATION,
                citizen_rights=[
                    "border_control_voice",
                    "immigration_policy_input",
                    "cultural_preservation",
                    "resource_protection"
                ],
                immigrant_restrictions=[
                    "subject_to_immigration_law",
                    "no_policy_voting_rights",
                    "cultural_assimilation_required",
                    "limited_resource_access"
                ],
                enforcement_mechanism="immigration_law"
            ),
            
            "infrastructure_priority": NaturalLawPrinciple(
                principle_id="NL003",
                name="Infrastructure Before Immigration",
                description="Territorial infrastructure must serve citizens first before accommodating immigrants",
                priority=3,
                territorial_scope=TerritorialJurisdiction.SOVEREIGN_NATION,
                citizen_rights=[
                    "infrastructure_priority_access",
                    "service_quality_guarantee",
                    "capacity_protection"
                ],
                immigrant_restrictions=[
                    "secondary_infrastructure_access",
                    "conditional_service_availability",
                    "no_capacity_guarantee"
                ],
                enforcement_mechanism="resource_allocation_law"
            ),
            
            "legal_precedence": NaturalLawPrinciple(
                principle_id="NL004",
                name="Citizen Legal Precedence",
                description="Citizens have legal precedence in all territorial disputes and resource allocation",
                priority=4,
                territorial_scope=TerritorialJurisdiction.SOVEREIGN_NATION,
                citizen_rights=[
                    "legal_system_priority",
                    "court_access_guarantee",
                    "constitutional_protection"
                ],
                immigrant_restrictions=[
                    "limited_legal_standing",
                    "conditional_court_access",
                    "subject_to_deportation"
                ],
                enforcement_mechanism="judicial_system"
            )
        }
        
        return principles
    
    def register_citizen(self, citizen_data: Dict[str, Any]) -> CitizenProfile:
        """Register a citizen in the natural law governance system"""
        citizen_profile = CitizenProfile(
            citizen_id=citizen_data.get('citizen_id'),
            citizenship_status=CitizenshipStatus(citizen_data.get('citizenship_status')),
            birth_territory=citizen_data.get('birth_territory'),
            naturalization_date=citizen_data.get('naturalization_date'),
            territorial_jurisdiction=TerritorialJurisdiction(citizen_data.get('territorial_jurisdiction')),
            rights_level=self._calculate_rights_level(citizen_data.get('citizenship_status')),
            verified=True
        )
        
        self.citizen_registry[citizen_profile.citizen_id] = citizen_profile
        self.logger.info(f"Registered citizen {citizen_profile.citizen_id} with status {citizen_profile.citizenship_status}")
        
        return citizen_profile
    
    def _calculate_rights_level(self, citizenship_status: str) -> int:
        """Calculate rights level based on citizenship status"""
        rights_mapping = {
            CitizenshipStatus.NATURAL_BORN_CITIZEN.value: 10,
            CitizenshipStatus.NATURALIZED_CITIZEN.value: 9,
            CitizenshipStatus.PERMANENT_RESIDENT.value: 6,
            CitizenshipStatus.TEMPORARY_RESIDENT.value: 4,
            CitizenshipStatus.VISITOR.value: 2,
            CitizenshipStatus.ILLEGAL_IMMIGRANT.value: 1
        }
        
        return rights_mapping.get(citizenship_status, 1)
    
    def evaluate_rights_conflict(self, citizen_id: str, immigrant_id: str, resource_type: str) -> Dict[str, Any]:
        """
        Evaluate rights conflict between citizen and immigrant
        Citizens ALWAYS have precedence according to natural law
        """
        citizen = self.citizen_registry.get(citizen_id)
        immigrant = self.citizen_registry.get(immigrant_id)
        
        if not citizen or not immigrant:
            return {"error": "Invalid citizen or immigrant ID"}
        
        # Natural law: Citizens always have precedence
        if citizen.rights_level >= 8:  # Citizens (natural born or naturalized)
            decision = "citizen_precedence"
            rationale = f"Natural law principle: Citizens have absolute precedence over non-citizens in territorial matters"
        else:
            decision = "evaluate_by_rights_level"
            rationale = f"Both parties are non-citizens, evaluate by rights level"
        
        return {
            "decision": decision,
            "citizen_rights_level": citizen.rights_level,
            "immigrant_rights_level": immigrant.rights_level,
            "rationale": rationale,
            "applicable_principles": ["citizen_supremacy", "territorial_sovereignty"],
            "timestamp": datetime.now().isoformat()
        }
    
    def validate_territorial_law(self, territory: str, proposed_law: Dict[str, Any]) -> Dict[str, Any]:
        """
        Validate proposed law against natural law principles
        Ensures citizen rights are not compromised
        """
        violations = []
        
        # Check if law violates citizen supremacy
        if proposed_law.get('affects_citizen_rights'):
            if proposed_law.get('reduces_citizen_priority'):
                violations.append({
                    "principle": "citizen_supremacy",
                    "violation": "Law reduces citizen priority in favor of non-citizens",
                    "severity": "critical"
                })
        
        # Check territorial sovereignty
        if proposed_law.get('immigration_related'):
            if not proposed_law.get('citizen_input_required'):
                violations.append({
                    "principle": "territorial_sovereignty",
                    "violation": "Immigration law proposed without citizen input requirement",
                    "severity": "high"
                })
        
        # Check infrastructure priority
        if proposed_law.get('infrastructure_allocation'):
            if proposed_law.get('immigrant_priority_over_citizens'):
                violations.append({
                    "principle": "infrastructure_priority",
                    "violation": "Infrastructure allocation prioritizes immigrants over citizens",
                    "severity": "critical"
                })
        
        return {
            "valid": len(violations) == 0,
            "violations": violations,
            "recommendations": self._generate_law_recommendations(violations),
            "territory": territory,
            "evaluation_timestamp": datetime.now().isoformat()
        }
    
    def _generate_law_recommendations(self, violations: List[Dict[str, Any]]) -> List[str]:
        """Generate recommendations to fix law violations"""
        recommendations = []
        
        for violation in violations:
            if violation['principle'] == 'citizen_supremacy':
                recommendations.append("Ensure citizen rights and priorities are explicitly protected and maintained")
            elif violation['principle'] == 'territorial_sovereignty':
                recommendations.append("Require citizen input and approval for all immigration-related policies")
            elif violation['principle'] == 'infrastructure_priority':
                recommendations.append("Guarantee infrastructure serves citizens first before accommodating immigrants")
        
        return recommendations
    
    def generate_governance_report(self, territory: str) -> Dict[str, Any]:
        """Generate comprehensive natural law governance report"""
        citizen_count = len([c for c in self.citizen_registry.values() 
                           if c.citizenship_status in [CitizenshipStatus.NATURAL_BORN_CITIZEN, 
                                                     CitizenshipStatus.NATURALIZED_CITIZEN]])
        
        immigrant_count = len([c for c in self.citizen_registry.values() 
                             if c.citizenship_status not in [CitizenshipStatus.NATURAL_BORN_CITIZEN, 
                                                           CitizenshipStatus.NATURALIZED_CITIZEN]])
        
        return {
            "territory": territory,
            "natural_law_compliance": "ENFORCED",
            "citizen_count": citizen_count,
            "immigrant_count": immigrant_count,
            "citizen_to_immigrant_ratio": f"{citizen_count}:{immigrant_count}" if immigrant_count > 0 else f"{citizen_count}:0",
            "active_principles": list(self.principles.keys()),
            "rights_hierarchy": {
                "1_highest": "Natural Born Citizens",
                "2_high": "Naturalized Citizens", 
                "3_medium": "Permanent Residents",
                "4_low": "Temporary Residents",
                "5_minimal": "Visitors",
                "6_restricted": "Illegal Immigrants"
            },
            "enforcement_status": "ACTIVE",
            "report_timestamp": datetime.now().isoformat()
        }

def main():
    """Main function to demonstrate natural law governance"""
    governance = NaturalLawGovernance()
    
    # Example usage
    print("🏛️ Natural Law Governance System Initialized")
    print("📋 Fundamental Principles:")
    for principle_id, principle in governance.principles.items():
        print(f"  {principle.principle_id}: {principle.name}")
    
    print("\n✅ System ready to enforce natural law and citizen rights precedence")

if __name__ == "__main__":
    main()
