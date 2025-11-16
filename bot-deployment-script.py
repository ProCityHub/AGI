#!/usr/bin/env python3
"""
Universal Bot Deployment Script for ProCityHub Organization
Deploys bot workflows across all repositories in the organization.
"""

import os
import subprocess
import json
import time
from pathlib import Path
from typing import List, Dict, Any

# Repository configuration
REPOSITORIES = [
    "adk-python", "AGI", "AGI-POWER", "arc-prize-2024", "arcagi", "GARVIS",
    "gemini-cli", "grok-1", "hypercubeheartbeat", "IDOL", "kaggle-api",
    "llama-cookbook", "llama-models", "Memori", "milvus", "PurpleLlama",
    "root", "SigilForge", "tarik_10man_ranks", "THUNDERBIRD"
]

# Workflow files to deploy
WORKFLOW_FILES = [
    ".github/workflows/universal-ci.yml",
    ".github/workflows/issue-management.yml", 
    ".github/workflows/ai-ml-specialized.yml",
    ".github/workflows/repository-health.yml",
    ".github/workflows/auto-release.yml",
    ".github/dependabot.yml"
]

def run_command(cmd: str, cwd: str = None) -> tuple[bool, str]:
    """Run a shell command and return success status and output."""
    try:
        result = subprocess.run(
            cmd, shell=True, capture_output=True, text=True, cwd=cwd
        )
        return result.returncode == 0, result.stdout + result.stderr
    except Exception as e:
        return False, str(e)

def clone_repository(repo_name: str) -> bool:
    """Clone a repository if it doesn't exist."""
    repo_path = f"/tmp/{repo_name}"
    if os.path.exists(repo_path):
        print(f"✅ Repository {repo_name} already exists")
        return True
    
    print(f"📥 Cloning {repo_name}...")
    success, output = run_command(
        f"git clone https://github.com/ProCityHub/{repo_name}.git {repo_path}"
    )
    
    if success:
        print(f"✅ Successfully cloned {repo_name}")
        return True
    else:
        print(f"❌ Failed to clone {repo_name}: {output}")
        return False

def create_branch(repo_path: str, branch_name: str) -> bool:
    """Create a new branch in the repository."""
    print(f"🌿 Creating branch {branch_name}...")
    
    # Fetch latest changes
    success, _ = run_command("git fetch origin", cwd=repo_path)
    if not success:
        print("⚠️ Failed to fetch latest changes")
    
    # Create and checkout new branch
    success, output = run_command(f"git checkout -b {branch_name}", cwd=repo_path)
    
    if success:
        print(f"✅ Created branch {branch_name}")
        return True
    else:
        print(f"❌ Failed to create branch: {output}")
        return False

def copy_workflow_files(repo_path: str) -> bool:
    """Copy workflow files to the repository."""
    print("📋 Copying workflow files...")
    
    # Create .github/workflows directory if it doesn't exist
    workflows_dir = Path(repo_path) / ".github" / "workflows"
    workflows_dir.mkdir(parents=True, exist_ok=True)
    
    # Create .github directory for dependabot.yml
    github_dir = Path(repo_path) / ".github"
    github_dir.mkdir(parents=True, exist_ok=True)
    
    success_count = 0
    
    for workflow_file in WORKFLOW_FILES:
        source_path = Path(workflow_file)
        dest_path = Path(repo_path) / workflow_file
        
        if source_path.exists():
            try:
                # Ensure destination directory exists
                dest_path.parent.mkdir(parents=True, exist_ok=True)
                
                # Copy file
                with open(source_path, 'r') as src:
                    content = src.read()
                
                with open(dest_path, 'w') as dst:
                    dst.write(content)
                
                print(f"✅ Copied {workflow_file}")
                success_count += 1
                
            except Exception as e:
                print(f"❌ Failed to copy {workflow_file}: {e}")
        else:
            print(f"⚠️ Source file {workflow_file} not found")
    
    return success_count > 0

