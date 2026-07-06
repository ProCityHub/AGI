# Installation Guide - Lattice Connect-All

**Author and concept origin:** Adrien D. Thomas

## Prerequisites

- Node.js 14+
- TypeScript 4.0+

## Installation

### 1. Copy the Directory

```bash
cp -r lattice_connect_all/ /path/to/your/project/
```

### 2. Build TypeScript

```bash
npx tsc lattice_connect_all/*.ts --target es2020 --module commonjs
```

### 3. Import in Your Code

```typescript
import {
  connectApplication,
  connectAllApplications,
  markApplicationConnected,
  addApplicationNode,
} from './lattice_connect_all/connect_all';
```

## How to Import connectAllApplications

```typescript
import { connectAllApplications } from './lattice_connect_all/connect_all';

const snapshot = connectAllApplications();
console.log(snapshot.connectedCount); // Number of connected apps
console.log(snapshot.totalApplications); // Total registered apps
```

## How to Add Another App Node

```typescript
import { addApplicationNode } from './lattice_connect_all/connect_all';
import type { LatticeApplicationNode } from './lattice_connect_all/types';

const newApp: LatticeApplicationNode = {
  name: 'NewApp',
  repository: 'ProCityHub/NewApp',
  role: 'satellite',
  localPath: './apps/new-app',
  brainMode: 'observer',
  bridgeStatus: 'ready-to-connect',
  safetyBoundary: 'isolated',
  nextAction: 'initialize',
};

const success = addApplicationNode(newApp);
if (success) {
  console.log('Application added to registry');
}
```

## How to Mark an App Connected

```typescript
import { markApplicationConnected } from './lattice_connect_all/connect_all';

const success = markApplicationConnected('ProCityHub/AGI');
if (success) {
  console.log('AGI marked as connected');
}
```

## Verification

```typescript
import { connectAllApplications } from './lattice_connect_all/connect_all';

const snapshot = connectAllApplications();
console.log(`Status: ${snapshot.summary}`);
```

## Troubleshooting

**TypeScript compilation errors:**

Ensure all files are in `lattice_connect_all/` directory:
- types.ts
- registry.ts
- connect_all.ts
- app_registry.json

**Import errors:**

Verify relative paths match your project structure.
