#!/usr/bin/env python3
"""
Space Exploration Demo
Comprehensive demonstration of space observatory and ISS integration
"""

import asyncio
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List

# Import our space integration modules
from ..core.space_observatory_client import SpaceObservatoryClient, Observatory
from ..iss.iss_integration import ISSIntegration

class SpaceExplorationDemo:
    """
    Comprehensive demo of space observatory and ISS integration capabilities
    """
    
    def __init__(self):
        # Initialize space observatory client
        self.space_client = SpaceObservatoryClient()
        
        # Initialize ISS integration
        self.iss_client = ISSIntegration()
        
        print("🚀 Space Exploration Demo initialized!")
    
    async def demonstrate_jwst_capabilities(self):
        """Demonstrate JWST observation capabilities"""
        print("\n" + "="*60)
        print("🔭 JAMES WEBB SPACE TELESCOPE DEMONSTRATION")
        print("="*60)
        
        # Search for JWST observations
        print("🔍 Searching for JWST observations of famous targets...")
        
        targets = ["M31", "NGC 1365", "WASP-96b", "TRAPPIST-1"]
        all_observations = []
        
        for target in targets:
            print(f"\n📡 Searching for {target} observations...")
            observations = self.space_client.search_observations(
                target, Observatory.JWST, max_results=3
            )
            
            if observations:
                print(f"  ✅ Found {len(observations)} observations")
                for obs in observations:
                    print(f"    - {obs.obs_id}: {obs.instrument} ({obs.observation_date.strftime('%Y-%m-%d')})")
                all_observations.extend(observations)
            else:
                print(f"  ❌ No observations found for {target}")
        
        # Process a mock JWST observation
        if all_observations:
            print(f"\n🔬 Processing JWST observation: {all_observations[0].obs_id}")
            
            # Demonstrate different analysis types
            analysis_types = ["spectroscopy", "photometry", "exoplanet_transit"]
            
            for analysis_type in analysis_types:
                print(f"\n  📊 Running {analysis_type} analysis...")
                analysis = self.space_client.process_jwst_observation(
                    all_observations[0].obs_id, analysis_type
                )
                
                if 'results' in analysis:
                    results = analysis['results']
                    print(f"    ✅ Analysis complete (confidence: {results.get('confidence', 0.9):.2f})")
                    
                    if analysis_type == "exoplanet_transit" and results.get('transit_detected'):
                        print(f"    🪐 Planet detected! Radius: {results.get('planet_radius', 0):.2f} Earth radii")
                        print(f"    🔄 Orbital period: {results.get('orbital_period', 0):.1f} days")
                    
                    elif analysis_type == "spectroscopy":
                        lines = results.get('spectral_lines_detected', [])
                        print(f"    🌈 Spectral lines detected: {', '.join(lines[:3])}")
                        print(f"    🌌 Redshift: {results.get('redshift', 0):.3f}")
    
    async def demonstrate_iss_integration(self):
        """Demonstrate ISS integration capabilities"""
        print("\n" + "="*60)
        print("🛰️ INTERNATIONAL SPACE STATION DEMONSTRATION")
        print("="*60)
        
        # Get current ISS position
        print("📍 Getting current ISS position...")
        position = self.iss_client.get_current_position()
        
        print(f"  🌍 Location: {position['latitude']:.2f}°, {position['longitude']:.2f}°")
        print(f"  ⬆️ Altitude: {position['altitude_km']} km")
        print(f"  🚀 Velocity: {position['orbital_velocity_kmh']:,} km/h")
        print(f"  ⏰ Orbital period: {position['orbital_period_minutes']:.1f} minutes")
        
        if position.get('next_sunrise'):
            sunrise = datetime.fromisoformat(position['next_sunrise'])
            print(f"  🌅 Next sunrise: {sunrise.strftime('%H:%M:%S')}")
        
        # Predict ISS passes over major cities
        print("\n🌍 Predicting ISS passes over major cities...")
        
        cities = [
            ("New York", 40.7128, -74.0060),
            ("London", 51.5074, -0.1278),
            ("Tokyo", 35.6762, 139.6503),
            ("Sydney", -33.8688, 151.2093)
        ]
        
        for city_name, lat, lon in cities:
            print(f"\n  📍 {city_name} ({lat:.1f}°, {lon:.1f}°):")
            passes = self.iss_client.predict_passes(lat, lon, days=3)
            
            if passes:
                for i, pass_info in enumerate(passes[:2]):
                    rise_time = datetime.fromisoformat(pass_info['rise_time'])
                    print(f"    {i+1}. {rise_time.strftime('%Y-%m-%d %H:%M')} - "
                          f"{pass_info['duration_seconds']}s, "
                          f"max elevation: {pass_info['max_elevation_degrees']:.0f}°, "
                          f"visibility: {pass_info['visibility']}")
            else:
                print("    ❌ No passes predicted")
        
        # Get crew information
        print("\n👨‍🚀 Current ISS crew:")
        crew = self.iss_client.get_current_crew()
        
        for member in crew:
            print(f"  - {member.name} ({member.nationality})")
            print(f"    Role: {member.role}, Experience: {member.experience_level}")
            print(f"    Mission: {member.mission}")
            
            # Monitor crew health
            health = self.iss_client.monitor_crew_health(member.name)
            vitals = health['vital_signs']
            print(f"    💓 Health: {vitals['heart_rate_bpm']} bpm, Status: {health['health_status']}")
        
        # Get active experiments
        print("\n🔬 Active ISS experiments:")
        experiments = self.iss_client.get_active_experiments()
        
        for exp in experiments:
            print(f"  - {exp.title}")
            print(f"    PI: {exp.principal_investigator}, Category: {exp.category}")
            print(f"    Status: {exp.status}, Duration: {exp.duration_days} days")
            
            # Analyze experiment data
            if exp.status == "Active":
                analysis = self.iss_client.analyze_experiment_data(exp.experiment_id)
                if 'progress_percentage' in analysis:
                    progress = analysis['progress_percentage']
                    print(f"    📊 Progress: {progress:.1f}%, Quality: {analysis.get('data_quality', 0):.2f}")
                    
                    if analysis.get('key_insights'):
                        print(f"    💡 Key insight: {analysis['key_insights'][0]}")
    
    async def demonstrate_multi_observatory_coordination(self):
        """Demonstrate coordination between multiple observatories"""
        print("\n" + "="*60)
        print("🌌 MULTI-OBSERVATORY COORDINATION DEMONSTRATION")
        print("="*60)
        
        # Create observation plans for different observatories
        targets = ["M87*", "Proxima Centauri b", "Betelgeuse"]
        observatories = [Observatory.JWST, Observatory.HST, Observatory.CHANDRA]
        
        print("📋 Creating coordinated observation plans...")
        
        observation_plans = {}
        
        for observatory in observatories:
            print(f"\n🔭 Planning observations for {observatory.value.upper()}...")
            
            plan = self.space_client.create_observation_plan(
                targets, 
                observatory,
                constraints={
                    'min_elevation': 30,
                    'max_airmass': 2.0,
                    'weather_threshold': 0.8
                }
            )
            
            observation_plans[observatory.value] = plan
            
            if 'observations' in plan:
                print(f"  ✅ Created plan for {len(plan['observations'])} targets")
                
                for obs in plan['observations']:
                    target = obs['target']
                    priority = obs['priority']
                    duration = obs['estimated_duration'] / 60  # Convert to minutes
                    instruments = ', '.join(obs['instruments'][:2])
                    
                    print(f"    - {target}: Priority {priority:.1f}, "
                          f"{duration:.0f}min, {instruments}")
        
        # Demonstrate cross-observatory analysis
        print("\n🔗 Cross-observatory analysis opportunities:")
        
        # Find common targets across observatories
        common_targets = set(targets)
        for plan in observation_plans.values():
            if 'observations' in plan:
                plan_targets = {obs['target'] for obs in plan['observations']}
                common_targets &= plan_targets
        
        if common_targets:
            print(f"  🎯 Common targets for multi-wavelength study: {', '.join(common_targets)}")
            
            for target in list(common_targets)[:2]:
                print(f"\n  📊 Multi-wavelength analysis plan for {target}:")
                print(f"    - JWST: Infrared spectroscopy and imaging")
                print(f"    - HST: Optical/UV high-resolution imaging")
                print(f"    - Chandra: X-ray emission analysis")
                print(f"    - Combined: Complete electromagnetic spectrum coverage")
        
        # Simulate coordinated observation results
        print("\n📈 Simulated coordinated observation results:")
        
        mock_results = {
            'target': 'M87*',
            'observation_date': datetime.now().isoformat(),
            'coordinated_observatories': ['JWST', 'HST', 'Chandra'],
            'key_findings': [
                'Black hole mass: 6.5 billion solar masses',
                'Jet velocity: 0.99c (near light speed)',
                'Accretion disk temperature: 10^9 K',
                'Magnetic field strength: 10^4 Gauss'
            ],
            'scientific_impact': 'High - confirms general relativity predictions',
            'follow_up_recommended': True
        }
        
        print(f"  🎯 Target: {mock_results['target']}")
        print(f"  🔭 Observatories: {', '.join(mock_results['coordinated_observatories'])}")
        print(f"  📊 Key findings:")
        for finding in mock_results['key_findings']:
            print(f"    - {finding}")
        print(f"  🌟 Impact: {mock_results['scientific_impact']}")
    
    async def demonstrate_real_time_monitoring(self):
        """Demonstrate real-time space monitoring capabilities"""
        print("\n" + "="*60)
        print("⚡ REAL-TIME SPACE MONITORING DEMONSTRATION")
        print("="*60)
        
        # Set up astronomical event monitoring
        print("🚨 Setting up astronomical event monitoring...")
        
        event_types = ['supernova', 'asteroid', 'exoplanet_transit', 'solar_flare']
        monitoring = self.space_client.monitor_astronomical_events(event_types)
        
        print(f"  ✅ Monitoring {len(monitoring['event_types'])} event types")
        print(f"  📡 Alert sources: {', '.join(monitoring['alert_sources'])}")
        
        # Display recent events
        if 'recent_supernovae' in monitoring:
            print(f"\n💥 Recent supernovae:")
            for sn in monitoring['recent_supernovae']:
                print(f"  - {sn['name']} (Type {sn['type']})")
                print(f"    Host: {sn['host_galaxy']}, Magnitude: {sn['magnitude']}")
        
        if 'near_earth_objects' in monitoring:
            print(f"\n☄️ Near-Earth objects:")
            for neo in monitoring['near_earth_objects']:
                print(f"  - {neo['name']} (Diameter: {neo['diameter']}m)")
                print(f"    Closest approach: {neo['closest_approach']} at {neo['distance']} AU")
        
        # Create mission timeline
        print(f"\n📅 Creating 7-day mission timeline...")
        timeline = self.iss_client.create_mission_timeline(7)
        
        print(f"  📋 Timeline created with {len(timeline['events'])} events")
        print(f"  🗓️ Upcoming events:")
        
        for event in timeline['events'][:5]:
            event_date = datetime.fromisoformat(event['date'])
            print(f"    - {event_date.strftime('%m/%d %H:%M')}: {event['description']}")
            print(f"      Duration: {event['duration_minutes']}min, Priority: {event['priority']}")
        
        # Simulate real-time data streams
        print(f"\n📊 Simulating real-time data streams...")
        
        data_streams = [
            "JWST live observations",
            "HST real-time processing", 
            "ISS telemetry feed",
            "Gaia stellar catalog updates",
            "Exoplanet transit alerts"
        ]
        
        for stream in data_streams:
            # Simulate data stream status
            status = "🟢 Active" if hash(stream) % 2 == 0 else "🟡 Standby"
            data_rate = abs(hash(stream)) % 1000 + 100  # Mock data rate
            
            print(f"  {status} {stream} - {data_rate} MB/hr")
    
    async def demonstrate_space_gaming_integration(self):
        """Demonstrate space gaming and simulation integration"""
        print("\n" + "="*60)
        print("🎮 SPACE GAMING & SIMULATION DEMONSTRATION")
        print("="*60)
        
        # Create realistic space environment
        print("🌌 Creating realistic space simulation environment...")
        
        # Get real ISS position for game environment
        iss_pos = self.iss_client.get_current_position()
        
        space_environment = {
            'solar_system_date': datetime.now().isoformat(),
            'iss_position': {
                'latitude': iss_pos['latitude'],
                'longitude': iss_pos['longitude'],
                'altitude_km': iss_pos['altitude_km']
            },
            'active_missions': [
                'ISS Expedition 70',
                'JWST Deep Field Survey',
                'Artemis Lunar Program',
                'Mars Sample Return'
            ],
            'space_weather': {
                'solar_activity': 'Moderate',
                'geomagnetic_conditions': 'Quiet',
                'radiation_levels': 'Normal'
            }
        }
        
        print(f"  🌍 Environment timestamp: {space_environment['solar_system_date']}")
        print(f"  🛰️ ISS position: {iss_pos['latitude']:.1f}°, {iss_pos['longitude']:.1f}°")
        print(f"  🚀 Active missions: {len(space_environment['active_missions'])}")
        
        # Simulate space mission planning game
        print(f"\n🎯 Space Mission Planning Game:")
        
        mission_scenarios = [
            {
                'name': 'ISS Resupply Mission',
                'difficulty': 'Medium',
                'duration_days': 3,
                'objectives': ['Dock with ISS', 'Deliver supplies', 'Return safely'],
                'constraints': ['Weather window', 'Orbital mechanics', 'Fuel limits']
            },
            {
                'name': 'JWST Target Selection',
                'difficulty': 'Hard',
                'duration_days': 30,
                'objectives': ['Select optimal targets', 'Schedule observations', 'Maximize science'],
                'constraints': ['Telescope pointing', 'Data downlink', 'Instrument availability']
            },
            {
                'name': 'Exoplanet Discovery',
                'difficulty': 'Expert',
                'duration_days': 365,
                'objectives': ['Analyze light curves', 'Confirm planets', 'Characterize atmospheres'],
                'constraints': ['Data quality', 'False positives', 'Follow-up observations']
            }
        ]
        
        for scenario in mission_scenarios:
            print(f"\n  🎮 Mission: {scenario['name']}")
            print(f"    Difficulty: {scenario['difficulty']}, Duration: {scenario['duration_days']} days")
            print(f"    Objectives: {', '.join(scenario['objectives'][:2])}...")
            print(f"    Key constraint: {scenario['constraints'][0]}")
        
        # Virtual observatory control
        print(f"\n🔭 Virtual Observatory Control:")
        
        virtual_telescopes = ['JWST', 'HST', 'Chandra', 'VLT', 'Keck']
        
        for telescope in virtual_telescopes:
            # Simulate telescope status
            status_options = ['Observing', 'Standby', 'Maintenance', 'Weather Hold']
            status = status_options[hash(telescope) % len(status_options)]
            
            efficiency = 85 + (hash(telescope) % 15)  # 85-99% efficiency
            
            print(f"  🔭 {telescope}: {status} (Efficiency: {efficiency}%)")
        
        print(f"\n  🎯 Available for player control: JWST, HST")
        print(f"  🎮 Game modes: Observation Planning, Real-time Control, Data Analysis")
        
        # Educational content
        print(f"\n📚 Educational Integration:")
        
        educational_modules = [
            'Orbital Mechanics Fundamentals',
            'Electromagnetic Spectrum Explorer', 
            'Exoplanet Detection Methods',
            'Space Mission Design',
            'Astronomical Data Analysis'
        ]
        
        for module in educational_modules:
            completion = 60 + (hash(module) % 40)  # 60-99% completion
            print(f"  📖 {module}: {completion}% complete")

