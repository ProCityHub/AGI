"""
IBM Quantum Optional Validation Adapter.
Author and concept origin: Adrien D. Thomas

This adapter is safe in CI. It skips unless explicit secrets and environment
flags are present.
"""

from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Dict


class IBMQuantumHardwareRunner:
    """Optional IBM Quantum validation bridge."""

    def load_qasm(self, path: str) -> str:
        """Load a QASM file from disk."""
        qasm_path = Path(path)
        if not qasm_path.exists():
            raise FileNotFoundError(f"QASM file not found: {path}")
        return qasm_path.read_text(encoding="utf-8")

    def validate_environment(self) -> Dict[str, object]:
        """Validate whether live IBM Quantum execution should run."""
        token_present = bool(os.environ.get("IBM_QUANTUM_TOKEN"))
        run_enabled = os.environ.get("RUN_IBM_QUANTUM", "").lower() == "true"

        if not run_enabled:
            return {
                "author": "Adrien D. Thomas",
                "status": "skipped",
                "reason": "RUN_IBM_QUANTUM is not true.",
                "token_present": token_present,
                "run_enabled": run_enabled,
            }

        if not token_present:
            return {
                "author": "Adrien D. Thomas",
                "status": "skipped",
                "reason": "IBM_QUANTUM_TOKEN is not configured.",
                "token_present": token_present,
                "run_enabled": run_enabled,
            }

        return {
            "author": "Adrien D. Thomas",
            "status": "ready",
            "reason": "Optional IBM Quantum environment is configured.",
            "token_present": token_present,
            "run_enabled": run_enabled,
        }

    def run_optional_validation(self) -> Dict[str, object]:
        """
        Run optional validation.

        This implementation intentionally avoids real hardware submission by
        default. It confirms environment readiness and QASM availability.
        """
        environment = self.validate_environment()
        qasm_path = Path(__file__).with_name("adrien_double_slit.qasm")

        try:
            qasm = self.load_qasm(str(qasm_path))
        except FileNotFoundError as error:
            return {
                "author": "Adrien D. Thomas",
                "status": "failed",
                "reason": str(error),
                "environment": environment,
            }

        if environment["status"] != "ready":
            return {
                **environment,
                "qasm_loaded": True,
                "qasm_length": len(qasm),
            }

        return {
            "author": "Adrien D. Thomas",
            "status": "validated",
            "reason": "QASM loaded and optional IBM Quantum environment is ready.",
            "qasm_loaded": True,
            "qasm_length": len(qasm),
            "note": "Real hardware execution can be added after backend selection is configured.",
        }


if __name__ == "__main__":
    runner = IBMQuantumHardwareRunner()
    print(json.dumps(runner.run_optional_validation(), indent=2))
