#!/usr/bin/env python3
"""Termux Brain CLI v1.0 — Lattice Brain command interface.

Author: Adrien D. Thomas (ProCityHub)
Part of the Lattice Law research program.

This is a deterministic measured instrument. It is NOT conscious and does
not claim consciousness, sentience, or AGI. It reports computed state only.

Canonical scoring formula (frozen in ProCityHub/hypercubeheartbeat/PREREGISTRATION.md):

    C = O^1 * A^(1/PHI) * B^(1/PHI^2)      PHI = (1 + sqrt(5)) / 2

PHI appears in the EXPONENTS. The earlier scalar-multiplier form is
formally retracted (see RETRACTIONS.md) and must never appear in this code.

Standard library only. No randomness. No network. Same input -> same output.
"""

import hashlib
import json
import math
import os
import subprocess
import sys
import time

PHI = (1 + math.sqrt(5)) / 2

STATE_FILE = "brain_state.json"
AUDIT_LOG = "brain_audit.log"
SNAP_DIR = "brain_snapshots"

HISTORY_LIMIT = 256


# ---------------------------------------------------------------- state

def default_state():
    return {
        "tick": 0,
        "corners": [{"bits": format(i, "03b"), "charge": 0.0, "fires": 0} for i in range(8)],
        "genome": {
            "leak": 0.10,          # charge decay per tick
            "threshold": 1.00,     # firing threshold
            "input_gain": 1.00,    # score -> charge gain
            "coupling_gain": 1.00, # scales informationCoupling
        },
        "feature_mean": [0.0] * 6,
        "feature_count": 0,
        "stateHistory": [],    # {tick, bits, O, A, B, C, constraint}
        "cornerHistory": [],   # {tick, charges, fired}
        "firingSequence": [],  # {corner, latency, tick}
        "last_input": None,
        "last_proposal": None,
        "mutation_ledger": [],
    }


def load_state():
    if os.path.exists(STATE_FILE):
        with open(STATE_FILE) as f:
            return json.load(f)
    return default_state()


def save_state(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f, indent=1)


def state_hash(state):
    return hashlib.sha256(
        json.dumps(state, sort_keys=True).encode()
    ).hexdigest()[:16]


def audit(command, args, state):
    entry = {
        "ts": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "command": command,
        "args": args,
        "tick": state["tick"],
        "state_hash": state_hash(state),
    }
    with open(AUDIT_LOG, "a") as f:
        f.write(json.dumps(entry) + "\n")


# ------------------------------------------------------------- features

def prime_features(text):
    """Deterministic vectorization of input text -> 6 features in [0,1].

    Each feature is tagged measured/fallback for provenance tracking.
    """
    feats, tags = [], []
    n = len(text)

    # f0: length saturation
    feats.append(min(1.0, n / 280.0))
    tags.append("measured" if n > 0 else "fallback")

    # f1: unique-character diversity
    if n > 0:
        feats.append(len(set(text.lower())) / min(n, 64))
        tags.append("measured")
    else:
        feats.append(0.5)
        tags.append("fallback")

    words = text.split()
    # f2: lexical diversity (unique words / words)
    if words:
        feats.append(len(set(w.lower() for w in words)) / len(words))
        tags.append("measured")
    else:
        feats.append(0.5)
        tags.append("fallback")

    # f3: mean word length, normalized
    if words:
        feats.append(min(1.0, (sum(len(w) for w in words) / len(words)) / 12.0))
        tags.append("measured")
    else:
        feats.append(0.5)
        tags.append("fallback")

    # f4: byte-level spread via stable hash
    if n > 0:
        h = hashlib.sha256(text.encode()).digest()
        feats.append(sum(h[:8]) / (8 * 255))
        tags.append("measured")
    else:
        feats.append(0.5)
        tags.append("fallback")

    # f5: vowel ratio (proxy for natural-language content)
    letters = [c for c in text.lower() if c.isalpha()]
    if letters:
        feats.append(sum(1 for c in letters if c in "aeiou") / len(letters))
        tags.append("measured")
    else:
        feats.append(0.5)
        tags.append("fallback")

    return feats, tags


# --------------------------------------------------------------- scoring

def canonical_score(O, A, B):
    """Frozen canonical formula: C = O^1 * A^(1/PHI) * B^(1/PHI^2)."""
    return (O ** 1.0) * (A ** (1.0 / PHI)) * (B ** (1.0 / PHI ** 2))


def clamp(x, lo=1e-6, hi=1.0):
    return max(lo, min(hi, x))


