#!/usr/bin/env python3
"""
Turkmenistan Governance Bridge
A tool for monitoring and integrating with Turkmenistan's digital governance repositories
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, List, Optional

class TurkmenistanGovernanceBridge:
    """Bridge for connecting with Turkmenistan governance repositories and systems"""
    
    def __init__(self):
        self.repositories = {
            "sdu_for_dpg": {
                "owner": "SDU-M",
                "repo": "SDU-for-DPG",
                "description": "Smart Data Ukimet architecture for government analytics",
                "type": "government_analytics"
            },
            "turkman_linux": {
                "owner": "turkman-linux",
                "repo": "iso-profile",
                "description": "National Linux distribution ISO profiles",
                "type": "national_os"
            },
            "net4people_bbs": {
                "owner": "net4people",
                "repo": "bbs",
                "description": "Digital rights and internet freedom discussions",
                "type": "digital_rights"
            }
        }
        
        self.government_portals = {
            "main": "https://turkmenistan.gov.tm",
            "news": "https://tdh.gov.tm",
            "environment": "https://mineco.gov.tm",
            "health": "https://www.saglykhm.gov.tm",
            "education": "https://mekdep.edu.tm"
        }
    
    def get_repository_info(self, repo_key: str) -> Optional[Dict]:
        """Get information about a specific repository"""
        if repo_key not in self.repositories:
            return None
            
        repo_info = self.repositories[repo_key]
        api_url = f"https://api.github.com/repos/{repo_info['owner']}/{repo_info['repo']}"
        
        try:
            response = requests.get(api_url)
            if response.status_code == 200:
                data = response.json()
                return {
                    "name": data["name"],
                    "full_name": data["full_name"],
                    "description": data["description"],
                    "stars": data["stargazers_count"],
                    "forks": data["forks_count"],
                    "language": data["language"],
                    "license": data["license"]["name"] if data["license"] else "No license",
                    "last_updated": data["updated_at"],
                    "url": data["html_url"],
                    "clone_url": data["clone_url"]
                }
        except Exception as e:
            print(f"Error fetching repository info: {e}")
            return None
    
    def monitor_all_repositories(self) -> Dict:
        """Monitor all tracked repositories"""
        results = {}
        
        for repo_key in self.repositories:
            print(f"Monitoring {repo_key}...")
            repo_info = self.get_repository_info(repo_key)
            if repo_info:
                results[repo_key] = repo_info
            time.sleep(1)  # Rate limiting
            
        return results
    
    def check_government_portals(self) -> Dict:
        """Check availability of government portals"""
        results = {}
        
        for portal_name, url in self.government_portals.items():
            try:
                response = requests.get(url, timeout=10)
                results[portal_name] = {
                    "url": url,
                    "status": response.status_code,
                    "available": response.status_code == 200,
                    "response_time": response.elapsed.total_seconds()
                }
            except Exception as e:
                results[portal_name] = {
                    "url": url,
                    "status": "error",
                    "available": False,
                    "error": str(e)
                }
                
        return results
    
    def generate_bridge_report(self) -> str:
        """Generate a comprehensive bridge status report"""
        print("🌉 Generating Turkmenistan Governance Bridge Report...")
        
        # Monitor repositories
        repo_status = self.monitor_all_repositories()
        
        # Check government portals
        portal_status = self.check_government_portals()
        
        # Generate report
        report = f"""
# 🌉 Turkmenistan Governance Bridge Status Report
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}

## 📊 Repository Status

"""
        
        for repo_key, info in repo_status.items():
            if info:
                report += f"""
### {info['name']}
- **Full Name:** {info['full_name']}
- **Description:** {info['description']}
- **Stars:** {info['stars']} ⭐
- **Forks:** {info['forks']} 🍴
- **Language:** {info['language']}
- **License:** {info['license']}
- **Last Updated:** {info['last_updated']}
- **URL:** {info['url']}

"""
        
        report += "\n## 🌐 Government Portal Status\n\n"
        
        for portal_name, status in portal_status.items():
            status_emoji = "✅" if status['available'] else "❌"
            report += f"- **{portal_name.title()}:** {status_emoji} {status['url']}\n"
            if 'response_time' in status:
                report += f"  - Response Time: {status['response_time']:.2f}s\n"
        
        return report
    
    def get_integration_opportunities(self) -> List[str]:
        """Identify potential integration opportunities"""
        opportunities = [
            "🔗 Fork SDU-for-DPG for government analytics patterns",
            "🐧 Study Turkman Linux for sovereign OS architecture",
            "🗣️ Engage with net4people community on digital rights",
            "📊 Implement government data analytics workflows",
            "🌐 Create API bridges to government portals",
            "🔒 Develop secure communication protocols",
            "📚 Document governance best practices",
            "🤝 Establish developer community connections"
        ]
        return opportunities

def main():
    """Main function to run the governance bridge"""
    bridge = TurkmenistanGovernanceBridge()
    
    print("🚀 Starting Turkmenistan Governance Bridge...")
    
    # Generate comprehensive report
    report = bridge.generate_bridge_report()
    print(report)
    
    # Show integration opportunities
    print("\n## 🎯 Integration Opportunities\n")
    opportunities = bridge.get_integration_opportunities()
    for opportunity in opportunities:
        print(f"- {opportunity}")
    
    # Save report to file
    with open("governance_bridge_report.md", "w") as f:
        f.write(report)
    
    print(f"\n✅ Report saved to governance_bridge_report.md")

if __name__ == "__main__":
    main()

