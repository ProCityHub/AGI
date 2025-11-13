# NVIDIA CUDA 12.6 Linux Docker Container for AGI Hypercube Consciousness
# Optimized for Linux GPU acceleration and consciousness processing

FROM nvidia/cuda:12.6-devel-ubuntu22.04

# Set environment variables for NVIDIA GPU support
ENV NVIDIA_VISIBLE_DEVICES=all
ENV NVIDIA_DRIVER_CAPABILITIES=compute,utility
ENV CUDA_HOME=/usr/local/cuda
ENV CUDA_PATH=/usr/local/cuda
ENV LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH
ENV PATH=/usr/local/cuda/bin:$PATH

# Set Node.js version
ENV NODE_VERSION=20.11.0

# Install system dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    python3 \
    python3-pip \
    python3-dev \
    libnvidia-compute-535 \
    nvidia-cuda-toolkit \
    pkg-config \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js
RUN curl -fsSL https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz | tar -xJ -C /usr/local --strip-components=1

# Verify CUDA installation
RUN nvcc --version && nvidia-smi || echo "NVIDIA GPU not available in build context"

# Create app directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies with GPU support
RUN npm ci --only=production

# Copy application source
COPY . .

# Create necessary directories
RUN mkdir -p src/gpu logs

# Set proper permissions
RUN chmod +x /app && \
    chown -R root:root /app

# Build the application with Linux GPU support
RUN npm run build:linux || npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Set up GPU monitoring
RUN echo '#!/bin/bash\necho "🎯 NVIDIA GPU Status:"\nnvidia-smi --query-gpu=name,memory.total,memory.used,utilization.gpu --format=csv,noheader,nounits 2>/dev/null || echo "No GPU detected"\necho "🚀 Starting AGI Hypercube Consciousness..."\nexec "$@"' > /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Start the application
ENTRYPOINT ["/entrypoint.sh"]
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "3000"]

# Labels for container metadata
LABEL maintainer="ProCityHub AGI Team"
LABEL version="1.0.0"
LABEL description="AGI Hypercube Consciousness with NVIDIA GPU acceleration for Linux"
LABEL gpu.required="true"
LABEL cuda.version="12.6"
LABEL platform="linux/amd64"