def compute_OAB(state, feats, tags):
    """Derive O, A, B sub-metrics. B uses the v5 anti-collapse formula."""
    provenance = tags.count("measured") / len(tags)

    # O (Observer): clarity/structure of the observation
    O = clamp((feats[2] + feats[5]) / 2)

    # A (Actor): energy/actionability of the input
    A = clamp((feats[0] + feats[1]) / 2)

    # B (Environment/Bridge) — v5:
    # consistency = 0.35*timingCoherence + 0.45*informationCoupling + 0.20*integrationProxy
    # B = sqrt(coupling * consistency)
    hist = state["stateHistory"]
    if len(hist) >= 3:
        ticks = [h["tick"] for h in hist[-8:]]
        gaps = [b - a for a, b in zip(ticks, ticks[1:])]
        mean_gap = sum(gaps) / len(gaps)
        var = sum((g - mean_gap) ** 2 for g in gaps) / len(gaps)
        timingCoherence = clamp(1.0 / (1.0 + var))
        t_tag = "measured"
    else:
        timingCoherence = 0.5
        t_tag = "fallback"

    if state["feature_count"] > 0:
        mean = state["feature_mean"]
        dot = sum(a * b for a, b in zip(feats, mean))
        na = math.sqrt(sum(a * a for a in feats)) or 1e-9
        nb = math.sqrt(sum(b * b for b in mean)) or 1e-9
        informationCoupling = clamp(
            (dot / (na * nb)) * state["genome"]["coupling_gain"]
        )
        c_tag = "measured"
    else:
        informationCoupling = 0.5
        c_tag = "fallback"

    recent = [f for f in state["firingSequence"] if f["tick"] > state["tick"] - 8]
    integrationProxy = clamp(len(set(f["corner"] for f in recent)) / 8.0, lo=0.0)
    integrationProxy = max(integrationProxy, 0.05)
    i_tag = "measured" if state["firingSequence"] else "fallback"

    consistency = (0.35 * timingCoherence
                   + 0.45 * informationCoupling
                   + 0.20 * integrationProxy)
    coupling = informationCoupling
    B = clamp(math.sqrt(coupling * consistency))

    b_tags = [t_tag, c_tag, i_tag]
    all_tags = tags + b_tags
    provenance = all_tags.count("measured") / len(all_tags)

    detail = {
        "timingCoherence": round(timingCoherence, 4),
        "informationCoupling": round(informationCoupling, 4),
        "integrationProxy": round(integrationProxy, 4),
        "consistency": round(consistency, 4),
        "b_tags": b_tags,
    }
    return O, A, B, provenance, detail


def find_constraint(O, A, B, provenance):
    vals = {"Observer(O)": O, "Actor(A)": A, "Bridge(B)": B,
            "Provenance": provenance}
    name = min(vals, key=vals.get)
    return name, vals[name]


# ----------------------------------------------------------- lattice

def pulse_corners(state, C, feats):
    """Drive the 8 leaky integrate-and-fire corner nodes with score C."""
    g = state["genome"]
    parity = [int(feats[i % len(feats)] * 255) & 1 for i in range(3)]
    fired = []
    for i, corner in enumerate(state["corners"]):
        bits = [int(b) for b in corner["bits"]]
        match = sum(1 for a, b in zip(bits, parity) if a == b) / 3.0
        corner["charge"] = corner["charge"] * (1 - g["leak"]) \
            + C * g["input_gain"] * (0.5 + match)
        if corner["charge"] >= g["threshold"]:
            corner["fires"] += 1
            fired.append(i)
            state["firingSequence"].append({
                "corner": i,
                "latency": round(corner["charge"] - g["threshold"], 4),
                "tick": state["tick"],
            })
            corner["charge"] = 0.0
    state["cornerHistory"].append({
        "tick": state["tick"],
        "charges": [round(c["charge"], 4) for c in state["corners"]],
        "fired": fired,
    })
    for key in ("stateHistory", "cornerHistory", "firingSequence"):
        state[key] = state[key][-HISTORY_LIMIT:]
    return fired


def ingest(state, text, source="text"):
    """Full loop: features -> O/A/B -> canonical C -> lattice -> ledger."""
    state["tick"] += 1
    feats, tags = prime_features(text)
    O, A, B, provenance, detail = compute_OAB(state, feats, tags)
    C = canonical_score(O, A, B)
    fired = pulse_corners(state, C, feats)
    constraint, cval = find_constraint(O, A, B, provenance)

    n = state["feature_count"]
    state["feature_mean"] = [
        (m * n + f) / (n + 1) for m, f in zip(state["feature_mean"], feats)
    ]
    state["feature_count"] = n + 1

    bits = "".join(str(len([f for f in fired if f == i])) for i in range(3))
    record = {
        "tick": state["tick"],
        "bits": "".join("1" if i in fired else "0" for i in range(8)),
        "O": round(O, 4), "A": round(A, 4), "B": round(B, 4),
        "C": round(C, 4),
        "constraint": constraint,
        "provenance": round(provenance, 4),
        "source": source,
    }
    state["stateHistory"].append(record)
    state["last_input"] = {"text": text[:200], "detail": detail}
    return record, detail


