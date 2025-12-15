"""
Gemini CLI Integration Wrapper
Provides Python interface to the Gemini CLI tool
"""

import os
import json
import subprocess
import asyncio
import tempfile
from typing import Dict, List, Optional, Any, Union
from dataclasses import dataclass
from pathlib import Path

@dataclass
class CLIConfig:
    """Configuration for Gemini CLI"""
    api_key: Optional[str] = None
    model: str = "gemini-2.0-flash-exp"
    temperature: float = 0.7
    max_tokens: int = 8192
    yolo_mode: bool = False  # Auto-approve tool usage
    verbose: bool = False

class GeminiCLI:
    """
    Python wrapper for Gemini CLI
    Integrates the powerful terminal-based AI agent into your Python applications
    """
    
    def __init__(self, config: Optional[CLIConfig] = None):
        """Initialize Gemini CLI wrapper"""
        self.config = config or CLIConfig()
        self.cli_path = self._find_cli_executable()
        
        # Setup environment
        self.env = os.environ.copy()
        if self.config.api_key:
            self.env["GEMINI_API_KEY"] = self.config.api_key
    
    def _find_cli_executable(self) -> str:
        """Find Gemini CLI executable"""
        # Check common installation paths
        possible_paths = [
            "gemini",  # In PATH
            os.path.expanduser("~/.local/bin/gemini"),
            "/usr/local/bin/gemini",
            "/opt/homebrew/bin/gemini",
        ]
        
        for path in possible_paths:
            try:
                result = subprocess.run([path, "--version"], 
                                      capture_output=True, text=True, timeout=5)
                if result.returncode == 0:
                    return path
            except (subprocess.TimeoutExpired, FileNotFoundError):
                continue
        
        raise RuntimeError("Gemini CLI not found. Install from: https://geminicli.com/install")
    
    def execute_command(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Execute a Gemini CLI command"""
        cmd = [self.cli_path]
        
        # Add configuration flags
        if self.config.model:
            cmd.extend(["--model", self.config.model])
        
        if self.config.temperature != 0.7:
            cmd.extend(["--temperature", str(self.config.temperature)])
        
        if self.config.max_tokens != 8192:
            cmd.extend(["--max-tokens", str(self.config.max_tokens)])
        
        if self.config.yolo_mode:
            cmd.append("--yolo")
        
        if self.config.verbose:
            cmd.append("--verbose")
        
        # Add additional flags from kwargs
        for key, value in kwargs.items():
            if key.startswith("--"):
                cmd.append(key)
                if value is not True:
                    cmd.append(str(value))
            elif key == "files":
                for file_path in value:
                    cmd.extend(["--file", file_path])
        
        # Add the prompt
        cmd.append(prompt)
        
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                env=self.env,
                timeout=300  # 5 minute timeout
            )
            
            return {
                "success": result.returncode == 0,
                "output": result.stdout,
                "error": result.stderr,
                "return_code": result.returncode,
                "command": " ".join(cmd)
            }
        
        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "output": "",
                "error": "Command timed out after 5 minutes",
                "return_code": -1,
                "command": " ".join(cmd)
            }
        except Exception as e:
            return {
                "success": False,
                "output": "",
                "error": str(e),
                "return_code": -1,
                "command": " ".join(cmd)
            }
    
    async def execute_command_async(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Execute Gemini CLI command asynchronously"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.execute_command, prompt, **kwargs)
    
    def analyze_code(self, file_paths: List[str], analysis_type: str = "review") -> Dict[str, Any]:
        """Analyze code files using Gemini CLI"""
        prompt = f"Analyze these code files for {analysis_type}. Provide detailed feedback on code quality, potential issues, and suggestions for improvement."
        
        return self.execute_command(
            prompt,
            files=file_paths,
            **{"--format": "json"} if analysis_type == "review" else {}
        )
    
    def generate_wii_game_code(self, game_type: str, requirements: str) -> Dict[str, Any]:
        """Generate Wii game code using Gemini CLI"""
        prompt = f"""
        Generate C code for a Wii {game_type} game with the following requirements:
        {requirements}
        
        The code should:
        - Use DevkitPro/libogc libraries
        - Include proper Wii Remote input handling
        - Implement basic game logic
        - Be well-commented and structured
        - Follow Wii homebrew best practices
        
        Provide complete, compilable code.
        """
        
        return self.execute_command(prompt, **{"--yolo": True})
    
    def optimize_ai_algorithm(self, algorithm_description: str, performance_data: Dict) -> Dict[str, Any]:
        """Optimize AI algorithms using Gemini CLI"""
        # Create temporary file with performance data
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(performance_data, f, indent=2)
            data_file = f.name
        
        try:
            prompt = f"""
            Optimize this AI algorithm based on the performance data:
            
            Algorithm Description:
            {algorithm_description}
            
            Analyze the performance data and suggest optimizations for:
            - Better accuracy
            - Improved response time
            - Reduced computational complexity
            - Enhanced player experience
            
            Provide specific code improvements and implementation suggestions.
            """
            
            result = self.execute_command(prompt, files=[data_file])
            
        finally:
            # Clean up temporary file
            os.unlink(data_file)
        
        return result
    
    def create_game_content(self, content_type: str, theme: str, difficulty: str) -> Dict[str, Any]:
        """Generate game content using Gemini CLI"""
        prompt = f"""
        Create {content_type} content for a Wii game with:
        - Theme: {theme}
        - Difficulty: {difficulty}
        
        Generate creative, engaging content that would enhance the gaming experience.
        Include implementation details and any necessary data structures.
        """
        
        return self.execute_command(prompt, **{"--creative": True})
    
    def debug_wii_code(self, code_file: str, error_description: str) -> Dict[str, Any]:
        """Debug Wii code using Gemini CLI"""
        prompt = f"""
        Debug this Wii homebrew code. The error/issue is:
        {error_description}
        
        Please:
        1. Identify the root cause of the issue
        2. Provide a fix with explanation
        3. Suggest improvements to prevent similar issues
        4. Ensure the fix follows Wii development best practices
        """
        
        return self.execute_command(prompt, files=[code_file])
    
    def generate_ai_strategy(self, game_context: Dict, player_data: Dict) -> Dict[str, Any]:
        """Generate AI strategy using Gemini CLI"""
        # Create context file
        context_data = {
            "game_context": game_context,
            "player_data": player_data
        }
        
        with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
            json.dump(context_data, f, indent=2)
            context_file = f.name
        
        try:
            prompt = """
            Generate an intelligent AI strategy based on the provided game context and player data.
            
            The strategy should:
            - Adapt to the player's skill level and play style
            - Provide appropriate challenge without frustration
            - Include specific behavioral patterns and decision trees
            - Consider real-time adaptation mechanisms
            
            Return the strategy as structured data that can be implemented in code.
            """
            
            result = self.execute_command(
                prompt, 
                files=[context_file],
                **{"--format": "json"}
            )
            
        finally:
            os.unlink(context_file)
        
        return result
    
    def interactive_session(self, initial_prompt: str) -> 'GeminiCLISession':
        """Start an interactive session with Gemini CLI"""
        return GeminiCLISession(self, initial_prompt)
    
    def batch_process(self, prompts: List[str], **kwargs) -> List[Dict[str, Any]]:
        """Process multiple prompts in batch"""
        results = []
        for prompt in prompts:
            result = self.execute_command(prompt, **kwargs)
            results.append(result)
        
        return results
    
    async def batch_process_async(self, prompts: List[str], **kwargs) -> List[Dict[str, Any]]:
        """Process multiple prompts asynchronously"""
        tasks = [self.execute_command_async(prompt, **kwargs) for prompt in prompts]
        return await asyncio.gather(*tasks)

class GeminiCLISession:
    """Interactive session with Gemini CLI"""
    
    def __init__(self, cli: GeminiCLI, initial_prompt: str):
        self.cli = cli
        self.session_history = [initial_prompt]
        self.session_file = None
        self._create_session_file()
    
    def _create_session_file(self):
        """Create a session file for context persistence"""
        self.session_file = tempfile.NamedTemporaryFile(
            mode='w+', suffix='.md', delete=False
        )
        self.session_file.write("# Gemini CLI Session\n\n")
        self.session_file.write(f"Initial prompt: {self.session_history[0]}\n\n")
        self.session_file.flush()
    
    def send_message(self, message: str) -> Dict[str, Any]:
        """Send a message in the session"""
        self.session_history.append(message)
        
        # Update session file
        with open(self.session_file.name, 'a') as f:
            f.write(f"User: {message}\n\n")
        
        # Execute with session context
        result = self.cli.execute_command(
            message,
            files=[self.session_file.name],
            **{"--continue": True}
        )
        
        # Add response to session file
        if result["success"]:
            with open(self.session_file.name, 'a') as f:
                f.write(f"Gemini: {result['output']}\n\n")
        
        return result
    
    def close(self):
        """Close the session and clean up"""
        if self.session_file:
            os.unlink(self.session_file.name)
            self.session_file = None

# Convenience functions
def quick_cli_command(prompt: str, **kwargs) -> str:
    """Quick CLI command execution"""
    cli = GeminiCLI()
    result = cli.execute_command(prompt, **kwargs)
    return result["output"] if result["success"] else result["error"]

def analyze_wii_project(project_path: str) -> Dict[str, Any]:
    """Analyze an entire Wii project"""
    cli = GeminiCLI()
    
    # Find relevant files
    project_dir = Path(project_path)
    code_files = []
    
    for ext in ['.c', '.cpp', '.h', '.hpp']:
        code_files.extend(project_dir.rglob(f'*{ext}'))
    
    if not code_files:
        return {"error": "No code files found in project"}
    
    # Limit to reasonable number of files
    code_files = [str(f) for f in code_files[:20]]
    
    return cli.analyze_code(code_files, "comprehensive_review")

# Example usage and testing
if __name__ == "__main__":
    async def main():
        # Initialize CLI
        cli = GeminiCLI(CLIConfig(yolo_mode=True, verbose=True))
        
        # Test basic command
        result = cli.execute_command("Explain how to optimize Wii Remote input processing")
        print(f"Basic command result: {result['output'][:200]}...")
        
        # Test code generation
        game_result = cli.generate_wii_game_code(
            "tennis",
            "Simple tennis game with AI opponent, score tracking, and basic physics"
        )
        print(f"Game code generation: {'Success' if game_result['success'] else 'Failed'}")
        
        # Test interactive session
        session = cli.interactive_session("Help me optimize my Wii Sports AI")
        response1 = session.send_message("What are the key factors for tennis AI?")
        response2 = session.send_message("How can I implement adaptive difficulty?")
        session.close()
        
        print(f"Session responses: {len(response1['output'])} and {len(response2['output'])} chars")
        
        # Test async batch processing
        prompts = [
            "Generate bowling physics calculations",
            "Create tennis ball trajectory algorithm",
            "Design boxing AI decision tree"
        ]
        
        batch_results = await cli.batch_process_async(prompts)
        print(f"Batch processing completed: {len(batch_results)} results")
    
    asyncio.run(main())
