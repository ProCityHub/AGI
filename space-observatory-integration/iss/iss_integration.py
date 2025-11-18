"""
International Space Station (ISS) Integration Module
Real-time ISS tracking, crew monitoring, and experiment management
"""

import os
import json
import asyncio
import logging
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
import requests
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class CrewMember:
    """ISS crew member information"""
    name: str
    nationality: str
    mission: str
    launch_date: datetime
    planned_return: datetime
    role: str
    experience_level: str

@dataclass
class ISSExperiment:
    """ISS scientific experiment"""
    experiment_id: str
    title: str
    principal_investigator: str
    category: str
    status: str
    start_date: datetime
    duration_days: int
    description: str
    results: Optional[Dict] = None

@dataclass
class ISSModule:
    """ISS module information"""
    name: str
    country: str
    launch_date: datetime
    mass_kg: float
    volume_m3: float
    purpose: str
    status: str

class ISSIntegration:
    """
    Comprehensive ISS integration for real-time monitoring and analysis
    """
    
    def __init__(self, nasa_api_key: Optional[str] = None):
        """Initialize ISS integration"""
        self.nasa_api_key = nasa_api_key or os.getenv("NASA_API_KEY")
        self.base_url = "http://api.open-notify.org"
        self.nasa_api_url = "https://api.nasa.gov"
        
        # ISS orbital parameters
        self.orbital_period = 92.68  # minutes
        self.altitude_km = 408  # approximate
        self.inclination = 51.6  # degrees
        
        logger.info("ISS Integration initialized")
    
    def get_current_position(self) -> Dict:
        """Get current ISS position and orbital data"""
        try:
            response = requests.get(f"{self.base_url}/iss-now.json", timeout=10)
            data = response.json()
            
            if data['message'] == 'success':
                position = data['iss_position']
                timestamp = datetime.fromtimestamp(data['timestamp'])
                
                # Calculate additional orbital parameters
                orbital_velocity = self._calculate_orbital_velocity()
                next_sunrise, next_sunset = self._calculate_day_night_cycle(
                    float(position['latitude']), 
                    float(position['longitude'])
                )
                
                return {
                    'latitude': float(position['latitude']),
                    'longitude': float(position['longitude']),
                    'altitude_km': self.altitude_km,
                    'timestamp': timestamp.isoformat(),
                    'orbital_velocity_kmh': orbital_velocity,
                    'next_sunrise': next_sunrise.isoformat() if next_sunrise else None,
                    'next_sunset': next_sunset.isoformat() if next_sunset else None,
                    'orbital_period_minutes': self.orbital_period,
                    'ground_track_speed_kmh': orbital_velocity * np.cos(np.radians(self.inclination))
                }
            else:
                raise Exception(f"ISS API error: {data.get('message', 'Unknown error')}")
        
        except Exception as e:
            logger.error(f"Error getting ISS position: {e}")
            return self._get_fallback_position()
    
    def _calculate_orbital_velocity(self) -> float:
        """Calculate ISS orbital velocity"""
        # Using simplified orbital mechanics
        earth_radius_km = 6371
        gravitational_parameter = 398600.4418  # km³/s²
        
        orbital_radius = earth_radius_km + self.altitude_km
        velocity_ms = np.sqrt(gravitational_parameter * 1000 / (orbital_radius * 1000))
        velocity_kmh = velocity_ms * 3.6
        
        return round(velocity_kmh, 2)
    
    def _calculate_day_night_cycle(self, lat: float, lon: float) -> Tuple[Optional[datetime], Optional[datetime]]:
        """Calculate next sunrise/sunset times for ISS"""
        # Simplified calculation - real implementation would use orbital mechanics
        now = datetime.now()
        
        # ISS experiences ~16 sunrises/sunsets per day
        cycle_duration = self.orbital_period / 16  # minutes per day/night cycle
        
        next_sunrise = now + timedelta(minutes=cycle_duration / 2)
        next_sunset = now + timedelta(minutes=cycle_duration)
        
        return next_sunrise, next_sunset
    
    def _get_fallback_position(self) -> Dict:
        """Return fallback position data when API is unavailable"""
        return {
            'latitude': 0.0,
            'longitude': 0.0,
            'altitude_km': self.altitude_km,
            'timestamp': datetime.now().isoformat(),
            'orbital_velocity_kmh': 27600,
            'next_sunrise': None,
            'next_sunset': None,
            'orbital_period_minutes': self.orbital_period,
            'ground_track_speed_kmh': 24000,
            'status': 'fallback_data'
        }
    
    def predict_passes(self, latitude: float, longitude: float, 
                      altitude: float = 0, days: int = 7) -> List[Dict]:
        """Predict ISS passes over a location"""
        try:
            url = f"{self.base_url}/iss-pass.json"
            params = {
                'lat': latitude,
                'lon': longitude,
                'alt': altitude,
                'n': min(10, days * 2)  # Approximate passes per day
            }
            
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            if data['message'] == 'success':
                passes = []
                for pass_info in data['response']:
                    rise_time = datetime.fromtimestamp(pass_info['risetime'])
                    
                    # Calculate additional pass information
                    max_elevation = self._estimate_max_elevation(
                        latitude, longitude, rise_time
                    )
                    
                    visibility = self._determine_visibility(rise_time, max_elevation)
                    
                    passes.append({
                        'rise_time': rise_time.isoformat(),
                        'duration_seconds': pass_info['duration'],
                        'max_elevation_degrees': max_elevation,
                        'visibility': visibility,
                        'direction': self._calculate_pass_direction(latitude, longitude),
                        'magnitude': self._estimate_brightness(max_elevation)
                    })
                
                return passes
            else:
                raise Exception(f"ISS Pass API error: {data.get('message', 'Unknown error')}")
        
        except Exception as e:
            logger.error(f"Error predicting ISS passes: {e}")
            return []
    
    def _estimate_max_elevation(self, lat: float, lon: float, pass_time: datetime) -> float:
        """Estimate maximum elevation for a pass"""
        # Simplified estimation based on latitude difference
        iss_lat_range = 51.6  # ISS orbital inclination
        lat_diff = abs(lat) - iss_lat_range
        
        if lat_diff <= 0:
            return np.random.uniform(30, 90)  # High pass
        else:
            return max(10, 90 - lat_diff * 2)  # Lower pass for higher latitudes
    
    def _determine_visibility(self, pass_time: datetime, elevation: float) -> str:
        """Determine visibility conditions for a pass"""
        hour = pass_time.hour
        
        if elevation > 60:
            visibility = "excellent"
        elif elevation > 30:
            visibility = "good"
        elif elevation > 15:
            visibility = "fair"
        else:
            visibility = "poor"
        
        # Adjust for time of day
        if 6 <= hour <= 18:
            visibility += "_daylight"
        else:
            visibility += "_dark"
        
        return visibility
    
    def _calculate_pass_direction(self, lat: float, lon: float) -> str:
        """Calculate general direction of ISS pass"""
        # Simplified direction calculation
        if lat > 0:  # Northern hemisphere
            return "SW to NE" if np.random.random() > 0.5 else "NW to SE"
        else:  # Southern hemisphere
            return "NW to SE" if np.random.random() > 0.5 else "SW to NE"
    
    def _estimate_brightness(self, elevation: float) -> float:
        """Estimate ISS brightness magnitude"""
        # ISS magnitude ranges from about -4 to +1
        base_magnitude = -2.0
        elevation_factor = (90 - elevation) / 90 * 3  # Dimmer at lower elevations
        return round(base_magnitude + elevation_factor, 1)
    
    def get_current_crew(self) -> List[CrewMember]:
        """Get current ISS crew information"""
        try:
            # This would connect to NASA APIs for real crew data
            # For now, return mock crew data
            current_crew = [
                CrewMember(
                    name="Andreas Mogensen",
                    nationality="Denmark/ESA",
                    mission="Expedition 70",
                    launch_date=datetime(2023, 8, 26),
                    planned_return=datetime(2024, 3, 15),
                    role="Commander",
                    experience_level="Experienced"
                ),
                CrewMember(
                    name="Satoshi Furukawa",
                    nationality="Japan/JAXA",
                    mission="Expedition 70",
                    launch_date=datetime(2023, 8, 26),
                    planned_return=datetime(2024, 3, 15),
                    role="Flight Engineer",
                    experience_level="Experienced"
                ),
                CrewMember(
                    name="Konstantin Borisov",
                    nationality="Russia/Roscosmos",
                    mission="Expedition 70",
                    launch_date=datetime(2023, 9, 15),
                    planned_return=datetime(2024, 4, 1),
                    role="Flight Engineer",
                    experience_level="Rookie"
                )
            ]
            
            return current_crew
        
        except Exception as e:
            logger.error(f"Error getting crew information: {e}")
            return []
    
    def get_active_experiments(self) -> List[ISSExperiment]:
        """Get currently active ISS experiments"""
        try:
            # Mock experiment data - real implementation would query NASA databases
            experiments = [
                ISSExperiment(
                    experiment_id="ISS-70-001",
                    title="Protein Crystal Growth in Microgravity",
                    principal_investigator="Dr. Sarah Chen",
                    category="Life Sciences",
                    status="Active",
                    start_date=datetime(2024, 1, 15),
                    duration_days=90,
                    description="Study protein crystallization in microgravity for drug development"
                ),
                ISSExperiment(
                    experiment_id="ISS-70-002",
                    title="Advanced Plant Habitat Growth Study",
                    principal_investigator="Dr. Michael Rodriguez",
                    category="Botany",
                    status="Active",
                    start_date=datetime(2024, 2, 1),
                    duration_days=120,
                    description="Growing vegetables in space for long-duration missions"
                ),
                ISSExperiment(
                    experiment_id="ISS-70-003",
                    title="Metal Alloy Solidification",
                    principal_investigator="Dr. Elena Petrov",
                    category="Materials Science",
                    status="Completed",
                    start_date=datetime(2023, 12, 1),
                    duration_days=60,
                    description="Study metal alloy formation in microgravity conditions",
                    results={
                        "samples_processed": 24,
                        "success_rate": 0.92,
                        "key_findings": "Improved crystal structure in microgravity"
                    }
                )
            ]
            
            return experiments
        
        except Exception as e:
            logger.error(f"Error getting experiment data: {e}")
            return []
    
    def monitor_crew_health(self, crew_member: str) -> Dict:
        """Monitor crew member health metrics"""
        try:
            # Mock health monitoring data
            health_metrics = {
                'crew_member': crew_member,
                'timestamp': datetime.now().isoformat(),
                'vital_signs': {
                    'heart_rate_bpm': np.random.randint(60, 90),
                    'blood_pressure_systolic': np.random.randint(110, 140),
                    'blood_pressure_diastolic': np.random.randint(70, 90),
                    'oxygen_saturation': np.random.uniform(95, 100),
                    'body_temperature_c': np.random.uniform(36.1, 37.2)
                },
                'exercise_data': {
                    'daily_exercise_minutes': np.random.randint(120, 180),
                    'resistance_training': True,
                    'cardiovascular_training': True,
                    'bone_density_maintenance': True
                },
                'psychological_metrics': {
                    'stress_level': np.random.uniform(0.2, 0.7),
                    'sleep_quality': np.random.uniform(0.6, 0.9),
                    'mood_rating': np.random.uniform(0.7, 0.95),
                    'cognitive_performance': np.random.uniform(0.8, 0.98)
                },
                'environmental_exposure': {
                    'radiation_dose_daily_msv': np.random.uniform(0.5, 1.5),
                    'co2_levels_ppm': np.random.randint(400, 800),
                    'cabin_pressure_kpa': np.random.uniform(101.0, 101.5),
                    'humidity_percent': np.random.uniform(40, 60)
                },
                'health_status': 'nominal'
            }
            
            # Determine overall health status
            if health_metrics['vital_signs']['heart_rate_bpm'] > 100:
                health_metrics['health_status'] = 'elevated_heart_rate'
            elif health_metrics['psychological_metrics']['stress_level'] > 0.8:
                health_metrics['health_status'] = 'elevated_stress'
            elif health_metrics['environmental_exposure']['radiation_dose_daily_msv'] > 2.0:
                health_metrics['health_status'] = 'radiation_concern'
            
            return health_metrics
        
        except Exception as e:
            logger.error(f"Error monitoring crew health: {e}")
            return {'error': str(e)}
    
    def get_iss_modules(self) -> List[ISSModule]:
        """Get information about ISS modules"""
        modules = [
            ISSModule(
                name="Zarya (FGB)",
                country="Russia",
                launch_date=datetime(1998, 11, 20),
                mass_kg=19323,
                volume_m3=71.5,
                purpose="Control and Power",
                status="Active"
            ),
            ISSModule(
                name="Unity (Node 1)",
                country="USA",
                launch_date=datetime(1998, 12, 4),
                mass_kg=11612,
                volume_m3=106,
                purpose="Connecting Hub",
                status="Active"
            ),
            ISSModule(
                name="Destiny Laboratory",
                country="USA",
                launch_date=datetime(2001, 2, 7),
                mass_kg=14515,
                volume_m3=106,
                purpose="Research Laboratory",
                status="Active"
            ),
            ISSModule(
                name="Columbus Laboratory",
                country="Europe/ESA",
                launch_date=datetime(2008, 2, 7),
                mass_kg=12775,
                volume_m3=75,
                purpose="Research Laboratory",
                status="Active"
            ),
            ISSModule(
                name="Kibo Laboratory",
                country="Japan/JAXA",
                launch_date=datetime(2008, 3, 11),
                mass_kg=32000,
                volume_m3=150,
                purpose="Research Laboratory",
                status="Active"
            )
        ]
        
        return modules
    
    def analyze_experiment_data(self, experiment_id: str) -> Dict:
        """Analyze ISS experiment data with AI"""
        try:
            # Mock AI analysis of experiment data
            analysis = {
                'experiment_id': experiment_id,
                'analysis_timestamp': datetime.now().isoformat(),
                'data_quality': np.random.uniform(0.8, 0.98),
                'progress_percentage': np.random.uniform(0.3, 0.95),
                'anomalies_detected': np.random.randint(0, 3),
                'key_insights': [],
                'recommendations': [],
                'statistical_significance': np.random.uniform(0.85, 0.99)
            }
            
            # Generate insights based on experiment type
            if "protein" in experiment_id.lower():
                analysis['key_insights'] = [
                    "Crystal formation 23% more uniform in microgravity",
                    "Reduced defect density observed",
                    "Optimal temperature range identified: 18-22°C"
                ]
                analysis['recommendations'] = [
                    "Extend crystallization time by 15%",
                    "Adjust buffer pH to 7.2",
                    "Increase sample concentration by 10%"
                ]
            
            elif "plant" in experiment_id.lower():
                analysis['key_insights'] = [
                    "Root growth patterns differ significantly from Earth",
                    "Phototropism response enhanced in microgravity",
                    "Water uptake efficiency increased by 18%"
                ]
                analysis['recommendations'] = [
                    "Adjust LED light spectrum",
                    "Modify watering schedule",
                    "Monitor CO2 levels more frequently"
                ]
            
            elif "metal" in experiment_id.lower():
                analysis['key_insights'] = [
                    "Grain structure more homogeneous",
                    "Reduced segregation effects",
                    "Improved mechanical properties predicted"
                ]
                analysis['recommendations'] = [
                    "Test additional alloy compositions",
                    "Vary cooling rates",
                    "Analyze microstructure in detail"
                ]
            
            return analysis
        
        except Exception as e:
            logger.error(f"Error analyzing experiment data: {e}")
            return {'error': str(e)}
    
    def create_mission_timeline(self, days: int = 30) -> Dict:
        """Create ISS mission timeline with key events"""
        try:
            timeline = {
                'timeline_start': datetime.now().isoformat(),
                'timeline_duration_days': days,
                'events': []
            }
            
            # Generate timeline events
            current_date = datetime.now()
            
            for day in range(days):
                event_date = current_date + timedelta(days=day)
                
                # Add regular events
                if day % 7 == 0:  # Weekly events
                    timeline['events'].append({
                        'date': event_date.isoformat(),
                        'type': 'crew_conference',
                        'description': 'Weekly crew conference with ground',
                        'duration_minutes': 60,
                        'priority': 'medium'
                    })
                
                if day % 3 == 0:  # Every 3 days
                    timeline['events'].append({
                        'date': event_date.isoformat(),
                        'type': 'experiment_maintenance',
                        'description': 'Routine experiment maintenance and data collection',
                        'duration_minutes': 120,
                        'priority': 'high'
                    })
                
                # Add random special events
                if np.random.random() < 0.1:  # 10% chance per day
                    event_types = [
                        'spacewalk_preparation',
                        'cargo_vehicle_arrival',
                        'educational_event',
                        'emergency_drill',
                        'equipment_repair'
                    ]
                    
                    event_type = np.random.choice(event_types)
                    timeline['events'].append({
                        'date': event_date.isoformat(),
                        'type': event_type,
                        'description': f'Scheduled {event_type.replace("_", " ")}',
                        'duration_minutes': np.random.randint(60, 300),
                        'priority': 'high' if 'emergency' in event_type else 'medium'
                    })
            
            return timeline
        
        except Exception as e:
            logger.error(f"Error creating mission timeline: {e}")
            return {'error': str(e)}