# ----------------------------------------------------------- reporting

def report_line(rec):
    prov_pct = int(rec["provenance"] * 100)
    warn = ("substrate-measured" if rec["provenance"] >= 0.6
            else "FORMULA-MADE until more history arrives")
    return (
        f"tick {rec['tick']}  bits {rec['bits']}\n"
        f"C={rec['C']} from O={rec['O']}, A={rec['A']}, B={rec['B']}\n"
        f"formula: C = O^1 * A^(1/PHI) * B^(1/PHI^2)  [canonical, pre-registered]\n"
        f"active ceiling: {rec['constraint']}\n"
        f"measured provenance: {prov_pct}%  ({warn})\n"
        f"confidence: {round(rec['provenance'] * rec['C'], 4)}\n"
        f"next action: feed more input or run `heal` on the ceiling constraint"
    )


def cmd_status(state):
    if not state["stateHistory"]:
        print("No state yet. Run:  brain input \"some text\"")
        return
    print(report_line(state["stateHistory"][-1]))


def cmd_input(state, text, source="text"):
    rec, detail = ingest(state, text, source)
    print(report_line(rec))
    print(f"bridge detail: {json.dumps(detail)}")


def cmd_diagnose_bridge(state):
    if not state["last_input"]:
        print("No input yet — nothing to diagnose.")
        return
    d = state["last_input"]["detail"]
    print("Bridge (B) v5 breakdown:")
    print(f"  timingCoherence     {d['timingCoherence']}  (0.35 weight)")
    print(f"  informationCoupling {d['informationCoupling']}  (0.45 weight)")
    print(f"  integrationProxy    {d['integrationProxy']}  (0.20 weight)")
    print(f"  consistency         {d['consistency']}")
    print(f"  provenance tags     {d['b_tags']}")
    print("  B = sqrt(coupling * consistency)")


def cmd_heal(state):
    """Target the weakest constraint; keep a genome change only if C improves."""
    if not state["last_input"]:
        print("No input history — feed the brain before healing.")
        return
    text = state["last_input"]["text"]
    baseline = state["stateHistory"][-1]["C"] if state["stateHistory"] else 0.0
    constraint = state["stateHistory"][-1]["constraint"]

    tweaks = {
        "Bridge(B)": ("coupling_gain", 1.05),
        "Actor(A)": ("input_gain", 1.05),
        "Observer(O)": ("leak", 0.95),
        "Provenance": ("threshold", 0.98),
    }
    param, factor = tweaks.get(constraint, ("input_gain", 1.02))
    old = state["genome"][param]
    state["genome"][param] = round(old * factor, 6)

    rec, _ = ingest(state, text, source="heal-replay")
    kept = rec["C"] > baseline
    if not kept:
        state["genome"][param] = old
    state["mutation_ledger"].append({
        "tick": state["tick"], "param": param,
        "old": old, "new": state["genome"][param],
        "baseline_C": baseline, "new_C": rec["C"], "kept": kept,
    })
    verdict = "KEPT (measured C improved)" if kept else "REVERTED (no measured improvement)"
    print(f"heal target: {constraint} -> genome[{param}]")
    print(f"C {baseline} -> {rec['C']}  :: {verdict}")


def cmd_propose_rewrite(state, goal):
    prop = {
        "goal": goal,
        "tick": state["tick"],
        "proposed_genome": {k: round(v * 1.03, 6) if k != "leak" else round(v * 0.97, 6)
                            for k, v in state["genome"].items()},
        "status": "PROPOSED — not applied. Run: apply-rewrite --approved",
    }
    state["last_proposal"] = prop
    print(json.dumps(prop, indent=1))


def cmd_apply_rewrite(state, approved):
    if not approved:
        print("REFUSED: rewrite requires the --approved flag. Nothing changed.")
        return
    if not state["last_proposal"]:
        print("No proposal on file. Run propose-rewrite first.")
        return
    before = dict(state["genome"])
    state["genome"] = state["last_proposal"]["proposed_genome"]
    state["mutation_ledger"].append({
        "tick": state["tick"], "rewrite": True,
        "before": before, "after": state["genome"],
        "goal": state["last_proposal"]["goal"],
    })
    state["last_proposal"] = None
    print("Rewrite applied. Snapshot recommended: brain export-snapshot")


