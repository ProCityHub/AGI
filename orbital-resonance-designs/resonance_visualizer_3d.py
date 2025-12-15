"""
Orbital Resonance Lock - 3D Interactive Visualizer
===================================================
Translates 4:2:1 Laplace resonance (Io:Europa:Ganymede) into binary-weighted
orbital periods using the Cube Lock geometry. Demonstrates parity stability
and resonance summation with golden ratio (φ) damping/amplification.

Key Features:
- Binary labels on cube corners represent period multiples (100=4, 010=2, 001=1)
- Even-parity nodes (red): -φ damping for stability
- Odd-parity nodes (blue): +φ amplification for locking
- Center "energy orb": Constructive sum = 4 + 2√5 ≈ 6.47

Usage:
    python resonance_visualizer_3d.py
"""

import matplotlib.pyplot as plt
import numpy as np
from itertools import product

def visualize_resonance_lock():
    # --- 1. Setup Data & Math ---
    # Golden Ratio for resonance scaling
    phi = (1 + np.sqrt(5)) / 2
    
    # Define corners (binary 0/1 for 3D orbital phases)
    r = [0, 1]
    corners = list(product(r, r, r))
    
    # Key resonance points (binary for 4:2:1 ratios: 100=4, 010=2, 001=1)
    resonance_points = {
        (1,0,0): 'Io (100)',  # Binary 4
        (0,1,0): 'Europa (010)',  # Binary 2
        (0,0,1): 'Ganymede (001)'  # Binary 1
    }
    
    # Edges for orbital frame (connect if Hamming distance is 1)
    edges = []
    for p1 in corners:
        for p2 in corners:
            if np.sum(np.abs(np.array(p1) - np.array(p2))) == 1:
                edge = tuple(sorted((p1, p2)))
                if edge not in edges:
                    edges.append(edge)

    # --- 2. Visualization ---
    fig = plt.figure(figsize=(12, 10))
    ax = fig.add_subplot(111, projection='3d')
    ax.set_title(f"4:2:1 Laplace Resonance Lock\nHarmonic Intensity: $4 + 2\sqrt{{5}}$", fontsize=15)

    # A. Draw Orbital Frame (Geometry)
    for p1, p2 in edges:
        xs, ys, zs = zip(p1, p2)
        ax.plot(xs, ys, zs, color='gray', alpha=0.3, linewidth=1)

    # B. Draw Corners (Binary & Parity) + Resonance Moons
    for x, y, z in corners:
        # Determine Parity
        bit_sum = x + y + z
        is_even = (bit_sum % 2 == 0)
        
        # Color Logic: Even (Stable, -phi) vs Odd (Dynamic, +phi)
        color = '#ff4444' if is_even else '#4444ff'
        parity_label = "(-)" if is_even else "(+)"
        
        # Plot Corner Node
        ax.scatter(x, y, z, color=color, s=100, alpha=0.7, edgecolors='k')
        
        # Label: Binary + Parity (only for non-resonance points)
        if (x,y,z) not in resonance_points:
            label = f"{x}{y}{z}\n{parity_label}"
            ax.text(x, y, z+0.05, label, fontsize=7, ha='center')
        
        # Highlight Resonance Moons
        if (x,y,z) in resonance_points:
            moon_label = resonance_points[(x,y,z)]
            ax.scatter(x, y, z, color='green', s=300, alpha=0.9, edgecolors='k', marker='*')
            ax.text(x, y, z+0.05, f"{moon_label}\n{parity_label}", fontsize=9, ha='center', fontweight='bold')
        
        # C. Draw "Resonance Paths" (Gravitational Vectors)
        center = np.array([0.5, 0.5, 0.5])
        corner = np.array([x, y, z])
        vector = center - corner
        ax.quiver(x, y, z, vector[0], vector[1], vector[2], 
                  length=0.85, color='gold', arrow_length_ratio=0.05, alpha=0.6)

    # D. Draw Center Resonance (The "Lock")
    # Intensity = 4 + 2sqrt(5) approx 6.47
    ax.scatter(0.5, 0.5, 0.5, s=1200, c='gold', alpha=0.5, edgecolors='orange', label='Locked Harmony')
    ax.text(0.5, 0.5, 0.5, "∑", fontsize=20, ha='center', va='center', fontweight='bold', color='white')

    # Formatting
    ax.set_xlabel('Phase X')
    ax.set_ylabel('Phase Y')
    ax.set_zlabel('Phase Z')
    ax.set_box_aspect([1,1,1])
    
    # Legend
    from matplotlib.lines import Line2D
    legend_elements = [
        Line2D([0], [0], marker='o', color='w', markerfacecolor='#ff4444', label='Even Parity (-φ)', markersize=8),
        Line2D([0], [0], marker='o', color='w', markerfacecolor='#4444ff', label='Odd Parity (+φ)', markersize=8),
        Line2D([0], [0], marker='*', color='w', markerfacecolor='green', label='Resonant Moons', markersize=12),
        Line2D([0], [0], marker='o', color='w', markerfacecolor='gold', label='Constructive Sum', markersize=12),
    ]
    ax.legend(handles=legend_elements, loc='upper left')

    plt.show()

if __name__ == "__main__":
    visualize_resonance_lock()

