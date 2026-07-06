# GitHub Application Brain

**Author and concept origin:** Adrien D. Thomas

## Overview

The Lattice GitHub Brain is a practical TypeScript module for scoring application state across three axes: observation, action, and bridge. It classifies into eight states and provides self-correction recommendations.

## How to Import LatticeGitHubBrain

```typescript
import {
  LatticeGitHubBrain,
  latticeGitHubBrain,
  BrainInput,
  BrainTrace,
} from '../src/lattice_github_brain';
```

## How to Call think()

```typescript
const input: BrainInput = {
  observationData: ['file1.ts', 'file2.ts'],
  actionData: ['build', 'test'],
  bridgeData: ['memory-trace-1', 'memory-trace-2'],
  metadata: { repository: 'ProCityHub/AGI' },
};

const trace: BrainTrace = latticeGitHubBrain.think(input);
```

## How to Read latticeScore, State, and Self-Correction

```typescript
const trace = latticeGitHubBrain.think(input);

// Read latticeScore (0 to ~PHI)
console.log(`Lattice Score: ${trace.latticeScore.toFixed(4)}`);

// Read state classification
console.log(`State: ${trace.state.name}`);  // e.g., 'INTEGRATED'
console.log(`Observer Active: ${trace.state.isObserverActive}`);
console.log(`Actor Active: ${trace.state.isActorActive}`);
console.log(`Bridge Active: ${trace.state.isBridgeActive}`);

// Read axis scores
console.log(`Observation: ${trace.scores.observation}`);
console.log(`Action: ${trace.scores.action}`);
console.log(`Bridge: ${trace.scores.bridge}`);

// Get self-correction messages
const corrections = latticeGitHubBrain.selfCorrect(input, trace.state);
corrections.forEach(msg => console.log(`  - ${msg}`));
```

## Eight States

| Code | State | Observation | Action | Bridge |
|------|-------|-------------|--------|--------|
| 000 | DORMANT | ✗ | ✗ | ✗ |
| 001 | BRIDGE | ✗ | ✗ | ✓ |
| 010 | ACTOR | ✗ | ✓ | ✗ |
| 011 | ACTOR_BRIDGE | ✗ | ✓ | ✓ |
| 100 | OBSERVER | ✓ | ✗ | ✗ |
| 101 | OBSERVER_BRIDGE | ✓ | ✗ | ✓ |
| 110 | FRAGMENTED | ✓ | ✓ | ✗ |
| 111 | INTEGRATED | ✓ | ✓ | ✓ |

## How to Import connectAllApplications

```typescript
import { connectAllApplications } from '../lattice_connect_all/connect_all';

const snapshot = connectAllApplications();
console.log(`Connected: ${snapshot.connectedCount}/${snapshot.totalApplications}`);
```

## How to Connect Another Repository

```typescript
import { addApplicationNode, connectApplication } from '../lattice_connect_all/connect_all';
import type { LatticeApplicationNode } from '../lattice_connect_all/types';

const newApp: LatticeApplicationNode = {
  name: 'CustomApp',
  repository: 'ProCityHub/CustomApp',
  role: 'satellite',
  localPath: './apps/custom',
  brainMode: 'observer',
  bridgeStatus: 'ready-to-connect',
  safetyBoundary: 'isolated',
  nextAction: 'initialize',
};

// Add to registry
const added = addApplicationNode(newApp);
if (added) {
  // Connect the app
  const connected = connectApplication('ProCityHub/CustomApp');
  console.log(`Connection: ${connected ? 'success' : 'failed'}`);
}
```

## Safety Boundary

The GitHub Application Brain is **software architecture only**:

✅ Scores application state on three axes  
✅ Classifies into eight operational states  
✅ Provides self-correction recommendations  
✅ Tracks memory traces  
✅ Manages application registry  

❌ Does **not** make consciousness claims  
❌ Does **not** include theory or prophecy  
❌ Does **not** make scientific or biological claims  
❌ Does **not** modify application code  
❌ Does **not** execute applications

## Formula

```
latticeScore = observation × action × bridge × φ
```

where φ (phi) = 1.618033988749895 (golden ratio)

## Related Files

- `../src/lattice_github_brain.ts` - Core brain module
- `../lattice_connect_all/` - Application connection layer
- `../examples/lattice_brain_demo.ts` - Practical examples
