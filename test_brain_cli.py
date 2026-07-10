#!/usr/bin/env python3
"""Smoke test for brain_cli.py.

This guards the new Termux Brain CLI files:
1. Canonical exponent formula is implemented.
2. The retracted scalar-multiplier formula is absent from new deliverables.
3. Determinism: same input on fresh state -> identical result.
4. No consciousness claims in user-facing strings.
"""

import json
import math
import os
import re
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
CLI = os.path.join(HERE, "brain_cli.py")
PHI = (1 + math.sqrt(5)) / 2

NEW_FILES = [
    "brain_cli.py",
    "termux_setup.sh",
    "test_brain_cli.py",
]

failures = []


def check(name, ok, detail=""):
    print(("PASS " if ok else "FAIL ") + name + ("  " + detail if detail else ""))
    if not ok:
        failures.append(name)


sys.path.insert(0, HERE)
import brain_cli  # noqa: E402

O, A, B = 0.8, 0.6, 0.4
expected = (O ** 1.0) * (A ** (1.0 / PHI)) * (B ** (1.0 / PHI ** 2))
got = brain_cli.canonical_score(O, A, B)
check("canonical formula numeric", abs(got - expected) < 1e-12,
      f"got {got}, expected {expected}")

src = open(CLI, encoding="utf-8").read()
check("phi-in-exponents present", "1.0 / PHI" in src and "PHI ** 2" in src)

# Build the banned pattern dynamically so this test file does not contain
# the banned expression as a literal.
mult = "[" + chr(0xD7) + "x*]"
banned = re.compile(
    r"\(\s*O\s*" + mult + r"\s*A\s*" + mult + r"\s*B\s*\)\s*" + mult +
    r"\s*(PHI|phi|" + chr(0x3C6) + r")",
    re.IGNORECASE,
)

hits = []
for filename in NEW_FILES:
    path = os.path.join(HERE, filename)
    if not os.path.exists(path):
        continue
    body = open(path, encoding="utf-8").read()
    if banned.search(body):
        hits.append(filename)

check("retracted scalar formula absent from new files", not hits, str(hits))


def run_fresh(workdir):
    shutil.copy(CLI, workdir)
    env = dict(os.environ)
    for text in ["alpha bridge", "beta pulse", "gamma coherence"]:
        subprocess.run([sys.executable, "brain_cli.py", "input", text],
                       cwd=workdir, capture_output=True, env=env, check=True)
    with open(os.path.join(workdir, "brain_state.json")) as f:
        state = json.load(f)
    return json.dumps(state["stateHistory"], sort_keys=True)


with tempfile.TemporaryDirectory() as d1, tempfile.TemporaryDirectory() as d2:
    r1, r2 = run_fresh(d1), run_fresh(d2)

check("determinism (same input -> same state)", r1 == r2)

claims = re.compile(r"\bI am (conscious|sentient|alive|aware)\b", re.IGNORECASE)
new_text = "\n".join(
    open(os.path.join(HERE, f), encoding="utf-8").read()
    for f in NEW_FILES
    if os.path.exists(os.path.join(HERE, f))
)
check("no consciousness claims", claims.search(new_text) is None)

print()
if failures:
    print(f"{len(failures)} FAILURE(S): {failures}")
    sys.exit(1)

print("ALL CHECKS PASSED — new Termux Brain files are clean.")
