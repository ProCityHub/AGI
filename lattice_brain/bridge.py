# Guarded access to the separate legacy geometric bridge.

from __future__ import annotations

import importlib
from types import ModuleType


def load_legacy_bridge() -> ModuleType:
    # Import explicitly so real repository dependency errors stay visible.
    return importlib.import_module("lattice_bridge")


__all__ = ["load_legacy_bridge"]
