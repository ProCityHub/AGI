/**
 * Lattice System Index
 * Author and concept origin: Adrien D. Thomas
 *
 * Practical software architecture only.
 * No consciousness claims. No autonomous production code rewriting.
 */

// Re-export Lattice GitHub Brain
export {
  LatticeGitHubBrain,
  latticeGitHubBrain,
  BrainInput,
  BrainState,
  BrainTrace,
  BrainScores,
} from './lattice_github_brain';

// Re-export Lattice Echo Chamber
export {
  LatticeEchoChamber,
  latticeEchoChamber,
  EchoLearningGoal,
  EchoLearningCycle,
  EchoLearningSnapshot,
  EchoRecommendation,
} from './lattice_echo_chamber';

// Re-export Lattice Command Center
export {
  LatticeCommandCenter,
  latticeCommandCenter,
  LatticeCommand,
  LatticeCommandResult,
  LatticeCommandSnapshot,
} from './lattice_command_center';

// Re-export Connect-All types
export {
  ConnectAllSnapshot,
  ApplicationNode,
  ApplicationConnection,
  ConnectionStatus,
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
  brain: any;
  echoChamber: any;
  commandCenter: any;
  registry: any;
  connectAll: any;
  author: string;
  safetyBoundary: string;
}

/**
 * createLatticeSystem()
 *
 * Initialize all Lattice components and return as unified system object.
 */
export function createLatticeSystem(): LatticeSystem {
  const {
    LatticeGitHubBrain,
    LatticeEchoChamber,
    LatticeCommandCenter,
  } = require('./lattice_github_brain');
  const { latticeApplicationRegistry } = require('../lattice_connect_all/registry');
  const { connectAllApplications } = require('../lattice_connect_all/connect_all');

  return {
    brain: new LatticeGitHubBrain(),
    echoChamber: new LatticeEchoChamber(),
    commandCenter: new LatticeCommandCenter(),
    registry: latticeApplicationRegistry,
    connectAll: connectAllApplications,
    author: 'Adrien D. Thomas',
    safetyBoundary:
      'Software architecture only. No consciousness claims. No autonomous production code rewriting.',
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
export function runLatticeSystemCommand(command: any): any {
  const { LatticeCommandCenter } = require('./lattice_command_center');
  const center = new LatticeCommandCenter();
  return center.commandLearnAndImprove(command);
}
