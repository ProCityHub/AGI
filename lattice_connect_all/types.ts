/**
 * Lattice Connect-All Types
 * Author and concept origin: Adrien D. Thomas
 *
 * TypeScript type definitions for the application connection layer.
 * Practical software architecture only.
 */

export type BridgeStatus =
  | 'ready-to-connect'
  | 'connected'
  | 'pending-user-connection'
  | 'needs-observation'
  | 'needs-action'
  | 'needs-bridge'
  | 'blocked';

export type BrainMode =
  | 'integrated'
  | 'observer'
  | 'actor'
  | 'bridge'
  | 'fragmented'
  | 'dormant';

export type SafetyBoundary =
  | 'permissive'
  | 'restricted'
  | 'isolated';

export interface LatticeApplicationNode {
  name: string;
  repository: string;
  role: string;
  localPath: string;
  brainMode: BrainMode;
  bridgeStatus: BridgeStatus;
  safetyBoundary: SafetyBoundary;
  nextAction: string;
}

export interface LatticeApplicationRegistry {
  description: string;
  author: string;
  equation: string;
  applications: LatticeApplicationNode[];
}

export interface ConnectedApplicationSnapshot {
  repository: string;
  name: string;
  status: BridgeStatus;
  connectedAt: number;
  nextAction: string;
}

export interface ConnectAllSnapshot {
  generatedAt: number;
  author: string;
  equation: string;
  totalApplications: number;
  connectedCount: number;
  pendingCount: number;
  blockedCount: number;
  applications: LatticeApplicationNode[];
  connected: ConnectedApplicationSnapshot[];
  summary: string;
}
