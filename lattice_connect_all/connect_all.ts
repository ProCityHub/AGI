/**
 * Lattice Connect-All Bridge
 * Author and concept origin: Adrien D. Thomas
 *
 * Connection orchestration for multiple GitHub applications.
 * Practical software architecture only.
 */

import type {
  LatticeApplicationNode,
  ConnectAllSnapshot,
  BridgeStatus,
} from './types';
import {
  latticeApplicationRegistry,
  getApplicationByRepository,
  getAllApplications,
  updateApplicationStatus,
  getConnectionCounts,
} from './registry';

/**
 * connectApplication(repository: string): boolean
 * Attempts to connect a single application.
 * Returns true if successful, false if not found or already connected.
 */
export function connectApplication(repository: string): boolean {
  const app = getApplicationByRepository(repository);
  if (!app) {
    return false;
  }

  if (app.bridgeStatus === 'connected') {
    return true;
  }

  updateApplicationStatus(repository, 'connected');
  return true;
}

/**
 * connectAllApplications(): ConnectAllSnapshot
 * Attempts to connect all registered applications.
 * Returns a snapshot with connection status.
 */
export function connectAllApplications(): ConnectAllSnapshot {
  const apps = getAllApplications();

  // Attempt to connect all ready applications
  apps.forEach((app) => {
    if (app.bridgeStatus === 'ready-to-connect') {
      connectApplication(app.repository);
    }
  });

  // Calculate counts
  const counts = getConnectionCounts();
  const totalApplications = apps.length;
  const connectedCount = counts.connected;
  const pendingCount = counts.pending;
  const blockedCount = counts.blocked;

  // Generate summary
  const summary =
    `Connection Status: ${connectedCount}/${totalApplications} connected. ` +
    `${pendingCount} pending user connection. ${blockedCount} blocked.`;

  // Compute simple software status scores (0-1)
  const observation = Math.min(totalApplications / 10, 1);
  const action = Math.min(connectedCount / totalApplications, 1);
  const bridge = Math.min((connectedCount + pendingCount) / totalApplications, 1);

  const snapshot: ConnectAllSnapshot = {
    generatedAt: Date.now(),
    author: 'Adrien D. Thomas',
    equation: 'C = (O × A × B) × φ',
    totalApplications,
    connectedCount,
    pendingCount,
    blockedCount,
    applications: apps,
    statusScores: {
      observation: Math.round(observation * 1000) / 1000,
      action: Math.round(action * 1000) / 1000,
      bridge: Math.round(bridge * 1000) / 1000,
    },
    summary,
  };

  return snapshot;
}

/**
 * markApplicationConnected(repository: string): boolean
 * Marks an application as connected.
 * Returns true if successful, false if not found.
 */
export function markApplicationConnected(repository: string): boolean {
  const app = getApplicationByRepository(repository);
  if (!app) {
    return false;
  }

  updateApplicationStatus(repository, 'connected');
  return true;
}

/**
 * addApplicationNode(app: LatticeApplicationNode): boolean
 * Adds a new application node to the registry.
 * Returns true if successful, false if already exists.
 */
export function addApplicationNode(app: LatticeApplicationNode): boolean {
  const existing = getApplicationByRepository(app.repository);
  if (existing) {
    return false;
  }

  latticeApplicationRegistry.applications.push(app);
  return true;
}

/**
 * getApplicationStatus(repository: string): BridgeStatus | null
 * Returns the bridge status of an application.
 * Returns null if not found.
 */
export function getApplicationStatus(repository: string): BridgeStatus | null {
  const app = getApplicationByRepository(repository);
  return app ? app.bridgeStatus : null;
}

/**
 * getConnectionSnapshot(): ConnectAllSnapshot
 * Alias for connectAllApplications().
 */
export function getConnectionSnapshot(): ConnectAllSnapshot {
  return connectAllApplications();
}
