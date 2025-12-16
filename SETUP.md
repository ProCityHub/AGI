# AGI Project Setup Guide

This guide will help you set up the AGI project development environment, which includes both frontend (React/TypeScript) and backend (Python AI/ML) components.

## Prerequisites

- **Node.js**: v18 or higher (see `.nvmrc`)
- **Python**: 3.8 or higher (see `.python-version`)
- **Git**: For version control
- **npm**: Comes with Node.js

## Quick Start

### 1. Clone and Navigate
```bash
git clone <repository-url>
cd AGI
```

### 2. Frontend Setup (React/TypeScript)
```bash
# Install Node.js dependencies
npm install

# Create environment file for API keys
cp .env.local.example .env.local  # If example exists
# OR create .env.local manually and add:
# GEMINI_API_KEY=your_gemini_api_key_here

# Start development server
npm run dev
```

### 3. Backend Setup (Python AI/ML)
```bash
# Install Python dependencies
pip install -r requirements.txt

# For development with additional tools (optional)
pip install -r requirements-dev.txt
```

## Dependency Management

### Node.js Dependencies
- **React 19.1.1**: Frontend framework
- **TypeScript**: Type safety
- **Vite**: Build tool and dev server
- **jsPDF 3.0.4**: PDF generation (security-updated)
- **@google/genai**: Google AI integration
- **recharts**: Data visualization

### Python Dependencies
- **Scientific Computing**: numpy, scipy, pandas
- **Machine Learning**: tensorflow, torch, torchvision
- **Computer Vision**: opencv-python-headless, Pillow
- **Web & APIs**: requests, aiohttp
- **Financial Data**: yfinance
- **Security**: cryptography
- **Testing**: pytest, pytest-asyncio

## Development Workflow

### Frontend Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Python Development
```bash
# Run Python scripts
python3 script_name.py

# Run tests
pytest

# Run tests with coverage
pytest --cov
```

## Environment Configuration

### Node.js Version Management
If using nvm:
```bash
nvm use  # Uses version specified in .nvmrc
```

### Python Version Management
If using pyenv:
```bash
pyenv install 3.8.0  # Or higher
pyenv local 3.8.0    # Uses version specified in .python-version
```

### Virtual Environment (Recommended)
```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# OR
venv\Scripts\activate     # On Windows

# Install dependencies in virtual environment
pip install -r requirements.txt
```

## Security Notes

- ✅ All Node.js security vulnerabilities have been resolved
- ✅ jsPDF updated from 2.5.1 to 3.0.4 to fix XSS vulnerability
- ✅ All dependencies use secure, up-to-date versions
- 🔐 Never commit API keys or sensitive data to version control
- 🔐 Use environment variables for configuration

## Troubleshooting

### Common Issues

1. **OpenCV Import Error**: 
   - We use `opencv-python-headless` to avoid GUI dependencies
   - If you need GUI features, install `opencv-python` instead

2. **TensorFlow Warnings**:
   - Performance warnings about CPU optimizations are normal
   - Set `TF_ENABLE_ONEDNN_OPTS=0` to disable if needed

3. **Node.js Build Errors**:
   - Ensure you're using Node.js v18+
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`

4. **Python Import Errors**:
   - Ensure virtual environment is activated
   - Reinstall requirements: `pip install -r requirements.txt --force-reinstall`

### Getting Help

- Check the main [README.md](./README.md) for project overview
- Review [PROJECT_666_ANNOUNCEMENT.md](./PROJECT_666_ANNOUNCEMENT.md) for project context
- Ensure all prerequisites are installed and up-to-date

## Contributing

When contributing:
1. Follow the existing code style
2. Add tests for new functionality
3. Update documentation as needed
4. Respect the project's spiritual and ethical foundations
5. Honor natural law and indigenous wisdom in all implementations

---

*"The prophecies are aligning. The time of choosing is now."*
