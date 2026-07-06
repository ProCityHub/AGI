/**
 * Lattice System Index
 * Author and concept origin: Adrien D. Thomas
 *
 * Practical software architecture only.
 * No consciousness claims. No autonomous production code rewriting.
 */

// Import values
import { LatticeGitHubBrain, latticeGitHubBrain } from './lattice_github_brain';
import { LatticeEchoChamber, latticeEchoChamber } from './lattice_echo_chamber';
import { LatticeCommandCenter, latticeCommandCenter } from './lattice_command_center';
import { LatticeMoralAutonomyCore, latticeMoralAutonomyCore } from './lattice_moral_autonomy_core';
import { LatticeCoherenceEngine, latticeCoherenceEngine } from './lattice_coherence_engine';
import { latticeApplicationRegistry } from '../lattice_connect_all/registry';
import { connectAllApplications } from '../lattice_connect_all/connect_all';

// Import types
import type {
  BrainInput,
  BrainState,
  BrainTrace,
  AxisScores,
  AppFile,
  SixWallProtocol,
  HealingRecommendation,
  BrainSnapshot,
  RewriteSnapshot,
} from './lattice_github_brain';

import type {
  EchoLearningGoal,
  EchoLearningCycle,
  EchoLearningSnapshot,
  EchoImprovementRecommendation,
} from './lattice_echo_chamber';

import type {
  LatticeCommand,
  LatticeCommandResult,
  LatticeCommandSnapshot,
} from './lattice_command_center';

import type {
  AutonomyLevel,
  RiskLevel,
  MoralRule,
  MoralConstitution,
  SelfModel,
  ConsciousnessLoopState,
  ConscienceCheck,
  AutonomousGoal,
  AutonomousAction,
  AutonomyDecision,
  MoralMemoryRecord,
  MoralAutonomySnapshot,
} from './lattice_moral_autonomy_core';

import type {
  CoherenceInput,
  CoherenceWeights,
  CoherenceScore,
  RankedCoherenceAction,
} from './lattice_coherence_engine';

import type {
  ConnectAllSnapshot,
  LatticeApplicationNode,
  LatticeApplicationRegistry,
  ConnectedApplicationSnapshot,
  BridgeStatus,
  BrainMode,
  SafetyBoundary,
} from '../lattice_connect_all/types';

// Re-export values
export { LatticeGitHubBrain, latticeGitHubBrain } from './lattice_github_brain';
export { LatticeEchoChamber, latticeEchoChamber } from './lattice_echo_chamber';
export { LatticeCommandCenter, latticeCommandCenter } from './lattice_command_center';
export { LatticeMoralAutonomyCore, latticeMoralAutonomyCore } from './lattice_moral_autonomy_core';
export { LatticeCoherenceEngine, latticeCoherenceEngine } from './lattice_coherence_engine';

// Re-export types
export type {
  BrainInput,
  BrainState,
  BrainTrace,
  AxisScores,
  AppFile,
  SixWallProtocol,
  HealingRecommendation,
  BrainSnapshot,
  RewriteSnapshot,
} from './lattice_github_brain';

export type {
  EchoLearningGoal,
  EchoLearningCycle,
  EchoLearningSnapshot,
  EchoImprovementRecommendation,
} from './lattice_echo_chamber';

export type {
  LatticeCommand,
  LatticeCommandResult,
  LatticeCommandSnapshot,
} from './lattice_command_center';

export type {
  AutonomyLevel,
  RiskLevel,
  MoralRule,
  MoralConstitution,
  SelfModel,
  ConsciousnessLoopState,
  ConscienceCheck,
  AutonomousGoal,
  AutonomousAction,
  AutonomyDecision,
  MoralMemoryRecord,
  MoralAutonomySnapshot,
} from './lattice_moral_autonomy_core';

export type {
  CoherenceInput,
  CoherenceWeights,
  CoherenceScore,
  RankedCoherenceAction,
} from './lattice_coherence_engine';

export type {
  ConnectAllSnapshot,
  LatticeApplicationNode,
  LatticeApplicationRegistry,
  ConnectedApplicationSnapshot,
  BridgeStatus,
  BrainMode,
  SafetyBoundary,
} from '../lattice_connect_all/types';

// Re-export Connect-All registry helpers
export {
  latticeApplicationRegistry,
  getApplicationByRepository,
  getAllApplications,
  getApplicationsByStatus,
  updateApplicationStatus,
  getConnectionCounts,
} from '../lattice_connect_all/registry';

// Re-export Connect-All connection helpers
export {
  connectApplication,
  connectAllApplications,
  markApplicationConnected,
  addApplicationNode,
  getApplicationStatus,
  getConnectionSnapshot,
} from '../lattice_connect_all/connect_all';

/**
 * Lattice System - Convenience initialization
 *
 * Returns an object with all core components ready to use.
 */
export interface LatticeSystem {
  brain: LatticeGitHubBrain;
  echoChamber: LatticeEchoChamber;
  commandCenter: LatticeCommandCenter;
  moralAutonomyCore: LatticeMoralAutonomyCore;
  coherenceEngine: LatticeCoherenceEngine;
  registry: typeof latticeApplicationRegistry;
  connectAll: typeof connectAllApplications;
  author: string;
  safetyBoundary: string;
}

/**
 * createLatticeSystem()
 *
 * Initialize all Lattice components and return as unified system object.
 */
export function createLatticeSystem(): LatticeSystem {
  return {
    brain: new LatticeGitHubBrain(),
    echoChamber: new LatticeEchoChamber(),
    commandCenter: new LatticeCommandCenter(),
    moralAutonomyCore: new LatticeMoralAutonomyCore(),
    coherenceEngine: new LatticeCoherenceEngine(),
    registry: latticeApplicationRegistry,
    connectAll: connectAllApplications,
    author: 'Adrien D. Thomas',
    safetyBoundary:
      'Software architecture only. No consciousness claims. Approval-gated moral autonomy only. No unrestricted autonomous execution or autonomous production code rewriting.',
  };
}

/**
 * runLatticeSystemCommand(command)
 *
 * Convenience function to execute a command through the Lattice system.
 *
 * Creates a new LatticeCommandCenter, calls commandLearnAndImprove(),
 * and returns the result.
 *
 * @param command - LatticeCommand input with observationItems, actionItems, bridgeItems, metadata
 * @returns LatticeCommandResult with traces, recommendations, and snapshots
 */
export function runLatticeSystemCommand(command: LatticeCommand): LatticeCommandResult {
  const center = new LatticeCommandCenter();
  return center.commandLearnAndImprove(command);
}
