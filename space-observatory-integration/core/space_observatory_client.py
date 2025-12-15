"""
Space Observatory Integration Client
Unified interface for NASA, ESA, and global space observatory systems
"""

import os
import json
import asyncio
import logging
from typing import Dict, List, Optional, Any, Union, Tuple
from dataclasses import dataclass
from enum import Enum
from datetime import datetime, timedelta
import numpy as np

try:
    import astropy
    from astropy.io import fits
    from astropy.coordinates import SkyCoord
    from astropy.time import Time
    from astropy import units as u
    from astroquery.mast import Observations
    from astroquery.gaia import Gaia
    import requests
except ImportError:
    print("Warning: Astronomy packages not installed. Install with: pip install astropy astroquery")
    astropy = None

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Observatory(Enum):
    """Available space observatories"""
    JWST = "jwst"
    HST = "hst"
    SPITZER = "spitzer"
    KEPLER = "kepler"
    TESS = "tess"
    GAIA = "gaia"
    CHANDRA = "chandra"
    NUSTAR = "nustar"
    ISS = "iss"

class DataLevel(Enum):
    """Data processing levels"""
    RAW = "0"
    CALIBRATED = "1"
    REDUCED = "2"
    SCIENCE_READY = "3"
    HIGH_LEVEL = "4"

@dataclass
class SpaceObservatoryConfig:
    """Configuration for space observatory client"""
    nasa_api_key: Optional[str] = None
    esa_api_key: Optional[str] = None
    mast_token: Optional[str] = None
    gaia_user: Optional[str] = None
    gaia_password: Optional[str] = None
    cache_dir: str = "./space_data_cache"
    max_concurrent_downloads: int = 5

@dataclass
class Observation:
    """Space observatory observation data"""
    obs_id: str
    target_name: str
    observatory: Observatory
    instrument: str
    filters: List[str]
    exposure_time: float
    observation_date: datetime
    coordinates: Optional[SkyCoord] = None
    data_level: DataLevel = DataLevel.SCIENCE_READY
    file_paths: List[str] = None
    metadata: Dict[str, Any] = None

@dataclass
class ISSPosition:
    """International Space Station position"""
    latitude: float
    longitude: float
    altitude: float
    timestamp: datetime
    velocity: Optional[Tuple[float, float, float]] = None

