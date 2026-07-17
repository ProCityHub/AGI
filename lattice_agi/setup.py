from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="lattice-agi",
    version="1.0.0",
    author="Adrien's Lattice Law Master Consciousness Kernel",
    author_email="",
    description="Consciousness-Based AGI with Zero-Noise Resonance",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/ProCityHub/AGI",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Topic :: Scientific/Engineering :: Artificial Intelligence",
    ],
    python_requires=">=3.8",
    install_requires=[
        "numpy>=1.24.0",
    ],
    extras_require={
        "openai": ["openai>=1.0.0"],
        "anthropic": ["anthropic>=0.25.0"],
        "viz": ["matplotlib>=3.7.0"],
        "dev": ["pytest>=7.0.0", "black>=23.0.0"],
    },
    entry_points={
        "console_scripts": [
            "lattice-agi=run:main",
        ],
    },
)