def commit_and_push(repo_path: str, branch_name: str) -> bool:
    """Commit changes and push to remote."""
    print("💾 Committing and pushing changes...")
    
    # Configure git
    run_command('git config user.email "action@github.com"', cwd=repo_path)
    run_command('git config user.name "ProCityHub Bot Deployment"', cwd=repo_path)
    
    # Add all files
    success, output = run_command("git add .", cwd=repo_path)
    if not success:
        print(f"❌ Failed to add files: {output}")
        return False
    
    # Check if there are changes to commit
    success, output = run_command("git diff --cached --quiet", cwd=repo_path)
    if success:  # No changes
        print("ℹ️ No changes to commit")
        return True
    
    # Commit changes
    commit_message = "feat: deploy universal bot ecosystem across repository\n\n- Add universal CI/CD pipeline with language detection\n- Implement automated issue and PR management\n- Deploy AI/ML specialized validation and tracking\n- Add repository health monitoring and scoring\n- Configure automated release and deployment workflows\n- Set up Dependabot for dependency management\n\nThis deployment creates a comprehensive bot ecosystem that provides:\n✅ Automated code quality checks\n✅ Security scanning and vulnerability detection\n✅ Issue labeling and contributor welcome messages\n✅ Stale issue management\n✅ ML model and dataset validation\n✅ Repository health scoring\n✅ Automated releases based on commit messages\n✅ Dependency update management"
    
    success, output = run_command(f'git commit -m "{commit_message}"', cwd=repo_path)
    if not success:
        print(f"❌ Failed to commit: {output}")
        return False
    
    # Push to remote
    success, output = run_command(f"git push -u origin {branch_name}", cwd=repo_path)
    if success:
        print("✅ Successfully pushed changes")
        return True
    else:
        print(f"❌ Failed to push: {output}")
        return False

def create_pull_request(repo_name: str, branch_name: str) -> bool:
    """Create a pull request using GitHub CLI."""
    print("🔄 Creating pull request...")
    
    pr_title = "🤖 Deploy Universal Bot Ecosystem"
    pr_body = """## 🚀 Universal Bot Ecosystem Deployment

This PR deploys a comprehensive bot ecosystem across the repository with the following features:

### 🤖 **Universal CI/CD Pipeline**
- Automatic language detection (Python, TypeScript, Rust)
- Code quality checks and linting
- Security scanning with Trivy and TruffleHog
- Dependency vulnerability scanning

### 🏷️ **Issue & PR Management**
- Automatic labeling based on content and file changes
- Welcome messages for new contributors
- Stale issue and PR management
- Auto-assignment based on code ownership

### 🧠 **AI/ML Specialized Features** (for ML repositories)
- Model file validation (ONNX, PyTorch, scikit-learn)
- Dataset quality checks and validation
- Jupyter notebook validation
- ML-specific security scanning
- Experiment tracking and metadata collection

### 🏥 **Repository Health Monitoring**
- Comprehensive health checks and scoring
- Documentation quality assessment
- Security configuration validation
- CI/CD setup verification
- Dependency management evaluation

### 🚀 **Automated Release & Deployment**
- Semantic versioning based on commit messages
- Automated changelog generation
- Multi-language package building (Python, Node.js, Rust)
- Release notifications and tracking

### 📦 **Dependency Management**
- Dependabot configuration for all package ecosystems
- Weekly dependency updates
- Security vulnerability alerts
- Automated dependency PRs

## 🎯 **Benefits**

✅ **Improved Code Quality** - Automated linting, formatting, and security checks  
✅ **Better Project Management** - Automated issue labeling and contributor onboarding  
✅ **Enhanced Security** - Comprehensive vulnerability scanning and secret detection  
✅ **Streamlined Releases** - Automated versioning and package publishing  
✅ **Repository Health** - Continuous monitoring and improvement suggestions  
✅ **ML/AI Support** - Specialized validation for machine learning projects  

## 🔧 **Configuration**

All workflows are designed to be:
- **Language-agnostic** - Automatically detects and adapts to your project type
- **Non-intrusive** - Uses `continue-on-error` for most checks to avoid blocking
- **Configurable** - Easy to customize through workflow files
- **Secure** - Follows GitHub security best practices

## 📋 **Next Steps**

After merging this PR:
1. Review and customize workflow configurations if needed
2. Add any repository-specific secrets (PyPI tokens, npm tokens, etc.)
3. Configure code owners in `.github/CODEOWNERS` for auto-assignment
4. Monitor the Actions tab for workflow execution

The bot ecosystem will immediately start working to improve your repository's automation, security, and maintainability! 🎉"""

    cmd = f'gh pr create --repo ProCityHub/{repo_name} --title "{pr_title}" --body "{pr_body}" --head {branch_name} --base main'
    
    success, output = run_command(cmd)
    if success:
        print("✅ Successfully created pull request")
        print(f"🔗 PR URL: {output.strip()}")
        return True
    else:
        print(f"❌ Failed to create PR: {output}")
        return False