# Convenience functions
def get_iss_location() -> Dict:
    """Quick ISS location lookup"""
    iss = ISSIntegration()
    return iss.get_current_position()

def predict_iss_visibility(lat: float, lon: float) -> List[Dict]:
    """Quick ISS visibility prediction"""
    iss = ISSIntegration()
    return iss.predict_passes(lat, lon)

def get_space_station_status() -> Dict:
    """Get comprehensive ISS status"""
    iss = ISSIntegration()
    
    return {
        'position': iss.get_current_position(),
        'crew': iss.get_current_crew(),
        'experiments': iss.get_active_experiments(),
        'modules': iss.get_iss_modules(),
        'timestamp': datetime.now().isoformat()
    }

# Example usage
if __name__ == "__main__":
    async def main():
        # Initialize ISS integration
        iss = ISSIntegration()
        
        # Get current position
        print("🛰️ Current ISS Position:")
        position = iss.get_current_position()
        print(f"  Location: {position['latitude']:.2f}°, {position['longitude']:.2f}°")
        print(f"  Altitude: {position['altitude_km']} km")
        print(f"  Velocity: {position['orbital_velocity_kmh']} km/h")
        
        # Predict passes
        print("\n🌍 ISS Passes over New York:")
        passes = iss.predict_passes(40.7128, -74.0060)
        for i, pass_info in enumerate(passes[:3]):
            print(f"  {i+1}. {pass_info['rise_time']}")
            print(f"     Duration: {pass_info['duration_seconds']}s, Max elevation: {pass_info['max_elevation_degrees']}°")
        
        # Get crew information
        print("\n👨‍🚀 Current ISS Crew:")
        crew = iss.get_current_crew()
        for member in crew:
            print(f"  - {member.name} ({member.nationality}) - {member.role}")
        
        # Get active experiments
        print("\n🔬 Active Experiments:")
        experiments = iss.get_active_experiments()
        for exp in experiments:
            print(f"  - {exp.title} ({exp.status})")
            print(f"    PI: {exp.principal_investigator}")
        
        # Monitor crew health
        print("\n💓 Crew Health Monitoring:")
        if crew:
            health = iss.monitor_crew_health(crew[0].name)
            vitals = health['vital_signs']
            print(f"  {crew[0].name}:")
            print(f"    Heart Rate: {vitals['heart_rate_bpm']} bpm")
            print(f"    Status: {health['health_status']}")
        
        # Create mission timeline
        print("\n📅 Mission Timeline (next 7 days):")
        timeline = iss.create_mission_timeline(7)
        for event in timeline['events'][:5]:
            print(f"  - {event['date'][:10]}: {event['description']}")
        
        print("\n🌟 ISS Integration Demo Complete!")
    
    asyncio.run(main())
