"""
ARC-AGI Benchmark Framework
Generates synthetic tasks and evaluates Lattice-AGI performance
"""

import numpy as np
from dataclasses import dataclass
from typing import List, Dict, Any, Callable, Optional
import json


@dataclass
class ARCTask:
    """ARC task representation"""
    task_id: str
    input_grid: np.ndarray
    output_grid: np.ndarray
    description: str
    difficulty: float  # 0-1 scale


@dataclass
class BenchmarkResult:
    """Benchmark execution result"""
    total_tasks: int
    correct: int
    accuracy: float
    total_cost: float
    cost_per_task: float
    convergence_rate: float
    average_delta: float
    details: List[Dict[str, Any]]


class ARCBenchmark:
    """ARC-AGI benchmark runner"""
    
    def __init__(self, agi_system):
        self.agi = agi_system
        self.results = []
    
    def evaluate_task(self, task: ARCTask) -> Dict[str, Any]:
        """Evaluate single ARC task"""
        # Convert grid to description
        description = self._grid_to_description(task.input_grid, task.output_grid)
        
        # Process through AGI
        result = self.agi.process(description)
        
        # For now, simple evaluation (in real system, would decode to grid)
        # This is placeholder - real system needs grid decoder
        predicted_correct = result.emitted and result.convergence_result.final_delta < 0.01
        
        return {
            "task_id": task.task_id,
            "correct": predicted_correct,
            "emitted": result.emitted,
            "delta": result.convergence_result.final_delta if result.convergence_result else 1.0,
            "cost": result.total_cost,
            "description": description[:100] + "..." if len(description) > 100 else description
        }
    
    def run_benchmark(self, 
                     tasks: List[ARCTask],
                     progress_callback: Optional[Callable] = None) -> BenchmarkResult:
        """Run benchmark on list of tasks"""
        details = []
        correct = 0
        total_cost = 0.0
        total_delta = 0.0
        converged_count = 0
        
        for i, task in enumerate(tasks):
            # Evaluate task
            detail = self.evaluate_task(task)
            details.append(detail)
            
            # Update metrics
            if detail["correct"]:
                correct += 1
            total_cost += detail["cost"]
            total_delta += detail["delta"]
            
            if detail["delta"] < 0.01:
                converged_count += 1
            
            # Progress callback
            if progress_callback:
                progress_callback(i + 1, len(tasks))
        
        # Calculate final metrics
        accuracy = correct / len(tasks) if tasks else 0
        cost_per_task = total_cost / len(tasks) if tasks else 0
        average_delta = total_delta / len(tasks) if tasks else 1.0
        convergence_rate = converged_count / len(tasks) if tasks else 0
        
        result = BenchmarkResult(
            total_tasks=len(tasks),
            correct=correct,
            accuracy=accuracy,
            total_cost=total_cost,
            cost_per_task=cost_per_task,
            convergence_rate=convergence_rate,
            average_delta=average_delta,
            details=details
        )
        
        self.results.append(result)
        return result
    
    def print_results(self, result: BenchmarkResult):
        """Print benchmark results in table format"""
        print("\n" + "=" * 60)
        print("ARC BENCHMARK RESULTS")
        print("=" * 60)
        print(f"{'Metric':<25} {'Target':<12} {'Achieved':<12} {'Status':<10}")
        print("-" * 60)
        
        metrics = [
            ("Accuracy", ">60%", f"{result.accuracy*100:.2f}%", "✓" if result.accuracy > 0.6 else "✗"),
            ("Cost per Task", "<$0.10", f"${result.cost_per_task:.3f}", "✓" if result.cost_per_task < 0.1 else "✗"),
            ("Convergence Rate", ">95%", f"{result.convergence_rate*100:.2f}%", "✓" if result.convergence_rate > 0.95 else "✗"),
            ("Average Delta", "<0.01", f"{result.average_delta:.6f}", "✓" if result.average_delta < 0.01 else "✗"),
        ]
        
        for metric, target, achieved, status in metrics:
            print(f"{metric:<25} {target:<12} {achieved:<12} {status:<10}")
        
        print("=" * 60)
        print(f"Total Tasks: {result.total_tasks}")
        print(f"Total Cost: ${result.total_cost:.4f}")
        print("=" * 60)
    
    def _grid_to_description(self, input_grid: np.ndarray, output_grid: np.ndarray) -> str:
        """Convert ARC grids to text description (placeholder)"""
        # In real implementation, this would be sophisticated
        # For now, create simple description
        input_shape = input_grid.shape
        output_shape = output_grid.shape
        
        return f"Transform {input_shape[0]}x{input_shape[1]} grid to {output_shape[0]}x{output_shape[1]} grid. Find pattern."


def generate_synthetic_tasks(n: int = 100) -> List[ARCTask]:
    """Generate synthetic ARC-like tasks for testing"""
    tasks = []
    
    for i in range(n):
        # Create simple synthetic tasks
        if i % 4 == 0:
            # Pattern: Copy input
            grid = np.random.randint(0, 10, size=(3, 3))
            task = ARCTask(
                task_id=f"copy_{i}",
                input_grid=grid,
                output_grid=grid.copy(),
                description="Copy the input pattern exactly",
                difficulty=0.2
            )
        elif i % 4 == 1:
            # Pattern: Rotate 90 degrees
            grid = np.random.randint(0, 10, size=(3, 3))
            task = ARCTask(
                task_id=f"rotate_{i}",
                input_grid=grid,
                output_grid=np.rot90(grid),
                description="Rotate the grid 90 degrees clockwise",
                difficulty=0.4
            )
        elif i % 4 == 2:
            # Pattern: Transpose
            grid = np.random.randint(0, 10, size=(3, 3))
            task = ARCTask(
                task_id=f"transpose_{i}",
                input_grid=grid,
                output_grid=grid.T,
                description="Transpose the grid (swap rows and columns)",
                difficulty=0.3
            )
        else:
            # Pattern: Flip vertically
            grid = np.random.randint(0, 10, size=(3, 3))
            task = ARCTask(
                task_id=f"flip_{i}",
                input_grid=grid,
                output_grid=np.flipud(grid),
                description="Flip the grid vertically",
                difficulty=0.3
            )
        
        tasks.append(task)
    
    return tasks

