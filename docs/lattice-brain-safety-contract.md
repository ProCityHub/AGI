# Lattice Brain safety and evidence contract

This extraction is additive. Existing engine files remain in place.

## Two distinct feature systems

- `brain_cli.text_features`: six bounded text statistics.
- `lattice_bridge.hash_corner_features`: eight deterministic,
  prime-indexed SHA-256-derived corner features.

They are intentionally not presented as equivalent. The legacy bridge
remains outside the default package import because its repository-local
dependencies must be repaired and tested separately before it can be
represented as runnable.

## Determinism

The supported claim for a stateful engine is:

> same initial state + same input + same configuration produces the
> same output and the same next state.

Repeating an input on an already-mutated instance is a different
experiment and is not claimed to produce the same output.

## Provenance

`measured` means computed from the current input or recorded internal
state. It does not mean externally validated, empirically calibrated,
or scientifically proven.

## Mutation safety

Both `heal` and `apply-rewrite` require explicit approval. A rejected
or missing approval must leave the persisted state unchanged.

## Claims

The software is a deterministic cognitive-architecture instrument and
simulation. It is not evidence by itself of consciousness, sentience,
or artificial general intelligence.