def deploy_to_repository(repo_name: str) -> bool:
    """Deploy bot workflows to a single repository."""
    print(f"\n🎯 Deploying to {repo_name}")
    print("=" * 50)
    
    repo_path = f"/tmp/{repo_name}"
    branch_name = f"codegen-bot/deploy-universal-bot-ecosystem-{int(time.time())}"
    
    # Step 1: Clone repository
    if not clone_repository(repo_name):
        return False
    
    # Step 2: Create branch
    if not create_branch(repo_path, branch_name):
        return False
    
    # Step 3: Copy workflow files
    if not copy_workflow_files(repo_path):
        return False
    
    # Step 4: Commit and push
    if not commit_and_push(repo_path, branch_name):
        return False
    
    # Step 5: Create pull request
    if not create_pull_request(repo_name, branch_name):
        return False
    
    print(f"🎉 Successfully deployed to {repo_name}!")
    return True

def main():
    """Main deployment function."""
    print("🤖 ProCityHub Universal Bot Deployment")
    print("=" * 50)
    print(f"📋 Deploying to {len(REPOSITORIES)} repositories")
    print(f"📁 Workflow files: {len(WORKFLOW_FILES)}")
    print()
    
    # Check if workflow files exist
    missing_files = []
    for workflow_file in WORKFLOW_FILES:
        if not Path(workflow_file).exists():
            missing_files.append(workflow_file)
    
    if missing_files:
        print("❌ Missing workflow files:")
        for file in missing_files:
            print(f"   - {file}")
        print("\nPlease ensure all workflow files are present before running deployment.")
        return
    
    # Check if GitHub CLI is available
    success, _ = run_command("gh --version")
    if not success:
        print("❌ GitHub CLI (gh) is not available. Please install it first.")
        return
    
    # Deploy to all repositories
    successful_deployments = []
    failed_deployments = []
    
    for repo_name in REPOSITORIES:
        try:
            if deploy_to_repository(repo_name):
                successful_deployments.append(repo_name)
            else:
                failed_deployments.append(repo_name)
        except KeyboardInterrupt:
            print("\n⚠️ Deployment interrupted by user")
            break
        except Exception as e:
            print(f"❌ Unexpected error deploying to {repo_name}: {e}")
            failed_deployments.append(repo_name)
        
        # Small delay between deployments
        time.sleep(2)
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 DEPLOYMENT SUMMARY")
    print("=" * 50)
    print(f"✅ Successful: {len(successful_deployments)}")
    print(f"❌ Failed: {len(failed_deployments)}")
    print(f"📈 Success Rate: {len(successful_deployments) / len(REPOSITORIES) * 100:.1f}%")
    
    if successful_deployments:
        print("\n✅ Successfully deployed to:")
        for repo in successful_deployments:
            print(f"   - {repo}")
    
    if failed_deployments:
        print("\n❌ Failed deployments:")
        for repo in failed_deployments:
            print(f"   - {repo}")
    
    print(f"\n🎉 Bot ecosystem deployment complete!")
    print("🔗 Check your GitHub repositories for the new pull requests.")

if __name__ == "__main__":
    main()
