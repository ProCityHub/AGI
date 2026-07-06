# Manifest - Lattice Connect-All

**Author and concept origin:** Adrien D. Thomas

## File Listing

### Core Files

**types.ts** (1.4 KB)
- TypeScript interface definitions
- Exports: BridgeStatus, BrainMode, SafetyBoundary, LatticeApplicationNode, LatticeApplicationRegistry, ConnectedApplicationSnapshot, ConnectAllSnapshot

**registry.ts** (3.9 KB)
- In-memory application registry
- Exports: latticeApplicationRegistry, getApplicationByRepository(), getAllApplications(), getApplicationsByStatus(), updateApplicationStatus(), getConnectionCounts()

**connect_all.ts** (3.8 KB)
- Connection orchestration
- Exports: connectApplication(), connectAllApplications(), markApplicationConnected(), addApplicationNode(), getApplicationStatus(), getConnectionSnapshot()

**app_registry.json** (1.7 KB)
- Pre-configured application registry
- Contains 5 applications: AGI, GARVIS, Memori, SigilForge, hypercubeheartbeat

### Documentation

**README.md** (0.8 KB)
- Project overview
- Quick start guide
- Safety boundary statement

**INSTALL.md** (1.2 KB)
- Installation instructions
- Usage examples
- Troubleshooting

**MANIFEST.md** (this file)
- File inventory and descriptions

## Directory Structure

```
lattice_connect_all/
├── types.ts
├── registry.ts
├── connect_all.ts
├── app_registry.json
├── README.md
├── INSTALL.md
└── MANIFEST.md
```

## Application Node Schema

Each application in the registry includes:

```typescript
{
  name: string;              // Application identifier
  repository: string;        // GitHub path: owner/repo
  role: string;              // Function in ecosystem
  localPath: string;         // Local filesystem path
  brainMode: string;         // Operational mode
  bridgeStatus: string;      // Connection status
  safetyBoundary: string;    // Safety level
  nextAction: string;        // Recommended action
}
```

## Bridge Statuses

- `ready-to-connect` - Ready to establish connection
- `connected` - Successfully connected
- `pending-user-connection` - Awaiting user action
- `needs-observation` - Needs diagnostic data
- `needs-action` - Needs execution/build
- `needs-bridge` - Needs memory/context
- `blocked` - Connection blocked

## Pre-registered Applications

1. **ProCityHub/AGI** (core-integration) - Main integration hub
2. **ProCityHub/GARVIS** (analysis-satellite) - Analysis module
3. **ProCityHub/Memori** (memory-layer) - Memory and persistence
4. **ProCityHub/SigilForge** (processing-engine) - Processing module
5. **ProCityHub/hypercubeheartbeat** (synchronization) - Sync and heartbeat

## Safety Boundary

Connect-All is **software architecture only**:

✓ Manages registry and connection status  
✓ Provides integration interfaces  
✓ Tracks application metadata  
✗ Does not modify application code  
✗ Does not execute applications  
✗ Does not make scientific or biological claims

## Performance

- Registry lookup: O(n) where n = number of applications
- Connection check: O(n)
- Snapshot generation: O(n)
- For 5-10 applications: negligible performance impact

## Extension Points

To add custom functionality:

1. Extend `BrainMode` type in types.ts
2. Add new bridge status values
3. Add helper functions to registry.ts
4. Add connection logic to connect_all.ts

## Related Files

- `../src/lattice_github_brain.ts` - Core brain module
- `../docs/GITHUB_APPLICATION_BRAIN.md` - Brain documentation
