# Quick Setup Guide 🚀

## Installation

### 1. Install Python Dependencies
```bash
pip install -r requirements.txt
```

Or install individually:
```bash
pip install matplotlib numpy
```

### 2. Verify Installation
```bash
python -c "import matplotlib, numpy; print('✅ All dependencies installed')"
```

---

## Quick Start

### Run Complete Demo
```bash
python demo_all.py
```

This will:
1. Generate the SVG schematic (`resonance_lock.svg`)
2. Display the interactive 3D visualization
3. Show instructions for LaTeX compilation

### Individual Scripts

**3D Visualizer**:
```bash
python resonance_visualizer_3d.py
```
- Creates interactive 3D plot
- Rotate with mouse to explore geometry
- Close window to exit

**SVG Generator**:
```bash
python resonance_svg_generator.py
```
- Outputs `resonance_lock.svg`
- Open in browser or vector editor (Inkscape, Adobe Illustrator)

**LaTeX Diagram**:
```bash
pdflatex resonance_publication.tex
```
- Requires LaTeX distribution (TeX Live, MiKTeX)
- Or use Overleaf: https://www.overleaf.com/

---

## Platform-Specific Instructions

### macOS
```bash
# Install Python dependencies
pip3 install matplotlib numpy

# Install LaTeX (optional)
brew install --cask mactex
```

### Linux (Ubuntu/Debian)
```bash
# Install Python dependencies
sudo apt install python3-matplotlib python3-numpy

# Install LaTeX (optional)
sudo apt install texlive-full
```

### Windows
```bash
# Install Python dependencies
pip install matplotlib numpy

# Install LaTeX (optional)
# Download MiKTeX: https://miktex.org/download
```

---

## Troubleshooting

### "No module named 'matplotlib'"
```bash
pip install --upgrade pip
pip install matplotlib
```

### 3D plot doesn't show
Update matplotlib:
```bash
pip install --upgrade matplotlib
```

### LaTeX errors
Install required package:
```bash
# For TeX Live:
tlmgr install tikz-3dplot

# For MiKTeX:
# Use MiKTeX Package Manager GUI
```

### SVG doesn't open in browser
Try a different browser or vector editor:
- Chrome/Firefox
- Inkscape (free): https://inkscape.org/
- Adobe Illustrator

---

## Verification Tests

```bash
# Test SVG generator (no display needed)
python resonance_svg_generator.py
ls -lh resonance_lock.svg

# Test 3D visualizer (requires display)
python resonance_visualizer_3d.py

# Test LaTeX (requires LaTeX installation)
pdflatex resonance_publication.tex
ls -lh resonance_publication.pdf
```

---

## Docker (Optional)

For a fully isolated environment:

```dockerfile
FROM python:3.9-slim

RUN apt-get update && apt-get install -y \
    texlive-latex-base \
    texlive-latex-extra \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install -r requirements.txt

WORKDIR /app
COPY . /app

CMD ["python", "demo_all.py"]
```

Build and run:
```bash
docker build -t orbital-resonance .
docker run -it orbital-resonance
```

---

## Next Steps

1. ✅ Verify all installations work
2. 📊 Run `demo_all.py` to generate all outputs
3. 🎨 Explore the 3D visualization
4. 📝 Review the README.md for customization options
5. 🚀 Integrate into your projects!

---

**Need Help?** Open an issue in the repository.