# Main demonstration function
async def main():
    """Run the comprehensive space exploration demonstration"""
    
    print("🌟" * 30)
    print("🚀 SPACE EXPLORATION INTEGRATION DEMO")
    print("🌟" * 30)
    
    # Check for required environment variables
    required_vars = ['NASA_API_KEY', 'MAST_API_TOKEN']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"⚠️  Optional environment variables not set: {', '.join(missing_vars)}")
        print("   Some features may use mock data instead of live APIs")
    
    # Initialize demo
    demo = SpaceExplorationDemo()
    
    try:
        # Run all demonstrations
        await demo.demonstrate_jwst_capabilities()
        await demo.demonstrate_iss_integration()
        await demo.demonstrate_multi_observatory_coordination()
        await demo.demonstrate_real_time_monitoring()
        await demo.demonstrate_space_gaming_integration()
        
        print("\n" + "🌟" * 30)
        print("🎉 SPACE EXPLORATION DEMO COMPLETE!")
        print("🌟" * 30)
        
        print("\n🚀 Summary of capabilities demonstrated:")
        print("  ✅ JWST observation search and analysis")
        print("  ✅ Real-time ISS tracking and crew monitoring")
        print("  ✅ Multi-observatory coordination")
        print("  ✅ Astronomical event monitoring")
        print("  ✅ Space gaming and simulation integration")
        print("  ✅ Educational content integration")
        
        print("\n🌌 Ready to explore the universe with AI! 🚀")
        
    except Exception as e:
        print(f"\n❌ Demo error: {e}")
        print("This may be due to missing dependencies or API access.")
        print("Install requirements: pip install -r requirements.txt")

if __name__ == "__main__":
    # Set up environment (you'll need to set your actual API keys)
    if not os.getenv("NASA_API_KEY"):
        print("💡 Tip: Set NASA_API_KEY environment variable for full functionality")
        print("   export NASA_API_KEY='your-api-key-here'")
    
    # Run the demo
    asyncio.run(main())
