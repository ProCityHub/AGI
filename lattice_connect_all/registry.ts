/**
 * Lattice Application Registry
 * Author and concept origin: Adrien D. Thomas
 *
 * In-memory registry of application nodes.
 * Practical software architecture only.
 */

import type {
  LatticeApplicationNode,
  LatticeApplicationRegistry,
} from './types';

export const latticeApplicationRegistry: LatticeApplicationRegistry = {
  description: 'Lattice Connect-All Application Registry',
  author: 'Adrien D. Thomas',
  equation: 'C = (O × A × B) × φ',
  applications: [
    {
      name: 'AGI',
      repository: 'ProCityHub/AGI',
      role: 'core-integration',
      localPath: './apps/agi',
      brainMode: 'integrated',
      bridgeStatus: 'ready-to-connect',
      safetyBoundary: 'permissive',
      nextAction: 'initialize-brain',
    },
    {
      name: 'GARVIS',
      repository: 'ProCityHub/GARVIS',
      role: 'analysis-satellite',
      localPath: './apps/garvis',
      brainMode: 'observer',
      bridgeStatus: 'pending-user-connection',
      safetyBoundary: 'isolated',
      nextAction: 'await-bridge',
    },
    {
      name: 'Memori',
      repository: 'ProCityHub/Memori',
      role: 'memory-layer',
      localPath: './apps/memori',
      brainMode: 'bridge',
      bridgeStatus: 'ready-to-connect',
      safetyBoundary: 'restricted',
      nextAction: 'initialize-memory',
    },
    {
      name: 'SigilForge',
      repository: 'ProCityHub/SigilForge',
      role: 'processing-engine',
      localPath: './apps/sigilforge',
      brainMode: 'actor',
      bridgeStatus: 'pending-user-connection',
      safetyBoundary: 'permissive',
      nextAction: 'await-bridge',
    },
    {
      name: 'hypercubeheartbeat',
      repository: 'ProCityHub/hypercubeheartbeat',
      role: 'synchronization',
      localPath: './apps/hypercubeheartbeat',
      brainMode: 'observer',
      bridgeStatus: 'pending-user-connection',
      safetyBoundary: 'isolated',
      nextAction: 'await-bridge',
    },
  ],
};

/**
 * getApplicationByRepository(repository: string): LatticeApplicationNode | undefined
 * Retrieves a single application node by repository name.
 */
export function getApplicationByRepository(
  repository: string
): LatticeApplicationNode | undefined {
  return latticeApplicationRegistry.applications.find(
    (app) => app.repository === repository
  );
}

/**
 * getAllApplications(): LatticeApplicationNode[]
 * Returns all registered application nodes.
 */
export function getAllApplications(): LatticeApplicationNode[] {
  return [...latticeApplicationRegistry.applications];
}

/**
 * getApplicationsByStatus(status: string): LatticeApplicationNode[]
 * Returns applications filtered by bridge status.
 */
export function getApplicationsByStatus(
  status: string
): LatticeApplicationNode[] {
  return latticeApplicationRegistry.applications.filter(
    (app) => app.bridgeStatus === status
  );
}

/**
 * updateApplicationStatus(repository: string, status: string): boolean
 * Updates an application's bridge status.
 * Returns true if successful, false if not found.
 */
export function updateApplicationStatus(
  repository: string,
  status: string
): boolean {
  const app = getApplicationByRepository(repository);
  if (app) {
    app.bridgeStatus = status as any;
    return true;
  }
  return false;
}

/**
 * getConnectionCounts(): { connected: number; pending: number; blocked: number }
 * Returns counts of applications by status.
 */
export function getConnectionCounts(): {
  connected: number;
  pending: number;
  blocked: number;
} {
  const connected = latticeApplicationRegistry.applications.filter(
    (app) => app.bridgeStatus === 'connected'
  ).length;

  const pending = latticeApplicationRegistry.applications.filter(
    (app) => app.bridgeStatus === 'pending-user-connection'
  ).length;

  const blocked = latticeApplicationRegistry.applications.filter(
    (app) => app.bridgeStatus === 'blocked'
  ).length;

  return { connected, pending, blocked };
}
