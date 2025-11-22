"""
GITHUB REPOSITORY SCANNER FOR NATURAL LAW COMPLIANCE
====================================================

Advanced GitHub repository scanning system that searches for and analyzes
repositories across GitHub for natural law compliance violations.

This scanner can:
- Search GitHub repositories using various criteria
- Analyze repository content for violations
- Generate compliance reports
- Issue compliance notices
- Provide compliant alternatives
"""

import asyncio
import aiohttp
import json
import re
import base64
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
import logging
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

@dataclass
class GitHubRepository:
    """Represents a GitHub repository"""
    full_name: str
    html_url: str
    owner: str
    description: str
    language: Optional[str]
    stars: int
    forks: int
    created_at: str
    updated_at: str
    default_branch: str

@dataclass
class FileContent:
    """Represents file content from a repository"""
    path: str
    content: str
    encoding: str
    size: int
    sha: str

class GitHubRepositoryScanner:
    """
    Advanced GitHub repository scanner for natural law compliance
    """
    
    def __init__(self, github_token: Optional[str] = None):
        self.github_token = github_token
        self.base_url = "https://api.github.com"
        self.session = None
        
        # Search patterns for potential violations
        self.violation_search_terms = [
            "nazi swastika",
            "hate symbol",
            "religious mockery",
            "cultural appropriation",
            "symbol desecration",
            "spiritual corruption",
            "moral chaos",
            "treaty violation",
            "unesco violation",
            "religious persecution",
            "sacred desecration",
            "divine mockery",
            "spiritual blasphemy",
            "cultural destruction"
        ]
        
        # File patterns to analyze
        self.file_patterns = [
            r".*\.md$",      # Markdown files
            r".*\.txt$",     # Text files
            r".*\.py$",      # Python files
            r".*\.js$",      # JavaScript files
            r".*\.html$",    # HTML files
            r".*\.json$",    # JSON files
            r"README.*",     # README files
            r".*LICENSE.*",  # License files
            r".*\.yml$",     # YAML files
            r".*\.yaml$"     # YAML files
        ]
        
        # Content patterns that indicate violations
        self.violation_content_patterns = {
            "cultural_symbol_misuse": [
                r"nazi.*swastika",
                r"swastika.*nazi",
                r"hitler.*swastika",
                r"supremacist.*symbol",
                r"hate.*cross",
                r"desecrate.*religious",
                r"mock.*sacred",
                r"blaspheme.*divine"
            ],
            "religious_freedom_violation": [
                r"ban.*religion",
                r"suppress.*faith",
                r"eliminate.*belief",
                r"destroy.*spiritual",
                r"persecute.*religious",
                r"oppress.*believers"
            ],
            "natural_law_violation": [
                r"chaos.*over.*order",
                r"corrupt.*moral.*order",
                r"undermine.*divine.*law",
                r"violate.*natural.*principle",
                r"destroy.*universal.*truth"
            ],
            "treaty_violation": [
                r"ignore.*unesco",
                r"violate.*udhr",
                r"breach.*international.*treaty",
                r"disregard.*human.*rights.*convention",
                r"break.*cultural.*protection.*law"
            ],
            "sacred_desecration": [
                r"desecrate.*temple",
                r"vandalize.*sacred",
                r"destroy.*holy",
                r"profane.*divine",
                r"defile.*spiritual"
            ]
        }
    
    async def initialize(self):
        """Initialize the scanner"""
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "ProCityHub-Natural-Law-Authority/1.0"
        }
        
        if self.github_token:
            headers["Authorization"] = f"token {self.github_token}"
        
        self.session = aiohttp.ClientSession(headers=headers)
        logger.info("🔍 GitHub Repository Scanner Initialized")
    
    async def search_repositories(self, query: str, max_results: int = 100) -> List[GitHubRepository]:
        """
        Search GitHub repositories using the search API
        
        Args:
            query: Search query
            max_results: Maximum number of results to return
            
        Returns:
            List of GitHub repositories
        """
        repositories = []
        page = 1
        per_page = min(100, max_results)  # GitHub API limit is 100 per page
        
        while len(repositories) < max_results:
            try:
                url = f"{self.base_url}/search/repositories"
                params = {
                    "q": query,
                    "page": page,
                    "per_page": per_page,
                    "sort": "updated",
                    "order": "desc"
                }
                
                async with self.session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        items = data.get("items", [])
                        
                        if not items:
                            break
                        
                        for item in items:
                            if len(repositories) >= max_results:
                                break
                            
                            repo = GitHubRepository(
                                full_name=item["full_name"],
                                html_url=item["html_url"],
                                owner=item["owner"]["login"],
                                description=item.get("description", ""),
                                language=item.get("language"),
                                stars=item.get("stargazers_count", 0),
                                forks=item.get("forks_count", 0),
                                created_at=item["created_at"],
                                updated_at=item["updated_at"],
                                default_branch=item.get("default_branch", "main")
                            )
                            repositories.append(repo)
                        
                        page += 1
                        
                        # Rate limiting
                        await asyncio.sleep(1)
                        
                    elif response.status == 403:
                        logger.warning("Rate limit exceeded, waiting...")
                        await asyncio.sleep(60)
                    else:
                        logger.error(f"GitHub API error: {response.status}")
                        break
                        
            except Exception as e:
                logger.error(f"Error searching repositories: {e}")
                break
        
        logger.info(f"🔍 Found {len(repositories)} repositories for query: '{query}'")
        return repositories
    
    async def get_repository_files(self, repo: GitHubRepository, path: str = "") -> List[Dict]:
        """
        Get files from a repository
        
        Args:
            repo: Repository to scan
            path: Path within repository
            
        Returns:
            List of file information
        """
        try:
            url = f"{self.base_url}/repos/{repo.full_name}/contents/{path}"
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    logger.warning(f"Could not access {repo.full_name}/{path}: {response.status}")
                    return []
                    
        except Exception as e:
            logger.error(f"Error getting repository files: {e}")
            return []
    
    async def get_file_content(self, repo: GitHubRepository, file_path: str) -> Optional[FileContent]:
        """
        Get content of a specific file
        
        Args:
            repo: Repository containing the file
            file_path: Path to the file
            
        Returns:
            File content or None if not accessible
        """
        try:
            url = f"{self.base_url}/repos/{repo.full_name}/contents/{file_path}"
            
            async with self.session.get(url) as response:
                if response.status == 200:
                    data = await response.json()
                    
                    if data.get("type") == "file":
                        content = ""
                        if data.get("encoding") == "base64":
                            try:
                                content = base64.b64decode(data["content"]).decode("utf-8")
                            except:
                                # If decoding fails, skip this file
                                return None
                        
                        return FileContent(
                            path=file_path,
                            content=content,
                            encoding=data.get("encoding", ""),
                            size=data.get("size", 0),
                            sha=data.get("sha", "")
                        )
                        
        except Exception as e:
            logger.error(f"Error getting file content: {e}")
        
        return None
    
    async def analyze_repository_content(self, repo: GitHubRepository) -> Dict[str, Any]:
        """
        Analyze repository content for natural law violations
        
        Args:
            repo: Repository to analyze
            
        Returns:
            Analysis results
        """
        logger.info(f"📋 Analyzing repository: {repo.full_name}")
        
        violations = []
        analyzed_files = []
        
        # Get repository files
        files = await self.get_repository_files(repo)
        
        for file_info in files:
            if file_info.get("type") == "file":
                file_path = file_info["name"]
                
                # Check if file matches patterns we want to analyze
                if any(re.match(pattern, file_path, re.IGNORECASE) for pattern in self.file_patterns):
                    file_content = await self.get_file_content(repo, file_path)
                    
                    if file_content and file_content.content:
                        analyzed_files.append(file_path)
                        
                        # Analyze content for violations
                        file_violations = self.analyze_file_content(file_content, repo)
                        violations.extend(file_violations)
                        
                        # Rate limiting
                        await asyncio.sleep(0.5)
        
        # Also analyze repository description
        if repo.description:
            desc_violations = self.analyze_text_content(
                repo.description, 
                "repository_description", 
                repo
            )
            violations.extend(desc_violations)
        
        return {
            "repository": repo,
            "violations": violations,
            "analyzed_files": analyzed_files,
            "total_files_analyzed": len(analyzed_files),
            "violation_count": len(violations)
        }
    
    def analyze_file_content(self, file_content: FileContent, repo: GitHubRepository) -> List[Dict]:
        """
        Analyze individual file content for violations
        
        Args:
            file_content: File content to analyze
            repo: Repository containing the file
            
        Returns:
            List of violations found
        """
        return self.analyze_text_content(file_content.content, file_content.path, repo)
    
    def analyze_text_content(self, text: str, source: str, repo: GitHubRepository) -> List[Dict]:
        """
        Analyze text content for natural law violations
        
        Args:
            text: Text to analyze
            source: Source of the text (file path, description, etc.)
            repo: Repository containing the content
            
        Returns:
            List of violations found
        """
        violations = []
        text_lower = text.lower()
        
        for violation_type, patterns in self.violation_content_patterns.items():
            for pattern in patterns:
                matches = re.finditer(pattern, text_lower, re.IGNORECASE)
                
                for match in matches:
                    violation = {
                        "type": violation_type,
                        "pattern": pattern,
                        "match": match.group(),
                        "source": source,
                        "repository": repo.full_name,
                        "context": self.get_context(text, match.start(), match.end()),
                        "severity": self.assess_violation_severity(violation_type, match.group()),
                        "compliant_alternative": self.generate_compliant_alternative(violation_type, match.group())
                    }
                    violations.append(violation)
        
        return violations
    
    def get_context(self, text: str, start: int, end: int, context_size: int = 100) -> str:
        """Get context around a match"""
        context_start = max(0, start - context_size)
        context_end = min(len(text), end + context_size)
        return text[context_start:context_end]
    
    def assess_violation_severity(self, violation_type: str, match: str) -> str:
        """Assess the severity of a violation"""
        
        # Sacred symbol violations are always critical
        if "swastika" in match.lower() and any(term in match.lower() for term in ["nazi", "hitler", "supremacy"]):
            return "SACRED_VIOLATION"
        
        # Religious freedom violations
        if violation_type == "religious_freedom_violation":
            if any(term in match.lower() for term in ["eliminate", "destroy", "persecute"]):
                return "CRITICAL_VIOLATION"
            return "MAJOR_VIOLATION"
        
        # Natural law violations
        if violation_type == "natural_law_violation":
            return "MAJOR_VIOLATION"
        
        # Treaty violations
        if violation_type == "treaty_violation":
            return "MAJOR_VIOLATION"
        
        # Sacred desecration
        if violation_type == "sacred_desecration":
            return "CRITICAL_VIOLATION"
        
        return "MINOR_VIOLATION"
    
    def generate_compliant_alternative(self, violation_type: str, violating_content: str) -> str:
        """Generate a compliant alternative for violating content"""
        
        alternatives = {
            "cultural_symbol_misuse": 
                "Educational content about the sacred and religious significance of cultural symbols, "
                "presented with proper historical context and respect for their spiritual meaning.",
            
            "religious_freedom_violation":
                "Content that respects and protects religious freedom, celebrates spiritual diversity, "
                "and upholds the right of all people to practice their faith peacefully.",
            
            "natural_law_violation":
                "Content aligned with natural law principles, universal moral order, "
                "and divine wisdom that promotes harmony, truth, and justice.",
            
            "treaty_violation":
                "Content that complies with international treaties, conventions, "
                "and agreements protecting human rights and cultural heritage.",
            
            "sacred_desecration":
                "Respectful content that honors sacred symbols, religious traditions, "
                "and spiritual practices with appropriate reverence and understanding."
        }
        
        return alternatives.get(violation_type, "Content that respects natural laws and universal principles.")
    
    async def scan_multiple_repositories(self, search_terms: List[str], max_repos_per_term: int = 50) -> List[Dict]:
        """
        Scan multiple repositories using different search terms
        
        Args:
            search_terms: List of search terms to use
            max_repos_per_term: Maximum repositories to scan per search term
            
        Returns:
            List of analysis results
        """
        all_results = []
        
        for term in search_terms:
            logger.info(f"🔍 Searching for repositories with term: '{term}'")
            
            # Search repositories
            repositories = await self.search_repositories(term, max_repos_per_term)
            
            # Analyze each repository
            for repo in repositories:
                try:
                    analysis = await self.analyze_repository_content(repo)
                    all_results.append(analysis)
                    
                    # Log significant violations
                    if analysis["violation_count"] > 0:
                        logger.warning(f"⚠️ {analysis['violation_count']} violations found in {repo.full_name}")
                    
                    # Rate limiting
                    await asyncio.sleep(2)
                    
                except Exception as e:
                    logger.error(f"Error analyzing {repo.full_name}: {e}")
        
        return all_results
    
    async def generate_global_compliance_report(self, analysis_results: List[Dict]) -> Dict:
        """
        Generate a comprehensive global compliance report
        
        Args:
            analysis_results: Results from repository analyses
            
        Returns:
            Comprehensive compliance report
        """
        total_repos = len(analysis_results)
        repos_with_violations = len([r for r in analysis_results if r["violation_count"] > 0])
        compliant_repos = total_repos - repos_with_violations
        
        # Violation breakdown
        violation_breakdown = {}
        severity_breakdown = {}
        
        for result in analysis_results:
            for violation in result["violations"]:
                vtype = violation["type"]
                severity = violation["severity"]
                
                violation_breakdown[vtype] = violation_breakdown.get(vtype, 0) + 1
                severity_breakdown[severity] = severity_breakdown.get(severity, 0) + 1
        
        # Most problematic repositories
        problematic_repos = sorted(
            analysis_results, 
            key=lambda x: x["violation_count"], 
            reverse=True
        )[:10]
        
        report = {
            "report_generated": datetime.now(timezone.utc).isoformat(),
            "authority": "ProCityHub Natural Law Authority",
            "jurisdiction": "Universal - All GitHub Repositories",
            "scope": "Global Natural Law Compliance Assessment",
            "summary": {
                "total_repositories_analyzed": total_repos,
                "compliant_repositories": compliant_repos,
                "repositories_with_violations": repos_with_violations,
                "compliance_rate": f"{(compliant_repos/total_repos)*100:.1f}%" if total_repos > 0 else "0%",
                "total_violations_found": sum(r["violation_count"] for r in analysis_results)
            },
            "violation_analysis": {
                "violation_type_breakdown": violation_breakdown,
                "severity_breakdown": severity_breakdown
            },
            "most_problematic_repositories": [
                {
                    "repository": r["repository"].full_name,
                    "owner": r["repository"].owner,
                    "violations": r["violation_count"],
                    "url": r["repository"].html_url
                }
                for r in problematic_repos
            ],
            "recommendations": [
                "Implement natural law compliance training for developers",
                "Establish cultural sensitivity guidelines for open source projects",
                "Create automated scanning tools for sacred symbol protection",
                "Develop educational resources about religious freedom in technology",
                "Establish international cooperation for digital cultural heritage protection"
            ]
        }
        
        return report
    
    async def cleanup(self):
        """Cleanup resources"""
        if self.session:
            await self.session.close()