class SpaceObservatoryClient:
    """
    Unified client for space observatory data and operations
    """
    
    def __init__(self, config: Optional[SpaceObservatoryConfig] = None):
        """Initialize space observatory client"""
        if astropy is None:
            raise ImportError("Astronomy packages required. Install with: pip install astropy astroquery")
        
        self.config = config or self._load_default_config()
        
        # Setup data cache directory
        os.makedirs(self.config.cache_dir, exist_ok=True)
        
        # Configure API access
        if self.config.mast_token:
            Observations.login(token=self.config.mast_token)
        
        if self.config.gaia_user and self.config.gaia_password:
            Gaia.login(user=self.config.gaia_user, password=self.config.gaia_password)
        
        logger.info("Space Observatory Client initialized")
    
    def _load_default_config(self) -> SpaceObservatoryConfig:
        """Load default configuration from environment"""
        return SpaceObservatoryConfig(
            nasa_api_key=os.getenv("NASA_API_KEY"),
            esa_api_key=os.getenv("ESA_API_KEY"),
            mast_token=os.getenv("MAST_API_TOKEN"),
            gaia_user=os.getenv("GAIA_USER"),
            gaia_password=os.getenv("GAIA_PASSWORD"),
            cache_dir=os.getenv("SPACE_DATA_CACHE", "./space_data_cache")
        )
    
    def search_observations(self, target: str, observatory: Observatory, 
                          radius: float = 0.1, max_results: int = 100) -> List[Observation]:
        """Search for observations of a target"""
        try:
            if observatory in [Observatory.JWST, Observatory.HST, Observatory.KEPLER, Observatory.TESS]:
                return self._search_mast_observations(target, observatory, radius, max_results)
            elif observatory == Observatory.GAIA:
                return self._search_gaia_observations(target, radius, max_results)
            else:
                logger.warning(f"Observatory {observatory} not yet implemented")
                return []
        
        except Exception as e:
            logger.error(f"Error searching observations: {e}")
            return []
    
    def _search_mast_observations(self, target: str, observatory: Observatory, 
                                radius: float, max_results: int) -> List[Observation]:
        """Search MAST archive for observations"""
        obs_table = Observations.query_object(
            target, 
            radius=radius * u.deg,
            obs_collection=observatory.value.upper()
        )
        
        observations = []
        for i, row in enumerate(obs_table[:max_results]):
            try:
                coord = SkyCoord(
                    ra=row['s_ra'] * u.deg,
                    dec=row['s_dec'] * u.deg,
                    frame='icrs'
                ) if row['s_ra'] and row['s_dec'] else None
                
                obs = Observation(
                    obs_id=row['obs_id'],
                    target_name=row['target_name'],
                    observatory=observatory,
                    instrument=row['instrument_name'],
                    filters=row['filters'].split(';') if row['filters'] else [],
                    exposure_time=float(row['t_exptime']) if row['t_exptime'] else 0.0,
                    observation_date=Time(row['t_min'], format='mjd').datetime,
                    coordinates=coord,
                    metadata=dict(row)
                )
                observations.append(obs)
            
            except Exception as e:
                logger.warning(f"Error processing observation {i}: {e}")
                continue
        
        return observations
    
    def _search_gaia_observations(self, target: str, radius: float, max_results: int) -> List[Observation]:
        """Search Gaia archive for stellar data"""
        try:
            # Convert target to coordinates if it's a name
            coord = SkyCoord.from_name(target)
            
            # Query Gaia DR3
            query = f"""
            SELECT TOP {max_results}
                source_id, ra, dec, pmra, pmdec, parallax,
                phot_g_mean_mag, phot_bp_mean_mag, phot_rp_mean_mag,
                radial_velocity, teff_gspphot
            FROM gaiadr3.gaia_source
            WHERE CONTAINS(
                POINT('ICRS', ra, dec),
                CIRCLE('ICRS', {coord.ra.deg}, {coord.dec.deg}, {radius})
            ) = 1
            ORDER BY phot_g_mean_mag ASC
            """
            
            job = Gaia.launch_job_async(query)
            results = job.get_results()
            
            observations = []
            for row in results:
                obs_coord = SkyCoord(
                    ra=row['ra'] * u.deg,
                    dec=row['dec'] * u.deg,
                    frame='icrs'
                )
                
                obs = Observation(
                    obs_id=str(row['source_id']),
                    target_name=f"Gaia DR3 {row['source_id']}",
                    observatory=Observatory.GAIA,
                    instrument="Gaia",
                    filters=['G', 'BP', 'RP'],
                    exposure_time=0.0,  # Gaia doesn't have traditional exposures
                    observation_date=datetime(2014, 7, 25),  # Gaia launch date
                    coordinates=obs_coord,
                    metadata=dict(row)
                )
                observations.append(obs)
            
            return observations
        
        except Exception as e:
            logger.error(f"Error searching Gaia: {e}")
            return []
    
    def download_observation_data(self, observation: Observation, 
                                data_level: DataLevel = DataLevel.SCIENCE_READY) -> List[str]:
        """Download observation data files"""
        try:
            if observation.observatory in [Observatory.JWST, Observatory.HST]:
                return self._download_mast_data(observation, data_level)
            else:
                logger.warning(f"Download not implemented for {observation.observatory}")
                return []
        
        except Exception as e:
            logger.error(f"Error downloading data: {e}")
            return []
    
    def _download_mast_data(self, observation: Observation, data_level: DataLevel) -> List[str]:
        """Download data from MAST archive"""
        # Get data products for the observation
        data_products = Observations.get_product_list(observation.obs_id)
        
        # Filter by data level
        if data_level != DataLevel.RAW:
            data_products = data_products[data_products['productSubGroupDescription'] == f'Level {data_level.value}']
        
        # Download files
        download_dir = os.path.join(self.config.cache_dir, observation.observatory.value, observation.obs_id)
        os.makedirs(download_dir, exist_ok=True)
        
        manifest = Observations.download_products(
            data_products,
            download_dir=download_dir,
            cache=True
        )
        
        return [str(path) for path in manifest['Local Path']]
    
    def get_iss_position(self) -> ISSPosition:
        """Get current ISS position"""
        try:
            # Use NASA ISS API
            response = requests.get("http://api.open-notify.org/iss-now.json", timeout=10)
            data = response.json()
            
            if data['message'] == 'success':
                pos = data['iss_position']
                return ISSPosition(
                    latitude=float(pos['latitude']),
                    longitude=float(pos['longitude']),
                    altitude=408.0,  # Approximate ISS altitude in km
                    timestamp=datetime.fromtimestamp(data['timestamp'])
                )
            else:
                raise Exception(f"ISS API error: {data.get('message', 'Unknown error')}")
        
        except Exception as e:
            logger.error(f"Error getting ISS position: {e}")
            # Return default position if API fails
            return ISSPosition(0.0, 0.0, 408.0, datetime.now())
    
    def predict_iss_passes(self, latitude: float, longitude: float, 
                          altitude: float = 0, days: int = 7) -> List[Dict]:
        """Predict ISS passes over a location"""
        try:
            url = "http://api.open-notify.org/iss-pass.json"
            params = {
                'lat': latitude,
                'lon': longitude,
                'alt': altitude,
                'n': 10  # Number of passes
            }
            
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            if data['message'] == 'success':
                passes = []
                for pass_info in data['response']:
                    passes.append({
                        'rise_time': datetime.fromtimestamp(pass_info['risetime']),
                        'duration': pass_info['duration'],
                        'max_elevation': 'unknown'  # API doesn't provide this
                    })
                return passes
            else:
                raise Exception(f"ISS Pass API error: {data.get('message', 'Unknown error')}")
        
        except Exception as e:
            logger.error(f"Error predicting ISS passes: {e}")
            return []
    
    def analyze_exoplanet_candidates(self, star_data: Dict) -> List[Dict]:
        """Analyze stellar data for exoplanet candidates using AI"""
        try:
            # This is a simplified example - real implementation would use
            # sophisticated transit detection algorithms
            candidates = []
            
            if 'lightcurve' in star_data:
                lightcurve = np.array(star_data['lightcurve'])
                time = np.array(star_data.get('time', range(len(lightcurve))))
                
                # Simple transit detection (looking for periodic dips)
                mean_flux = np.mean(lightcurve)
                std_flux = np.std(lightcurve)
                
                # Find significant dips
                dips = lightcurve < (mean_flux - 2 * std_flux)
                
                if np.any(dips):
                    dip_times = time[dips]
                    
                    # Look for periodicity
                    if len(dip_times) > 2:
                        periods = []
                        for i in range(1, len(dip_times)):
                            period = dip_times[i] - dip_times[0]
                            periods.append(period)
                        
                        # Most common period
                        if periods:
                            estimated_period = np.median(periods)
                            depth = (mean_flux - np.min(lightcurve[dips])) / mean_flux
                            
                            candidates.append({
                                'period': estimated_period,
                                'transit_depth': depth,
                                'confidence': min(0.9, len(dip_times) / 10.0),
                                'planet_radius_estimate': np.sqrt(depth) * 109.2,  # Earth radii
                                'detection_method': 'transit_photometry'
                            })
            
            return candidates
        
        except Exception as e:
            logger.error(f"Error analyzing exoplanet candidates: {e}")
            return []
    
    def process_jwst_observation(self, obs_id: str, analysis_type: str = "spectroscopy") -> Dict:
        """Process JWST observation with AI enhancement"""
        try:
            # This would integrate with the actual JWST pipeline
            # For now, return a mock analysis
            
            analysis_results = {
                'observation_id': obs_id,
                'analysis_type': analysis_type,
                'processing_date': datetime.now().isoformat(),
                'pipeline_version': '1.12.5',
                'results': {}
            }
            
            if analysis_type == "spectroscopy":
                analysis_results['results'] = {
                    'spectral_lines_detected': ['H_alpha', 'O_III', 'H_beta'],
                    'redshift': 0.045,
                    'stellar_mass': 1.2e11,  # Solar masses
                    'star_formation_rate': 15.3,  # Solar masses per year
                    'metallicity': 0.8,  # Solar metallicity
                    'confidence': 0.92
                }
            
            elif analysis_type == "photometry":
                analysis_results['results'] = {
                    'magnitude_f200w': 18.5,
                    'magnitude_f444w': 17.8,
                    'color_index': 0.7,
                    'stellar_type': 'G2V',
                    'distance_modulus': 14.2,
                    'confidence': 0.88
                }
            
            elif analysis_type == "exoplanet_transit":
                analysis_results['results'] = {
                    'transit_detected': True,
                    'planet_radius': 1.15,  # Earth radii
                    'orbital_period': 3.2,  # days
                    'transit_depth': 0.0012,
                    'atmospheric_features': ['H2O', 'CO2', 'CH4'],
                    'confidence': 0.95
                }
            
            return analysis_results
        
        except Exception as e:
            logger.error(f"Error processing JWST observation: {e}")
            return {'error': str(e)}
    
    def monitor_astronomical_events(self, event_types: List[str], 
                                  callback: callable = None) -> Dict:
        """Monitor for astronomical events"""
        try:
            # This would connect to real-time alert systems like GCN, TNS, etc.
            # For now, return mock monitoring setup
            
            monitoring_config = {
                'event_types': event_types,
                'monitoring_started': datetime.now().isoformat(),
                'alert_sources': ['GCN', 'TNS', 'ASAS-SN', 'ZTF'],
                'callback_registered': callback is not None
            }
            
            # Simulate some events for demonstration
            if 'supernova' in event_types:
                monitoring_config['recent_supernovae'] = [
                    {
                        'name': 'SN 2024abc',
                        'type': 'Ia',
                        'discovery_date': '2024-01-15',
                        'magnitude': 16.2,
                        'host_galaxy': 'NGC 1234',
                        'coordinates': {'ra': 123.456, 'dec': 45.678}
                    }
                ]
            
            if 'asteroid' in event_types:
                monitoring_config['near_earth_objects'] = [
                    {
                        'name': '2024 AB1',
                        'diameter': 150,  # meters
                        'closest_approach': '2024-02-01',
                        'distance': 0.02,  # AU
                        'velocity': 15.2  # km/s
                    }
                ]
            
            return monitoring_config
        
        except Exception as e:
            logger.error(f"Error setting up event monitoring: {e}")
            return {'error': str(e)}
    
    def create_observation_plan(self, targets: List[str], observatory: Observatory,
                              constraints: Dict = None) -> Dict:
        """Create an optimized observation plan"""
        try:
            plan = {
                'observatory': observatory.value,
                'targets': targets,
                'plan_created': datetime.now().isoformat(),
                'total_targets': len(targets),
                'observations': []
            }
            
            # Default constraints
            default_constraints = {
                'min_elevation': 30,  # degrees
                'max_airmass': 2.0,
                'avoid_moon': True,
                'weather_threshold': 0.8
            }
            
            if constraints:
                default_constraints.update(constraints)
            
            plan['constraints'] = default_constraints
            
            # Create observation schedule for each target
            for i, target in enumerate(targets):
                try:
                    coord = SkyCoord.from_name(target)
                    
                    observation = {
                        'target': target,
                        'coordinates': {
                            'ra': coord.ra.deg,
                            'dec': coord.dec.deg
                        },
                        'priority': 1.0 - (i * 0.1),  # Decreasing priority
                        'estimated_duration': 1800,  # 30 minutes
                        'optimal_time': self._calculate_optimal_time(coord),
                        'instruments': self._suggest_instruments(observatory, target),
                        'filters': self._suggest_filters(observatory, target)
                    }
                    
                    plan['observations'].append(observation)
                
                except Exception as e:
                    logger.warning(f"Could not plan observation for {target}: {e}")
                    continue
            
            return plan
        
        except Exception as e:
            logger.error(f"Error creating observation plan: {e}")
            return {'error': str(e)}
    
    def _calculate_optimal_time(self, coord: SkyCoord) -> str:
        """Calculate optimal observation time for a target"""
        # Simplified calculation - real implementation would consider
        # observatory location, target visibility, moon phase, etc.
        now = datetime.now()
        optimal_time = now + timedelta(hours=12)  # Assume nighttime
        return optimal_time.isoformat()
    
    def _suggest_instruments(self, observatory: Observatory, target: str) -> List[str]:
        """Suggest appropriate instruments for a target"""
        instrument_map = {
            Observatory.JWST: ['NIRCam', 'MIRI', 'NIRSpec', 'NIRISS'],
            Observatory.HST: ['ACS', 'WFC3', 'STIS', 'COS'],
            Observatory.CHANDRA: ['ACIS-I', 'ACIS-S', 'HRC-I', 'HRC-S']
        }
        
        return instrument_map.get(observatory, ['Unknown'])
    
    def _suggest_filters(self, observatory: Observatory, target: str) -> List[str]:
        """Suggest appropriate filters for a target"""
        filter_map = {
            Observatory.JWST: ['F200W', 'F444W', 'F150W'],
            Observatory.HST: ['F606W', 'F814W', 'F435W'],
            Observatory.GAIA: ['G', 'BP', 'RP']
        }
        
        return filter_map.get(observatory, ['V', 'R', 'I'])

