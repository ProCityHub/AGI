#!/usr/bin/env python3
# Focused regression tests for the additive lattice-brain surface.

from __future__ import annotations

import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
CLI = HERE / "brain_cli.py"
sys.path.insert(0, str(HERE))

import brain_cli
import lattice_brain

failures: list[str] = []


def check(name: str, ok: bool, detail: str = "") -> None:
    print(("PASS " if ok else "FAIL ") + name + (f"  {detail}" if detail else ""))
    if not ok:
        failures.append(name)


sample = "drywall estimate for the northside job"
check(
    "brain feature compatibility alias",
    brain_cli.prime_features(sample) == brain_cli.text_features(sample),
)
bridge_source = (HERE / "lattice_bridge.py").read_text(encoding="utf-8")
check(
    "legacy bridge rename present",
    "def hash_corner_features(" in bridge_source
    and "prime_features = hash_corner_features" in bridge_source,
)
check(
    "verified instrument feature contract",
    len(brain_cli.text_features(sample)[0]) == 6,
)
check(
    "package exports verified names",
    lattice_brain.text_features is brain_cli.text_features
    and lattice_brain.canonical_score is brain_cli.canonical_score,
)

with tempfile.TemporaryDirectory() as tmp:
    work = Path(tmp)
    shutil.copy2(CLI, work / "brain_cli.py")
    env = dict(os.environ)
    subprocess.run(
        [sys.executable, "brain_cli.py", "input", sample],
        cwd=work,
        env=env,
        text=True,
        capture_output=True,
        check=True,
    )
    state_path = work / "brain_state.json"
    before = json.loads(state_path.read_text(encoding="utf-8"))
    denied = subprocess.run(
        [sys.executable, "brain_cli.py", "heal"],
        cwd=work,
        env=env,
        text=True,
        capture_output=True,
        check=True,
    )
    after = json.loads(state_path.read_text(encoding="utf-8"))
    check(
        "heal refuses without approval",
        "requires the --approved flag" in denied.stdout,
        denied.stdout.strip(),
    )
    check("denied heal preserves state", before == after)

if failures:
    print(f"{len(failures)} FAILURE(S): {failures}")
    raise SystemExit(1)

print("ALL LATTICE-BRAIN SAFETY CHECKS PASSED")
