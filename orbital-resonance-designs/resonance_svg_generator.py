"""
Celestial Blueprint Generator - 2D Vector Schematic (SVG)
==========================================================
Generates a clean, print-ready isometric diagram of the 4:2:1 Laplace resonance
using binary-weighted orbital periods and parity-based stability indicators.

Features:
- Isometric projection of the binary cube geometry
- Binary labels for orbital period ratios (100=Io/4, 010=Europa/2, 001=Ganymede/1)
- Color-coded parity system (red=stable/-φ, blue=dynamic/+φ)
- Dashed resonance paths converging to central harmonic lock
- Gold center orb representing constructive sum (4 + 2√5 ≈ 6.47)

Output:
    resonance_lock.svg - Scalable vector graphic for web/print

Usage:
    python resonance_svg_generator.py
"""

import math

def generate_resonance_svg(filename="resonance_lock.svg"):
    # SVG Parameters
    width, height = 600, 600
    cx, cy = width / 2, height / 2
    scale = 150  # Size of the orbital frame
    
    # Colors
    color_even = "#D32F2F"  # Red (stable)
    color_odd = "#1976D2"   # Blue (dynamic)
    color_resonant = "#4CAF50"  # Green (moons)
    color_link = "#FFC107"  # Gold (resonance)
    
    # 3D to 2D Projection (Isometric)
    def project(x, y, z):
        iso_x = (x - y) * math.cos(math.pi / 6) * scale + cx
        iso_y = (x + y) * math.sin(math.pi / 6) * scale - (z * scale) + cy + 50
        return iso_x, iso_y

    # Corners
    corners = [(x, y, z) for z in [0, 1] for y in [0, 1] for x in [0, 1]]
    
    # Resonance points
    resonance_points = {
        (1,0,0): ('Io (100)', color_resonant),
        (0,1,0): ('Europa (010)', color_resonant),
        (0,0,1): ('Ganymede (001)', color_resonant)
    }

    svg_content = [f'<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">']
    svg_content.append(f'<rect width="100%" height="100%" fill="white"/>')
    
    # 1. Draw Paths to Center (Resonance Flow)
    center_proj = project(0.5, 0.5, 0.5)
    for c in corners:
        px, py = project(*c)
        svg_content.append(f'<line x1="{px}" y1="{py}" x2="{center_proj[0]}" y2="{center_proj[1]}" '
                           f'stroke="{color_link}" stroke-width="2" stroke-dasharray="5,5" opacity="0.6"/>')

    # 2. Draw Orbital Edges (Geometry)
    for i, c1 in enumerate(corners):
        for c2 in corners[i+1:]:
            dist = abs(c1[0]-c2[0]) + abs(c1[1]-c2[1]) + abs(c1[2]-c2[2])
            if dist == 1:
                x1, y1 = project(*c1)
                x2, y2 = project(*c2)
                svg_content.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#333" stroke-width="2"/>')

    # 3. Draw Nodes (Binary & Parity)
    for c in corners:
        x, y, z = c
        px, py = project(x, y, z)
        
        # Parity Check
        parity = (x + y + z) % 2
        fill = color_even if parity == 0 else color_odd
        if c in resonance_points:
            label, fill = resonance_points[c]
            amp_text = "Lock"
        else:
            amp_text = "-φ" if parity == 0 else "+φ"
            label = f"{x}{y}{z}"
        
        # Node Circle
        svg_content.append(f'<circle cx="{px}" cy="{py}" r="20" fill="{fill}" stroke="#000" stroke-width="1"/>')
        
        # Text Label (Binary/Resonant)
        svg_content.append(f'<text x="{px}" y="{py-25}" font-family="monospace" font-size="14" '
                           f'text-anchor="middle" fill="#000" font-weight="bold">{label}</text>')
        # Text Label (Amp/Resonance)
        svg_content.append(f'<text x="{px}" y="{py+5}" font-family="sans-serif" font-size="12" '
                           f'text-anchor="middle" fill="white">{amp_text}</text>')

    # 4. Draw Center Lock
    svg_content.append(f'<circle cx="{center_proj[0]}" cy="{center_proj[1]}" r="15" fill="gold" stroke="orange" stroke-width="3"/>')
    svg_content.append(f'<text x="{center_proj[0]}" y="{center_proj[1]+35}" font-family="sans-serif" font-size="14" '
                       f'text-anchor="middle" fill="#333" font-weight="bold">I ≈ 6.47</text>')

    svg_content.append('</svg>')
    
    with open(filename, "w") as f:
        f.write("\n".join(svg_content))
    print(f"SVG generated: {filename}")

if __name__ == "__main__":
    generate_resonance_svg()