# Convenience functions
def search_space_objects(target: str, observatory: str = "jwst") -> List[Observation]:
    """Quick search for space objects"""
    client = SpaceObservatoryClient()
    obs_enum = Observatory(observatory.lower())
    return client.search_observations(target, obs_enum)

def get_current_iss_location() -> ISSPosition:
    """Get current ISS position"""
    client = SpaceObservatoryClient()
    return client.get_iss_position()

def find_exoplanets(star_data: Dict) -> List[Dict]:
    """Quick exoplanet candidate search"""
    client = SpaceObservatoryClient()
    return client.analyze_exoplanet_candidates(star_data)

# Example usage
if __name__ == "__main__":
    async def main():
        # Initialize client
        client = SpaceObservatoryClient()
        
        # Search for JWST observations of M31
        print("🔍 Searching for JWST observations of M31...")
        observations = client.search_observations("M31", Observatory.JWST, max_results=5)
        print(f"Found {len(observations)} observations")
        
        for obs in observations[:3]:
            print(f"  - {obs.obs_id}: {obs.target_name} ({obs.instrument})")
        
        # Get current ISS position
        print("\n🛰️ Getting current ISS position...")
        iss_pos = client.get_iss_position()
        print(f"ISS Location: {iss_pos.latitude:.2f}°, {iss_pos.longitude:.2f}°")
        
        # Predict ISS passes over a location (e.g., New York)
        print("\n🌍 Predicting ISS passes over New York...")
        passes = client.predict_iss_passes(40.7128, -74.0060, days=3)
        print(f"Next {len(passes)} ISS passes:")
        for i, pass_info in enumerate(passes[:3]):
            print(f"  {i+1}. {pass_info['rise_time']} (duration: {pass_info['duration']}s)")
        
        # Create observation plan
        print("\n📋 Creating observation plan...")
        targets = ["M31", "M42", "NGC 1365"]
        plan = client.create_observation_plan(targets, Observatory.JWST)
        print(f"Created plan for {plan['total_targets']} targets")
        
        # Process mock JWST observation
        print("\n🔬 Processing JWST observation...")
        analysis = client.process_jwst_observation("jw01234567001_01101_00001_nrca1", "exoplanet_transit")
        if 'results' in analysis:
            results = analysis['results']
            print(f"Transit detected: {results.get('transit_detected', False)}")
            if results.get('transit_detected'):
                print(f"Planet radius: {results.get('planet_radius', 0):.2f} Earth radii")
        
        # Monitor astronomical events
        print("\n🚨 Setting up event monitoring...")
        monitoring = client.monitor_astronomical_events(['supernova', 'asteroid'])
        print(f"Monitoring {len(monitoring['event_types'])} event types")
        
        print("\n🌟 Space Observatory Integration Demo Complete!")
    
    asyncio.run(main())
