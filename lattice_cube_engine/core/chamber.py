"""
Lattice Chamber.
Author and concept origin: Adrien D. Thomas

Models the six-wall 0.6 artifact and eight capacitor corner nodes.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List


@dataclass(frozen=True)
class CubeWall:
    """One reflective wall of the Lattice Cube."""
    name: str
    scalar: float = 0.1


@dataclass(frozen=True)
class CapacitorCorner:
    """One capacitor corner node of the Lattice Cube."""
    name: str
    polarity: int
    charge: float = 0.125


class LatticeChamber:
    """
    Six walls + eight capacitor corners.

    Six walls sum to 0.6.
    Corners alternate polarity to represent positive / negative capacitor states.
    """

    def __init__(self) -> None:
        self.walls: List[CubeWall] = [
            CubeWall(name=f"Wall_{index + 1}", scalar=0.1)
            for index in range(6)
        ]

        self.corners: List[CapacitorCorner] = [
            CapacitorCorner(
                name=f"Corner_{index + 1}",
                polarity=1 if index % 2 == 0 else -1,
                charge=0.125,
            )
            for index in range(8)
        ]

    def wall_sum(self) -> float:
        """Return six-wall artifact sum."""
        return float(sum(wall.scalar for wall in self.walls))

    def corner_charge(self) -> float:
        """
        Return net signed capacitor charge.

        Alternating polarity should keep the chamber balanced around center.
        """
        return float(sum(corner.polarity * corner.charge for corner in self.corners))

    def reflect_vector(self, vector: List[float]) -> List[float]:
        """
        Reflect a numeric vector through all six walls.

        Each wall contributes vector * wall.scalar.
        The output is the cumulative reflected vector.
        """
        reflected = [0.0 for _ in vector]

        for wall in self.walls:
            for index, value in enumerate(vector):
                reflected[index] += float(value) * wall.scalar

        return reflected

    def export_chamber_state(self) -> Dict[str, object]:
        """Return a serializable chamber state snapshot."""
        return {
            "author": "Adrien D. Thomas",
            "engine": "LatticeChamber",
            "wall_count": len(self.walls),
            "corner_count": len(self.corners),
            "wall_sum": self.wall_sum(),
            "corner_charge": self.corner_charge(),
            "walls": [wall.__dict__ for wall in self.walls],
            "corners": [corner.__dict__ for corner in self.corners],
        }