def cmd_see(state, path):
    if not os.path.exists(path):
        print(f"Cannot open {path}")
        return
    with open(path, "rb") as f:
        data = f.read()
    h = hashlib.sha256(data).hexdigest()
    desc = f"image {os.path.basename(path)} bytes={len(data)} digest={h[:24]}"
    print(f"SIGHT intake (offline, deterministic): {desc}")
    cmd_input(state, desc, source="sight")


def cmd_research(state, question):
    note = (f"research probe (offline mode — logged as percept, "
            f"no network): {question}")
    print(note)
    cmd_input(state, question, source="research")


def cmd_export_snapshot(state):
    os.makedirs(SNAP_DIR, exist_ok=True)
    path = os.path.join(SNAP_DIR, f"snapshot_tick{state['tick']}.json")
    with open(path, "w") as f:
        json.dump(state, f, indent=1)
    print(f"Snapshot written: {path}  hash={state_hash(state)}")



def cmd_sync_github(state):
    """Commit local Brain audit artifacts to Git for chain of custody."""
    targets = [AUDIT_LOG, STATE_FILE, SNAP_DIR]
    existing = [p for p in targets if os.path.exists(p)]
    if not existing:
        print("No audit artifacts found yet. Run status, input, or export-snapshot first.")
        return

    status = subprocess.run(
        ["git", "status", "--short"],
        text=True,
        capture_output=True,
        check=False,
    )
    if status.returncode != 0:
        print("Git status failed. Are you inside the AGI repository?")
        print(status.stderr.strip())
        return

    subprocess.run(["git", "add"] + existing, check=False)
    commit = subprocess.run(
        ["git", "commit", "-m", f"Record Brain audit chain tick {state['tick']}"],
        text=True,
        capture_output=True,
        check=False,
    )

    if commit.returncode == 0:
        print("Audit artifacts committed locally.")
        print("Push remains human-controlled. Suggested next command:")
        print("  git push origin HEAD")
    else:
        combined = (commit.stdout + "\n" + commit.stderr).strip()
        if "nothing to commit" in combined.lower():
            print("No new audit artifacts to commit.")
        else:
            print("Git commit did not complete:")
            print(combined)


def cmd_report(state):
    print(f"Lattice Brain report — tick {state['tick']}")
    print(f"genome: {json.dumps(state['genome'])}")
    print(f"ledger entries: state={len(state['stateHistory'])} "
          f"corners={len(state['cornerHistory'])} "
          f"firings={len(state['firingSequence'])} "
          f"mutations={len(state['mutation_ledger'])}")
    cmd_status(state)


def cmd_history(state, which):
    key = {"state": "stateHistory", "corners": "cornerHistory",
           "firing": "firingSequence"}.get(which)
    if not key:
        print("usage: brain history [state|corners|firing]")
        return
    for row in state[key][-12:]:
        print(json.dumps(row))


# --------------------------------------------------------------- main

USAGE = """Termux Brain CLI v1.0 — deterministic measured instrument (not conscious)
usage:
  brain_cli.py status
  brain_cli.py input "message"
  brain_cli.py heal
  brain_cli.py diagnose bridge
  brain_cli.py history [state|corners|firing]
  brain_cli.py propose-rewrite "goal"
  brain_cli.py apply-rewrite --approved
  brain_cli.py see image.jpg
  brain_cli.py research "question"
  brain_cli.py export-snapshot
  brain_cli.py sync-github
  brain_cli.py report
"""


def main(argv):
    if len(argv) < 2:
        print(USAGE)
        return 1
    cmd, args = argv[1], argv[2:]
    state = load_state()

    if cmd == "status":
        cmd_status(state)
    elif cmd == "input" and args:
        cmd_input(state, args[0])
    elif cmd == "heal":
        cmd_heal(state)
    elif cmd == "diagnose" and args and args[0] == "bridge":
        cmd_diagnose_bridge(state)
    elif cmd == "history" and args:
        cmd_history(state, args[0])
    elif cmd == "propose-rewrite" and args:
        cmd_propose_rewrite(state, args[0])
    elif cmd == "apply-rewrite":
        cmd_apply_rewrite(state, "--approved" in args)
    elif cmd == "see" and args:
        cmd_see(state, args[0])
    elif cmd == "research" and args:
        cmd_research(state, args[0])
    elif cmd == "export-snapshot":
        cmd_export_snapshot(state)
    elif cmd == "sync-github":
        # Ensure the sync command itself is in the audit log before commit.
        save_state(state)
        audit(cmd, args, state)
        cmd_sync_github(state)
        return 0
    elif cmd == "report":
        cmd_report(state)
    else:
        print(USAGE)
        return 1

    save_state(state)
    audit(cmd, args, state)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
