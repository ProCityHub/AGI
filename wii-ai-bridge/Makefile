# Makefile for Wii AI Gaming Bridge
# Builds both AI components and Wii homebrew applications

# DevkitPro paths
DEVKITPRO := /opt/devkitpro
DEVKITPPC := $(DEVKITPRO)/devkitPPC
LIBOGC_INC := $(DEVKITPRO)/libogc/include
LIBOGC_LIB := $(DEVKITPRO)/libogc/lib/wii

# Compiler settings
CC := $(DEVKITPPC)/bin/powerpc-eabi-gcc
CXX := $(DEVKITPPC)/bin/powerpc-eabi-g++
AR := $(DEVKITPPC)/bin/powerpc-eabi-ar
OBJCOPY := $(DEVKITPPC)/bin/powerpc-eabi-objcopy

# Flags
CFLAGS := -g -O2 -Wall -Wextra $(MACHDEP) $(INCLUDE)
CXXFLAGS := $(CFLAGS)
LDFLAGS := -g $(MACHDEP) -Wl,-Map,$(notdir $@).map

# Architecture
MACHDEP := -DGEKKO -mrvl -mcpu=750 -meabi -mhard-float

# Include paths
INCLUDE := -I$(LIBOGC_INC) -I$(DEVKITPRO)/portlibs/wii/include -Iwii/include -Icore/include

# Library paths
LIBPATHS := -L$(LIBOGC_LIB) -L$(DEVKITPRO)/portlibs/wii/lib

# Libraries
LIBS := -lwiiuse -lbte -logc -lm -lwiikeyboard -lfat

# Source directories
WII_SRCDIR := wii
CORE_SRCDIR := core
GAMES_SRCDIR := games
BUILD_DIR := build
DIST_DIR := dist

# Source files
WII_SOURCES := $(wildcard $(WII_SRCDIR)/*.c)
WII_OBJECTS := $(WII_SOURCES:$(WII_SRCDIR)/%.c=$(BUILD_DIR)/%.o)

# Targets
TARGET := wii-ai-bridge
DOL_TARGET := $(DIST_DIR)/$(TARGET).dol
ELF_TARGET := $(BUILD_DIR)/$(TARGET).elf

# Python AI components
PYTHON_SOURCES := $(wildcard $(CORE_SRCDIR)/*.py $(GAMES_SRCDIR)/*.py)

.PHONY: all clean wii python install setup-devkit

all: wii python

# Build Wii homebrew application
wii: $(DOL_TARGET)

$(DOL_TARGET): $(ELF_TARGET) | $(DIST_DIR)
	@echo "Creating DOL file..."
	$(OBJCOPY) -O binary $< $@
	@echo "Wii homebrew application built: $@"

$(ELF_TARGET): $(WII_OBJECTS) | $(BUILD_DIR)
	@echo "Linking ELF file..."
	$(CC) $(LDFLAGS) $(WII_OBJECTS) $(LIBPATHS) $(LIBS) -o $@

$(BUILD_DIR)/%.o: $(WII_SRCDIR)/%.c | $(BUILD_DIR)
	@echo "Compiling $<..."
	$(CC) $(CFLAGS) -c $< -o $@

# Build Python AI components
python:
	@echo "Setting up Python AI environment..."
	python3 -m pip install -r requirements.txt
	@echo "Python AI components ready"

# Create directories
$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

$(DIST_DIR):
	mkdir -p $(DIST_DIR)

# Install to SD card (customize SD_PATH as needed)
SD_PATH := /media/sd
install: $(DOL_TARGET)
	@echo "Installing to SD card..."
	mkdir -p $(SD_PATH)/apps/$(TARGET)
	cp $(DOL_TARGET) $(SD_PATH)/apps/$(TARGET)/boot.dol
	cp meta.xml $(SD_PATH)/apps/$(TARGET)/ 2>/dev/null || true
	cp icon.png $(SD_PATH)/apps/$(TARGET)/ 2>/dev/null || true
	@echo "Installation complete"

# Setup DevkitPro environment
setup-devkit:
	@echo "Setting up DevkitPro environment..."
	@if [ ! -d "$(DEVKITPRO)" ]; then \
		echo "DevkitPro not found. Please install DevkitPro first."; \
		echo "Visit: https://devkitpro.org/wiki/Getting_Started"; \
		exit 1; \
	fi
	@echo "DevkitPro environment ready"

# Clean build files
clean:
	@echo "Cleaning build files..."
	rm -rf $(BUILD_DIR)
	rm -rf $(DIST_DIR)
	find . -name "*.pyc" -delete
	find . -name "__pycache__" -delete
	@echo "Clean complete"

# Development server for AI testing
dev-server:
	@echo "Starting AI development server..."
	cd $(CORE_SRCDIR) && python3 -m uvicorn ai_server:app --reload --host 0.0.0.0 --port 8080

# Run AI tests
test-ai:
	@echo "Running AI component tests..."
	python3 -m pytest tests/ -v

# Package for distribution
package: all
	@echo "Creating distribution package..."
	mkdir -p $(DIST_DIR)/package
	cp $(DOL_TARGET) $(DIST_DIR)/package/
	cp -r $(CORE_SRCDIR) $(DIST_DIR)/package/
	cp -r $(GAMES_SRCDIR) $(DIST_DIR)/package/
	cp requirements.txt $(DIST_DIR)/package/
	cp README.md $(DIST_DIR)/package/
	cd $(DIST_DIR) && tar -czf wii-ai-bridge-$(shell date +%Y%m%d).tar.gz package/
	@echo "Package created: $(DIST_DIR)/wii-ai-bridge-$(shell date +%Y%m%d).tar.gz"

# Help
help:
	@echo "Wii AI Gaming Bridge Build System"
	@echo ""
	@echo "Targets:"
	@echo "  all          - Build both Wii and Python components"
	@echo "  wii          - Build Wii homebrew application"
	@echo "  python       - Setup Python AI environment"
	@echo "  install      - Install to SD card (set SD_PATH)"
	@echo "  setup-devkit - Verify DevkitPro installation"
	@echo "  clean        - Clean all build files"
	@echo "  dev-server   - Start AI development server"
	@echo "  test-ai      - Run AI component tests"
	@echo "  package      - Create distribution package"
	@echo "  help         - Show this help message"