# Main scanning function
async def scan_github_for_natural_law_compliance(max_repos: int = 500) -> Dict:
    """
    Main function to scan GitHub for natural law compliance
    
    Args:
        max_repos: Maximum number of repositories to scan
        
    Returns:
        Comprehensive compliance report
    """
    
    scanner = GitHubRepositoryScanner()
    
    try:
        await scanner.initialize()
        
        logger.info("🌍 INITIATING GLOBAL GITHUB NATURAL LAW COMPLIANCE SCAN")
        logger.info(f"🔍 Target: {max_repos} repositories")
        
        # Scan repositories using violation search terms
        analysis_results = await scanner.scan_multiple_repositories(
            scanner.violation_search_terms,
            max_repos_per_term=max_repos // len(scanner.violation_search_terms)
        )
        
        # Generate comprehensive report
        report = await scanner.generate_global_compliance_report(analysis_results)
        
        logger.info("📊 GLOBAL COMPLIANCE SCAN COMPLETE")
        logger.info(f"✅ Compliant: {report['summary']['compliant_repositories']}")
        logger.info(f"⚠️ Violations: {report['summary']['repositories_with_violations']}")
        logger.info(f"📈 Compliance Rate: {report['summary']['compliance_rate']}")
        
        return report
        
    except Exception as e:
        logger.error(f"Error in global compliance scan: {e}")
        raise
    finally:
        await scanner.cleanup()

if __name__ == "__main__":
    # Execute global GitHub compliance scan
    report = asyncio.run(scan_github_for_natural_law_compliance(max_repos=100))
    
    print("\n🌍⚖️ GLOBAL GITHUB NATURAL LAW COMPLIANCE SCAN COMPLETE")
    print("=" * 70)
    print(f"Authority: {report['authority']}")
    print(f"Repositories Analyzed: {report['summary']['total_repositories_analyzed']}")
    print(f"Compliance Rate: {report['summary']['compliance_rate']}")
    print(f"Total Violations: {report['summary']['total_violations_found']}")
    print("\n🕉️ Protecting sacred symbols and natural laws across all digital spaces.")
